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

        // Define confetti particles
        const confettiColors = ["#00ff00", "#ff00ff", "#00ffff", "#ff0000", "#ffff00"];
        const particles = [];
        const numParticles = 50;
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                radius: Math.random() * 10,
            });
        }

        // Define animation function
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
                ctx.fillStyle = particle.color;
                ctx.fill();
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
