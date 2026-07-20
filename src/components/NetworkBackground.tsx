"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulseSpeed: number;
  pulseTimer: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let nodes: Node[] = [];
    let particles: Particle[] = [];
    const maxNodes = 40;

    // Initialize nodes
    const initNodes = () => {
      nodes = [];
      const count = Math.min(maxNodes, Math.floor((width * height) / 30000) || 20);
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 2 + 1.5;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          baseRadius: radius,
          radius: radius,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseTimer: Math.random() * Math.PI,
        });
      }
    };

    initNodes();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
      particles = [];
    };

    window.addEventListener("resize", resize);

    // Mouse position
    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Periodic particle generator
    const spawnParticle = () => {
      if (nodes.length === 0) return;
      const source = nodes[Math.floor(Math.random() * nodes.length)];

      // Spawn particles flowing outward
      const particleCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < particleCount; i++) {
        const maxLife = Math.random() * 100 + 100;
        particles.push({
          x: source.x,
          y: source.y,
          speed: Math.random() * 0.8 + 0.4,
          angle: Math.random() * Math.PI * 2,
          life: 0,
          maxLife: maxLife,
          color: Math.random() > 0.4 ? "#F6821F" : "#3b82f6", // Orange or Blue
        });
      }
    };

    let lastSpawnTime = 0;

    let frameId = 0;
    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // Periodic spawn
      if (timestamp - lastSpawnTime > 250) {
        spawnParticle();
        lastSpawnTime = timestamp;
      }

      // Draw vector lines connecting nearby nodes
      const maxDistance = 180;
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Draw clean corporate gradient lines
            const alpha = (1 - dist / maxDistance) * 0.12;

            // Highlight connections close to the mouse
            let highlight = 0;
            if (mouse.active) {
              const mouseDistA = Math.sqrt((nodeA.x - mouse.x) ** 2 + (nodeA.y - mouse.y) ** 2);
              const mouseDistB = Math.sqrt((nodeB.x - mouse.x) ** 2 + (nodeB.y - mouse.y) ** 2);
              if (mouseDistA < 150) highlight += (1 - mouseDistA / 150) * 0.3;
              if (mouseDistB < 150) highlight += (1 - mouseDistB / 150) * 0.3;
            }

            const finalAlpha = Math.min(0.5, alpha + highlight);

            // Draw gradient line
            const grad = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
            // Blend from Orange (A) to Blue/Teal (B)
            grad.addColorStop(0, `rgba(246, 130, 31, ${finalAlpha})`);
            grad.addColorStop(1, `rgba(59, 130, 246, ${finalAlpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = highlight > 0.05 ? 1.0 : 0.6;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }

      // Update and Draw Particles
      particles = particles.filter((p) => {
        p.life++;

        // Move particle
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // Apply a gentle curve over time
        p.angle += (Math.random() - 0.5) * 0.05;

        // Draw particle
        const lifePercent = 1 - p.life / p.maxLife;
        if (lifePercent <= 0) return false;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = lifePercent * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow
        ctx.fillStyle = p.color;
        ctx.globalAlpha = lifePercent * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset

        return p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
      });

      // Update and Draw Nodes
      for (const node of nodes) {
        // Drift movement
        node.x += node.vx;
        node.y += node.vy;

        // Boundaries bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Pulsing radius
        node.pulseTimer += node.pulseSpeed;
        node.radius = node.baseRadius + Math.sin(node.pulseTimer) * 0.8;

        // Mouse hover reactions
        let mouseScale = 1.0;
        if (mouse.active) {
          const mouseDist = Math.sqrt((node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2);
          if (mouseDist < 150) {
            const pull = (1 - mouseDist / 150);
            mouseScale = 1.0 + pull * 1.5;
            // Draw a subtle halo ring
            ctx.strokeStyle = "rgba(246, 130, 31, 0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 4 * pull, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.fillStyle = "#F6821F";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * mouseScale, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-50/10 dark:bg-[#050811] pointer-events-auto select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70 dark:opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-[#050811] h-full pointer-events-none" />
    </div>
  );
}
