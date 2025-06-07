<script lang="ts">
    import cursor_svg from "$lib/assets/cursor2.svg";
    import { onMount } from "svelte";
    import { FFmpeg, type FileData } from "@ffmpeg/ffmpeg";
    import { toBlobURL } from "@ffmpeg/util";

    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

    // Variables:
    let lastClickX = 0;
    let lastClickY = 0;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let cursor_img: HTMLImageElement;
    let totalFrames = 0;
    let isRecording = false;
    let animationFrameId: number;
    let isAnimating = false;
    let selectedAnimation = "ripple"; // Default animation type
    let cursorShrink = 1; // 1 = normal size, <1 = shrunk
    let cursorShrinkFrame = 0;
    let cursorShift = { x: 0, y: 0 };
    let cursorBounceFrame = 0;
    let isBouncing = false;
    let bounceCircles: {
        x: number;
        y: number;
        radius: number;
        alpha: number;
        frame: number;
    }[] = [];
    let shiftBounceState = 0; // 0: idle, 1: shifting, 2: shrink+bounce, 3: returning
    let shiftBounceFrame = 0;
    let shiftBounceStart = { x: 0, y: 0 };
    let shiftBounceTarget = { x: 0, y: 0 };
    let pendingRipple: { x: number; y: number } | null = null;

    // Animation types
    const animationTypes = [
        { id: "ripple", name: "Ripple Effect" },
        { id: "twinkle", name: "Twinkle Click" },
        { id: "shift-bounce", name: "Shift Bounce" },
    ];

    // Animation particles
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
        size: number;
        type?: string; // For special particle types
        headDist: number;
        tailDist: number;
        maxDist: number;
        tailProgress: number;
    }

    let particles: Particle[] = [];

    // FFmpeg
    const ffmpeg = new FFmpeg();
    const frames: string[] = [];

    onMount(async () => {
        await initFFmpeg();
        await initCanvas();
        setupClickHandler();
    });

    function setupClickHandler() {
        canvas.addEventListener("click", (e) => {
            if (!isAnimating) return; // Only allow clicks when animation is running

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            lastClickX = (e.clientX - rect.left) * scaleX;
            lastClickY = (e.clientY - rect.top) * scaleY;
            createClickEffect(lastClickX, lastClickY);
        });
    }

    function createClickEffect(x: number, y: number) {
        switch (selectedAnimation) {
            case "ripple":
                createRippleEffect(x, y);
                break;
            case "twinkle":
                createTwinkleEffect(x, y);
                break;
            case "shift-bounce":
                createShiftBounceEffect(x, y);
                break;
        }
    }

    function createRippleEffect(x: number, y: number) {
        // Start shrink for ripple, but do NOT start ripple particles yet
        cursorShrink = 0.78; // more pronounced shrink
        cursorShrinkFrame = 0;
        // Store the click position for later ripple
        pendingRipple = { x, y };
    }

    function createTwinkleEffect(x: number, y: number) {
        cursorShrink = 0.85;
        cursorShrinkFrame = 0;
        const cursorSize = 50;
        const margin = 0.08;
        const numParticles = 7;
        // Center the arc on the diagonal (bisector) of the corner, rotated 10° to the right
        const arcCenter = (-3 * Math.PI) / 4 + (10 * Math.PI) / 180; // -135° + 10°
        const arcStart = arcCenter - Math.PI / 2;
        const arcEnd = arcCenter + Math.PI / 2;
        const arcStep = (arcEnd - arcStart) / (numParticles - 1);
        const originX = x - cursorSize / 2;
        const originY = y - cursorSize / 2;
        for (let i = 0; i < numParticles; i++) {
            const angle = arcStart + i * arcStep;
            const startX = originX + Math.cos(angle) * margin;
            const startY = originY + Math.sin(angle) * margin;
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            particles.push({
                x: startX,
                y: startY,
                vx: dirX,
                vy: dirY,
                life: 1,
                color: "#ffe600",
                size: 4 + Math.random() * 1.5,
                type: "twinkle",
                headDist: margin,
                tailDist: margin,
                maxDist: 38 + Math.random() * 10,
                tailProgress: 0,
            });
        }
    }

    function createShiftBounceEffect(x: number, y: number) {
        shiftBounceState = 1;
        shiftBounceFrame = 0;
        shiftBounceStart = { x, y };
        // Shift target: top-left, now closer (e.g., 16px up and 16px left)
        shiftBounceTarget = { x: x - 16, y: y - 16 };
        cursorShrink = 1;
        bounceCircles = [];
    }

    function updateParticles() {
        particles = particles.filter((p) => {
            switch (p.type) {
                case "ripple":
                    p.size += 2;
                    p.life -= 0.02;
                    break;
                case "twinkle": {
                    // Move head outward
                    const speed = 1.35; // a bit faster
                    if (p.headDist < p.maxDist) {
                        p.headDist += speed;
                    } else {
                        // Animate tail toward head
                        if (p.tailDist < p.headDist) {
                            p.tailDist += speed * 1.1;
                        }
                    }
                    // Fade out a bit faster
                    p.life -= 0.018;
                    p.size *= 0.985;
                    break;
                }
            }
            return p.life > 0;
        });
    }

    function drawParticles() {
        particles.forEach((p) => {
            ctx.globalAlpha = p.life;
            if (p.type === "ripple") {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (p.type === "twinkle") {
                // Draw spark as a line from tail to head
                // Recompute origin (top-left corner)
                const cursorSize = 50;
                const originX = lastClickX - cursorSize / 2;
                const originY = lastClickY - cursorSize / 2;
                const headX = originX + p.vx * p.headDist;
                const headY = originY + p.vy * p.headDist;
                const tailX = originX + p.vx * Math.min(p.tailDist, p.headDist);
                const tailY = originY + p.vy * Math.min(p.tailDist, p.headDist);
                ctx.save();
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(headX, headY);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function updateBounceCircles() {
        bounceCircles.forEach((c) => {
            c.radius += 1.5; // slower expansion
            c.alpha -= 0.025; // slower fade
            c.frame++;
        });
        bounceCircles = bounceCircles.filter((c) => c.alpha > 0.05);
    }

    function drawBounceCircles() {
        bounceCircles.forEach((c) => {
            ctx.save();
            ctx.globalAlpha = c.alpha;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "#4a5568";
            ctx.stroke();
            ctx.restore();
        });
    }

    // Helper for ease-in-out
    function easeInOut(t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Helper for quadratic Bezier
    function bezier2(p0, p1, p2, t) {
        const u = 1 - t;
        return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    function animate() {
        if (!isAnimating) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let drawX = lastClickX;
        let drawY = lastClickY;
        let drawSize = 50 * cursorShrink;
        // --- SHIFT-BOUNCE LOGIC ---
        if (selectedAnimation === "shift-bounce" && shiftBounceState > 0) {
            shiftBounceFrame++;
            // Concave curve for shift (slightly down, then left, then a bit right)
            const shiftCtrl = {
                x: shiftBounceStart.x - 40, // left of start
                y: shiftBounceStart.y + 24, // slightly down
            };
            // Convex curve for return (right+down, then a bit left)
            const returnCtrl = {
                x: shiftBounceTarget.x + 56, // right of target
                y: shiftBounceTarget.y + 48, // down from target
            };
            const MOVE_FRAMES = 48; // slower
            const SHRINK_FRAMES = 24; // slower shrink
            const RETURN_FRAMES = 56; // slower return
            if (shiftBounceState === 1) {
                // Move to shifted position along concave curve
                let t = Math.min(1, shiftBounceFrame / MOVE_FRAMES);
                t = easeInOut(t);
                drawX = bezier2(
                    shiftBounceStart.x,
                    shiftCtrl.x,
                    shiftBounceTarget.x,
                    t,
                );
                drawY = bezier2(
                    shiftBounceStart.y,
                    shiftCtrl.y,
                    shiftBounceTarget.y,
                    t,
                );
                if (t >= 1) {
                    shiftBounceState = 2;
                    shiftBounceFrame = 0;
                    cursorShrink = 0.78;
                }
            } else if (shiftBounceState === 2) {
                // Shrink at shifted position
                drawX = shiftBounceTarget.x;
                drawY = shiftBounceTarget.y;
                drawSize = 50 * cursorShrink;
                cursorShrinkFrame++;
                if (cursorShrinkFrame < SHRINK_FRAMES * 0.4) {
                    cursorShrink = 0.7;
                } else if (cursorShrinkFrame < SHRINK_FRAMES * 0.75) {
                    cursorShrink = 0.88;
                } else {
                    cursorShrink = 1;
                }
                // After shrink, start rings and return
                if (shiftBounceFrame === SHRINK_FRAMES) {
                    // Top-left spike of cursor at shifted position
                    const spikeX = drawX - drawSize / 2;
                    const spikeY = drawY - drawSize / 2;
                    bounceCircles = [];
                    for (let i = 0; i < 2; i++) {
                        bounceCircles.push({
                            x: spikeX,
                            y: spikeY,
                            radius: 18 + i * 14,
                            alpha: 1,
                            frame: 0,
                        });
                    }
                    shiftBounceState = 3;
                    shiftBounceFrame = 0;
                }
            } else if (shiftBounceState === 3) {
                // Return to initial position along convex curve, scale up
                let t = Math.min(1, shiftBounceFrame / RETURN_FRAMES);
                t = easeInOut(t);
                drawX = bezier2(
                    shiftBounceTarget.x,
                    returnCtrl.x,
                    shiftBounceStart.x,
                    t,
                );
                drawY = bezier2(
                    shiftBounceTarget.y,
                    returnCtrl.y,
                    shiftBounceStart.y,
                    t,
                );
                // Animate scale up as it returns
                drawSize = 50 * (0.92 + 0.08 * t);
                updateBounceCircles();
                drawBounceCircles();
                if (t >= 1) {
                    shiftBounceState = 0;
                }
            }
            ctx.drawImage(
                cursor_img,
                drawX - drawSize / 2,
                drawY - drawSize / 2,
                drawSize,
                drawSize,
            );
            if (shiftBounceState === 3) {
                updateBounceCircles();
                drawBounceCircles();
            }
        } else {
            // Handle twinkle shrink
            if (selectedAnimation === "twinkle" && cursorShrink < 1) {
                cursorShrinkFrame++;
                if (cursorShrinkFrame < 24) {
                    cursorShrink = 0.85;
                } else if (cursorShrinkFrame < 48) {
                    cursorShrink = 0.92;
                } else {
                    cursorShrink = 1;
                }
            }
            // Handle ripple shrink and trigger ripple after expand
            if (selectedAnimation === "ripple" && cursorShrink < 1) {
                cursorShrinkFrame++;
                if (cursorShrinkFrame < 4) {
                    cursorShrink = 0.78;
                } else if (cursorShrinkFrame < 8) {
                    cursorShrink = 0.92;
                } else {
                    cursorShrink = 1;
                    // Only trigger ripple after expanding, and only once
                    if (pendingRipple) {
                        for (let i = 0; i < 3; i++) {
                            particles.push({
                                x: pendingRipple.x,
                                y: pendingRipple.y,
                                vx: 0,
                                vy: 0,
                                life: 1,
                                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                                size: 5 + i * 10,
                                type: "ripple",
                                headDist: 0,
                                tailDist: 0,
                                maxDist: 0,
                                tailProgress: 0,
                            });
                        }
                        pendingRipple = null;
                    }
                }
            }
            // Draw cursor, anchored at top-left for twinkle shrink
            if (selectedAnimation === "twinkle" && cursorShrink < 1) {
                // Anchor top-left corner
                ctx.drawImage(
                    cursor_img,
                    lastClickX - 25,
                    lastClickY - 25,
                    50 * cursorShrink,
                    50 * cursorShrink,
                );
            } else {
                // Default: center anchor
                ctx.drawImage(
                    cursor_img,
                    drawX - drawSize / 2,
                    drawY - drawSize / 2,
                    drawSize,
                    drawSize,
                );
            }
            updateParticles();
            drawParticles();
        }
        if (isRecording) {
            frames.push(canvas.toDataURL("image/png"));
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    function startRecording() {
        isRecording = true;
        isAnimating = true;
        frames.length = 0;
        particles = [];

        // Create initial click effect in the center
        lastClickX = canvas.width / 2;
        lastClickY = canvas.height / 2;
        createClickEffect(lastClickX, lastClickY);

        animate();
    }

    function stopRecording() {
        isRecording = false;
        isAnimating = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        genFFmpeg();
    }

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
        cursor_img = new Image();
        cursor_img.src = cursor_svg;
        frames.length = 0;

        // Set canvas size to be smaller and more focused
        canvas.width = 300;
        canvas.height = 300;

        await new Promise((resolve) => {
            if (cursor_img.complete) {
                resolve(null);
            } else {
                cursor_img.onload = () => resolve(null);
            }
        });

        // Set initial cursor position to center
        lastClickX = canvas.width / 2;
        lastClickY = canvas.height / 2;
        ctx.drawImage(cursor_img, lastClickX - 25, lastClickY - 25, 50, 50);
    }

    // generate Output
    async function genFFmpeg() {
        async function getBinaryImage(dataUrl: string) {
            return fetch(dataUrl).then(async (res) => await res.arrayBuffer());
        }

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
            }
        });

        try {
            for (let i = 0; i < frames.length; i++) {
                const name = `frame${i.toString().padStart(5, "0")}.png`;
                const binary = await getBinaryImage(frames[i]);
                const uint8Array = new Uint8Array(binary);
                await ffmpeg.writeFile(name, uint8Array);
            }

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
        } catch (error) {
            console.error(error);
            frames.length = 0;
        }
    }
</script>

<div
    style="
    transform-origin: top center;
    position: relative;
    margin-top: 0;
    width: 100%;
    padding: 0 5rem;
    "
    class="w-full flex justify-center items-center flex-col"
>
    <div class="mb-4">
        <select
            bind:value={selectedAnimation}
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {#each animationTypes as type}
                <option value={type.id}>{type.name}</option>
            {/each}
        </select>
    </div>
    <div
        style="
        margin-top: 75px;
        transform-origin: top center;
        "
        class="flex justify-center items-center relative"
    >
        <canvas
            id="my_canvas"
            style="width: 300px; height: 300px;"
            class="bg-white border-blue-500 border-opacity-50 border-8 rounded-2xl overflow-clip"
        />
    </div>
    <div class="mt-4 flex gap-4">
        <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            on:click={startRecording}
        >
            Start Recording
        </button>
        <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            on:click={stopRecording}
        >
            Stop & Export
        </button>
    </div>
</div>
