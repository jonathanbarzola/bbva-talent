"use client";

import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult } from "@/lib/types";

interface CandidateCardProps {
  candidate: EmpleadoResult;
  rank: number;
  onViewGraph: (id: string) => void;
}

const NIVEL_CONFIG: Record<string, { color: string; label: string }> = {
  Junior: { color: BBVA.ice,     label: "Junior" },
  Mid:    { color: BBVA.canary,  label: "Mid" },
  Senior: { color: BBVA.lime,    label: "Senior" },
  Staff:  { color: BBVA.mandarin,label: "Staff" },
};

const SKILL_COLORS = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary];

/** SVG circular score indicator */
function ScoreRing({ score }: { score: number }) {
  const pct    = Math.round(score * 100);
  const size   = 56;
  const stroke = 3.5;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const ringColor = pct >= 90 ? BBVA.lime : pct >= 75 ? BBVA.sereneBlue : BBVA.canary;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(133,200,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ color: ringColor }}
      >
        <span className="font-mono font-bold leading-none" style={{ fontSize: 14 }}>{pct}</span>
        <span className="font-mono leading-none" style={{ fontSize: 8, color: "#3d4f6e" }}>match</span>
      </div>
    </div>
  );
}

export default function CandidateCard({ candidate, rank, onViewGraph }: CandidateCardProps) {
  const nivel  = NIVEL_CONFIG[candidate.nivel] ?? { color: BBVA.grey3, label: candidate.nivel };
  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <article
      className="group relative rounded-2xl p-5 transition-all duration-300 cursor-default overflow-hidden scanline"
      style={{
        background: "rgba(10,22,40,0.75)",
        border: "1px solid rgba(133,200,255,0.10)",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(133,200,255,0.28)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,19,145,0.2)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(133,200,255,0.10)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r"
        style={{ background: `linear-gradient(180deg, ${nivel.color}00, ${nivel.color}, ${nivel.color}00)` }}
      />

      {/* Rank badge */}
      <div
        className="absolute top-3 right-14 font-mono text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: "rgba(133,200,255,0.06)", color: "#3d4f6e", border: "1px solid rgba(133,200,255,0.08)" }}
      >
        #{String(rank).padStart(2, "0")}
      </div>

      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #001391, #0020cc)`,
            boxShadow: "0 0 16px rgba(0,19,145,0.5)",
            color: "#fff",
          }}
        >
          {initials}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)" }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight mb-0.5 truncate" style={{ color: "#e8eeff" }}>
            {candidate.nombre}
          </h3>
          <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>
            {candidate.rol}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
              style={{
                background: `${nivel.color}18`,
                color: nivel.color,
                border: `1px solid ${nivel.color}44`,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: nivel.color, display: "inline-block" }} />
              {nivel.label}
            </span>
            <span className="text-[10px] font-mono" style={{ color: "#3d4f6e" }}>
              {candidate.squad}
            </span>
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing score={candidate.score} />
      </div>

      {/* Bio */}
      <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "#4d6080" }}>
        {candidate.bio}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {candidate.habilidades.slice(0, 5).map((skill, i) => {
          const c = SKILL_COLORS[i % SKILL_COLORS.length];
          return (
            <span
              key={skill.nombre}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono"
              style={{
                background: `${c}12`,
                color: c,
                border: `1px solid ${c}30`,
              }}
            >
              {skill.nombre}
            </span>
          );
        })}
        {candidate.habilidades.length > 5 && (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-mono"
            style={{ background: "rgba(133,200,255,0.06)", color: "#3d4f6e" }}
          >
            +{candidate.habilidades.length - 5}
          </span>
        )}
      </div>

      {/* Projects */}
      {candidate.proyectos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {candidate.proyectos.map(proj => (
            <span
              key={proj.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono"
              style={{
                background: `${BBVA.mandarin}10`,
                color: BBVA.mandarin,
                border: `1px solid ${BBVA.mandarin}28`,
              }}
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <circle cx="3.5" cy="3.5" r="2.5" stroke={BBVA.mandarin} strokeWidth="1"/>
              </svg>
              {proj.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Collaborators avatars */}
      {candidate.colaboradores.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {candidate.colaboradores.slice(0, 3).map((colab, i) => (
              <div
                key={colab.id}
                className="w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: `hsl(${210 + i * 30}, 60%, 25%)`,
                  borderColor: "#050a14",
                  color: BBVA.sereneBlue,
                  zIndex: 3 - i,
                }}
                title={colab.nombre}
              >
                {colab.nombre.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-mono" style={{ color: "#3d4f6e" }}>
            {candidate.colaboradores.length} colaborador{candidate.colaboradores.length > 1 ? "es" : ""}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onViewGraph(candidate.id)}
        className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 relative overflow-hidden group/btn"
        style={{
          background: "linear-gradient(135deg, #001391, #0020cc)",
          color: "#ffffff",
          boxShadow: "0 0 20px rgba(0,19,145,0.3)",
          letterSpacing: "0.08em",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,19,145,0.6), 0 0 60px rgba(133,200,255,0.1)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,19,145,0.3)";
        }}
      >
        Ver Constelación 360°
      </button>
    </article>
  );
}
