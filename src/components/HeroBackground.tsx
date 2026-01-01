"use client";

import { useEffect, useRef } from "react";

interface Pulse {
  x: number; // Grid index X
  y: number; // Grid index Y
  age: number; // Frames since birth
  life: number; // Total life frames
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Grid Configuration
    const gridSize = 40; // px
    let cols = 0;
    let rows = 0;
    
    // Grid State for Collision Dampening
    // Stores a value 0.0 -> 1.0 where 1.0 means fully dampened (invisible)
    let dampeningMap: number[] = []; // 1D array representing 2D grid

    // Resize Handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / gridSize);
      rows = Math.ceil(canvas.height / gridSize);
      dampeningMap = new Array(cols * rows).fill(0);
    };
    
    window.addEventListener("resize", resize);
    resize();

    // Animation State
    let pulses: Pulse[] = [];
    let frameId = 0;

    // Spawner
    const spawnPulse = (targetX?: number, targetY?: number) => {
      const x = targetX ?? Math.floor(Math.random() * cols);
      const y = targetY ?? Math.floor(Math.random() * rows);
      pulses.push({ x, y, age: 0, life: 50 }); 
    };

    let lastTime = 0;
    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
       const rect = canvas.getBoundingClientRect();
       mouse.x = e.clientX - rect.left;
       mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridX = Math.round(clickX / gridSize);
        const gridY = Math.round(clickY / gridSize);
        
        spawnPulse(gridX, gridY);
    };
    canvas.addEventListener("click", handleClick);

    // Draw Loop
    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update Pulses
      pulses.forEach(p => p.age += deltaTime);
      pulses = pulses.filter(p => p.age < p.life);

      if (Math.random() < 0.3 * deltaTime) spawnPulse();

      // Draw Vertical Lines
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j < rows; j++) {
          let intensity = 0;
          let activeSources = 0;
          const cx = i;
          const cy = j + 0.5;

          // Mouse influence
          const mx = (mouse.x / gridSize);
          const my = (mouse.y / gridSize);
          const mDist = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
          if (mDist < 4) {
             const mInt = (1 - mDist / 4) * 0.8;
             intensity += mInt;
             if (mInt > 0.1) activeSources++;
          }

          for (const p of pulses) {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const currentRadius = p.age * 10;                                                                                                                       
            const diff = Math.abs(dist - currentRadius);
            
            if (diff < 2.0) { 
              const decay = Math.max(0, 1 - (p.age / p.life));
              const pulseInt = (1 - diff / 2.0) * decay;
              intensity += pulseInt;
              if (pulseInt > 0.1) activeSources++;
            }
          }

          // DAMPENING LOGIC (Vertical)
          // Map index logic: roughly map segment to a cell index (using i,j)
          // We use simple mapping for vertical segments vertical-index = i * rows + j
          const mapIdx = i * rows + j;
          
          if (dampeningMap[mapIdx] === undefined) dampeningMap[mapIdx] = 0;

          // If collision (multiple sources > threshold), burn the spot
          if (activeSources > 1 && intensity > 0.5) {
             dampeningMap[mapIdx] = Math.min(dampeningMap[mapIdx] + 5 * deltaTime, 1.0); // Burn fast
          } else {
             dampeningMap[mapIdx] = Math.max(dampeningMap[mapIdx] - 0.5 * deltaTime, 0); // Recover slowly
          }

          // Apply dampening
          // "Disappear slowly" -> High dampening reduces intensity
          const displayedIntensity = Math.max(0, intensity - dampeningMap[mapIdx]);

          const x = i * gridSize;
          const y1 = j * gridSize;
          const y2 = (j + 1) * gridSize;
          
          drawLine(ctx, x, y1, x, y2, displayedIntensity);
        }
      }

      // Draw Horizontal Lines
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i < cols; i++) {
          let intensity = 0;
          let activeSources = 0;
          const cx = i + 0.5;
          const cy = j;

          const mx = (mouse.x / gridSize);
          const my = (mouse.y / gridSize);
          const mDist = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
          if (mDist < 4) {
             const mInt = (1 - mDist / 4) * 0.8;
             intensity += mInt;
             if (mInt > 0.1) activeSources++;
          }

          for (const p of pulses) {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const currentRadius = p.age * 10;
            const diff = Math.abs(dist - currentRadius);
            if (diff < 2.0) {
              const decay = Math.max(0, 1 - (p.age / p.life));
              const pulseInt = (1 - diff / 2.0) * decay;
              intensity += pulseInt;
              if (pulseInt > 0.1) activeSources++;
            }
          }

          // DAMPENING LOGIC (Horizontal)
          // distinct index required compared to vertical? 
          // Let's use an offset in the map: vertical count = (cols+1)*rows. Horizontal starts after.
          // Horizontal Map Index
          const hMapOffset = (cols + 1) * rows;
          const mapIdx = hMapOffset + (j * cols + i);
          
          if (dampeningMap[mapIdx] === undefined) dampeningMap[mapIdx] = 0;

          if (activeSources > 1 && intensity > 0.5) {
             dampeningMap[mapIdx] = Math.min(dampeningMap[mapIdx] + 5 * deltaTime, 1.0); 
          } else {
             dampeningMap[mapIdx] = Math.max(dampeningMap[mapIdx] - 0.5 * deltaTime, 0); 
          }

          const displayedIntensity = Math.max(0, intensity - dampeningMap[mapIdx]);

          const x1 = i * gridSize;
          const x2 = (i + 1) * gridSize;
          const y = j * gridSize;

          drawLine(ctx, x1, y, x2, y, displayedIntensity);
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    // Helper to draw a line with dynamic color
    const drawLine = (c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, intensity: number) => {
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      
      // Base Grid Color (very dim) -> Accent Color (bright)
      // Base: rgba(120, 113, 108, 0.1) -> stone-500 @ 10%
      // Accent: var(--accent) (#ff4f00)
      
      if (intensity > 0.05) {
        // Linear intensity boost
        let alpha = 0.1 + intensity * 0.5; // Reduced max alpha (was 0.9)
        let width = 1 + intensity * 0.5; // Reduced width expansion (was 1 + intensity)
        
        // COLLISION / OVERLOAD EFFECT
        // If intensity > 1 (overlapping waves or mouse+wave), go WHITE/HOT
        if (intensity > 1.0) {
            c.strokeStyle = `rgba(255, 255, 255, ${Math.min(alpha, 0.8)})`; // Cap alpha at 0.8
            c.lineWidth = width * 1.2; 
        } else {
            // Standard Accent
            const r = 255, g = 79, b = 0; 
            c.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(alpha, 0.6)})`; // Cap alpha at 0.6
            c.lineWidth = width;
        }
      } else {
        // Base Line
        c.strokeStyle = "rgba(120, 113, 108, 0.05)"; // Halved base opacity (was 0.1)
        c.lineWidth = 1;
      }
      
      c.stroke();
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-stone-50/50 dark:bg-[#0c0a09] pointer-events-auto">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Overlay Gradient to soften edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-100/80 dark:to-[#0c0a09] h-full pointer-events-none"></div>
    </div>
  );
}
