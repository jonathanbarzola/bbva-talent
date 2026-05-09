"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult, GraphResponse, GraphNode, GraphLink } from "@/lib/types";

const TalentGraph = dynamic(() => import("./TalentGraph"), { ssr: false });

interface TeamConstellationProps {
  candidates: EmpleadoResult[];
  open: boolean;
  onClose: () => void;
  onViewIndividual?: (id: string) => void;
}

/** Build a graph from a team of candidates:
 *   - empleado nodes (one per candidate)
 *   - habilidad nodes — only "core" skills (top 4 per person) and shared skills
 *   - WORKED_ON aggregated as colaborador links between team members
 *   - HAS_SKILL links person → skill
 */
function buildTeamGraph(candidates: EmpleadoResult[]): GraphResponse {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seenSkills = new Set<string>();
  const skillUseCount = new Map<string, number>();

  // Pre-pass: count skill usage to highlight shared ones
  for (const c of candidates) {
    for (const s of c.habilidades) {
      skillUseCount.set(s.nombre, (skillUseCount.get(s.nombre) ?? 0) + 1);
    }
  }

  for (const c of candidates) {
    nodes.push({
      id: `emp_${c.id}`,
      label: c.nombre,
      type: "empleado",
      properties: {
        rol: c.rol,
        squad: c.squad,
        nivel: c.nivel,
        score: Math.round(c.score * 100),
      },
    });

    // Top 4 skills per person + any shared skill (used by 2+ team members)
    const sortedSkills = [...c.habilidades].sort((a, b) => b.score - a.score);
    const corePicks = sortedSkills.slice(0, 4);
    const sharedPicks = c.habilidades.filter(s => (skillUseCount.get(s.nombre) ?? 0) > 1);
    const skillsToInclude = Array.from(new Set([...corePicks, ...sharedPicks].map(s => s.nombre)))
      .map(name => c.habilidades.find(s => s.nombre === name)!)
      .filter(Boolean);

    for (const sk of skillsToInclude) {
      const skillId = `skill_${sk.nombre}`;
      if (!seenSkills.has(skillId)) {
        seenSkills.add(skillId);
        nodes.push({
          id: skillId,
          label: sk.nombre,
          type: "habilidad",
          properties: {
            categoria: sk.categoria,
            shared_count: skillUseCount.get(sk.nombre) ?? 1,
          },
        });
      }
      links.push({
        source: `emp_${c.id}`,
        target: skillId,
        type: "HAS_SKILL",
        properties: { score: sk.score },
      });
    }
  }

  // Add COLLABORATES_WITH edges between team members
  const teamIds = new Set(candidates.map(c => c.id));
  const seenPairs = new Set<string>();

  for (const c of candidates) {
    for (const colab of c.colaboradores) {
      if (!teamIds.has(colab.id)) continue;
      const pair = [c.id, colab.id].sort().join(":");
      if (seenPairs.has(pair)) continue;
      seenPairs.add(pair);
      links.push({
        source: `emp_${c.id}`,
        target: `emp_${colab.id}`,
        type: "COLLABORATES_WITH",
        properties: { weight: colab.weight },
      });
    }
  }

  return { nodes, links };
}

