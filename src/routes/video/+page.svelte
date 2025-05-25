<script lang="ts">
    import { onMount } from "svelte";
    import cursor_svg from "$lib/assets/cursor/cursor.svg";

    onMount(createCanvas);

    async function createCanvas() {
        const cursor_img = new Image();
        cursor_img.src = cursor_svg;
        cursor_img.onload = function () {
            const canvas = document.getElementById(
                "my_canvas",
            ) as HTMLCanvasElement;
            canvas.width = 500;
            canvas.height = 500;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            let raf: number;

            const target = {
                x: 400,
                y: 400,
                radius: 25,
                color: "rgb(50, 250, 100)",
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStyle = this.color;
                    ctx.fill();
                },
            };

            const ball1 = {
                x: 0,
                y: 0,
                radius: 5,
                color: "rgb(250, 100, 100)",
                t: 0, // parameter from 0 to π
                speed: 0.005, // how fast the ball moves along the arc
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStyle = this.color;
                    ctx.fill();
                },
            };

            const cursor = {
                x: 0,
                y: 0,
                w: 50,
                h: 50,
                t: 0, 
                speed: 0.05,
                draw() {
                    ctx.drawImage(cursor_img, this.x, this.y, this.w, this.h);
                },
            };

            // Calculate values only once at the beginning
            const x0 = cursor.x;
            const y0 = cursor.y;
            const x1 = target.x;
            const y1 = target.y;

            const dx = x1 - x0;
            const dy = y1 - y0;
            const angle = Math.atan2(dy, dx);

            const a = Math.sqrt(dx * dx + dy * dy) / 2;
            const b = a * 0.1; // controls curve strength
            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;

            function moveBall() {
                if (cursor.t > Math.PI) {

                    cursor.w += 0.05
                    cursor.h += 0.05
                    cursor.draw()

                    return false;
                }

                // Parametric ellipse (we move from t = 0 to t = π)
                const xt = a * Math.cos(Math.PI - cursor.t); // flipped so start → target
                const yt = b * Math.sin(cursor.t); // curve upward/downward

                // Rotate and translate to fit the direction
                cursor.x = cx + xt * Math.cos(angle) - yt * Math.sin(angle);
                cursor.y = cy + xt * Math.sin(angle) + yt * Math.cos(angle);

                cursor.t += cursor.speed;

                return true;
            }

            function draw() {
                ctx!.clearRect(0, 0, canvas.width, canvas.height);

                const animating = moveBall();

                target.draw();
                cursor.draw();

                if (animating) {
                    raf = requestAnimationFrame(draw);
                }
            }
            // Start the animation
            raf = requestAnimationFrame(draw);
        };
    }
</script>

<div
    class="min-h-screen w-full flex justify-center items-center flex-col gap-5"
>
    <canvas
        id="my_canvas"
        class="bg-blue-100 border-blue-500 border-4 rounded-2xl overflow-clip"
    />
</div>
