
type WorkerContext = {
    canvas: OffscreenCanvas;
    options: {
        _overlay_x: number;
        _overlay_y: number;
        _overlay_width: number;
        _overlay_height: number;
        target_bg_rgb: { r: number; g: number; b: number };
    };
};

function hexToRgb(hex_color: string) {
    const hex = hex_color.replace("#", "");
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

let workerContext: WorkerContext = {
    canvas: null as unknown as OffscreenCanvas,
    options: {
        _overlay_x: 0,
        _overlay_y: 0,
        _overlay_width: 0,
        _overlay_height: 0,
        target_bg_rgb: { r: 0, g: 0, b: 0 }
    }
};

self.onmessage = async (e) => {

    console.log('Worker called');
    console.log('Worker received data:', e.data);

    const { backdropBitmap, cursorBitmap, targetData, options } = e.data;
    const {
        target_bg_color,
        target_border_radius,
        target_no_fillout,
        target_replace_cursor,
        target_enable_arrow,
        image_border_radius,
        target_scale_factor: initialScaleFactor,
        _overlay_x,
        _overlay_y,
        _overlay_width,
        _overlay_height,
        _strokeWidth
    } = options;

    const canvas = new OffscreenCanvas(targetData.canvas_width, targetData.canvas_height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update worker context
    workerContext.canvas = canvas;
    workerContext.options = {
        _overlay_x,
        _overlay_y,
        _overlay_width,
        _overlay_height,
        target_bg_rgb: hexToRgb(target_bg_color)
    };

    try {
        console.log('Processing images...');
        console.log('Backdrop dimensions:', backdropBitmap.width, 'x', backdropBitmap.height);
        // console.log('Cursor dimensions:', cursorBitmap.width, 'x', cursorBitmap.height);

        const target_bg_rgb = hexToRgb(target_bg_color);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Ensure Transparent Background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        applyCanvasClip(Number(image_border_radius));

        // Transform + Scale
        let target_scale_factor = initialScaleFactor;
        if (target_scale_factor === "0.99") {
            target_scale_factor = Math.min(
                canvas.width / (canvas.width / 4 + _overlay_width),
                canvas.width / (canvas.width / 4 + _overlay_width),
            ).toString();
        }
        const scale = Number(target_scale_factor);
        const { width, height } = canvas;
        let trans = {
            x: _overlay_x * scale - (width - _overlay_width * scale) / 2,
            y: _overlay_y * scale - (height - _overlay_height * scale) / 2,
        };

        // Handle edge cases
        if (trans.x < 0) trans.x = 0;
        if (trans.y < 0) trans.y = 0;
        if (trans.x > canvas.width * scale - canvas.width) {
            trans.x = canvas.width * scale - canvas.width;
        }
        if (trans.y > canvas.height * scale - canvas.height) {
            trans.y = canvas.height * scale - canvas.height;
        }
        ctx.setTransform(scale, 0, 0, scale, -trans.x, -trans.y);

        // Draw base image
        ctx.drawImage(backdropBitmap, 0, 0, canvas.width, canvas.height);

        if (!target_replace_cursor) {
            // Draw target highlight
            ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
            ctx.lineWidth = !target_no_fillout ? _strokeWidth : _strokeWidth * 2.5;
            ctx.beginPath();
            ctx.roundRect(
                _overlay_x - _strokeWidth * 2,
                _overlay_y - _strokeWidth * 2,
                _overlay_width + _strokeWidth * 4,
                _overlay_height + _strokeWidth * 4,
                [
                    Number(target_border_radius),
                    Number(target_border_radius),
                    Number(target_border_radius),
                    Number(target_border_radius),
                ],
            );
            ctx.stroke();

            if (!target_no_fillout) {
                ctx.beginPath();
                ctx.roundRect(
                    _overlay_x,
                    _overlay_y,
                    _overlay_width,
                    _overlay_height,
                    [
                        Number(target_border_radius),
                        Number(target_border_radius),
                        Number(target_border_radius),
                        Number(target_border_radius),
                    ],
                );

                ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 0.333)`;
                ctx.lineWidth = _strokeWidth;
                ctx.stroke();

                ctx.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 0.666)`;
                ctx.fill();
            }
        } else {
            // Draw cursor
            const size = 75;
            ctx.drawImage(
                cursorBitmap,
                targetData.click_x,
                targetData.click_y,
                size,
                size,
            );
        }

        if (target_enable_arrow) {
            createArrow();
        }

        const blob = await canvas.convertToBlob();
        self.postMessage({ blob, quality: 'high' });
    } catch (error) {
        console.error('Error in worker:', error);
    }
};

function applyCanvasClip(radius: number) {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const width = workerContext.canvas.width;
    const height = workerContext.canvas.height;

    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.arcTo(width, 0, width, height, radius);
    ctx.arcTo(width, height, 0, height, radius);
    ctx.arcTo(0, height, 0, 0, radius);
    ctx.arcTo(0, 0, width, 0, radius);
    ctx.closePath();
    ctx.clip();
}

function createArrow() {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const { _overlay_x, _overlay_y, _overlay_width, _overlay_height, target_bg_rgb } = workerContext.options;
    const canvas = workerContext.canvas;

    const size1 = _overlay_x * _overlay_y;
    const size2 = _overlay_x * (canvas.height - (_overlay_y + _overlay_height));
    const size3 = (canvas.width - (_overlay_x + _overlay_width)) * _overlay_y;
    const size4 = (canvas.width - (_overlay_x + _overlay_width)) * (canvas.height - (_overlay_y + _overlay_height));

    const max = Math.max(size1, size2, size3, size4);
    const _puffer = 10;
    const _space_x = 30 - _puffer;
    const _space_y = 30 - _puffer;
    const _length = 120;

    let head, end;
    switch (max) {
        case size1:
            head = [_overlay_x - _space_x, _overlay_y - _space_y];
            end = [head[0] - _length, head[1] - _length];
            genLine(head, end);
            genTriangle(head, end, "tl");
            break;
        case size2:
            head = [_overlay_x - _space_x, _overlay_y + _overlay_height + _space_y];
            end = [head[0] - _length, head[1] + _length];
            genLine(head, end);
            genTriangle(head, end, "bl");
            break;
        case size3:
            head = [_overlay_x + _overlay_width + _space_x, _overlay_y - _space_y];
            end = [head[0] + _length, head[1] - _length];
            genLine(head, end);
            genTriangle(head, end, "tr");
            break;
        case size4:
            head = [_overlay_x + _overlay_width + _space_x, _overlay_y + _overlay_height + _space_y];
            end = [head[0] + _length, head[1] + _length];
            genLine(head, end);
            genTriangle(head, end, "br");
            break;
    }
}

function genLine(head: number[], end: number[]) {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const { target_bg_rgb } = workerContext.options;

    ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(head[0], head[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
}

function genTriangle(head: number[], end: number[], kind: string) {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const { target_bg_rgb } = workerContext.options;

    const x_diff = end[0] - head[0];
    const y_diff = end[1] - head[1];
    const new_x = head[0] + 0.1 * x_diff;
    const new_y = head[1] + 0.1 * y_diff;

    ctx.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, 1.0)`;
    ctx.beginPath();

    if (kind.includes("t")) {
        ctx.moveTo(new_x + 10, kind === "tl" ? new_y - 10 : new_y + 10);
        ctx.lineTo(new_x - 10, kind === "tl" ? new_y + 10 : new_y - 10);
        ctx.lineTo(kind === "tl" ? head[0] + 10 : head[0] - 10, head[1] + 10);
    }
    if (kind.includes("b")) {
        ctx.moveTo(new_x + 10, kind === "bl" ? new_y + 10 : new_y - 10);
        ctx.lineTo(new_x - 10, kind === "bl" ? new_y - 10 : new_y + 10);
        ctx.lineTo(kind === "bl" ? head[0] + 10 : head[0] - 10, head[1] - 10);
    }

    ctx.fill();
} 