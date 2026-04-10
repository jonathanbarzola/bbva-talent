"use client";

import { useEffect, useState } from "react";
import { BBVA } from "@/lib/bbva-colors";
import type { EmpleadoResult, SearchResponse } from "@/lib/types";
import CandidateCard from "./CandidateCard";

interface ResultsViewProps {
  result: SearchResponse;
  onViewConstellation: (employeeId: string) => void;
  onNewSearch: () => void;
}

export default function ResultsView({ result, onViewConstellation, onNewSearch }: ResultsViewProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const top = result.candidatos[0];

  return (
    <div
      className="min-h-screen"
      style={{ background:"#050a14", opacity: visible ? 1 : 0, transition:"opacity 0.4s ease" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", right:"5%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,19,145,0.12) 0%, transparent 70%)", filter:"blur(60px)" }} />
        <div style={{ position:"absolute", bottom:"0", left:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(150,148,255,0.06) 0%, transparent 70%)", filter:"blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="relative z-10 sticky top-0 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom:"1px solid rgba(133,200,255,0.08)", background:"rgba(5,10,20,0.92)", backdropFilter:"blur(20px)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
            style={{ background:"linear-gradient(135deg, #001391, #0020cc)", color:"#fff", boxShadow:"0 0 16px rgba(0,19,145,0.4)" }}
          >
            BB
            <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color:"#3d4f6e" }}>
              resultados para
            </span>
            <span
              className="font-mono text-xs px-3 py-1.5 rounded-lg max-w-sm truncate"
              style={{ background:"rgba(133,200,255,0.08)", border:"1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue }}
            >
              &ldquo;{result.query}&rdquo;
            </span>
          </div>
        </div>

        <button
          onClick={onNewSearch}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 hover:opacity-80"
          style={{ background:"rgba(133,200,255,0.07)", border:"1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor:"pointer" }}
        >
          ← Nueva búsqueda
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <section className="mb-10 animate-fade-up" style={{ animationDelay:"0.05s" }}>
          <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-5 mb-6">
            {/* Heading */}
            <div className="flex flex-col justify-center">
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color:"#3d4f6e" }}>
                Análisis completado
              </p>
              <h2 className="font-black leading-tight" style={{ fontSize:"clamp(1.8rem, 3.5vw, 3rem)", color:"#e8eeff" }}>
                <span style={{ color: BBVA.sereneBlue }}>{result.total}</span> candidatos{" "}
                <span style={{ fontSize:"0.6em", color:"#4d6080" }}>encontrados</span>
              </h2>
            </div>

            {/* Stats — stacked vertically so each card has real height */}
            <div className="flex flex-col gap-2.5 min-w-[300px]">
              {[
                { label:"Fuentes analizadas", value:"4",              color: BBVA.sereneBlue },
                { label:"Top match",          value:`${Math.round((top?.score ?? 0)*100)}%`, color: BBVA.lime },
                { label:"Modelo",             value:"text-embed-3",   color: BBVA.purple },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-6 px-5 py-4 rounded-xl flex-1"
                  style={{ background:"rgba(10,22,40,0.85)", border:`1px solid ${s.color}28` }}
                >
                  <span className="font-mono text-sm" style={{ color:"#3d4f6e" }}>{s.label}</span>
                  <span className="font-black text-2xl leading-none" style={{ color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intent */}
          <div className="px-5 py-4 rounded-2xl" style={{ background:"rgba(133,200,255,0.04)", border:"1px solid rgba(133,200,255,0.1)" }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color:"#3d4f6e" }}>
              Intención semántica detectada
            </p>
            <p className="text-sm leading-relaxed" style={{ color:"#8099b8" }}>
              {result.intencion_detectada}
            </p>
          </div>
        </section>

        {/* ── Featured top candidate ─────────────────────────────────────── */}
        {top && (
          <section className="mb-10 animate-fade-up" style={{ animationDelay:"0.15s" }}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded-full font-bold"
                style={{ background:`${BBVA.lime}15`, color: BBVA.lime, border:`1px solid ${BBVA.lime}35` }}
              >
                ★ Mejor match
              </span>
              <div className="flex-1 h-px" style={{ background:"rgba(133,200,255,0.07)" }} />
            </div>
            <FeaturedCard candidate={top} onViewConstellation={onViewConstellation} />
          </section>
        )}

        {/* ── Other candidates ───────────────────────────────────────────── */}
        {result.candidatos.length > 1 && (
          <section className="animate-fade-up" style={{ animationDelay:"0.25s" }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color:"#3d4f6e" }}>
                Otros candidatos
              </span>
              <div className="flex-1 h-px" style={{ background:"rgba(133,200,255,0.07)" }} />
              <span className="font-mono text-xs" style={{ color:"#1e2d44" }}>
                {result.candidatos.length - 1} perfiles
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {result.candidatos.slice(1).map((c, idx) => (
                <div key={c.id} className="animate-fade-up" style={{ animationDelay:`${0.28 + idx * 0.07}s` }}>
                  <CandidateCard candidate={c} rank={idx + 2} onViewGraph={onViewConstellation} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ── Featured card ─────────────────────────────────────────────────────────── */
function FeaturedCard({ candidate, onViewConstellation }: { candidate: EmpleadoResult; onViewConstellation: (id: string) => void }) {
  const score    = Math.round(candidate.score * 100);
  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const SKILL_COLORS = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary, BBVA.mandarin];

  return (
    <div
      className="relative rounded-2xl p-7 overflow-hidden"
      style={{ background:"rgba(10,22,40,0.88)", border:"1px solid rgba(133,200,255,0.2)", boxShadow:"0 0 60px rgba(0,19,145,0.18)" }}
    >
      <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none" style={{ background:`radial-gradient(circle at 80% 20%, ${BBVA.electricBlue}20 0%, transparent 60%)` }} />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Avatar + identity */}
        <div className="flex items-start gap-5 lg:w-72 flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0 relative overflow-hidden"
            style={{ background:"linear-gradient(135deg, #001391, #0020cc)", boxShadow:"0 0 35px rgba(0,19,145,0.6)", color:"#fff" }}
          >
            {initials}
            <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)" }} />
          </div>
          <div>
            <h3 className="font-black text-2xl leading-tight mb-1" style={{ color:"#e8eeff" }}>{candidate.nombre}</h3>
            <p className="text-base mb-1" style={{ color: BBVA.sereneBlue }}>{candidate.rol}</p>
            <p className="font-mono text-sm" style={{ color:"#3d4f6e" }}>{candidate.squad} · {candidate.ubicacion}</p>
            <div
              className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg font-mono text-xs font-bold"
              style={{ background:"rgba(136,231,131,0.1)", border:`1px solid ${BBVA.lime}35`, color: BBVA.lime }}
            >
              {candidate.nivel}
            </div>
          </div>
        </div>

        {/* Bio + skills */}
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed mb-5" style={{ color:"#5a7090" }}>{candidate.bio}</p>
          <div className="flex flex-wrap gap-2">
            {candidate.habilidades.map((skill, i) => {
              const c = SKILL_COLORS[i % SKILL_COLORS.length];
              return (
                <span key={skill.nombre} className="px-3 py-1 rounded-lg font-mono text-xs" style={{ background:`${c}13`, color:c, border:`1px solid ${c}32` }}>
                  {skill.nombre}
                </span>
              );
            })}
          </div>
          {candidate.proyectos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {candidate.proyectos.map(p => (
                <span key={p.id} className="px-3 py-1 rounded-lg font-mono text-xs" style={{ background:`${BBVA.mandarin}10`, color: BBVA.mandarin, border:`1px solid ${BBVA.mandarin}28` }}>
                  {p.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score + CTA */}
        <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-5 lg:w-36 flex-shrink-0">
          <div className="text-center">
            <div className="font-black leading-none" style={{ fontSize:56, color: BBVA.lime, fontFamily:"var(--font-mono)" }}>{score}</div>
            <div className="font-mono text-sm mt-1" style={{ color:"#3d4f6e" }}>% match</div>
          </div>
          <button
            onClick={() => onViewConstellation(candidate.id)}
            className="px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 whitespace-nowrap"
            style={{ background:"linear-gradient(135deg, #001391, #0020cc)", color:"#fff", letterSpacing:"0.07em", boxShadow:"0 0 30px rgba(0,19,145,0.55)", cursor:"pointer" }}
          >
            Ver 360°
          </button>
        </div>
      </div>
    </div>
  );
}
