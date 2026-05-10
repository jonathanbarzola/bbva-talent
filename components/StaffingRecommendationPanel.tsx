"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import {
  recommendStaffing,
  fteToLabel,
  fteToBucketName,
  patternToLabel,
  type Confidence,
  type ReasoningWeight,
  type RiskSeverity,
} from "@/lib/staffingRecommendation";
import type { EmpleadoResult } from "@/lib/types";

interface Props {
  candidate: EmpleadoResult;
  /** Optional context for messaging (project name etc.) */
  projectName?: string;
  projectDomain?: string;
}

const CONFIDENCE_CONFIG: Record<Confidence, { color: string; label: string }> = {
  high:   { color: BBVA.lime,       label: "Alta confianza" },
  medium: { color: BBVA.canary,     label: "Confianza media" },
  low:    { color: BBVA.mandarin,   label: "Baja confianza" },
};

const WEIGHT_CONFIG: Record<ReasoningWeight, { icon: string; color: string; label: string }> = {
  primary:    { icon: "★", color: BBVA.purple,     label: "Factor principal" },
  supporting: { icon: "+", color: BBVA.lime,       label: "Apoyo" },
  constraint: { icon: "!", color: "#fb923c",       label: "Restricción" },
};

const RISK_CONFIG: Record<RiskSeverity, { color: string; bg: string; border: string; label: string; icon: string }> = {
  high:   { color: "#fca5a5", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.32)", label: "Alto riesgo", icon: "⚠" },
  medium: { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.28)", label: "Riesgo medio", icon: "⚠" },
  low:    { color: BBVA.canary, bg: `${BBVA.canary}10`,      border: `${BBVA.canary}30`,      label: "Atención",     icon: "ⓘ" },
};

