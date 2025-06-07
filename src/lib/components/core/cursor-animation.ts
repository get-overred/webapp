import cursor_svg1 from "$lib/assets/cursor1.svg";
import cursor_svg2 from "$lib/assets/cursor2.svg";
import cursor_svg3 from "$lib/assets/cursor3.svg";

// Main externally callable function
export function triggerCursorAnimation(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    size: number,
    animationType: string,
    onComplete?: () => void
) {
    // Animation state scoped to this call
    let lastClickX = x;
    let lastClickY = y;
    let cursor_img: HTMLImageElement = new window.Image();
    cursor_img.src =
        animationType === "ripple"
            ? cursor_svg1
            : animationType === "twinkle"
                ? cursor_svg2
                : cursor_svg3;
    let animationFrameId: number;
    let isAnimating = true;
    let selectedAnimation = animationType;
    let cursorShrink = 1;
    let cursorShrinkFrame = 0;
    let bounceCircles: {
        x: number;
        y: number;
        radius: number;
        alpha: number;
        frame: number;
    }[] = [];
    let shiftBounceState = 0;
    let shiftBounceFrame = 0;
    let shiftBounceStart = { x: 0, y: 0 };
    let shiftBounceTarget = { x: 0, y: 0 };
    let pendingRipple: { x: number; y: number } | null = null;
    let particles: Particle[] = [];

    // Animation particles
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
        size: number;
        type?: string;
        headDist: number;
        tailDist: number;
        maxDist: number;
        tailProgress: number;
    }

    function createRippleEffect(x: number, y: number) {
        cursorShrink = 0.78;
        cursorShrinkFrame = 0;
        pendingRipple = { x, y };
    }

    function createTwinkleEffect(x: number, y: number) {
        cursorShrink = 0.85;
        cursorShrinkFrame = 0;
        const cursorSize = size;
        const margin = 0.08;
        const numParticles = 7;
        const arcCenter = (-3 * Math.PI) / 4 + (10 * Math.PI) / 180;
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
                maxDist: 20 + Math.random() * 5,
                tailProgress: 0,
            });
        }
    }

    function createShiftBounceEffect(x: number, y: number) {
        shiftBounceState = 1;
        shiftBounceFrame = 0;
        shiftBounceStart = { x, y };
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
                    const speed = 1.0;
                    if (p.headDist < p.maxDist) {
                        p.headDist += speed;
                    } else {
                        if (p.tailDist < p.headDist) {
                            p.tailDist += speed * 1.1;
                        }
                    }
                    p.life -= 0.012;
                    p.size *= 0.992;
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
                const cursorSize = size;
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
            c.radius += 1.5;
            c.alpha -= 0.025;
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

    function easeInOut(t: number) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function bezier2(p0, p1, p2, t) {
        const u = 1 - t;
        return u * u * p0 + 2 * u * t * p1 + t * t * p2;
    }

    function animate() {
        if (!isAnimating) {
            if (onComplete) onComplete();
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let drawX = lastClickX;
        let drawY = lastClickY;
        let drawSize = size * cursorShrink;

        // Check if all animations are truly complete
        const isAnimationComplete = () => {
            if (selectedAnimation === "shift-bounce") {
                return shiftBounceState === 0 && bounceCircles.length === 0;
            } else if (selectedAnimation === "ripple") {
                return cursorShrink === 1 && particles.length === 0;
            } else if (selectedAnimation === "twinkle") {
                return cursorShrink === 1 && particles.length === 0;
            }
            return false;
        };

        if (selectedAnimation === "shift-bounce" && shiftBounceState > 0) {
            shiftBounceFrame++;
            const shiftCtrl = {
                x: shiftBounceStart.x - 40,
                y: shiftBounceStart.y + 24,
            };
            const returnCtrl = {
                x: shiftBounceTarget.x + 56,
                y: shiftBounceTarget.y + 48,
            };
            const MOVE_FRAMES = 48;
            const SHRINK_FRAMES = 24;
            const RETURN_FRAMES = 56;
            if (shiftBounceState === 1) {
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
                drawX = shiftBounceTarget.x;
                drawY = shiftBounceTarget.y;
                drawSize = size * cursorShrink;
                cursorShrinkFrame++;
                if (cursorShrinkFrame < SHRINK_FRAMES * 0.4) {
                    cursorShrink = 0.7;
                } else if (cursorShrinkFrame < SHRINK_FRAMES * 0.75) {
                    cursorShrink = 0.88;
                } else {
                    cursorShrink = 1;
                }
                if (shiftBounceFrame === SHRINK_FRAMES) {
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
                drawSize = size * (0.92 + 0.08 * t);
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
            if (selectedAnimation === "twinkle" && cursorShrink < 1) {
                cursorShrinkFrame++;
                if (cursorShrinkFrame < 12) {
                    cursorShrink = 0.85;
                } else if (cursorShrinkFrame < 24) {
                    cursorShrink = 0.92;
                } else {
                    cursorShrink = 1;
                }
            }
            if (selectedAnimation === "ripple" && cursorShrink < 1) {
                cursorShrinkFrame++;
                if (cursorShrinkFrame < 8) {
                    cursorShrink = 0.78 + (cursorShrinkFrame / 8) * 0.14;
                } else if (cursorShrinkFrame < 16) {
                    cursorShrink = 0.92 + ((cursorShrinkFrame - 8) / 8) * 0.08;
                } else {
                    cursorShrink = 1;
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
            if (selectedAnimation === "twinkle" && cursorShrink < 1) {
                ctx.drawImage(
                    cursor_img,
                    lastClickX - size / 2,
                    lastClickY - size / 2,
                    size * cursorShrink,
                    size * cursorShrink,
                );
            } else {
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

        // Check if animation is complete after all updates
        if (isAnimationComplete()) {
            isAnimating = false;
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Start the animation
    particles = [];
    switch (animationType) {
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
    animate();
}
