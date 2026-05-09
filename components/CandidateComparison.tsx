"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult, AvailabilityStatus } from "@/lib/types";

interface CandidateComparisonProps {
  candidates: EmpleadoResult[];
  open: boolean;
  onClose: () => void;
  onRemove?: (id: string) => void;
  onViewGraph?: (id: string) => void;
  onViewTeamConstellation?: () => void;
}

const NIVEL_COLOR: Record<string, string> = {
  Junior: BBVA.ice,
  Mid: BBVA.canary,
  Senior: BBVA.lime,
  Staff: BBVA.mandarin,
};

const AVAIL_LABEL: Record<AvailabilityStatus, { color: string; label: string; icon: string }> = {
  disponible:      { color: BBVA.lime,     label: "Disponible",     icon: "●" },
  parcial:         { color: BBVA.canary,   label: "50% disponible", icon: "◐" },
  asignado:        { color: "#ff5c5c",     label: "100% asignado",  icon: "✕" },
  vacaciones:      { color: BBVA.ice,      label: "Vacaciones",     icon: "○" },
  maternidad:      { color: BBVA.purple,   label: "Maternidad",     icon: "♡" },
  licencia:        { color: BBVA.mandarin, label: "Licencia",       icon: "○" },
  descanso_medico: { color: "#ff5c5c",     label: "Descanso médico",icon: "✚" },
};

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 90 ? BBVA.lime : pct >= 75 ? BBVA.sereneBlue : BBVA.canary;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(133,200,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color }}>
        <span className="font-mono font-black leading-none" style={{ fontSize: size * 0.28 }}>{pct}</span>
        <span className="font-mono leading-none mt-0.5" style={{ fontSize: 9, color: "#3d4f6e" }}>match</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(133,200,255,0.03)", border: "1px solid rgba(133,200,255,0.06)" }}>
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3d4f6e" }}>{label}</span>
      <span className="font-mono text-xs font-bold" style={{ color: color ?? "#e8eeff" }}>{value}</span>
    </div>
  );
}

