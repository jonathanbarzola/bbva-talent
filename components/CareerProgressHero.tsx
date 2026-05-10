"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { CareerProgress } from "@/lib/careerProgress";
import type { Nivel } from "@/lib/types";

const NIVEL_COLOR: Record<Nivel, string> = {
  Analyst:   BBVA.ice,
  Associate: BBVA.canary,
  Expert:    BBVA.mandarin,
};

interface Props {
  progress: CareerProgress;
}

function initials(name: string): string {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function CareerProgressHero({ progress }: Props) {
  const { user, targetNivel, isTopTier, overallProgress, cohortSize } = progress;
  const currentColor = NIVEL_COLOR[user.nivel];
  const targetColor = targetNivel ? NIVEL_COLOR[targetNivel] : currentColor;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 sm:p-7"
      style={{
        background: `linear-gradient(135deg, ${currentColor}10, ${targetColor}10)`,
        border: `1px solid ${targetColor}38`,
        boxShadow: `0 0 40px ${targetColor}1a`,
      }}
    >
      <div className="flex items-start gap-4 mb-5 flex-wrap">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl"
          style={{
            background: "linear-gradient(135deg, #001391, #0020cc)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(0,19,145,0.5)",
          }}
        >
          {initials(user.nombre)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.purple }}>
            Tu progreso · Demo · {cohortSize > 0 ? `vs p75 de ${cohortSize} ${targetNivel}s` : "perfil único"}
          </p>
          <h1 className="font-black leading-tight mb-2" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--theme-text-primary)" }}>
            {user.nombre}
          </h1>

          {/* Nivel transition */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="font-mono text-xs font-bold px-2.5 py-1 rounded"
              style={{ background: `${currentColor}20`, color: currentColor, border: `1px solid ${currentColor}50` }}
            >
              {user.nivel}
            </span>

            {!isTopTier && targetNivel && (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "var(--theme-text-dim)" }}>
                  <path d="M5 9H13M13 9L9 5M13 9L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  className="font-mono text-xs font-bold px-2.5 py-1 rounded"
                  style={{ background: `${targetColor}20`, color: targetColor, border: `1px solid ${targetColor}50` }}
                >
                  {targetNivel}
                </span>
              </>
            )}

            {isTopTier && (
              <span className="font-mono text-[11px] italic" style={{ color: "var(--theme-text-muted)" }}>
                Ya estás en el tier más alto · seguí afilando
              </span>
            )}
          </div>
        </div>

        {/* Big number */}
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--theme-text-dim)" }}>
            {isTopTier ? "Salud del perfil" : "Avance"}
          </p>
          <p
            className="font-black font-mono leading-none"
            style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: targetColor }}
          >
            {overallProgress}
            <span className="text-base font-mono ml-1" style={{ color: targetColor + "aa" }}>%</span>
          </p>
        </div>
      </div>

      {/* Big progress bar */}
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "var(--theme-tile-medium)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${currentColor}cc, ${targetColor})`,
            boxShadow: `0 0 12px ${targetColor}66`,
          }}
        />
      </div>

      <p className="font-mono text-[11px] mt-3 leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
        {isTopTier
          ? `Comparado con tus pares ${user.nivel}, tu perfil está en buen estado. Las recomendaciones abajo apuntan a mantener tu impacto y abrir espacio para mentoring.`
          : `Cálculo basado en 6 factores: skills, Trust Score, EDI, tenure, mentoring activo y soft skills evidenciados. Ver desglose abajo.`}
      </p>
    </motion.section>
  );
}
