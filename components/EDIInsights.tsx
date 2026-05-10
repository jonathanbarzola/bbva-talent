"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { CareerProgress } from "@/lib/careerProgress";

interface Props {
  progress: CareerProgress;
}

export default function EDIInsights({ progress }: Props) {
  const { softSkills, targetNivel } = progress;

  const confirmed = softSkills.filter(s => s.confirmed);
  const gaps = softSkills.filter(s => s.isGap);

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.purple }}>
          Soft skills · análisis de tu EDI
        </p>
        <p className="font-bold text-base" style={{ color: "var(--theme-text-primary)" }}>
          {targetNivel
            ? `Lo que dicen tus peers vs lo que se espera en ${targetNivel}`
            : `Lo que dicen tus peers en tu evaluación reciente`}
        </p>
        <p className="font-mono text-[10px] mt-1" style={{ color: "var(--theme-text-muted)" }}>
          Heurística sobre comentarios de peers y manager — buscamos evidencia explícita de cada bucket. Las palabras clave usadas son auditables en <code className="font-mono">lib/careerProgress.ts</code>.
        </p>
      </header>

      {/* Confirmed strengths */}
      {confirmed.length > 0 && (
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: BBVA.lime }}>
            ✓ Fortalezas confirmadas · {confirmed.length}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {confirmed.map((s, i) => (
              <motion.div
                key={s.bucket}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl p-3"
                style={{ background: `${BBVA.lime}08`, border: `1px solid ${BBVA.lime}30` }}
              >
                <p className="font-bold text-[12px] mb-1" style={{ color: BBVA.lime }}>
                  {s.label}
                </p>
                {s.evidence.map((e, idx) => (
                  <p
                    key={idx}
                    className="font-mono text-[10px] italic leading-relaxed mt-1"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {e}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps to close */}
      {gaps.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "#fb923c" }}>
            ↑ Gaps esperados para {targetNivel} · {gaps.length}
          </p>
          <div className="space-y-2.5">
            {gaps.map((s, i) => (
              <motion.div
                key={s.bucket}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                className="rounded-xl p-3"
                style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.28)" }}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <span style={{ color: "#fb923c", fontSize: 13, lineHeight: "18px" }}>↑</span>
                  <div className="flex-1">
                    <p className="font-bold text-[12px]" style={{ color: "#fb923c" }}>
                      {s.label}
                    </p>
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>
                      Sin evidencia explícita en tus peer/manager comments. Este skill se espera en {targetNivel}.
                    </p>
                  </div>
                </div>
                {s.action && (
                  <div
                    className="rounded-lg px-3 py-2 mt-2"
                    style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: BBVA.purple }}>
                      Acción sugerida
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--theme-text-primary)" }}>
                      {s.action}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {confirmed.length === 0 && gaps.length === 0 && (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
        >
          <p className="font-mono text-xs" style={{ color: "var(--theme-text-muted)" }}>
            Sin EDI cargado todavía — pedile a tu manager que complete el ciclo de evaluación para activar este análisis.
          </p>
        </div>
      )}
    </section>
  );
}
