"use client";

import { useEffect, useMemo, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult, SearchResponse } from "@/lib/types";
import CandidateCard from "./CandidateCard";
import TeamBuilderPanel from "./TeamBuilderPanel";
import CandidateComparison from "./CandidateComparison";
import WhyCandidateModal from "./WhyCandidateModal";
import TeamConstellation from "./TeamConstellation";

interface ResultsViewProps {
  result: SearchResponse;
  onViewConstellation: (employeeId: string) => void;
  onNewSearch: () => void;
}

const NIVEL_FILTERS = ["Todos", "Analyst", "Associate", "Expert"];

export default function ResultsView({ result, onViewConstellation, onNewSearch }: ResultsViewProps) {
  const [visible, setVisible]               = useState(false);
  const [filterNivel, setFilterNivel]       = useState("Todos");
  const [selectedIds, setSelectedIds]       = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [teamConstellationOpen, setTeamConstellationOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const top    = result.candidatos[0];
  const others = result.candidatos.slice(1);

  const filteredOthers = useMemo(() => {
    if (filterNivel === "Todos") return others;
    return others.filter(c => c.nivel === filterNivel);
  }, [others, filterNivel]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedCandidates = useMemo(
    () => result.candidatos.filter(c => selectedIds.includes(c.id)),
    [result.candidatos, selectedIds]
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--theme-bg-page)", opacity: visible ? 1 : 0, transition: "opacity 0.4s ease", paddingBottom: selectedIds.length > 0 ? 96 : 0 }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,19,145,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "0", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,148,255,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border-default)", background: "var(--theme-bg-overlay-strong)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", boxShadow: "0 0 16px rgba(0,19,145,0.4)" }}
          >
            BB
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--theme-text-dim)" }}>resultados para</span>
            <span
              className="font-mono text-xs px-3 py-1.5 rounded-lg max-w-sm truncate"
              style={{ background: "var(--theme-tile-medium)", border: "1px solid var(--theme-border-strong)", color: BBVA.sereneBlue }}
            >
              &ldquo;{result.query}&rdquo;
            </span>
          </div>
        </div>
        <button
          onClick={onNewSearch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 hover:opacity-80"
          style={{ background: "var(--theme-tile-medium)", border: "1px solid var(--theme-border-strong)", color: BBVA.sereneBlue, cursor: "pointer" }}
        >
          ← Nueva búsqueda
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Stats row */}
        <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-5 mb-6">
            <div className="flex flex-col justify-center">
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--theme-text-dim)" }}>Análisis completado</p>
              <h2 className="font-black leading-tight" style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", color: "var(--theme-text-primary)" }}>
                <span style={{ color: BBVA.sereneBlue }}>{result.total}</span> candidatos{" "}
                <span style={{ fontSize: "0.6em", color: "var(--theme-text-muted)" }}>encontrados</span>
              </h2>
            </div>
            <div className="flex flex-col gap-2.5 min-w-[300px]">
              {[
                { label: "Fuentes analizadas", value: "4",              color: BBVA.sereneBlue },
                { label: "Top match",          value: `${Math.round((top?.score ?? 0) * 100)}%`, color: BBVA.lime },
                { label: "Modelo",             value: "text-embed-3",   color: BBVA.purple },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between gap-6 px-5 py-4 rounded-xl flex-1" style={{ background: "var(--theme-bg-surface-strong)", border: `1px solid ${s.color}28` }}>
                  <span className="font-mono text-sm" style={{ color: "var(--theme-text-dim)" }}>{s.label}</span>
                  <span className="font-black text-2xl leading-none" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-4 rounded-2xl" style={{ background: "var(--theme-tile-soft)", border: "1px solid var(--theme-border-default)" }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--theme-text-dim)" }}>Intención semántica detectada</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-secondary)" }}>{result.intencion_detectada}</p>
          </div>
        </section>

        {/* Featured top candidate */}
        {top && (
          <section className="mb-10 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded-full font-bold" style={{ background: `${BBVA.lime}15`, color: BBVA.lime, border: `1px solid ${BBVA.lime}35` }}>
                ★ Mejor match
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--theme-tile-medium)" }} />
            </div>
            <FeaturedCard
              candidate={top}
              onViewConstellation={onViewConstellation}
              isSelected={selectedIds.includes(top.id)}
              onSelect={toggleSelect}
              onExplain={setExplainingId}
            />
          </section>
        )}

        {/* Other candidates */}
        {others.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: "var(--theme-text-dim)" }}>Otros candidatos</span>
              <div className="flex-1 h-px hidden sm:block" style={{ background: "var(--theme-tile-medium)" }} />
              <div className="flex items-center gap-1.5 flex-wrap">
                {NIVEL_FILTERS.map(nivel => (
                  <button
                    key={nivel}
                    onClick={() => setFilterNivel(nivel)}
                    className="px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all duration-150"
                    style={{
                      background: filterNivel === nivel ? "var(--theme-border-strong)" : "var(--theme-tile-soft)",
                      color: filterNivel === nivel ? BBVA.sereneBlue : "var(--theme-text-dim)",
                      border: `1px solid ${filterNivel === nivel ? "var(--theme-border-hover)" : "var(--theme-tile-medium)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
              <span className="font-mono text-xs" style={{ color: "var(--theme-text-faint)" }}>{filteredOthers.length} perfiles</span>
            </div>

            {filteredOthers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredOthers.map((c, idx) => (
                  <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${0.28 + idx * 0.07}s` }}>
                    <CandidateCard
                      candidate={c}
                      rank={result.candidatos.indexOf(c) + 1}
                      onViewGraph={onViewConstellation}
                      isSelected={selectedIds.includes(c.id)}
                      onSelect={toggleSelect}
                      onExplain={setExplainingId}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 rounded-2xl flex flex-col items-center gap-3" style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid var(--theme-border-soft)" }}>
                <span className="font-mono text-2xl" style={{ opacity: 0.3 }}>∅</span>
                <p className="font-mono text-sm" style={{ color: "var(--theme-text-dim)" }}>
                  No hay candidatos con nivel <span style={{ color: BBVA.sereneBlue }}>{filterNivel}</span>
                </p>
                <button onClick={() => setFilterNivel("Todos")} className="font-mono text-xs underline" style={{ color: "var(--theme-text-dim)", cursor: "pointer" }}>
                  Ver todos los niveles
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <TeamBuilderPanel
        selected={selectedCandidates}
        onRemove={toggleSelect}
        onClear={() => setSelectedIds([])}
        onCompare={() => setComparisonOpen(true)}
      />

      <CandidateComparison
        candidates={selectedCandidates}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        onRemove={toggleSelect}
        onViewGraph={(id) => { setComparisonOpen(false); onViewConstellation(id); }}
        onViewTeamConstellation={() => { setComparisonOpen(false); setTeamConstellationOpen(true); }}
      />

      <TeamConstellation
        candidates={selectedCandidates}
        open={teamConstellationOpen}
        onClose={() => setTeamConstellationOpen(false)}
        onViewIndividual={(id) => { setTeamConstellationOpen(false); onViewConstellation(id); }}
      />

      <WhyCandidateModal
        candidate={result.candidatos.find(c => c.id === explainingId) ?? null}
        open={explainingId !== null}
        onClose={() => setExplainingId(null)}
      />
    </div>
  );
}

