<script lang="ts">
    import cursor_svg1 from "$lib/assets/cursor1.svg";
    import cursor_svg2 from "$lib/assets/cursor2.svg";
    import cursor_svg3 from "$lib/assets/cursor3.svg";
    import { onMount } from "svelte";
    import type { FLOW } from "../func";
    import type { Variables } from "../func";
    import { FFmpeg, type FileData } from "@ffmpeg/ffmpeg";
    import audioFile from "$lib/assets/for_elise.mp3";
    import { toBlobURL } from "@ffmpeg/util";
    import { triggerCursorAnimation } from "./cursor-animation";

    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

    export let cFlow: FLOW | null = null;
    export let VARIABLES: Variables;
    export let downloadVideo: boolean = false;

    // Variables:
    let currentStepIndex = 0;
    let lastClickX = 0;
    let lastClickY = 0;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let cursor_img: HTMLImageElement;
    let raf: number;
    let currentBgImage: HTMLImageElement | null = null;
    let isAnimationEnded = false;
    let isProcessingVideo = false;
    let processingProgress = 0;
    let totalFrames = 0;
    let startedUp = false;
    let isAnimating = false; // Add flag to track if animation is in progress
    let tempCanvas: HTMLCanvasElement;
    let tempCtx: CanvasRenderingContext2D;
    let isCursorAnimating = false;

    // FFmpeg
    const ffmpeg = new FFmpeg();
    const frames: string[] = [];

    onMount(async () => {
        await initFFmpeg(); // init ffmpeg
        await initCanvas(); // init canvas
        // Initialize temporary canvas for cursor animation
        tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx = tempCanvas.getContext("2d")!;
        startedUp = true;
    });

    $: if (downloadVideo) genFFmpeg();
    $: if (VARIABLES && startedUp) restartCanvas();

    async function initFFmpeg() {
        await ffmpeg.load({
            coreURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.js`,
                "text/javascript",
            ),
            wasmURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`,
                "application/wasm",
            ),
            workerURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.worker.js`,
                "text/javascript",
            ),
        });
    }

    async function initCanvas() {
        canvas = document.getElementById("my_canvas") as HTMLCanvasElement;
        ctx = canvas.getContext("2d")!;

        // Preload cursor image without blocking
        cursor_img = new Image();
        cursor_img.src =
            VARIABLES.video_click_animation.toLowerCase() === "ripple"
                ? cursor_svg1
                : VARIABLES.video_click_animation.toLowerCase() === "twinkle"
                  ? cursor_svg2
                  : cursor_svg3;

        // Clear frames array
        frames.length = 0;

        // Draw initial frame immediately without waiting for cursor image
        if (currentBgImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentBgImage, 0, 0, canvas.width, canvas.height);
        }

        // Start animation immediately
        startAnimation();

        // Handle cursor image loading in the background
        if (!cursor_img.complete) {
            cursor_img.onload = () => {
                // Redraw with cursor once loaded
                if (currentBgImage) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );
                    ctx.drawImage(
                        cursor_img,
                        lastClickX - 25,
                        lastClickY - 25,
                        50,
                        50,
                    );
                }
            };
        }
    }

    function startAnimation() {
        if (!cFlow?.steps.length || isAnimating) return; // Prevent multiple animations

        // Reset animation state
        currentStepIndex = 0;
        lastClickX = 0;
        lastClickY = 0;
        isAnimationEnded = false;
        frames.length = 0;
        processingProgress = 0;
        isProcessingVideo = false;
        isAnimating = true; // Set animation flag
        isCursorAnimating = false;

        // Set initial canvas size based on first step
        const firstStep = cFlow.steps[0];
        const originalWidth = firstStep.target_data.canvas_width;
        const originalHeight = firstStep.target_data.canvas_height;

        // Calculate scale to achieve at least 1080p height while maintaining aspect ratio
        const targetHeight = 1080; // Minimum height for 1080p
        const scale = targetHeight / originalHeight;

        // Set canvas size to achieve 1080p or higher
        canvas.width = Math.round(originalWidth * scale);
        canvas.height = Math.round(originalHeight * scale);

        // Set canvas CSS size to fit the viewport
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        const displayScale = Math.min(
            maxWidth / canvas.width,
            maxHeight / canvas.height,
        );

        canvas.style.width = `${canvas.width * displayScale}px`;
        canvas.style.height = `${canvas.height * displayScale}px`;

        // Start animation in next frame
        requestAnimationFrame(() => {
            animateStep();
        });
    }

    function animateStep() {
        if (currentStepIndex >= (cFlow?.steps.length || 0)) {
            console.log("End of sequence");
            isAnimationEnded = true;
            isAnimating = false; // Reset animation flag
            return; // End of sequence
        }
        if (!isAnimating) return; // Prevent animation

        // Reset cursor animation state for new step
        isCursorAnimating = false;
        if (tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        const step = cFlow!.steps[currentStepIndex];
        const targetX = step.target_data.click_x;
        const targetY = step.target_data.click_y;
        const boxLeft = step.target_data.left;
        const boxTop = step.target_data.top;
        const boxWidth = step.target_data.width;
        const boxHeight = step.target_data.height;
        const text = step.descrb;

        // Load the background image
        const bgImage = new Image();
        bgImage.src = step.base64;
        bgImage.onload = () => {
            currentBgImage = bgImage;
            // Start the animation sequence
            animateCursor(
                lastClickX,
                lastClickY,
                targetX,
                targetY,
                boxLeft,
                boxTop,
                boxWidth,
                boxHeight,
                () => {
                    // After cursor animation completes, move to next step
                    lastClickX = targetX;
                    lastClickY = targetY;
                    currentStepIndex++;

                    // Add a small delay before next step
                    setTimeout(() => animateStep(), 500);
                },
            );
        };
    }

    function animateCursor(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        boxLeft: number,
        boxTop: number,
        boxWidth: number,
        boxHeight: number,
        onComplete: () => void,
    ) {
        const scale = canvas.width / cFlow!.steps[0].target_data.canvas_width;
        let isAnimationComplete = false;
        const speedMultiplier = Number(VARIABLES.video_speed); // Adjust this value to change overall speed (higher = faster)

        const cursor = {
            x: startX * scale,
            y: startY * scale,
            w: 50, // Fixed pixel size
            h: 50, // Fixed pixel size
            t: 0,
            speed: 0.018 * speedMultiplier, // Adjusted by speed multiplier
            draw() {
                ctx.drawImage(
                    cursor_img,
                    this.x - this.w / 2,
                    this.y - this.h / 2,
                    this.w,
                    this.h,
                );
            },
        };

        // Animation phases
        let phase = 0; // 0: move cursor, 1: zoom in, 2: click animation, 3: wait, 4: zoom out
        let zoomProgress = 0;
        const zoomInSpeed = 0.01 * speedMultiplier; // Adjusted by speed multiplier
        const zoomOutSpeed = 0.05 * speedMultiplier; // Adjusted by speed multiplier
        const maxZoom = VARIABLES.video_zoom_to_element ? 1.5 : 1.0; // Only zoom if enabled
        let zoomCenterX = endX * scale;
        let zoomCenterY = endY * scale;
        let waitStartTime = 0;

        // Box highlight parameters
        const boxHighlight = {
            x: boxLeft * scale,
            y: boxTop * scale,
            width: boxWidth * scale,
            height: boxHeight * scale,
            borderColor: VARIABLES.target_bg_color,
            fillColor: VARIABLES.target_bg_color,
            strokeWidth: 5 * scale,
            draw() {
                // Draw outer stroke
                ctx.strokeStyle = this.borderColor;
                ctx.lineWidth = this.strokeWidth;
                ctx.beginPath();
                ctx.roundRect(
                    this.x - this.strokeWidth,
                    this.y - this.strokeWidth,
                    this.width + this.strokeWidth * 2,
                    this.height + this.strokeWidth * 2,
                    [
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                    ], // border radius
                );
                ctx.globalAlpha = 1.0;
                ctx.stroke();

                // Draw inner highlight
                if (!VARIABLES.target_no_fillout) {
                    ctx.beginPath();
                    ctx.roundRect(this.x, this.y, this.width, this.height, [
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                        Number(VARIABLES.target_border_radius),
                    ]);
                    ctx.strokeStyle = this.borderColor;
                    ctx.globalAlpha = 0.33;
                    ctx.lineWidth = this.strokeWidth;
                    ctx.stroke();
                    ctx.fillStyle = this.fillColor;
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            },
        };

        // Subtitle parameters
        const subtitle = {
            text: cFlow!.steps[currentStepIndex].descrb
                .replace(/\s+/g, " ")
                .trim(),
            padding: 20 * scale,
            fontSize: 24 * scale,
            draw() {
                if (!VARIABLES.video_enable_subtitles) return;

                // Calculate text dimensions
                ctx.font = `bold ${this.fontSize}px Arial`;
                const textMetrics = ctx.measureText(this.text);
                const textWidth = textMetrics.width;
                const textHeight = this.fontSize;

                // Calculate banner dimensions
                const bannerHeight = textHeight + this.padding * 2;
                const bannerWidth = canvas.width;
                const bannerY = canvas.height - bannerHeight;

                // Draw semi-transparent black banner
                ctx.fillStyle = "rgba(0, 0, 0, 0.333)";
                ctx.fillRect(0, bannerY, bannerWidth, bannerHeight);

                // Draw text
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(
                    this.text,
                    canvas.width / 2,
                    bannerY + bannerHeight / 2,
                );
            },
        };

        // Easing function for more natural movement
        function easeInOutCubic(t: number): number {
            return t < 0.5 ? 3 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        // Click animation parameters
        const clickAnimation = {
            radius: 0,
            maxRadius: 40 * scale,
            alpha: 1,
            speed: 1.5 * scale * speedMultiplier, // Adjusted by speed multiplier
            isComplete: false,
        };

        function drawFinalFrame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Draw the background
            if (currentBgImage) {
                ctx.drawImage(
                    currentBgImage,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );

                // Draw box highlight
                boxHighlight.draw();

                // Draw subtitle
                subtitle.draw();

                // Draw cursor at final position
                ctx.drawImage(
                    cursor_img,
                    zoomCenterX - 25,
                    zoomCenterY - 25,
                    50,
                    50,
                );
            }
        }

        function draw() {
            if (isAnimationComplete) {
                drawFinalFrame();
                return;
            }

            // Clear the canvas and redraw the background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (currentBgImage) {
                if (phase === 0) {
                    // Phase 0: Move cursor to position
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );

                    // Draw box highlight
                    boxHighlight.draw();

                    // Draw subtitle
                    subtitle.draw();

                    // Calculate progress for easing
                    const dx = endX * scale - cursor.x;
                    const dy = endY * scale - cursor.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = Math.sqrt(
                        Math.pow(endX * scale - startX * scale, 2) +
                            Math.pow(endY * scale - startY * scale, 2),
                    );
                    const progress = 1 - distance / maxDistance;
                    const easedProgress = easeInOutCubic(progress);

                    // Apply eased movement
                    if (distance > 0.1) {
                        const moveX = dx * cursor.speed * (1 + easedProgress);
                        const moveY = dy * cursor.speed * (1 + easedProgress);
                        cursor.x += moveX;
                        cursor.y += moveY;
                        cursor.draw();
                        raf = requestAnimationFrame(draw);
                    } else {
                        cursor.x = endX * scale;
                        cursor.y = endY * scale;
                        cursor.draw();
                        phase = 1; // Move to zoom phase
                        raf = requestAnimationFrame(draw);
                    }
                } else if (phase === 1) {
                    // Phase 1: Zoom in
                    if (VARIABLES.video_zoom_to_element) {
                        // Only zoom if enabled
                        zoomProgress += zoomInSpeed;
                        if (zoomProgress >= 1) {
                            zoomProgress = 1;
                            phase = 2; // Move to click animation phase
                        }
                    } else {
                        phase = 2; // Skip zoom phase if disabled
                    }
                    const currentZoom = 1 + (maxZoom - 1) * zoomProgress;

                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );
                    ctx.restore();

                    // Draw box highlight with zoom
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    boxHighlight.draw();
                    ctx.restore();

                    // Draw subtitle (no zoom needed for subtitle)
                    subtitle.draw();

                    // Draw cursor with zoom compensation
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        cursor_img,
                        zoomCenterX - 25,
                        zoomCenterY - 25,
                        50,
                        50,
                    );
                    ctx.restore();

                    raf = requestAnimationFrame(draw);
                } else if (phase === 2) {
                    // Phase 2: Click animation while zoomed
                    const currentZoom = maxZoom;

                    // Draw background with zoom
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );
                    ctx.restore();

                    // Draw box highlight with zoom
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    boxHighlight.draw();
                    ctx.restore();

                    // Draw subtitle (no zoom needed for subtitle)
                    subtitle.draw();

                    // Handle cursor animation
                    if (!isCursorAnimating) {
                        isCursorAnimating = true;
                        // Clear temporary canvas
                        tempCtx.clearRect(
                            0,
                            0,
                            tempCanvas.width,
                            tempCanvas.height,
                        );

                        // Scale the temporary canvas context to match the zoom
                        tempCtx.save();
                        tempCtx.translate(zoomCenterX, zoomCenterY);
                        tempCtx.scale(currentZoom, currentZoom);
                        tempCtx.translate(-zoomCenterX, -zoomCenterY);

                        // Trigger cursor animation with completion callback
                        triggerCursorAnimation(
                            tempCtx,
                            tempCanvas,
                            endX * scale, // Use the scaled coordinates
                            endY * scale, // Use the scaled coordinates
                            50, // Adjust cursor size for zoom
                            VARIABLES.video_click_animation.toLowerCase(),
                            () => {
                                // When cursor animation completes
                                console.log("Cursor animation complete");
                                clickAnimation.isComplete = true;
                                phase = 3; // Move to wait phase
                                waitStartTime = performance.now();
                                isCursorAnimating = false; // Reset cursor animation state
                            },
                        );

                        tempCtx.restore();
                    }

                    // Composite the cursor animation onto the main canvas
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(tempCanvas, 0, 0);
                    ctx.restore();

                    // Continue animation frame
                    raf = requestAnimationFrame(draw);
                } else if (phase === 3) {
                    // Phase 3: Wait for 1 second
                    const currentZoom = maxZoom;

                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );
                    ctx.restore();

                    // Draw box highlight with zoom
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    boxHighlight.draw();
                    ctx.restore();

                    // Draw subtitle (no zoom needed for subtitle)
                    subtitle.draw();

                    // Draw cursor with zoom compensation
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        cursor_img,
                        zoomCenterX - 25,
                        zoomCenterY - 25,
                        50,
                        50,
                    );
                    ctx.restore();

                    if (
                        performance.now() - waitStartTime >=
                        1000 / speedMultiplier
                    ) {
                        // Adjusted wait time
                        phase = 4; // Move to zoom out phase
                    }
                    raf = requestAnimationFrame(draw);
                } else if (phase === 4) {
                    // Phase 4: Zoom out
                    if (VARIABLES.video_zoom_to_element) {
                        // Only zoom if enabled
                        zoomProgress -= zoomOutSpeed;
                        if (zoomProgress <= 0) {
                            zoomProgress = 0;
                            isAnimationComplete = true;
                            drawFinalFrame(); // Draw final frame before completing
                            onComplete(); // Animation complete
                            return;
                        }
                    } else {
                        isAnimationComplete = true;
                        drawFinalFrame(); // Draw final frame before completing
                        onComplete(); // Animation complete
                        return;
                    }
                    const currentZoom = 1 + (maxZoom - 1) * zoomProgress;

                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        currentBgImage,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    );
                    ctx.restore();

                    // Draw box highlight with zoom
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    boxHighlight.draw();
                    ctx.restore();

                    // Draw subtitle (no zoom needed for subtitle)
                    subtitle.draw();

                    // Draw cursor with zoom compensation
                    ctx.save();
                    ctx.translate(zoomCenterX, zoomCenterY);
                    ctx.scale(currentZoom, currentZoom);
                    ctx.translate(-zoomCenterX, -zoomCenterY);
                    ctx.drawImage(
                        cursor_img,
                        zoomCenterX - 25,
                        zoomCenterY - 25,
                        50,
                        50,
                    );
                    ctx.restore();

                    raf = requestAnimationFrame(draw);
                }

                // Capture frame for video
                const dataUrl = canvas.toDataURL("image/png");
                frames.push(dataUrl);
            }
        }

        raf = requestAnimationFrame(draw);
    }

    // generate Output
    async function genFFmpeg() {
        async function getBinaryImage(dataUrl: string) {
            return fetch(dataUrl).then(async (res) => await res.arrayBuffer());
        }

        isProcessingVideo = true;
        processingProgress = 0;
        totalFrames = frames.length;

        ffmpeg.on("log", ({ type, message }) => {
            console.warn(`[ffmpeg ${type}] ${message}`);
            // Extract frame progress from FFmpeg output
            const frameMatch = message.match(/frame=\s*(\d+)/);
            if (frameMatch) {
                // FFmpeg progress is the second half (50-100%)
                const ffmpegProgress = Math.min(
                    100,
                    Math.round((parseInt(frameMatch[1]) / totalFrames) * 100),
                );
                processingProgress = 50 + ffmpegProgress / 2;
            }
        });

        try {
            for (let i = 0; i < frames.length; i++) {
                const name = `frame${i.toString().padStart(5, "0")}.png`;
                const binary = await getBinaryImage(frames[i]);
                const uint8Array = new Uint8Array(binary);
                await ffmpeg.writeFile(name, uint8Array);
                // Frame processing is the first half (0-50%)
                processingProgress = Math.min(
                    50,
                    Math.round(((i + 1) / frames.length) * 50),
                );
            }

            const audioBlob = await fetch(audioFile).then((res) => res.blob());
            const audioBuffer = new Uint8Array(await audioBlob.arrayBuffer());
            await ffmpeg.writeFile("audio.mp3", audioBuffer);

            await ffmpeg.exec([
                "-framerate",
                "60",
                "-i",
                "frame%05d.png",
                "-c:v",
                "libx264",
                "-preset",
                "slow",
                "-crf",
                "18",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos",
                "-color_range",
                "tv",
                "-vsync",
                "0",
                "-r",
                "60",
                "-shortest",
                "output.mp4",
            ]);

            const output: FileData = await ffmpeg.readFile("output.mp4");
            const videoBlob = new Blob([output], { type: "video/mp4" });
            const videoUrl = URL.createObjectURL(videoBlob);

            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = "myVideo.mp4";
            a.click();

            // Cleanup
            URL.revokeObjectURL(videoUrl);
            frames.length = 0;
            processingProgress = 100;
            isProcessingVideo = false;
        } catch (error) {
            console.error(error);
            frames.length = 0;
            isProcessingVideo = false;
            processingProgress = 0;
        }
    }

    function stopAnimation() {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        isCursorAnimating = false;
        // Reset all animation state
        currentStepIndex = 0;
        lastClickX = 0;
        lastClickY = 0;
        isAnimationEnded = false;
        frames.length = 0; // Clear previous frames
        currentBgImage = null;
        isAnimating = false; // Reset animation flag

        // Clear the canvas
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Clear temporary canvas
        if (tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
    }

    function restartCanvas() {
        // Force stop any ongoing animation and wait for cleanup
        stopAnimation();

        // Reset all animation-related state
        isCursorAnimating = false;
        currentStepIndex = 0;
        lastClickX = 0;
        lastClickY = 0;
        isAnimationEnded = false;
        frames.length = 0;
        currentBgImage = null;
        isAnimating = false;

        // Clear all canvases
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Start new animation in next frame to ensure clean state
        requestAnimationFrame(() => {
            startAnimation();
        });
    }
</script>

<div
    style="
    transform-origin: top center;
    transform: scale({VARIABLES.editor_scale});
    position: relative;
    margin-top: 0;
    width: 100%;
    padding: 0 5rem;
    "
    class="w-full flex justify-center items-center flex-col"
>
    <div
        style="
        margin-top: 75px;
        transform: scale(1);
        transform-origin: top center;
        "
        class="flex justify-center items-center relative"
    >
        <canvas
            id="my_canvas"
            class="bg-white border-white border-opacity-10 border-8 rounded-2xl overflow-clip"
        />
        {#if isAnimationEnded}
            <div
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl"
            >
                {#if isProcessingVideo}
                    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                        <div class="text-lg font-semibold mb-2">
                            Processing Video...
                        </div>
                        <div
                            class="w-64 h-4 bg-gray-200 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-red-400 transition-all duration-300"
                                style="width: {processingProgress}%"
                            ></div>
                        </div>
                        <div class="mt-2 text-sm text-gray-600">
                            {processingProgress}%
                        </div>
                    </div>
                {:else}
                    <button
                        on:click={restartCanvas}
                        class="px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors duration-200 shadow-lg text-lg font-semibold"
                    >
                        Replay Animation
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</div>
