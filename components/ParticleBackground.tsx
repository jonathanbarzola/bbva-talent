"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 65;
const CONNECTION_DISTANCE = 140;
const FALLBACK_COLOR = "133, 200, 255";
const FALLBACK_ALPHA_MULT = 1;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface ThemeStyle {
  color: string;
  alphaMult: number;
}

// Read theme-driven canvas styling from CSS vars on the document root. Both vars
// are defined per theme in globals.css; light mode boosts alpha so the dark-blue
// particles stay visible against the near-white background.
function readThemeStyle(): ThemeStyle {
  if (typeof window === "undefined") return { color: FALLBACK_COLOR, alphaMult: FALLBACK_ALPHA_MULT };
  const root = getComputedStyle(document.documentElement);
  const color = root.getPropertyValue("--theme-particle-rgb").trim() || FALLBACK_COLOR;
  const alphaMult = parseFloat(root.getPropertyValue("--theme-particle-alpha").trim()) || FALLBACK_ALPHA_MULT;
  return { color, alphaMult };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const styleRef = useRef<ThemeStyle>({ color: FALLBACK_COLOR, alphaMult: FALLBACK_ALPHA_MULT });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    const particles: Particle[] = [];

    styleRef.current = readThemeStyle();

    // React to theme toggle: when html[data-theme] flips, re-read both CSS vars.
    const themeObserver = new MutationObserver(() => {
      styleRef.current = readThemeStyle();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.3 + 0.4,
          alpha: Math.random() * 0.32 + 0.08,
        });
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const { color, alphaMult } = styleRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${Math.min(1, p.alpha * alphaMult)})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length - 1; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DISTANCE) {
            const lineAlpha = Math.min(1, (1 - d / CONNECTION_DISTANCE) * 0.11 * alphaMult);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);
    resize();
    init();
    tick();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
