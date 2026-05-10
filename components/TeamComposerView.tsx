"use client";

import { useState, useEffect, useRef } from "react";
import { BBVA } from "@/lib/bbva-colors";
import type { SDAProject } from "@/lib/types";
import { getSDAProjects } from "@/lib/api";
import { SkeletonProjectRow } from "./Skeleton";

interface Props {
  onSearch: (project: SDAProject) => void;
  onBack: () => void;
}

const ESTADO_CONFIG: Record<SDAProject["estado"], { color: string; dot: string }> = {
  "En planificación": { color: BBVA.canary,     dot: "○" },
  "En desarrollo":    { color: BBVA.sereneBlue, dot: "◎" },
  "En producción":    { color: BBVA.lime,       dot: "●" },
};

const DOMINIO_COLORS: Record<string, string> = {
  "Banca Digital":         BBVA.sereneBlue,
  "Riesgos":               BBVA.mandarin,
  "Pagos":                 BBVA.purple,
  "Mercados":              BBVA.lime,
  "Ciberseguridad":        BBVA.ice,
  "Data & Analytics":      BBVA.canary,
  "Infraestructura Cloud": BBVA.sereneBlue,
  "Canales":               BBVA.purple,
  "Cumplimiento":          BBVA.mandarin,
  "Transformación":        BBVA.lime,
};

function domainColor(dominio: string): string {
  return DOMINIO_COLORS[dominio] ?? BBVA.sereneBlue;
}

