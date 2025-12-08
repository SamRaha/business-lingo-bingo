import React, { useEffect, useRef } from "react";
import "./Confetti.css";

function Confetti(props) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        // Function to set canvas dimensions
        const setCanvasSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        // Set initial canvas dimensions with a slight delay to ensure DOM is ready
        setTimeout(setCanvasSize, 100);

        // Handle window resize
        const handleResize = () => {
            setCanvasSize();
        };

        window.addEventListener('resize', handleResize);

        // Enhanced confetti colors with gradients
        const confettiColors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
            '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8',
            '#00b894', '#00cec9', '#e17055', '#e84393', '#fdcb6e'
        ];

        const shapes = ['circle', 'square', 'triangle', 'star'];
        const particles = [];
        const numParticles = 200; // Even more particles for full coverage

        // Create particles with guaranteed full-width coverage
        for (let i = 0; i < numParticles; i++) {
            // Force some particles to start on the left side
            let x;
            if (i < numParticles / 3) {
                // First third: specifically spawn on left side
                x = Math.random() * (window.innerWidth * 0.4);
            } else if (i < (numParticles * 2) / 3) {
                // Second third: center area
                x = (window.innerWidth * 0.3) + Math.random() * (window.innerWidth * 0.4);
            } else {
                // Last third: right side
                x = (window.innerWidth * 0.6) + Math.random() * (window.innerWidth * 0.4);
            }

            particles.push({
                x: x,
                y: -Math.random() * window.innerHeight, // Start from above
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
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

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
                if (particle.x < 0 || particle.x > window.innerWidth) {
                    particle.vx = -particle.vx * 0.8;
                    particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
                }

                // Reset particle when it falls off screen or fades out
                if (particle.y > window.innerHeight + 50 || particle.opacity <= 0) {
                    // Ensure full-width respawn distribution
                    const rand = Math.random();
                    if (rand < 0.33) {
                        particle.x = Math.random() * (window.innerWidth * 0.4); // Left third
                    } else if (rand < 0.66) {
                        particle.x = (window.innerWidth * 0.3) + Math.random() * (window.innerWidth * 0.4); // Center
                    } else {
                        particle.x = (window.innerWidth * 0.6) + Math.random() * (window.innerWidth * 0.4); // Right
                    }

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

        // Cleanup function to stop animation and remove event listener
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="confetti-canvas" />;
}

export default Confetti;