export default function StaffingRecommendationPanel({ candidate, projectName, projectDomain }: Props) {
  const rec = recommendStaffing(candidate, { projectName, projectDomain });
  const confCfg = CONFIDENCE_CONFIG[rec.confidence];
  const isExternal = candidate.tipo_contrato === "externo";

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-[11px] font-black"
          style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, color: "#fff" }}
        >
          ✦
        </span>
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: BBVA.purple }}>
          Recomendación de FTE
        </p>
      </div>

      {/* Hero — recommended FTE big number */}
      <div
        className="rounded-2xl p-4 flex items-stretch gap-4"
        style={{
          background: `linear-gradient(135deg, ${BBVA.purple}14, ${BBVA.electricBlue}10)`,
          border: `1px solid ${BBVA.purple}38`,
        }}
      >
        <div className="flex flex-col items-center justify-center px-3 sm:px-4 flex-shrink-0 border-r" style={{ borderColor: "rgba(150,148,255,0.2)" }}>
          <p className="font-black font-mono leading-none" style={{ color: BBVA.purple, fontSize: "clamp(2.4rem, 5vw, 3.2rem)" }}>
            {fteToLabel(rec.recommendedFte)}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: BBVA.purple, opacity: 0.8 }}>
            FTE sugerido
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-secondary)" }}>
            {fteToBucketName(rec.recommendedFte)}
          </p>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${confCfg.color}1c`, color: confCfg.color, border: `1px solid ${confCfg.color}40` }}
              >
                {confCfg.label}
              </span>
              <span
                className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${BBVA.sereneBlue}1c`, color: BBVA.sereneBlue, border: `1px solid ${BBVA.sereneBlue}40` }}
              >
                {patternToLabel(rec.historicalSummary.pattern)}
              </span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
              Basado en {rec.historicalSummary.quartersAnalyzed} quarter{rec.historicalSummary.quartersAnalyzed !== 1 ? "s" : ""} analizados ·
              {" "}promedio {rec.historicalSummary.avgProjectsPerQuarter.toFixed(1)} proyectos/Q
              {" "}({(rec.historicalSummary.avgFte * 100).toFixed(0)}% FTE prom.).
            </p>
          </div>

          {/* Alternative FTEs — visual reference */}
          {rec.alternativeFtes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>alternativas:</span>
              {rec.alternativeFtes.map(f => (
                <span
                  key={f}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.15)", color: "var(--theme-text-secondary)" }}
                >
                  {fteToLabel(f)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {rec.reasoning.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--theme-text-muted)" }}>
            Razonamiento
          </p>
          <div className="space-y-2">
            {rec.reasoning.map((r, i) => {
              const wcfg = WEIGHT_CONFIG[r.weight];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05 }}
                  className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
                  style={{ background: `${wcfg.color}0a`, border: `1px solid ${wcfg.color}28` }}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-mono text-[12px] font-black"
                    style={{ background: `${wcfg.color}1c`, border: `1px solid ${wcfg.color}40`, color: wcfg.color }}
                  >
                    {wcfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-[12px]" style={{ color: "var(--theme-text-primary)" }}>{r.label}</span>
                      <span
                        className="font-mono text-[9px] uppercase tracking-widest px-1 py-0.5 rounded"
                        style={{ background: `${wcfg.color}24`, color: wcfg.color }}
                      >
                        {wcfg.label}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
                      {r.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historical Timeline */}
      {rec.historicalSummary.quartersAnalyzed > 0 && (
        <HistoricalTimeline candidate={candidate} />
      )}

      {/* Risk signals */}
      {rec.riskSignals.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--theme-text-muted)" }}>
            Señales a considerar
          </p>
          <div className="space-y-2">
            {rec.riskSignals.map((rs, i) => {
              const rcfg = RISK_CONFIG[rs.severity];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: 0.15 + i * 0.05 }}
                  className="rounded-xl px-3 py-2.5"
                  style={{ background: rcfg.bg, border: `1px solid ${rcfg.border}` }}
                >
                  <div className="flex items-start gap-2.5">
                    <span style={{ color: rcfg.color, fontSize: 13, lineHeight: "20px" }}>{rcfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[12px] leading-tight mb-0.5" style={{ color: rcfg.color }}>
                        {rcfg.label}
                      </p>
                      <p className="font-mono text-[11px] leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>
                        {rs.message}
                      </p>
                      {rs.context && (
                        <p className="font-mono text-[10px] mt-1.5 italic leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                          {rs.context}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* External feedback (only if external & has feedback) */}
      {isExternal && candidate.feedback_externo && candidate.feedback_externo.length > 0 && (
        <ExternalFeedbackList feedback={candidate.feedback_externo} consultora={candidate.consultora} />
      )}
    </section>
  );
}

// ── Historical timeline subcomponent ─────────────────────────────────────

function HistoricalTimeline({ candidate }: { candidate: EmpleadoResult }) {
  const records = candidate.staffing_historico ?? [];
  if (records.length === 0) return null;

  // Group records by quarter
  const byQuarter = new Map<string, typeof records>();
  for (const r of records) {
    if (!byQuarter.has(r.quarter)) byQuarter.set(r.quarter, []);
    byQuarter.get(r.quarter)!.push(r);
  }
  const quarters = Array.from(byQuarter.keys()).sort();

  // Color per project (deterministic by code)
  const projectColors = [BBVA.lime, BBVA.sereneBlue, BBVA.purple, BBVA.canary, BBVA.mandarin, BBVA.ice];
  const projectColorMap = new Map<string, string>();
  let colorIdx = 0;
  for (const r of records) {
    if (!projectColorMap.has(r.proyecto_codigo)) {
      projectColorMap.set(r.proyecto_codigo, projectColors[colorIdx % projectColors.length]);
      colorIdx++;
    }
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--theme-text-muted)" }}>
        Historial de staffing por quarter
      </p>
      <div
        className="rounded-xl p-3 sm:p-4"
        style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
      >
        <div className="space-y-2">
          {quarters.map((q, qIdx) => {
            const items = byQuarter.get(q)!;
            const totalFte = items.reduce((s, r) => s + r.fte, 0);

            return (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: qIdx * 0.04 }}
                className="flex items-center gap-3"
              >
                <span className="w-16 flex-shrink-0 font-mono text-[10px] font-bold" style={{ color: "var(--theme-text-secondary)" }}>
                  {q}
                </span>
                <div className="flex-1 h-6 rounded-md overflow-hidden flex" style={{ background: "var(--theme-tile-soft)" }}>
                  {items.map((r, i) => {
                    const widthPct = r.fte * 100;
                    const color = projectColorMap.get(r.proyecto_codigo)!;
                    return (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6, delay: qIdx * 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full flex items-center justify-center font-mono text-[9px] font-bold overflow-hidden whitespace-nowrap"
                        style={{
                          background: `linear-gradient(90deg, ${color}66, ${color}aa)`,
                          color: "#0a1628",
                          minWidth: 0,
                        }}
                        title={`${r.proyecto_codigo} ${r.proyecto_nombre} · ${(r.fte * 100).toFixed(0)}%`}
                      >
                        {r.fte >= 0.25 && (
                          <span className="px-1.5 truncate" style={{ maxWidth: "100%" }}>
                            {r.proyecto_codigo} · {(r.fte * 100).toFixed(0)}%
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <span className="w-12 flex-shrink-0 text-right font-mono text-[10px] font-bold" style={{ color: totalFte >= 1 ? BBVA.lime : BBVA.canary }}>
                  {(totalFte * 100).toFixed(0)}%
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Project legend */}
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5" style={{ borderColor: "var(--theme-tile-medium)" }}>
          {Array.from(projectColorMap.entries()).map(([codigo, color]) => {
            const project = records.find(r => r.proyecto_codigo === codigo)!;
            return (
              <span
                key={codigo}
                className="inline-flex items-center gap-1 font-mono text-[9px]"
                style={{ color }}
              >
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                {codigo} {project.proyecto_nombre}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── External feedback list ──────────────────────────────────────────────

function ExternalFeedbackList({
  feedback,
  consultora,
}: {
  feedback: NonNullable<EmpleadoResult["feedback_externo"]>;
  consultora?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--theme-text-muted)" }}>
        Feedback de jefes anteriores {consultora ? `(${consultora})` : ""}
      </p>
      <div className="space-y-2">
        {feedback.map((f, i) => {
          const ratingColor =
            f.rating >= 4 ? BBVA.lime :
            f.rating === 3 ? BBVA.canary :
            "#fca5a5";
          return (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: `${ratingColor}08`, border: `1px solid ${ratingColor}28` }}
            >
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[12px]" style={{ color: "var(--theme-text-primary)" }}>
                    {f.manager_nombre}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-muted)" }}>
                    · {f.proyecto_codigo} {f.proyecto_nombre} · {f.quarter}
                  </span>
                </div>
                <RatingStars rating={f.rating} color={ratingColor} />
              </div>
              <p className="font-mono text-[11px] leading-relaxed italic" style={{ color: "var(--theme-text-secondary)" }}>
                &ldquo;{f.comentario}&rdquo;
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RatingStars({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= rating ? color : "var(--theme-border-strong)", fontSize: 11 }}>
          ★
        </span>
      ))}
      <span className="font-mono text-[10px] font-bold ml-1" style={{ color }}>
        {rating}/5
      </span>
    </div>
  );
}