export default function TeamComposerView({ onSearch, onBack }: Props) {
  const [projects, setProjects] = useState<SDAProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState<SDAProject | null>(null);
  const searchRef               = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSDAProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = projects.filter(p => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.codigo.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q) || p.dominio.toLowerCase().includes(q);
  });

  const handleSelect = (project: SDAProject) => {
    setSelected(prev => prev?.codigo === project.codigo ? null : project);
  };

  const totalPeople = selected?.roles.reduce((a, r) => a + r.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--theme-bg-page)" }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%", backgroundImage: "radial-gradient(circle, rgba(150,148,255,0.14) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "0", right: "10%", width: 400, height: 400, borderRadius: "50%", backgroundImage: "radial-gradient(circle, rgba(0,19,145,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 px-6 py-4 flex items-center justify-between sticky top-0"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "var(--theme-bg-overlay-strong)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-70"
            style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.12)", color: BBVA.sereneBlue, cursor: "pointer" }}
          >
            ← Volver
          </button>
          <div>
            <h1 className="font-black text-sm" style={{ color: "var(--theme-text-primary)" }}>
              BBVA <span style={{ color: BBVA.purple }}>Project Composer</span>
            </h1>
            <p className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>{projects.length} proyectos SDA disponibles</p>
          </div>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px]"
          style={{ background: "rgba(150,148,255,0.07)", color: BBVA.purple, border: "1px solid rgba(150,148,255,0.18)" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BBVA.purple, display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
          MOCK MODE
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* LEFT — search + list */}
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] mb-5"
            style={{ background: "rgba(150,148,255,0.07)", border: "1px solid rgba(150,148,255,0.16)", color: BBVA.purple }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <polygon points="4,0 8,7 0,7" stroke={BBVA.purple} strokeWidth="1" fill="none"/>
            </svg>
            Selecciona tu proyecto · La IA arma el equipo
          </div>

          <h2 className="font-black leading-none mb-1" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            <span className="text-gradient">Busca</span>
            <span style={{ color: "var(--theme-text-primary)" }}> tu Proyecto</span>
          </h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
            Busca por código SDA o nombre. Los roles ya están mapeados.
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--theme-text-dim)" }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SDA-53021 · FX Tracker · Pagos…"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono bg-transparent outline-none"
              style={{ background: "var(--theme-bg-surface-strong)", border: "1px solid rgba(133,200,255,0.14)", color: "var(--theme-text-primary)" }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(150,148,255,0.45)"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--theme-border-default)"; }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--theme-text-dim)", cursor: "pointer" }}>✕</button>
            )}
          </div>

          {/* List */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.08)" }}>
            {loading ? (
              <div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonProjectRow key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 px-6 flex flex-col items-center gap-3 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${BBVA.purple}10`, border: `1px dashed ${BBVA.purple}40` }}
                >
                  <span style={{ color: BBVA.purple, fontSize: 18 }}>⊘</span>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--theme-text-primary)" }}>
                    Sin coincidencias para &ldquo;{query}&rdquo;
                  </p>
                  <p className="font-mono text-[11px] leading-relaxed max-w-xs" style={{ color: "var(--theme-text-muted)" }}>
                    Prueba con otro código (SDA-530…), nombre o dominio (Pagos, Riesgos, IA, Compliance).
                  </p>
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="mt-1 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-opacity hover:opacity-80"
                  style={{ background: `${BBVA.purple}15`, border: `1px solid ${BBVA.purple}35`, color: BBVA.purple, cursor: "pointer" }}
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(150,148,255,0.2) transparent" }}>
                {filtered.map((project, idx) => {
                  const isActive  = selected?.codigo === project.codigo;
                  const estadoCfg = ESTADO_CONFIG[project.estado];
                  const dColor    = domainColor(project.dominio);

                  return (
                    <button
                      key={project.codigo}
                      onClick={() => handleSelect(project)}
                      className="w-full text-left flex items-center gap-4 px-5 py-4 transition-all duration-150"
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(133,200,255,0.05)" : "none",
                        background: isActive ? "rgba(150,148,255,0.08)" : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)"; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div
                        className="flex-shrink-0 font-mono text-[10px] font-bold px-2 py-1 rounded-lg min-w-[80px] text-center"
                        style={{ background: isActive ? `${BBVA.purple}22` : "var(--theme-tile-medium)", color: isActive ? BBVA.purple : "var(--theme-text-dim)", border: `1px solid ${isActive ? BBVA.purple + "40" : "var(--theme-border-default)"}` }}
                      >
                        {project.codigo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate leading-tight mb-0.5" style={{ color: isActive ? "var(--theme-text-primary)" : "var(--theme-text-secondary)" }}>
                          {project.nombre}
                        </p>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${dColor}12`, color: dColor, border: `1px solid ${dColor}25` }}>
                          {project.dominio}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        <span style={{ color: estadoCfg.color, fontSize: 10 }}>{estadoCfg.dot}</span>
                        <span className="font-mono text-[10px] hidden sm:block" style={{ color: estadoCfg.color + "cc" }}>{project.estado}</span>
                      </div>
                      <div className="flex-shrink-0 font-mono text-[10px] font-bold w-12 text-center" style={{ color: isActive ? BBVA.purple : "var(--theme-text-dim)" }}>
                        {project.roles.length} rol{project.roles.length !== 1 ? "es" : ""}
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${BBVA.purple}22`, border: `1px solid ${BBVA.purple}55` }}>
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M2 4.5L3.8 6.5L7 2.5" stroke={BBVA.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!loading && (
            <p className="font-mono text-[10px] mt-2 px-1" style={{ color: "var(--theme-text-faint)" }}>
              {filtered.length} de {projects.length} proyectos
            </p>
          )}
        </div>

        {/* RIGHT — detail + submit */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="sticky top-24 rounded-2xl overflow-hidden transition-all duration-300"
            style={{ background: "var(--theme-bg-surface)", border: selected ? `1px solid ${BBVA.purple}35` : "1px solid rgba(133,200,255,0.08)", boxShadow: selected ? `0 0 40px ${BBVA.purple}12` : "none" }}
          >
            {!selected ? (
              <div className="p-8 flex flex-col items-center justify-center gap-4 text-center" style={{ minHeight: 280 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(150,148,255,0.06)", border: "1px dashed rgba(150,148,255,0.2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="rgba(150,148,255,0.3)" strokeWidth="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="rgba(150,148,255,0.3)" strokeWidth="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="rgba(150,148,255,0.3)" strokeWidth="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="rgba(150,148,255,0.3)" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "var(--theme-text-dim)" }}>Selecciona un proyecto</p>
                  <p className="font-mono text-xs leading-relaxed" style={{ color: "var(--theme-text-faint)" }}>Los roles y candidatos recomendados aparecerán acá</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-5" style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "rgba(150,148,255,0.04)" }}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background: `${BBVA.purple}18`, color: BBVA.purple, border: `1px solid ${BBVA.purple}35` }}>
                      [{selected.codigo}]
                    </span>
                    <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: ESTADO_CONFIG[selected.estado].color + "cc" }}>
                      {ESTADO_CONFIG[selected.estado].dot} {selected.estado}
                    </span>
                  </div>
                  <h3 className="font-black text-base leading-tight mb-2" style={{ color: "var(--theme-text-primary)" }}>{selected.nombre}</h3>
                  <span
                    className="inline-block font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ background: `${domainColor(selected.dominio)}12`, color: domainColor(selected.dominio), border: `1px solid ${domainColor(selected.dominio)}25` }}
                  >
                    {selected.dominio}
                  </span>
                </div>

                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--theme-text-dim)" }}>Roles requeridos</p>
                  <div className="flex flex-col gap-2 mb-5">
                    {selected.roles.map((role, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "var(--theme-bg-overlay-soft)", border: "1px solid rgba(133,200,255,0.08)" }}>
                        <span className="text-xs font-medium" style={{ color: "var(--theme-text-secondary)" }}>{role.role}</span>
                        <span className="font-black font-mono text-sm" style={{ color: BBVA.purple }}>×{role.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-5" style={{ background: `${BBVA.purple}08`, border: `1px solid ${BBVA.purple}20` }}>
                    <span className="font-mono text-xs" style={{ color: "var(--theme-text-muted)" }}>Total personas</span>
                    <span className="font-black font-mono text-lg" style={{ color: BBVA.purple }}>{totalPeople}</span>
                  </div>

                  <button
                    onClick={() => onSearch(selected)}
                    className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #4a00b4, #7b00ff, #9694FF)", color: "#fff", letterSpacing: "0.08em", boxShadow: "0 0 30px rgba(150,148,255,0.4)", cursor: "pointer" }}
                  >
                    Ver equipo recomendado →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
