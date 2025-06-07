type WorkerContext = {
    canvas: OffscreenCanvas;
    options: {
        _overlay_x: number;
        _overlay_y: number;
        _overlay_width: number;
        _overlay_height: number;
        target_bg_rgb: { r: number; g: number; b: number };
    };
    target_bg_color: string;
};

function hexToRgb(hex_color: string) {
    // Handle rgba colors
    if (hex_color.startsWith('rgba')) {
        return rgbaToRgb(hex_color);
    }

    // Handle hex colors
    const hex = hex_color.replace("#", "");
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function rgbaToRgb(rgba: string) {
    // Extract numbers from rgba string using regex
    const matches = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (!matches) {
        console.warn('Invalid rgba color format:', rgba);
        return { r: 0, g: 0, b: 0 };
    }

    return {
        r: parseInt(matches[1]),
        g: parseInt(matches[2]),
        b: parseInt(matches[3])
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
    },
    target_bg_color: 'rgba(0, 0, 0, 1)'
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
        _strokeWidth,
        border
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
    workerContext.target_bg_color = target_bg_color;

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
            // Extract opacity from rgba if present, otherwise use 1.0
            const opacity = target_bg_color.startsWith('rgba')
                ? parseFloat(target_bg_color.match(/[\d.]+\)$/)?.[0] ?? '1.0')
                : 1.0;

            // Draw target highlight
            ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, ${opacity})`;
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

                ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, ${opacity * 0.333})`;
                ctx.lineWidth = _strokeWidth;
                ctx.stroke();

                ctx.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, ${opacity * 0.666})`;
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

        // Generate IMG with border:
        const { width: borderWidth } = parseBorderStyle(border);
        const totalBorderWidth = borderWidth * (border.includes('double') ? 3 : 1);

        const canvasWithBorder = new OffscreenCanvas(
            canvas.width + totalBorderWidth * 2,
            canvas.height + totalBorderWidth * 2
        );
        const ctxWithBorder = canvasWithBorder.getContext('2d');
        if (!ctxWithBorder) return;

        // Draw border with the same border radius as the image
        drawBorder(ctxWithBorder, border, canvasWithBorder.width, canvasWithBorder.height, Number(image_border_radius));

        // Draw original image in center
        ctxWithBorder.drawImage(canvas, totalBorderWidth, totalBorderWidth);

        const blobWithBorder = await canvasWithBorder.convertToBlob();

        // Send both blobs to the main thread
        self.postMessage({ blob, blobWithBorder });
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

    // Extract opacity from the target_bg_color
    const opacity = workerContext.target_bg_color.startsWith('rgba')
        ? parseFloat(workerContext.target_bg_color.match(/[\d.]+\)$/)?.[0] ?? '1.0')
        : 1.0;

    const size1 = _overlay_x * _overlay_y;
    const size2 = _overlay_x * (canvas.height - (_overlay_y + _overlay_height));
    const size3 = (canvas.width - (_overlay_x + _overlay_width)) * _overlay_y;
    const size4 = (canvas.width - (_overlay_x + _overlay_width)) * (canvas.height - (_overlay_y + _overlay_height));

    const max = Math.max(size1, size2, size3, size4);
    const _puffer = 10;
    const _space_x = 50 - _puffer;
    const _space_y = 50 - _puffer;
    const _length = 120;

    let head, end;
    switch (max) {
        case size1:
            head = [_overlay_x - _space_x, _overlay_y - _space_y];
            end = [head[0] - _length, head[1] - _length];
            genLine(head, end, opacity);
            genTriangle(head, end, "tl", opacity);
            break;
        case size2:
            head = [_overlay_x - _space_x, _overlay_y + _overlay_height + _space_y];
            end = [head[0] - _length, head[1] + _length];
            genLine(head, end, opacity);
            genTriangle(head, end, "bl", opacity);
            break;
        case size3:
            head = [_overlay_x + _overlay_width + _space_x, _overlay_y - _space_y];
            end = [head[0] + _length, head[1] - _length];
            genLine(head, end, opacity);
            genTriangle(head, end, "tr", opacity);
            break;
        case size4:
            head = [_overlay_x + _overlay_width + _space_x, _overlay_y + _overlay_height + _space_y];
            end = [head[0] + _length, head[1] + _length];
            genLine(head, end, opacity);
            genTriangle(head, end, "br", opacity);
            break;
    }
}

function genLine(head: number[], end: number[], opacity: number) {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const { target_bg_rgb } = workerContext.options;

    ctx.strokeStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, ${opacity})`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(head[0], head[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
}

function genTriangle(head: number[], end: number[], kind: string, opacity: number) {
    const ctx = workerContext.canvas.getContext('2d');
    if (!ctx) return;

    const { target_bg_rgb } = workerContext.options;

    const x_diff = end[0] - head[0];
    const y_diff = end[1] - head[1];
    const new_x = head[0] + 0.1 * x_diff;
    const new_y = head[1] + 0.1 * y_diff;

    ctx.fillStyle = `rgba(${target_bg_rgb.r}, ${target_bg_rgb.g}, ${target_bg_rgb.b}, ${opacity})`;
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

function parseBorderStyle(borderStr: string): { style: string; width: number; color: string } {
    const parts = borderStr.trim().split(/\s+/);
    let style = 'solid';
    let width = 1;
    let color = 'rgb(0, 0, 0)';

    for (const part of parts) {
        if (['solid', 'double', 'dashed', 'dotted', 'ridge', 'groove', 'inset', 'outset'].includes(part)) {
            style = part;
        } else if (part.endsWith('px')) {
            width = parseInt(part);
        } else if (part.startsWith('rgb') || part.startsWith('#')) {
            color = part;
        }
    }

    return { style, width, color };
}

function getBorderColors(color: string, style: string): { outer: string; inner: string } {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb;

    switch (style) {
        case 'ridge':
            return {
                outer: `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`,
                inner: `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`
            };
        case 'groove':
            return {
                outer: `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`,
                inner: `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
            };
        case 'inset':
            return {
                outer: `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`,
                inner: `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`
            };
        case 'outset':
            return {
                outer: `rgb(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)})`,
                inner: `rgb(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)})`
            };
        default:
            return { outer: color, inner: color };
    }
}

function drawBorder(ctx: OffscreenCanvasRenderingContext2D, border: string, width: number, height: number, borderRadius: number) {
    const { style, width: borderWidth, color } = parseBorderStyle(border);
    const { outer, inner } = getBorderColors(color, style);

    // Adjust border radius for the outer border
    const outerRadius = borderRadius + borderWidth;

    ctx.lineWidth = borderWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    switch (style) {
        case 'double': {
            const gap = borderWidth;
            // Outer border
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, outerRadius);
            ctx.stroke();

            // Inner border
            ctx.beginPath();
            ctx.roundRect(borderWidth + gap, borderWidth + gap,
                width - 2 * (borderWidth + gap), height - 2 * (borderWidth + gap),
                Math.max(0, borderRadius - gap));
            ctx.stroke();
            break;
        }
        case 'ridge':
        case 'groove':
        case 'inset':
        case 'outset': {
            // Draw outer edge
            ctx.strokeStyle = outer;
            ctx.beginPath();
            ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, outerRadius);
            ctx.stroke();

            // Draw inner edge
            ctx.strokeStyle = inner;
            ctx.beginPath();
            ctx.roundRect(borderWidth, borderWidth, width - 2 * borderWidth, height - 2 * borderWidth, borderRadius);
            ctx.stroke();
            break;
        }
        case 'dashed': {
            ctx.strokeStyle = color;
            ctx.setLineDash([borderWidth * 2, borderWidth]);
            ctx.beginPath();
            ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, outerRadius);
            ctx.stroke();
            ctx.setLineDash([]);
            break;
        }
        case 'dotted': {
            ctx.strokeStyle = color;
            ctx.setLineDash([borderWidth, borderWidth]);
            ctx.beginPath();
            ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, outerRadius);
            ctx.stroke();
            ctx.setLineDash([]);
            break;
        }
        default: { // solid
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, outerRadius);
            ctx.stroke();
        }
    }
} 