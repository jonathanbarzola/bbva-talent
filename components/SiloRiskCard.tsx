"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { SiloRisk, SiloSeverity, SiloRiskKind } from "@/lib/siloAnalysis";
import { effectiveAvailable } from "@/lib/workforce-stats";

const SEVERITY_CONFIG: Record<SiloSeverity, { color: string; label: string; bg: string; border: string }> = {
  critical: { color: "#f87171",       label: "Crítico", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.32)" },
  high:     { color: "#fb923c",       label: "Alto",    bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.28)" },
  medium:   { color: BBVA.canary,     label: "Medio",   bg: `${BBVA.canary}10`,        border: `${BBVA.canary}30` },
  low:      { color: BBVA.sereneBlue, label: "Bajo",    bg: `${BBVA.sereneBlue}08`,    border: `${BBVA.sereneBlue}22` },
};

const RISK_ICON: Record<SiloRiskKind, string> = {
  "bus-factor":            "◬",
  "succession":            "▲",
  "tenure-concentration":  "⏳",
  "no-pipeline":           "⊘",
  "demand-supply":         "⇄",
  "low-mentorship":        "♛",
};

const RISK_LABEL: Record<SiloRiskKind, string> = {
  "bus-factor":            "Bus factor",
  "succession":            "Sucesión",
  "tenure-concentration":  "Concentración de tenure",
  "no-pipeline":           "Sin pipeline Junior",
  "demand-supply":         "Demanda > supply",
  "low-mentorship":        "Pocos mentores",
};

export function SiloRiskCard({ risk, index }: { risk: SiloRisk; index: number }) {
  const [expanded, setExpanded] = useState(risk.overallSeverity === "critical");
  const cfg = SEVERITY_CONFIG[risk.overallSeverity];
  const { workforce: w, category: cat } = risk;
  const eff = effectiveAvailable(w);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left transition-colors"
        style={{ cursor: "pointer" }}
        aria-expanded={expanded}
      >
        {/* Severity badge */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${cfg.color}1c`, border: `1px solid ${cfg.color}50` }}
        >
          <span style={{ color: cfg.color, fontSize: 16 }}>⚠</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${cfg.color}24`, color: cfg.color, border: `1px solid ${cfg.color}50` }}
            >
              {cfg.label}
            </span>
            <span
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${cat.color}1c`, color: cat.color, border: `1px solid ${cat.color}40` }}
            >
              {cat.type === "legacy" ? "LEGACY" : cat.type === "proprietary" ? "BBVA" : cat.type === "emerging" ? "EMERGENTE" : "MODERNO"}
            </span>
            {cat.isCritical && (
              <span
                className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(248,113,113,0.15)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.3)" }}
              >
                CORE BANK
              </span>
            )}
          </div>

          <h3 className="font-black text-base leading-tight" style={{ color: "#e8eeff" }}>
            {cat.name}
          </h3>

          <p className="font-mono text-[11px] mt-1 leading-relaxed" style={{ color: "#a8b8d0" }}>
            {cat.description}
          </p>

          {/* Quick stats inline */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <QuickStat label="total" value={w.total.toString()} />
            <QuickStat label="tenure" value={`${w.avgTenureYears} años`} dangerous={w.avgTenureYears >= 15} />
            <QuickStat label="bus factor" value={`${w.busFactor}/5`} dangerous={w.busFactor <= 2} />
            <QuickStat label="mentores" value={w.mentors.toString()} />
            <QuickStat label="cobertura demanda" value={`${eff}/${w.demandedHeadcount}`} dangerous={eff < w.demandedHeadcount * 0.6} />
          </div>
        </div>

        <span
          className="flex-shrink-0 font-mono text-[10px] mt-2 transition-transform"
          style={{ color: "#3d4f6e", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "rgba(133,200,255,0.06)" }}>

              {/* Risk factors */}
              <div className="pt-4">
                <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2.5" style={{ color: "#6b7fa3" }}>
                  Factores de riesgo detectados
                </p>
                <div className="space-y-2">
                  {risk.factors.map((f, i) => {
                    const fcfg = SEVERITY_CONFIG[f.severity];
                    return (
                      <motion.div
                        key={f.kind}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.05 }}
                        className="rounded-xl px-3 py-2.5 flex items-start gap-3"
                        style={{ background: fcfg.bg, border: `1px solid ${fcfg.border}` }}
                      >
                        <div
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: `${fcfg.color}1a`, border: `1px solid ${fcfg.color}40` }}
                        >
                          <span style={{ color: fcfg.color, fontSize: 14 }}>{RISK_ICON[f.kind]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span
                              className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${fcfg.color}24`, color: fcfg.color }}
                            >
                              {fcfg.label}
                            </span>
                            <span className="font-bold text-[12px]" style={{ color: "#e8eeff" }}>
                              {RISK_LABEL[f.kind]}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#a8b8d0" }}>
                            {f.detail}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* AI suggestions */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-black"
                    style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, color: "#fff" }}
                  >
                    ✦
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: BBVA.purple }}>
                    Recomendaciones de la IA
                  </p>
                </div>

                <div className="space-y-2">
                  {risk.aiSuggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: 0.15 + i * 0.05 }}
                      className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
                      style={{ background: `${BBVA.purple}0d`, border: `1px solid ${BBVA.purple}28` }}
                    >
                      <span style={{ color: BBVA.purple, fontSize: 12, lineHeight: "20px" }}>→</span>
                      <p className="font-mono text-[11px] leading-relaxed flex-1" style={{ color: "#c8d4ec" }}>
                        {s}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Drill-down stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <DrillStat label="Junior" value={w.seniority.junior} total={w.total} color={BBVA.ice} />
                <DrillStat label="Mid" value={w.seniority.mid} total={w.total} color={BBVA.canary} />
                <DrillStat label="Senior" value={w.seniority.senior} total={w.total} color={BBVA.lime} />
                <DrillStat label="Staff" value={w.seniority.staff} total={w.total} color={BBVA.mandarin} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function QuickStat({ label, value, dangerous }: { label: string; value: string; dangerous?: boolean }) {
  const color = dangerous ? "#fb923c" : "#a8b8d0";
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color }}>
      <span style={{ color: "#3d4f6e" }}>{label}:</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

function DrillStat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: `${color}0a`, border: `1px solid ${color}24` }}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color, opacity: 0.85 }}>{label}</p>
      <p className="font-black font-mono text-base leading-none" style={{ color }}>{value}</p>
      <p className="font-mono text-[9px] mt-0.5" style={{ color: color, opacity: 0.6 }}>{pct}%</p>
    </div>
  );
}