export default function TeamConstellation({ candidates, open, onClose, onViewIndividual }: TeamConstellationProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const graphData = useMemo(() => buildTeamGraph(candidates), [candidates]);

  const sharedSkills = useMemo(() => {
    return graphData.nodes.filter(
      n => n.type === "habilidad" && Number(n.properties.shared_count ?? 0) > 1
    );
  }, [graphData.nodes]);

  const collabPairs = useMemo(
    () => graphData.links.filter(l => l.type === "COLLABORATES_WITH").length,
    [graphData.links]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="team-constellation"
          role="dialog"
          aria-modal="true"
          aria-label={`Constelación de equipo de ${candidates.length} miembros`}
          className="fixed inset-0 z-[95] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          style={{ background: "#050a14" }}
        >
          {/* Ambient */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.electricBlue}1f 0%, transparent 70%)`, filter: "blur(80px)" }} />
            <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.lime}10 0%, transparent 70%)`, filter: "blur(80px)" }} />
            <div className="absolute inset-0 bg-dot-grid opacity-40" />
          </div>

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "rgba(5,10,20,0.92)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black"
                style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, boxShadow: `0 0 22px ${BBVA.purple}55`, color: "#fff" }}
              >
                ✦
              </div>
              <div>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded inline-block mb-1"
                  style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
                >
                  Constelación de equipo
                </span>
                <h2 className="font-black text-base sm:text-lg leading-tight" style={{ color: "#e8eeff" }}>
                  Tejido del equipo de {candidates.length} miembro{candidates.length !== 1 ? "s" : ""}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-opacity hover:opacity-80"
              style={{ background: "rgba(133,200,255,0.06)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
              aria-label="Cerrar constelación de equipo"
            >
              ✕ Cerrar
            </button>
          </header>

          {/* Stats strip */}
          <div className="relative z-10 flex items-center gap-4 px-6 py-3 flex-shrink-0 flex-wrap" style={{ borderBottom: "1px solid rgba(133,200,255,0.06)", background: "rgba(10,22,40,0.5)" }}>
            <Stat label="Personas" value={candidates.length.toString()} color={BBVA.electricBlue} />
            <Stat label="Skills únicas" value={graphData.nodes.filter(n => n.type === "habilidad").length.toString()} color={BBVA.lime} />
            <Stat label="Skills compartidas" value={sharedSkills.length.toString()} color={BBVA.purple} />
            <Stat label="Colaboraciones previas" value={collabPairs.toString()} color={BBVA.sereneBlue} />
            <div className="flex-1 min-w-0" />
            <p className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>
              Tip: arrastrá los nodos para reorganizar · scroll para zoom · click para inspeccionar
            </p>
          </div>

          {/* Graph + sidebar */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0">

            {/* Sidebar with team members */}
            <aside
              className="lg:w-72 flex-shrink-0 px-5 py-4 overflow-y-auto"
              style={{ borderRight: "1px solid rgba(133,200,255,0.06)", background: "rgba(5,10,20,0.4)" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "#6b7fa3" }}>
                Equipo ({candidates.length})
              </p>
              <div className="space-y-2">
                {candidates.map((c, i) => {
                  const initials = c.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
                  return (
                    <button
                      key={c.id}
                      onClick={() => onViewIndividual?.(c.id)}
                      disabled={!onViewIndividual}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all"
                      style={{ background: "rgba(133,200,255,0.04)", border: "1px solid rgba(133,200,255,0.08)", cursor: onViewIndividual ? "pointer" : "default" }}
                      onMouseEnter={e => {
                        if (!onViewIndividual) return;
                        (e.currentTarget as HTMLElement).style.background = "rgba(133,200,255,0.10)";
                        (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.sereneBlue}40`;
                      }}
                      onMouseLeave={e => {
                        if (!onViewIndividual) return;
                        (e.currentTarget as HTMLElement).style.background = "rgba(133,200,255,0.04)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.08)";
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${215 + i * 28},55%,25%), hsl(${235 + i * 28},55%,35%))`, color: BBVA.sereneBlue, border: `1px solid ${BBVA.sereneBlue}30` }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs leading-tight truncate" style={{ color: "#e8eeff" }}>{c.nombre}</p>
                        <p className="font-mono text-[10px] truncate" style={{ color: "#6b7fa3" }}>{c.rol}</p>
                      </div>
                      <span
                        className="font-mono text-[10px] font-bold flex-shrink-0"
                        style={{ color: c.score >= 0.9 ? BBVA.lime : c.score >= 0.75 ? BBVA.sereneBlue : BBVA.canary }}
                      >
                        {Math.round(c.score * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Shared skills list */}
              {sharedSkills.length > 0 && (
                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: BBVA.purple }}>
                    Skills compartidas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sharedSkills.map(s => (
                      <span
                        key={s.id}
                        className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{ background: `${BBVA.lime}18`, color: BBVA.lime, border: `1px solid ${BBVA.lime}40` }}
                        title={`Compartida por ${s.properties.shared_count} miembros`}
                      >
                        {s.label} ×{s.properties.shared_count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {collabPairs === 0 && candidates.length >= 2 && (
                <div
                  className="mt-5 rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)" }}
                >
                  <p className="font-mono text-[11px] leading-relaxed" style={{ color: "#fca5a5" }}>
                    ⚠ Sin colaboraciones previas entre miembros — esperá tiempo de gel-up.
                  </p>
                </div>
              )}
            </aside>

            {/* Graph canvas */}
            <div className="flex-1 min-h-0 relative">
              <TalentGraph data={graphData} fullscreen />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="font-black font-mono text-lg leading-none" style={{ color }}>
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3d4f6e" }}>
        {label}
      </span>
    </div>
  );
}
