import React, { useEffect, useRef } from "react";
import "./Confetti.css";

function Confetti(props) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        // Set canvas dimensions
        canvas.width = props.width;
        canvas.height = props.height;

        // Enhanced confetti colors with gradients
        const confettiColors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
            '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8',
            '#00b894', '#00cec9', '#e17055', '#e84393', '#fdcb6e'
        ];

        const shapes = ['circle', 'square', 'triangle', 'star'];
        const particles = [];
        const numParticles = 150; // More particles for flashy effect

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -Math.random() * canvas.height, // Start from above
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 3 + 2, // Falling down
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                size: Math.random() * 15 + 5,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
                life: 1
            });
        }

        // Draw different shapes
        function drawShape(ctx, particle) {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.fillStyle = particle.color;

            switch (particle.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -particle.size);
                    ctx.lineTo(-particle.size, particle.size);
                    ctx.lineTo(particle.size, particle.size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'star':
                    const spikes = 5;
                    const outerRadius = particle.size;
                    const innerRadius = particle.size * 0.4;
                    ctx.beginPath();
                    for (let i = 0; i < spikes * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i / (spikes * 2)) * 2 * Math.PI;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            ctx.restore();
        }

        // Enhanced animation function
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.rotation += particle.rotationSpeed;

                // Add some air resistance and gravity
                particle.vy += 0.2;
                particle.vx *= 0.99;

                // Fade out over time
                particle.life -= 0.005;
                particle.opacity = Math.max(0, particle.life);

                // Bounce off sides
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx = -particle.vx * 0.8;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }

                // Reset particle when it falls off screen or fades out
                if (particle.y > canvas.height + 50 || particle.opacity <= 0) {
                    particle.x = Math.random() * canvas.width;
                    particle.y = -Math.random() * 100 - 50;
                    particle.vx = (Math.random() - 0.5) * 8;
                    particle.vy = Math.random() * 3 + 2;
                    particle.life = 1;
                    particle.opacity = 1;
                    particle.rotation = Math.random() * 360;
                    particle.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                    particle.shape = shapes[Math.floor(Math.random() * shapes.length)];
                }

                drawShape(ctx, particle);
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Cleanup function to stop animation
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [props.width, props.height]);

    return <canvas ref={canvasRef} className="confetti-canvas" />;
}

export default Confetti;