function CandidateColumn({
  candidate,
  rank,
  sharedSkills,
  onRemove,
  onViewGraph,
}: {
  candidate: EmpleadoResult;
  rank: number;
  sharedSkills: Set<string>;
  onRemove?: (id: string) => void;
  onViewGraph?: (id: string) => void;
}) {
  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const nivelColor = NIVEL_COLOR[candidate.nivel] ?? BBVA.grey3;
  const avail = candidate.disponibilidad ? AVAIL_LABEL[candidate.disponibilidad] : null;
  const trustTier = candidate.trust_score?.tier ?? null;
  const TIER_COLOR: Record<string, string> = {
    platinum: BBVA.purple,
    gold: BBVA.canary,
    silver: BBVA.sereneBlue,
    bronze: BBVA.mandarin,
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: rank * 0.04 }}
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(10,22,40,0.85)",
        border: "1px solid rgba(133,200,255,0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${nivelColor}00, ${nivelColor}, ${nivelColor}00)` }} />

      {/* Header */}
      <div className="p-4 flex items-start gap-3" style={{ borderBottom: "1px solid rgba(133,200,255,0.06)" }}>
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #001391, #0020cc)", boxShadow: "0 0 18px rgba(0,19,145,0.5)", color: "#fff" }}
        >
          {initials}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight truncate" style={{ color: "#e8eeff" }}>{candidate.nombre}</h3>
          <p className="text-[11px] truncate" style={{ color: "#6b7fa3" }}>{candidate.rol}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${nivelColor}18`, color: nivelColor, border: `1px solid ${nivelColor}40` }}
            >
              {candidate.nivel}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "#3d4f6e" }}>{candidate.squad}</span>
          </div>
        </div>
        <ScoreRing score={candidate.score} size={56} />
      </div>

      {/* Action row */}
      <div className="px-4 pt-3 flex items-center gap-2">
        {onViewGraph && (
          <button
            onClick={() => onViewGraph(candidate.id)}
            className="flex-1 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all"
            style={{ background: `${BBVA.electricBlue}30`, border: `1px solid ${BBVA.sereneBlue}30`, color: BBVA.sereneBlue, cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.electricBlue}55`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.electricBlue}30`; }}
          >
            Ver 360°
          </button>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(candidate.id)}
            className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition-all"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)", color: "#fca5a5", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.07)"; }}
          >
            Quitar
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="p-4 flex flex-col gap-1.5">
        {avail && (
          <StatRow label="Disponibilidad" value={`${avail.icon} ${avail.label}`} color={avail.color} />
        )}
        {candidate.años_empresa !== undefined && (
          <StatRow label="Antigüedad" value={`${candidate.años_empresa} año${candidate.años_empresa !== 1 ? "s" : ""}`} />
        )}
        {trustTier && candidate.trust_score && (
          <StatRow
            label="Trust Score"
            value={`${candidate.trust_score.overall} · ${trustTier}`}
            color={TIER_COLOR[trustTier] ?? BBVA.sereneBlue}
          />
        )}
        {candidate.b_tokens && (
          <StatRow
            label="B-Tokens"
            value={`${candidate.b_tokens.balance} · ${candidate.b_tokens.tier}`}
            color={BBVA.canary}
          />
        )}
        {candidate.edi && (
          <StatRow
            label={`EDI ${candidate.edi.año}`}
            value={candidate.edi.rating === 1 ? "Supera" : candidate.edi.rating === 2 ? "Cumple" : "A mejorar"}
            color={candidate.edi.rating === 1 ? BBVA.lime : candidate.edi.rating === 2 ? BBVA.sereneBlue : BBVA.mandarin}
          />
        )}
      </div>

      {/* Skills */}
      <div className="px-4 pb-3">
        <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#3d4f6e" }}>
          Skills · {candidate.habilidades.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {candidate.habilidades.map(skill => {
            const isShared = sharedSkills.has(skill.nombre);
            return (
              <span
                key={skill.nombre}
                className="font-mono text-[10px] px-2 py-0.5 rounded-md"
                style={{
                  background: isShared ? `${BBVA.lime}18` : "rgba(133,200,255,0.05)",
                  color: isShared ? BBVA.lime : "#6b7fa3",
                  border: `1px solid ${isShared ? BBVA.lime + "55" : "rgba(133,200,255,0.08)"}`,
                  fontWeight: isShared ? 700 : 400,
                }}
                title={isShared ? "Compartida con el resto del equipo" : undefined}
              >
                {isShared && "✓ "}{skill.nombre}
              </span>
            );
          })}
        </div>
      </div>

      {/* Projects */}
      {candidate.proyectos.length > 0 && (
        <div className="px-4 pb-3">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#3d4f6e" }}>
            Proyectos · {candidate.proyectos.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.proyectos.map(p => (
              <span
                key={p.id}
                className="font-mono text-[10px] px-2 py-0.5 rounded-md"
                style={{ background: `${BBVA.mandarin}10`, color: BBVA.mandarin, border: `1px solid ${BBVA.mandarin}28` }}
              >
                {p.nombre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Collaborators */}
      {candidate.colaboradores.length > 0 && (
        <div className="px-4 pb-4 mt-auto">
          <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#3d4f6e" }}>
            Colaboradores · {candidate.colaboradores.length}
          </p>
          <div className="flex -space-x-1.5">
            {candidate.colaboradores.slice(0, 5).map((colab, i) => (
              <div
                key={colab.id}
                className="w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-bold"
                style={{ background: `hsl(${210 + i * 30}, 60%, 25%)`, borderColor: "#0a1628", color: BBVA.sereneBlue, zIndex: 5 - i }}
                title={colab.nombre}
              >
                {colab.nombre.charAt(0)}
              </div>
            ))}
            {candidate.colaboradores.length > 5 && (
              <div
                className="w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-bold"
                style={{ background: "rgba(133,200,255,0.1)", borderColor: "#0a1628", color: "#6b7fa3" }}
              >
                +{candidate.colaboradores.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.article>
  );
}

export default function CandidateComparison({ candidates, open, onClose, onRemove, onViewGraph, onViewTeamConstellation }: CandidateComparisonProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sharedSkills = useMemo(() => {
    if (candidates.length < 2) return new Set<string>();
    const sets = candidates.map(c => new Set(c.habilidades.map(h => h.nombre)));
    const intersection = new Set<string>(sets[0]);
    for (const s of sets.slice(1)) {
      for (const skill of intersection) {
        if (!s.has(skill)) intersection.delete(skill);
      }
    }
    return intersection;
  }, [candidates]);

  const avgScore = useMemo(() => {
    if (candidates.length === 0) return 0;
    return candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length;
  }, [candidates]);

  const totalSkills = useMemo(() => {
    const all = new Set<string>();
    candidates.forEach(c => c.habilidades.forEach(s => all.add(s.nombre)));
    return all.size;
  }, [candidates]);

  const cols = candidates.length === 1 ? 1 : candidates.length === 2 ? 2 : candidates.length === 3 ? 3 : 4;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="comparison-root"
          role="dialog"
          aria-modal="true"
          aria-label={`Comparación de ${candidates.length} candidatos`}
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={onClose} style={{ background: "rgba(5,10,20,0.92)", backdropFilter: "blur(8px)" }} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full overflow-y-auto"
          >
            <div className="max-w-[1500px] mx-auto px-6 py-8">

              {/* Header */}
              <header className="flex items-center justify-between mb-6 sticky top-0 py-4" style={{ background: "rgba(5,10,20,0.95)", backdropFilter: "blur(20px)", zIndex: 5 }}>
                <div className="flex items-center gap-4">
                  <div
                    className="px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
                  >
                    Comparación
                  </div>
                  <h2 className="font-black text-lg sm:text-xl" style={{ color: "#e8eeff" }}>
                    {candidates.length} candidato{candidates.length !== 1 ? "s" : ""} lado a lado
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onViewTeamConstellation && candidates.length >= 2 && (
                    <button
                      onClick={onViewTeamConstellation}
                      title="Ver constelación visual del equipo"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`,
                        color: "#fff",
                        boxShadow: `0 0 18px ${BBVA.purple}50`,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 13 }}>✦</span>
                      Constelación
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ background: "rgba(133,200,255,0.06)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
                    aria-label="Cerrar comparación"
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </header>

              {/* Summary stats */}
              {candidates.length > 0 && (
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(10,22,40,0.7)", border: `1px solid ${BBVA.lime}25` }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3d4f6e" }}>Match promedio</p>
                    <p className="font-black font-mono text-2xl" style={{ color: BBVA.lime }}>{Math.round(avgScore * 100)}%</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(10,22,40,0.7)", border: `1px solid ${BBVA.sereneBlue}25` }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3d4f6e" }}>Skills únicas</p>
                    <p className="font-black font-mono text-2xl" style={{ color: BBVA.sereneBlue }}>{totalSkills}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(10,22,40,0.7)", border: `1px solid ${BBVA.purple}25` }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3d4f6e" }}>Skills compartidas</p>
                    <p className="font-black font-mono text-2xl" style={{ color: BBVA.purple }}>{sharedSkills.size}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(10,22,40,0.7)", border: `1px solid ${BBVA.canary}25` }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "#3d4f6e" }}>Disponibles ahora</p>
                    <p className="font-black font-mono text-2xl" style={{ color: BBVA.canary }}>
                      {candidates.filter(c => c.disponibilidad === "disponible" || c.disponibilidad === "parcial").length}
                    </p>
                  </div>
                </section>
              )}

              {/* Shared skills banner */}
              {sharedSkills.size > 0 && (
                <section className="rounded-xl px-4 py-3 mb-6 flex items-start gap-3" style={{ background: `${BBVA.lime}08`, border: `1px solid ${BBVA.lime}25` }}>
                  <span style={{ color: BBVA.lime, fontSize: 14 }}>✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] font-bold mb-1.5" style={{ color: BBVA.lime }}>
                      Skills que TODOS comparten
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(sharedSkills).map(skill => (
                        <span
                          key={skill}
                          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: `${BBVA.lime}18`, color: BBVA.lime, border: `1px solid ${BBVA.lime}40` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Empty state */}
              {candidates.length === 0 && (
                <div className="py-24 flex flex-col items-center gap-4 rounded-2xl" style={{ background: "rgba(10,22,40,0.5)", border: "1px solid rgba(133,200,255,0.07)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${BBVA.purple}10`, border: `1px dashed ${BBVA.purple}40` }}>
                    <span className="text-2xl" style={{ color: BBVA.purple }}>⊞</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm mb-1" style={{ color: "#e8eeff" }}>No hay candidatos para comparar</p>
                    <p className="font-mono text-xs" style={{ color: "#3d4f6e" }}>
                      Selecciona al menos 2 candidatos desde resultados o equipo recomendado
                    </p>
                  </div>
                </div>
              )}

              {/* Grid */}
              {candidates.length > 0 && (
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
                >
                  <AnimatePresence>
                    {candidates.map((c, i) => (
                      <CandidateColumn
                        key={c.id}
                        candidate={c}
                        rank={i}
                        sharedSkills={sharedSkills}
                        onRemove={onRemove}
                        onViewGraph={onViewGraph}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
