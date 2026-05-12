"use client";

import { useEffect, useRef, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";

interface Metric {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  color: string;
  delay: number;
}

const METRICS: Metric[] = [
  {
    value: 47,
    label: "equipos formados",
    detail: "vs 21 días en Excel + Google Chat",
    color: BBVA.lime,
    delay: 0,
  },
  {
    value: 92,
    suffix: "%",
    label: "matches aceptados",
    detail: "por managers en primer paso",
    color: BBVA.sereneBlue,
    delay: 80,
  },
  {
    value: 134,
    label: "talentos descubiertos",
    detail: "fuera del radar habitual",
    color: BBVA.purple,
    delay: 160,
  },
];

/**
 * Count-up hook that respects session memory.
 * If the user already saw this counter animate in the current session
 * (e.g. they visited home, navigated away, and came back), the value jumps
 * straight to `target` after hydration to avoid the "everything resets to 0"
 * effect.
 *
 * SSR safety: useState ALWAYS starts at 0 so the server-rendered HTML and
 * the first client render match. The sessionStorage check happens inside
 * useEffect (post-hydration). Without this rule we get a hydration mismatch
 * because window/sessionStorage don't exist on the server.
 */
function useCountUp(target: number, duration = 1400, startDelay = 0, sessionKey?: string): number {
  const storageKey = sessionKey ? `bbva-talent:countup:${sessionKey}:${target}` : null;
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Post-hydration: now it's safe to read sessionStorage. If we already
    // animated this counter in the session, snap directly to target.
    const alreadyAnimated = (() => {
      if (!storageKey) return false;
      try {
        return window.sessionStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    })();

    if (alreadyAnimated) {
      setValue(target);
      return;
    }

    let raf = 0;
    const begin = () => {
      let start: number | null = null;
      const tick = (ts: number) => {
        if (start === null) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          if (storageKey) {
            try { window.sessionStorage.setItem(storageKey, "1"); } catch { /* ignore */ }
          }
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const t = setTimeout(begin, startDelay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, startDelay, storageKey]);

  return value;
}

function MetricCard({ metric }: { metric: Metric }) {
  const value = useCountUp(metric.value, 1400, 250 + metric.delay, metric.label);

  return (
    <div
      className="relative rounded-xl px-4 py-3 overflow-hidden"
      style={{
        background: "var(--theme-bg-surface-soft)",
        border: `1px solid ${metric.color}25`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${metric.color}1a 0%, transparent 70%)` }}
      />
      <div className="relative z-10">
        <p className="font-black font-mono leading-none mb-1" style={{ color: metric.color, fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>
          {value}
          {metric.suffix && <span className="text-[0.65em] ml-0.5">{metric.suffix}</span>}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest leading-tight" style={{ color: "var(--theme-text-secondary)" }}>
          {metric.label}
        </p>
        <p className="font-mono text-[10px] leading-tight mt-1" style={{ color: "var(--theme-text-dim)" }}>
          {metric.detail}
        </p>
      </div>
    </div>
  );
}

export default function ImpactMetrics() {
  return (
    <div
      className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-2xl mb-8 animate-fade-up"
      style={{ animationDelay: "0.18s" }}
    >
      {METRICS.map(m => (
        <MetricCard key={m.label} metric={m} />
      ))}
    </div>
  );
}
