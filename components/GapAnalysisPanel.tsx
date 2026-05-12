"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { Gap, GapSeverity, GapCategory } from "@/lib/gapAnalysis";

interface GapAnalysisPanelProps {
  gaps: Gap[];
}

const SEVERITY_CONFIG: Record<GapSeverity, { color: string; label: string; bg: string; border: string }> = {
  critical: { color: "#f87171", label: "Crítico",  bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.32)" },
  high:     { color: "#fb923c", label: "Alto",     bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.28)" },
  medium:   { color: BBVA.canary, label: "Medio",  bg: `${BBVA.canary}10`,        border: `${BBVA.canary}30` },
  low:      { color: BBVA.sereneBlue, label: "Bajo", bg: `${BBVA.sereneBlue}08`,  border: `${BBVA.sereneBlue}22` },
};

const CATEGORY_ICONS: Record<GapCategory, string> = {
  coverage:      "◬",
  availability:  "○",
  seniority:     "▲",
  collaboration: "⇄",
  trust:         "♛",
  skills:        "✦",
};

const CATEGORY_LABELS: Record<GapCategory, string> = {
  coverage:      "Cobertura",
  availability:  "Disponibilidad",
  seniority:     "Seniority",
  collaboration: "Colaboración",
  trust:         "Trust",
  skills:        "Skills",
};

function GapCard({ gap, index }: { gap: Gap; index: number }) {
  const [expanded, setExpanded] = useState(gap.severity === "critical");
  const cfg = SEVERITY_CONFIG[gap.severity];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left transition-colors"
        style={{ cursor: "pointer" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${cfg.color}1a`, border: `1px solid ${cfg.color}40` }}
        >
          <span style={{ color: cfg.color, fontSize: 13 }}>{CATEGORY_ICONS[gap.category]}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${cfg.color}1c`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
            >
              {cfg.label}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
              {CATEGORY_LABELS[gap.category]}
            </span>
          </div>
          <p className="font-bold text-sm leading-tight" style={{ color: "var(--theme-text-primary)" }}>
            {gap.title}
          </p>
          {!expanded && (
            <p className="font-mono text-[11px] mt-0.5 truncate" style={{ color: "var(--theme-text-muted)" }}>
              {gap.detail}
            </p>
          )}
        </div>

        <span
          className="flex-shrink-0 font-mono text-[10px] transition-transform"
          style={{ color: "var(--theme-text-dim)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 pl-[3.75rem]">
              <p className="font-mono text-[11px] leading-relaxed mb-3" style={{ color: "var(--theme-text-secondary)" }}>
                {gap.detail}
              </p>
              {gap.recommendation && (
                <div
                  className="rounded-lg px-3 py-2 flex items-start gap-2"
                  style={{ background: "var(--theme-tile-soft)", border: "1px solid var(--theme-border-default)" }}
                >
                  <span style={{ color: BBVA.sereneBlue, fontSize: 12 }}>→</span>
                  <p className="font-mono text-[11px] leading-relaxed flex-1" style={{ color: BBVA.sereneBlue }}>
                    <span className="font-bold uppercase tracking-widest text-[9px] mr-1.5">Sugerido:</span>
                    {gap.recommendation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GapAnalysisPanel({ gaps }: GapAnalysisPanelProps) {
  if (gaps.length === 0) {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: `${BBVA.lime}08`, border: `1px solid ${BBVA.lime}28` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${BBVA.lime}1a`, border: `1px solid ${BBVA.lime}40` }}
        >
          <span style={{ color: BBVA.lime, fontSize: 14 }}>✓</span>
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "var(--theme-text-primary)" }}>Sin gaps detectados</p>
          <p className="font-mono text-[11px]" style={{ color: "var(--theme-text-muted)" }}>
            El equipo recomendado cumple con cobertura, disponibilidad y balance.
          </p>
        </div>
      </div>
    );
  }

  const counts = gaps.reduce<Record<GapSeverity, number>>(
    (acc, g) => {
      acc[g.severity] = (acc[g.severity] ?? 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  return (
    <section className="rounded-2xl p-4" style={{ background: "var(--theme-bg-surface)", border: "1px solid var(--theme-border-default)", boxShadow: "var(--theme-shadow-card)" }}>
      <header className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
            style={{ background: "rgba(150,148,255,0.12)", color: BBVA.purple, border: `1px solid ${BBVA.purple}30` }}
          >
            Gap Analysis
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
            análisis automático
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(["critical", "high", "medium", "low"] as GapSeverity[]).map(sev => {
            if (counts[sev] === 0) return null;
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <span
                key={sev}
                className="font-mono text-[9px] font-bold px-2 py-0.5 rounded"
                style={{ background: `${cfg.color}1c`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
              >
                {counts[sev]} {cfg.label}
              </span>
            );
          })}
        </div>
      </header>

      <div className="flex flex-col gap-2">
        {gaps.map((gap, i) => (
          <GapCard key={gap.id} gap={gap} index={i} />
        ))}
      </div>
    </section>
  );
}
