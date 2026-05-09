"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { explainMatchScore, type ExplainContext, type ScoreFactor } from "@/lib/scoreExplain";
import type { EmpleadoResult } from "@/lib/types";

interface WhyCandidateModalProps {
  candidate: EmpleadoResult | null;
  open: boolean;
  onClose: () => void;
  context?: ExplainContext;
}

const CATEGORY_CONFIG: Record<ScoreFactor["category"], { color: string; icon: string; label: string }> = {
  skills:        { color: BBVA.lime,       icon: "◆", label: "Skills" },
  trust:         { color: BBVA.canary,     icon: "♛", label: "Trust" },
  availability:  { color: BBVA.sereneBlue, icon: "○", label: "Disponibilidad" },
  domain:        { color: BBVA.mandarin,   icon: "▲", label: "Dominio" },
  collaboration: { color: BBVA.purple,     icon: "⇄", label: "Colaboración" },
  seniority:     { color: BBVA.ice,        icon: "★", label: "Seniority" },
  edi:           { color: "#9be8a3",       icon: "✓", label: "EDI" },
};

function FactorRow({ factor, index }: { factor: ScoreFactor; index: number }) {
  const cfg = CATEGORY_CONFIG[factor.category];
  const isNegative = factor.contribution < 0;
  const fillPct = Math.min(100, Math.max(0, (Math.abs(factor.contribution) / Math.max(1, factor.maxContribution)) * 100));
  const sign = factor.contribution > 0 ? "+" : factor.contribution < 0 ? "−" : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="rounded-xl px-4 py-3"
      style={{
        background: isNegative ? "rgba(248,113,113,0.05)" : `${cfg.color}07`,
        border: `1px solid ${isNegative ? "rgba(248,113,113,0.18)" : cfg.color + "20"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: isNegative ? "rgba(248,113,113,0.15)" : `${cfg.color}1a`,
            border: `1px solid ${isNegative ? "rgba(248,113,113,0.35)" : cfg.color + "40"}`,
          }}
        >
          <span style={{ color: isNegative ? "#fca5a5" : cfg.color, fontSize: 13 }}>{cfg.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-bold text-[13px] leading-tight" style={{ color: "#e8eeff" }}>
              {factor.label}
            </p>
            <span
              className="font-mono text-xs font-black flex-shrink-0"
              style={{ color: isNegative ? "#fca5a5" : cfg.color }}
            >
              {sign}{Math.abs(factor.contribution)} pts
            </span>
          </div>

          {/* Bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(133,200,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 0.6, delay: 0.15 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: isNegative
                  ? "linear-gradient(90deg, #fca5a5, #f87171)"
                  : `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
              }}
            />
          </div>

          <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#a8b8d0" }}>
            {factor.detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function WhyCandidateModal({ candidate, open, onClose, context }: WhyCandidateModalProps) {
  const router = useRouter();
  const explanation = useMemo(
    () => (candidate ? explainMatchScore(candidate, context) : null),
    [candidate, context]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!candidate || !explanation) return null;

  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const positiveSum = explanation.factors.filter(f => f.contribution > 0).reduce((s, f) => s + f.contribution, 0);
  const negativeSum = explanation.factors.filter(f => f.contribution < 0).reduce((s, f) => s + f.contribution, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="why-root"
          role="dialog"
          aria-modal="true"
          aria-label={`Auditoría del match de ${candidate.nombre}`}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div
            className="absolute inset-0"
            onClick={onClose}
            style={{ background: "rgba(5,10,20,0.88)", backdropFilter: "blur(8px)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col rounded-2xl"
            style={{
              background: "rgba(10,22,40,0.97)",
              border: `1px solid ${BBVA.purple}40`,
              boxShadow: `0 28px 80px rgba(0,0,0,0.6), 0 0 60px ${BBVA.purple}22`,
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <header className="flex items-start gap-4 p-5" style={{ borderBottom: "1px solid rgba(133,200,255,0.08)" }}>
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #001391, #0020cc)", boxShadow: "0 0 20px rgba(0,19,145,0.5)", color: "#fff" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded inline-block mb-1.5"
                  style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
                >
                  Auditoría de match
                </span>
                <h2 className="font-black text-base leading-tight mb-0.5" style={{ color: "#e8eeff" }}>
                  ¿Por qué {candidate.nombre.split(" ")[0]}?
                </h2>
                <p className="font-mono text-[11px]" style={{ color: "#6b7fa3" }}>
                  {candidate.rol} · {candidate.squad}
                  {context?.roleName && context.roleName !== candidate.rol && ` · evaluado para ${context.roleName}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black font-mono leading-none" style={{ color: BBVA.lime, fontSize: 36 }}>
                  {explanation.totalScore}
                </div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: "#3d4f6e" }}>% match</div>
              </div>
            </header>

            {/* Summary + warnings */}
            <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(133,200,255,0.06)" }}>
              <p className="text-[13px] leading-relaxed mb-2" style={{ color: "#c8d4ec" }}>
                {explanation.summary}
              </p>
              {explanation.warnings.length > 0 && (
                <div className="space-y-1 mt-3">
                  {explanation.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-3 py-2"
                      style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.20)" }}
                    >
                      <span style={{ color: "#fca5a5", fontSize: 12 }}>⚠</span>
                      <p className="font-mono text-[11px] leading-relaxed flex-1" style={{ color: "#fca5a5" }}>
                        {w}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Factors */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: "#6b7fa3" }}>
                  Desglose del score
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px]" style={{ color: BBVA.lime }}>
                    +{positiveSum} pts
                  </span>
                  {negativeSum < 0 && (
                    <span className="font-mono text-[10px]" style={{ color: "#fca5a5" }}>
                      {negativeSum} pts
                    </span>
                  )}
                </div>
              </div>
              {explanation.factors.map((f, i) => (
                <FactorRow key={f.label} factor={f} index={i} />
              ))}
            </div>

            {/* Footer */}
            <footer className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderTop: "1px solid rgba(133,200,255,0.08)", background: "rgba(5,10,20,0.5)" }}>
              <p className="font-mono text-[10px] leading-tight flex-1 min-w-0" style={{ color: "#3d4f6e" }}>
                Modelo de scoring auditable · Cumple con principios de transparencia algorítmica (GDPR Art. 22).
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { onClose(); router.push(`/candidate/${candidate.id}`); }}
                  className="px-4 py-2 rounded-lg font-mono text-[11px] font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`,
                    color: "#fff",
                    boxShadow: `0 0 18px ${BBVA.purple}40`,
                    cursor: "pointer",
                  }}
                >
                  Ver perfil completo →
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-mono text-[11px] font-bold transition-opacity hover:opacity-80"
                  style={{ background: `${BBVA.sereneBlue}10`, border: `1px solid ${BBVA.sereneBlue}30`, color: BBVA.sereneBlue, cursor: "pointer" }}
                >
                  Cerrar
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