function FeaturedCard({ candidate, onViewConstellation, isSelected, onSelect, onExplain }: {
  candidate: EmpleadoResult;
  onViewConstellation: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onExplain?: (id: string) => void;
}) {
  const score    = Math.round(candidate.score * 100);
  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const SKILL_COLORS = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary, BBVA.mandarin];

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const duration = 1100;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [score]);

  return (
    <div
      className="relative rounded-2xl p-7 overflow-hidden transition-all duration-300"
      style={{
        background: "var(--theme-bg-surface-strong)",
        border: isSelected ? `1px solid ${BBVA.lime}55` : "1px solid var(--theme-border-hover)",
        boxShadow: isSelected ? `0 0 60px ${BBVA.lime}14, 0 0 60px rgba(0,19,145,0.18)` : "0 0 60px rgba(0,19,145,0.18)",
      }}
    >
      <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background: `radial-gradient(circle at 80% 20%, ${BBVA.electricBlue}20 0%, transparent 60%)` }} />

      {onSelect && (
        <button
          onClick={() => onSelect(candidate.id)}
          title={isSelected ? "Quitar del equipo" : "Agregar al equipo"}
          className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] transition-all duration-200 z-10"
          style={{ background: isSelected ? `${BBVA.lime}18` : "var(--theme-tile-medium)", border: `1px solid ${isSelected ? BBVA.lime + "55" : "var(--theme-border-default)"}`, color: isSelected ? BBVA.lime : "var(--theme-text-dim)", cursor: "pointer" }}
        >
          {isSelected ? (
            <><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={BBVA.lime} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>En equipo</>
          ) : (
            <><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 1V7M1 4H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/></svg>Agregar al equipo</>
          )}
        </button>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row gap-8">
        <div className="flex items-start gap-5 lg:w-72 flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #001391, #0020cc)", boxShadow: "0 0 35px rgba(0,19,145,0.6)", color: "#fff" }}
          >
            {initials}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)" }} />
          </div>
          <div>
            <h3 className="font-black text-2xl leading-tight mb-1" style={{ color: "var(--theme-text-primary)" }}>{candidate.nombre}</h3>
            <p className="text-base mb-1" style={{ color: BBVA.sereneBlue }}>{candidate.rol}</p>
            <p className="font-mono text-sm" style={{ color: "var(--theme-text-dim)" }}>{candidate.squad} · {candidate.ubicacion}</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg font-mono text-xs font-bold" style={{ background: "rgba(136,231,131,0.1)", border: `1px solid ${BBVA.lime}35`, color: BBVA.lime }}>
              {candidate.nivel}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--theme-text-secondary)" }}>{candidate.bio}</p>
          <div className="flex flex-wrap gap-2">
            {candidate.habilidades.map((skill, i) => {
              const c = SKILL_COLORS[i % SKILL_COLORS.length];
              return (
                <span key={skill.nombre} className="px-3 py-1 rounded-lg font-mono text-xs" style={{ background: `${c}13`, color: c, border: `1px solid ${c}32` }}>
                  {skill.nombre}
                </span>
              );
            })}
          </div>
          {candidate.proyectos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {candidate.proyectos.map(p => (
                <span key={p.id} className="px-3 py-1 rounded-lg font-mono text-xs" style={{ background: `${BBVA.mandarin}10`, color: BBVA.mandarin, border: `1px solid ${BBVA.mandarin}28` }}>
                  {p.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-5 lg:w-36 flex-shrink-0">
          <div className="text-center">
            <div className="font-black leading-none" style={{ fontSize: 56, color: BBVA.lime, fontFamily: "var(--font-mono)" }}>
              {displayScore}
            </div>
            <div className="font-mono text-sm mt-1" style={{ color: "var(--theme-text-dim)" }}>% match</div>
          </div>
          <div className="flex flex-col gap-2 lg:items-stretch">
            <button
              onClick={() => onViewConstellation(candidate.id)}
              className="px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff", letterSpacing: "0.07em", boxShadow: "0 0 30px rgba(0,19,145,0.55)", cursor: "pointer" }}
            >
              Ver 360°
            </button>
            {onExplain && (
              <button
                onClick={() => onExplain(candidate.id)}
                title="¿Por qué este candidato?"
                className="px-3 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap"
                style={{ background: `${BBVA.purple}10`, border: `1px solid ${BBVA.purple}38`, color: BBVA.purple, cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}24`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}10`; }}
              >
                ¿Por qué?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
