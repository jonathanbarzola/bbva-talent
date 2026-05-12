"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";

export interface OnboardingStep {
  targetId: string;
  title: string;
  body: string;
  placement?: "top" | "bottom";
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  open: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function readRect(id: string): TargetRect | null {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function OnboardingTour({ steps, open, onClose, onFinish }: OnboardingTourProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);

  const step = steps[stepIdx] ?? null;

  useEffect(() => {
    if (!open) setStepIdx(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;

    const el = typeof document !== "undefined" ? document.getElementById(step.targetId) : null;
    const update = () => setRect(readRect(step.targetId));

    // Bring the target into view BEFORE measuring — otherwise the spotlight
    // can land off-screen when the home page grows beyond a single viewport.
    if (el) {
      const r = el.getBoundingClientRect();
      const offscreen = r.top < 80 || r.bottom > window.innerHeight - 80;
      if (offscreen) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    update();

    // Re-measure after smooth-scroll settles (~350ms is enough for the default easing).
    const t1 = setTimeout(update, 80);
    const t2 = setTimeout(update, 380);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIdx]);

  const handleNext = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      onFinish?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const handleClose = () => {
    onClose();
  };

  if (!open || !step) return null;

  // Decide placement dynamically — if the requested placement would clip the
  // tooltip off-screen, flip it. Tooltip height is ~220px (header + body + dots + buttons).
  const TOOLTIP_H = 220;
  const TOOLTIP_W = 360;
  const GAP = 16;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

  let placement: "top" | "bottom" = step.placement ?? (rect && rect.top > vh / 2 ? "top" : "bottom");
  if (rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceAbove = rect.top;
    if (placement === "bottom" && spaceBelow < TOOLTIP_H + GAP && spaceAbove > spaceBelow) placement = "top";
    if (placement === "top" && spaceAbove < TOOLTIP_H + GAP && spaceBelow > spaceAbove) placement = "bottom";
  }

  const tooltipStyle: React.CSSProperties = rect
    ? placement === "bottom"
      ? {
          top: Math.min(rect.top + rect.height + GAP, vh - TOOLTIP_H - GAP),
          left: Math.max(GAP, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - GAP)),
        }
      : {
          top: Math.max(GAP, rect.top - TOOLTIP_H - GAP),
          left: Math.max(GAP, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - GAP)),
        }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-root"
        role="dialog"
        aria-modal="true"
        aria-label="Tour guiado de BBVA Talent"
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Click-capturer — closes the tour on outside click.
            When a spotlight target is found, this layer stays TRANSPARENT — the
            spotlight's inverse box-shadow does the dimming. If we tinted it here,
            it would stack on top of the spotlight cutout and the target would
            appear dark. When no target is found we fall back to a full backdrop
            so the tooltip isn't floating over a clear page. */}
        <div
          className="absolute inset-0"
          onClick={handleClose}
          style={{
            background: rect ? "transparent" : "var(--theme-bg-modal-backdrop)",
            backdropFilter: rect ? undefined : "blur(4px)",
          }}
        />

        {/* Spotlight ring around target */}
        {rect && (
          <motion.div
            key={`spot-${stepIdx}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              border: `2px solid ${BBVA.purple}`,
              // Inverse box-shadow creates a "spotlight" effect — dims everything
              // OUTSIDE this rect while leaving the target fully visible.
              boxShadow: `0 0 0 9999px rgba(5,10,20,0.78), 0 0 60px ${BBVA.purple}66`,
            }}
          >
            <motion.span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ background: BBVA.purple, boxShadow: `0 0 12px ${BBVA.purple}` }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          key={`tooltip-${stepIdx}`}
          initial={{ opacity: 0, y: placement === "bottom" ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute w-[360px] max-w-[92vw] rounded-2xl p-5"
          style={{
            ...tooltipStyle,
            background: "var(--theme-bg-surface-strong)",
            border: `1px solid ${BBVA.purple}40`,
            boxShadow: `0 18px 60px rgba(0,0,0,0.55), 0 0 50px ${BBVA.purple}22`,
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Step counter */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
              style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}30` }}
            >
              Paso {stepIdx + 1} de {steps.length}
            </span>
            <button
              onClick={handleClose}
              className="font-mono text-[10px] hover:opacity-100 transition-opacity"
              style={{ color: "var(--theme-text-muted)", opacity: 0.7, cursor: "pointer" }}
              aria-label="Cerrar tour"
            >
              Saltar tour ✕
            </button>
          </div>

          {/* Body */}
          <h3 className="font-black text-base mb-2 leading-tight" style={{ color: "var(--theme-text-primary)" }}>
            {step.title}
          </h3>
          <p className="font-mono text-[12px] leading-relaxed mb-5" style={{ color: "var(--theme-text-secondary)" }}>
            {step.body}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === stepIdx ? 24 : 8,
                  background: i === stepIdx ? BBVA.purple : "rgba(150,148,255,0.18)",
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="px-3 py-2 rounded-lg font-mono text-[11px] font-bold transition-opacity"
              style={{
                background: "var(--theme-tile-soft)",
                border: "1px solid rgba(133,200,255,0.1)",
                color: stepIdx === 0 ? "var(--theme-text-faint)" : "var(--theme-text-muted)",
                cursor: stepIdx === 0 ? "not-allowed" : "pointer",
                opacity: stepIdx === 0 ? 0.5 : 1,
              }}
            >
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 rounded-lg font-black text-[12px] uppercase tracking-wider transition-transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`,
                color: "#fff",
                letterSpacing: "0.07em",
                boxShadow: `0 0 24px ${BBVA.purple}55`,
                cursor: "pointer",
              }}
            >
              {stepIdx === steps.length - 1 ? "Empezar →" : "Siguiente →"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
