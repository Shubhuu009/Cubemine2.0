'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  saturation: number;
  opacity: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let orbs: Orb[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < Math.min(count, 120); i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.35 + 0.05,
          hue: 230 + Math.random() * 60,
        });
      }
    };

    const initOrbs = () => {
      orbs = [];
      const orbCount = 4;
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 150 + Math.random() * 200,
          hue: [240, 260, 280, 200][i],
          saturation: 70 + Math.random() * 20,
          opacity: 0.015 + Math.random() * 0.02,
        });
      }
    };

    const drawGrid = () => {
      const gridSize = 80;
      const scrollOffset = (time * 8) % gridSize;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.018)';
      ctx.lineWidth = 0.5;

      for (let x = -scrollOffset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -scrollOffset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawOrbs = () => {
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, ${orb.saturation}%, 60%, ${orb.opacity})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue}, ${orb.saturation}%, 50%, ${orb.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${orb.hue}, ${orb.saturation}%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const pulse = Math.sin(time * 2 + p.x * 0.01) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${Math.max(0.02, p.opacity + pulse)})`;
        ctx.fill();
      });
    };

    const drawConnections = () => {
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = 0.04 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawOrbs();
      drawGrid();
      drawParticles();
      drawConnections();

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    initOrbs();
    animate();

    const handleResize = () => {
      resize();
      initParticles();
      initOrbs();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
