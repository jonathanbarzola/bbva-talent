"use client";

import { useEffect, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";
import type { TeamCompositionResponse } from "@/lib/types";
import CandidateCard from "./CandidateCard";

interface Props {
  result: TeamCompositionResponse;
  onViewConstellation: (employeeId: string) => void;
  onNewTeam: () => void;
  onNewSearch: () => void;
}

// Color per role index so each section has its own accent
const ROLE_COLORS = [
  BBVA.purple,
  BBVA.sereneBlue,
  BBVA.lime,
  BBVA.mandarin,
  BBVA.ice,
  BBVA.canary,
];

export default function TeamComposerResults({ result, onViewConstellation, onNewTeam, onNewSearch }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const totalPeople = result.roles.reduce((acc, r) => acc + r.candidates.length, 0);
  const allSkills = new Set<string>();
  result.roles.forEach(rm => rm.candidates.forEach(c => c.habilidades.forEach(h => allSkills.add(h.nombre))));

  return (
    <div
      className="min-h-screen"
      style={{ background: "#050a14", opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,148,255,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "0", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,19,145,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "rgba(5,10,20,0.92)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #4a00b4, #9694FF)", color: "#fff", boxShadow: "0 0 16px rgba(150,148,255,0.4)" }}
          >
            PC
          </div>
          <div className="hidden sm:block">
            <p className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#3d4f6e" }}>
              Project Composer
            </p>
            <p
              className="font-bold text-sm max-w-xs truncate"
              style={{ color: "#e8eeff" }}
            >
              {result.project_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewTeam}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:opacity-80"
            style={{ background: "rgba(150,148,255,0.08)", border: "1px solid rgba(150,148,255,0.18)", color: BBVA.purple, cursor: "pointer" }}
          >
            ← Editar roles
          </button>
          <button
            onClick={onNewSearch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:opacity-80"
            style={{ background: "rgba(133,200,255,0.07)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
          >
            Búsqueda libre
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* ── Team summary banner ──────────────────────────────────────────── */}
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "rgba(10,22,40,0.88)", border: "1px solid rgba(150,148,255,0.2)", boxShadow: "0 0 60px rgba(150,148,255,0.08)" }}>
            <div className="absolute top-0 right-0 w-80 h-40 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${BBVA.purple}18 0%, transparent 70%)` }} />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Project info */}
              <div>
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[10px] mb-3"
                  style={{ background: `${BBVA.purple}12`, border: `1px solid ${BBVA.purple}30`, color: BBVA.purple }}
                >
                  ✦ Equipo recomendado
                </div>
                <h2 className="font-black text-2xl mb-1" style={{ color: "#e8eeff" }}>
                  {result.project_name}
                </h2>
                <p className="font-mono text-sm" style={{ color: "#4d6080" }}>
                  {result.roles.length} roles · {totalPeople} perfiles identificados
                </p>

                {/* Gaps warning */}
                {result.gaps.length > 0 && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,181,107,0.08)", border: "1px solid rgba(255,181,107,0.2)" }}>
                    <span style={{ color: BBVA.mandarin, fontSize: 12 }}>⚠</span>
                    <p className="font-mono text-xs" style={{ color: BBVA.mandarin + "cc" }}>
                      Perfiles escasos: {result.gaps.join(" · ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 flex-shrink-0">
                {[
                  { label: "Personas",        value: String(totalPeople),          color: BBVA.purple },
                  { label: "Skills únicas",   value: String(result.total_skills),  color: BBVA.sereneBlue },
                  { label: "Cobertura",       value: `${result.coverage_score}%`,  color: BBVA.lime },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-black text-3xl leading-none mb-1" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>
                      {s.value}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Role sections ────────────────────────────────────────────────── */}
        {result.roles.map((roleMatch, rIdx) => {
          const color = ROLE_COLORS[rIdx % ROLE_COLORS.length];
          const filled = roleMatch.candidates.length;
          const needed = roleMatch.quantity;
          const isComplete = filled >= needed;

          return (
            <section
              key={`${roleMatch.role}-${rIdx}`}
              className="mb-12 animate-fade-up"
              style={{ animationDelay: `${0.1 + rIdx * 0.1}s` }}
            >
              {/* Role header */}
              <div className="flex items-center gap-4 mb-5">
                {/* Role badge */}
                <div
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl flex-shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}35` }}
                >
                  <div
                    className="font-black font-mono text-xl leading-none"
                    style={{ color }}
                  >
                    {roleMatch.quantity}×
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight" style={{ color: "#e8eeff" }}>
                      {roleMatch.role}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>
                      {filled}/{needed} perfiles encontrados
                    </p>
                  </div>
                </div>

                <div className="flex-1 h-px" style={{ background: `${color}20` }} />

                {/* Status pill */}
                <span
                  className="font-mono text-[10px] px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                  style={{
                    background: isComplete ? `${BBVA.lime}15` : `${BBVA.canary}15`,
                    color: isComplete ? BBVA.lime : BBVA.canary,
                    border: `1px solid ${isComplete ? BBVA.lime + "35" : BBVA.canary + "35"}`,
                  }}
                >
                  {isComplete ? "✓ Completo" : "⚡ Parcial"}
                </span>
              </div>

              {/* Candidates grid */}
              {roleMatch.candidates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {roleMatch.candidates.map((candidate, cIdx) => (
                    <div
                      key={candidate.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${0.12 + rIdx * 0.1 + cIdx * 0.06}s` }}
                    >
                      <CandidateCard
                        candidate={candidate}
                        rank={cIdx + 1}
                        onViewGraph={onViewConstellation}
                      />
                    </div>
                  ))}

                  {/* Placeholder slots for missing candidates */}
                  {Array.from({ length: Math.max(0, needed - filled) }).map((_, pi) => (
                    <div
                      key={`placeholder-${pi}`}
                      className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3"
                      style={{
                        background: "rgba(10,22,40,0.4)",
                        border: `1px dashed ${color}25`,
                        minHeight: 200,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}10`, border: `1px dashed ${color}30` }}
                      >
                        <span style={{ color: `${color}55`, fontSize: 18 }}>?</span>
                      </div>
                      <p className="font-mono text-xs text-center" style={{ color: "#1e2d44" }}>
                        Perfil pendiente
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="py-10 rounded-2xl flex flex-col items-center gap-3"
                  style={{ background: "rgba(10,22,40,0.4)", border: `1px dashed ${color}20` }}
                >
                  <p className="font-mono text-sm" style={{ color: "#3d4f6e" }}>
                    No se encontraron perfiles para este rol
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
