"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { CareerProgress } from "@/lib/careerProgress";

interface Props {
  progress: CareerProgress;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default function SkillGapTable({ progress }: Props) {
  const { skillGaps, targetNivel } = progress;

  if (skillGaps.length === 0) {
    return (
      <section
        className="rounded-2xl p-5 text-center"
        style={{ background: `${BBVA.lime}08`, border: `1px solid ${BBVA.lime}28` }}
      >
        <p className="font-bold text-base mb-1" style={{ color: BBVA.lime }}>✓ Sin gaps técnicos relevantes</p>
        <p className="font-mono text-xs" style={{ color: "var(--theme-text-muted)" }}>
          {targetNivel
            ? `Tu cobertura de skills está al nivel del cohorte ${targetNivel}. Foco en factores no-técnicos.`
            : "Tu cobertura técnica está alineada con tus pares."}
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.sereneBlue }}>
          Gaps técnicos · top {skillGaps.length}
        </p>
        <p className="font-bold text-base" style={{ color: "var(--theme-text-primary)" }}>
          Skills donde estás por debajo del p75 del cohorte {targetNivel ?? "actual"}
        </p>
        <p className="font-mono text-[10px] mt-1" style={{ color: "var(--theme-text-muted)" }}>
          La barra muestra tu nivel actual vs el target del cohorte. Las skills marcadas como ⊘ son las que NO tenés en tu perfil todavía.
        </p>
      </header>

      <div className="space-y-2">
        {skillGaps.map((g, i) => (
          <motion.div
            key={g.skill}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="rounded-xl px-3 py-2.5 flex items-center gap-3"
            style={{
              background: g.isMissing ? "rgba(248,113,113,0.06)" : "var(--theme-tile-soft)",
              border: g.isMissing ? "1px solid rgba(248,113,113,0.28)" : "1px solid rgba(133,200,255,0.08)",
            }}
          >
            {/* Icon: missing or partial */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold"
              style={{
                background: g.isMissing ? "rgba(248,113,113,0.14)" : `${BBVA.canary}16`,
                color: g.isMissing ? "#f87171" : BBVA.canary,
                border: `1px solid ${g.isMissing ? "rgba(248,113,113,0.30)" : `${BBVA.canary}40`}`,
              }}
              title={g.isMissing ? "Skill ausente del perfil" : "Por debajo del p75 del cohorte"}
            >
              {g.isMissing ? "⊘" : "↑"}
            </div>

            {/* Skill name + bars */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <p className="font-bold text-[13px] leading-none" style={{ color: "var(--theme-text-primary)" }}>
                  {g.skill}
                </p>
                <p className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
                  {Math.round(g.cohortCoverage * 100)}% del cohorte la tiene
                </p>
              </div>

              {/* Dual bar: current vs target */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--theme-tile-medium)" }}>
                {/* Target bar (background) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.targetScore * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `${BBVA.lime}66` }}
                />
                {/* Current bar (foreground) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.currentScore * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.04 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: g.isMissing ? "transparent" : `linear-gradient(90deg, ${BBVA.sereneBlue}, ${BBVA.purple})` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <p className="font-mono text-[9px]" style={{ color: BBVA.sereneBlue }}>
                  {g.isMissing ? "Sin score" : `Tú: ${pct(g.currentScore)}`}
                </p>
                <p className="font-mono text-[9px]" style={{ color: BBVA.lime }}>
                  Target p75: {pct(g.targetScore)}
                </p>
              </div>
            </div>

            {/* Delta badge */}
            <div className="flex-shrink-0 text-center">
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>
                Δ
              </p>
              <p
                className="font-black font-mono text-sm leading-none"
                style={{ color: g.delta > 0.4 ? "#f87171" : g.delta > 0.2 ? "#fb923c" : BBVA.canary }}
              >
                {pct(g.delta)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
