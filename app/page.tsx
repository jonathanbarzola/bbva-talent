"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BBVA } from "@/lib/bbva-colors";
import { searchTalent, getEmployeeGraph, getProjectRecommendations, getSDAProjects } from "@/lib/api";
import type {
  SearchResponse, GraphResponse, TeamCompositionResponse, SDAProject,
} from "@/lib/types";
import OnboardingTour, { type OnboardingStep } from "@/components/OnboardingTour";
import ImpactMetrics from "@/components/ImpactMetrics";
import SuccessStories from "@/components/SuccessStories";
import RoiCalculator from "@/components/RoiCalculator";

// ── Lazy imports for heavy components ───────────────────────────────────────
const ParticleBackground   = dynamic(() => import("@/components/ParticleBackground"),   { ssr: false });
const SearchingAnimation   = dynamic(() => import("@/components/SearchingAnimation"),   { ssr: false });
const ResultsView          = dynamic(() => import("@/components/ResultsView"),          { ssr: false });
const ConstellationView    = dynamic(() => import("@/components/ConstellationView"),    { ssr: false });
const TeamComposerView     = dynamic(() => import("@/components/TeamComposerView"),     { ssr: false });
const ProjectResultsView   = dynamic(() => import("@/components/ProjectResultsView"),   { ssr: false });
const NetworkingView       = dynamic(() => import("@/components/NetworkingView"),       { ssr: false });

// ── Onboarding constants ─────────────────────────────────────────────────────
const ONBOARDING_KEY = "bbva-talent:onboarding-seen-v1";
const DEMO_PROJECT_CODE = "SDA-53021"; // FX Tracker · Pagos Digitales

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetId: "onboarding-step-1",
    title: "Empezá por tu proyecto",
    body: "Elegí cualquiera de los 30 proyectos SDA del banco. Cada uno ya tiene roles definidos — nosotros buscamos las personas.",
    placement: "bottom",
  },
  {
    targetId: "onboarding-step-2",
    title: "¿Sin tiempo? Probá una demo en vivo",
    body: "Con un click cargamos el caso real del proyecto FX Tracker (Pagos) y vas directo a ver el equipo recomendado. Cero fricción.",
    placement: "top",
  },
  {
    targetId: "onboarding-step-3",
    title: "Recomendaciones explicables",
    body: "Cada candidato viene con Trust Score, EDI, B-Tokens y disponibilidad real. Hacé click en 360° para ver su red de colaboradores.",
    placement: "top",
  },
];

// ── State machine ────────────────────────────────────────────────────────────

type AppView =
  | "home"
  | "searching"
  | "results"
  | "constellation"
  | "project-composer"
  | "project-results"
  | "networking";

interface AppState {
  view: AppView;
  query: string;
  searchResult: SearchResponse | null;
  graphData: GraphResponse | null;
  selectedEmployeeId: string | null;
  projectResult: TeamCompositionResponse | null;
  selectedProject: SDAProject | null;
  dataReady: boolean;
  error: string | null;
}

const INITIAL: AppState = {
  view: "home",
  query: "",
  searchResult: null,
  graphData: null,
  selectedEmployeeId: null,
  projectResult: null,
  selectedProject: null,
  dataReady: false,
  error: null,
};

const MENTOR_SUGGESTIONS = [
  "Mentor en data science e IA",
  "Referente cloud AWS para networking",
  "Senior en ciberseguridad y compliance",
  "Experto en arquitectura de microservicios",
];

// ── Home hero ────────────────────────────────────────────────────────────────

function HomeView({
  onSearch,
  onProjectComposer,
  onNetworking,
  onDemoMode,
  onShowTour,
}: {
  onSearch: (query: string) => void;
  onProjectComposer: () => void;
  onNetworking: () => void;
  onDemoMode: () => void;
  onShowTour: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const q = query.trim();
    if (q.length < 3) return;
    onSearch(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#050a14" }}>
      <ParticleBackground />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,19,145,0.25) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(133,200,255,0.06) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "30%", right: "15%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,148,255,0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
      </div>

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #001391, #0020cc)", boxShadow: "0 0 16px rgba(0,19,145,0.45)", color: "#fff" }}
          >
            BB
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          </div>
          <div>
            <span className="font-black text-sm" style={{ color: "#e8eeff" }}>BBVA</span>
            <span className="font-bold text-sm ml-1.5" style={{ color: "#3d4f6e" }}>Talent</span>
          </div>
        </div>

        {/* Nav links — secondary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-150 hover:opacity-80"
            style={{ background: "rgba(133,200,255,0.05)", border: "1px solid rgba(133,200,255,0.10)", color: "#3d4f6e", cursor: "pointer" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="8" y1="8" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Buscar perfil
          </button>
          <button
            onClick={onNetworking}
            className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-150 hover:opacity-80"
            style={{ background: "rgba(133,200,255,0.06)", border: "1px solid rgba(133,200,255,0.12)", color: BBVA.sereneBlue, cursor: "pointer" }}
          >
            Networking
          </button>
          <Link
            href="/about"
            className="hidden sm:flex px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-150 hover:opacity-80"
            style={{ background: "rgba(150,148,255,0.06)", border: "1px solid rgba(150,148,255,0.18)", color: BBVA.purple }}
          >
            Arquitectura
          </Link>
          <button
            onClick={onShowTour}
            title="Ver tour guiado"
            aria-label="Ver tour guiado"
            className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-150 hover:opacity-100"
            style={{ background: `${BBVA.purple}10`, border: `1px solid ${BBVA.purple}30`, color: BBVA.purple, cursor: "pointer", opacity: 0.85 }}
          >
            ?
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-12">

        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs mb-8 animate-fade-up"
          style={{ background: "rgba(150,148,255,0.07)", border: "1px solid rgba(150,148,255,0.20)", color: BBVA.purple, animationDelay: "0.05s" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BBVA.purple, display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
          AI-powered · Knowledge Graph · BBVA Talent
        </div>

        {/* Headline */}
        <h1
          className="font-black leading-tight mb-4 animate-fade-up"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", animationDelay: "0.1s" }}
        >
          <span style={{ color: "#e8eeff" }}>Armá el equipo</span>
          <br />
          <span className="text-gradient">ideal para cada</span>
          <br />
          <span style={{ color: "#e8eeff" }}>proyecto SDA</span>
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed mb-7 max-w-lg animate-fade-up"
          style={{ color: "#4d6080", animationDelay: "0.15s" }}
        >
          Seleccioná un proyecto y la IA recomienda el equipo perfecto analizando
          habilidades, disponibilidad, Trust Score y colaboraciones previas.
        </p>

        {/* ── Impact metrics — communicates value before any click ── */}
        <ImpactMetrics />

        {/* ── PRIMARY CTA — Project Composer ── */}
        <div id="onboarding-step-1" className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={onProjectComposer}
            className="group w-full relative overflow-hidden rounded-2xl p-7 text-left transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(74,0,180,0.18) 0%, rgba(150,148,255,0.10) 100%)",
              border: `1px solid ${BBVA.purple}45`,
              boxShadow: `0 0 60px ${BBVA.purple}14, 0 0 120px rgba(0,19,145,0.12)`,
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(74,0,180,0.28) 0%, rgba(150,148,255,0.16) 100%)";
              (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.purple}70`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 80px ${BBVA.purple}22, 0 0 160px rgba(0,19,145,0.18)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(74,0,180,0.18) 0%, rgba(150,148,255,0.10) 100%)";
              (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.purple}45`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 60px ${BBVA.purple}14, 0 0 120px rgba(0,19,145,0.12)`;
            }}
          >
            {/* Decorative glow top-right */}
            <div className="absolute top-0 right-0 w-64 h-40 pointer-events-none" style={{ background: `radial-gradient(circle at 85% 15%, ${BBVA.purple}22 0%, transparent 65%)` }} />

            <div className="relative z-10 flex items-center gap-5">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
                style={{ background: "linear-gradient(135deg, #4a00b4, #7b00ff, #9694FF)", boxShadow: `0 0 30px ${BBVA.purple}55`, color: "#fff" }}
              >
                ✦
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <p className="font-black text-xl" style={{ color: "#e8eeff" }}>Project Composer</p>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${BBVA.purple}20`, border: `1px solid ${BBVA.purple}40`, color: BBVA.purple }}
                  >
                    PRINCIPAL
                  </span>
                </div>
                <p className="font-mono text-sm leading-snug" style={{ color: BBVA.purple + "cc" }}>
                  Seleccioná un proyecto SDA · La IA recomienda el equipo ideal
                  basándose en skills, disponibilidad y Trust Score
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="flex-shrink-0 group-hover:translate-x-1.5 transition-transform duration-200"
                width="22" height="22" viewBox="0 0 22 22" fill="none"
              >
                <path d="M8 18L15 11L8 4" stroke={BBVA.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Feature pills */}
            <div className="relative z-10 flex flex-wrap gap-2 mt-5 ml-[84px]">
              {["Trust Score", "EDI 2025", "B-Tokens", "Disponibilidad", "Colaboraciones previas"].map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2.5 py-1 rounded-lg"
                  style={{ background: `${BBVA.purple}12`, border: `1px solid ${BBVA.purple}25`, color: BBVA.purple + "cc" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* ── Demo mode CTA — pre-loads FX Tracker case ── */}
        <button
          id="onboarding-step-2"
          onClick={onDemoMode}
          className="mt-4 group flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-[12px] font-bold animate-fade-up transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${BBVA.lime}10, ${BBVA.lime}05)`,
            border: `1px solid ${BBVA.lime}30`,
            color: BBVA.lime,
            animationDelay: "0.24s",
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${BBVA.lime}20, ${BBVA.lime}0d)`;
            (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.lime}55`;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${BBVA.lime}22`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${BBVA.lime}10, ${BBVA.lime}05)`;
            (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.lime}30`;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <span style={{ fontSize: 13 }}>▶</span>
          <span>Probá un caso real</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${BBVA.lime}18`, color: BBVA.lime, opacity: 0.9 }}>
            SDA-53021 · FX Tracker
          </span>
          <span className="opacity-60 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 w-full max-w-2xl mt-8 mb-6 animate-fade-up" style={{ animationDelay: "0.28s" }}>
          <div className="flex-1 h-px" style={{ background: "rgba(133,200,255,0.07)" }} />
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#1e2d44" }}>
            o si buscás algo puntual
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(133,200,255,0.07)" }} />
        </div>

        {/* ── SECONDARY CTAs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl animate-fade-up" style={{ animationDelay: "0.32s" }}>

          {/* Buscar perfil / mentor */}
          <div>
            {!searchOpen ? (
              <button
                onClick={openSearch}
                className="group w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200"
                style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(133,200,255,0.10)", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.25)"; (e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.9)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.7)"; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(133,200,255,0.07)", border: "1px solid rgba(133,200,255,0.14)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4.5" stroke={BBVA.sereneBlue} strokeWidth="1.4"/>
                    <line x1="10.5" y1="10.5" x2="14" y2="14" stroke={BBVA.sereneBlue} strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-tight" style={{ color: "#e8eeff" }}>Buscar perfil</p>
                  <p className="font-mono text-[11px] mt-0.5" style={{ color: "#3d4f6e" }}>Búsqueda 1 a 1 por skills o rol</p>
                </div>
                <svg className="ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 11L9 7L5 3" stroke="#3d4f6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <div
                className="w-full rounded-xl overflow-hidden"
                style={{ background: "rgba(10,22,40,0.9)", border: "1px solid rgba(133,200,255,0.22)" }}
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#3d4f6e" }}>
                    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
                    <line x1="9" y1="9" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscá un mentor, perfil o skill..."
                    className="flex-1 bg-transparent outline-none text-sm font-mono placeholder:opacity-30"
                    style={{ color: "#e8eeff" }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={query.trim().length < 3}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all"
                    style={{
                      background: query.trim().length >= 3 ? "linear-gradient(135deg, #001391, #0020cc)" : "rgba(133,200,255,0.06)",
                      color: query.trim().length >= 3 ? "#fff" : "#3d4f6e",
                      cursor: query.trim().length >= 3 ? "pointer" : "not-allowed",
                    }}
                  >
                    Buscar
                  </button>
                </div>
                {/* Suggestions inline */}
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {MENTOR_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                      className="px-2 py-1 rounded font-mono text-[10px] transition-opacity hover:opacity-80"
                      style={{ background: "rgba(133,200,255,0.05)", border: "1px solid rgba(133,200,255,0.08)", color: "#3d4f6e", cursor: "pointer" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Networking & Mentores */}
          <button
            onClick={onNetworking}
            className="group flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200"
            style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(133,200,255,0.10)", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${BBVA.sereneBlue}40`; (e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.9)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.10)"; (e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.7)"; }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BBVA.sereneBlue}0d`, border: `1px solid ${BBVA.sereneBlue}25` }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="5" cy="5" r="2.5" stroke={BBVA.sereneBlue} strokeWidth="1.3"/>
                <circle cx="11" cy="5" r="2.5" stroke={BBVA.sereneBlue} strokeWidth="1.3"/>
                <path d="M1 14c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={BBVA.sereneBlue} strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M11 10c1.5 0 3 1.3 3 3" stroke={BBVA.sereneBlue} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight" style={{ color: "#e8eeff" }}>Networking & Mentores</p>
              <p className="font-mono text-[11px] mt-0.5" style={{ color: "#3d4f6e" }}>Conectá con referentes internos · B-Tokens</p>
            </div>
            <svg className="ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 11L9 7L5 3" stroke="#3d4f6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Success stories — narrative proof points */}
        <SuccessStories />

        {/* ROI Calculator — interactive cost savings */}
        <RoiCalculator />

        {/* Stats bar */}
        <div id="onboarding-step-3" className="flex items-center gap-8 mt-14 animate-fade-up" style={{ animationDelay: "0.38s" }}>
          {[
            { value: "18+", label: "Empleados",  color: BBVA.sereneBlue },
            { value: "10",  label: "Proyectos",  color: BBVA.purple     },
            { value: "100+",label: "Skills",     color: BBVA.lime       },
            { value: "AI",  label: "Semántico",  color: BBVA.mandarin   },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-black font-mono text-2xl leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── Error toast ───────────────────────────────────────────────────────────────

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl"
      style={{ background: "rgba(10,22,40,0.97)", border: "1px solid rgba(248,113,113,0.35)", backdropFilter: "blur(20px)" }}
    >
      <span style={{ color: "#f87171" }}>⚠</span>
      <span className="font-mono text-sm" style={{ color: "#fca5a5" }}>{message}</span>
      <button onClick={onDismiss} className="ml-2 font-mono text-xs" style={{ color: "#3d4f6e", cursor: "pointer" }}>✕</button>
    </div>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────

export default function Page() {
  const [state, setState] = useState<AppState>(INITIAL);
  const [tourOpen, setTourOpen] = useState(false);

  const go = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // Auto-open onboarding on first visit (only on home view)
  useEffect(() => {
    if (state.view !== "home") return;
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      // Slight delay so the home animations finish first
      const t = setTimeout(() => setTourOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [state.view]);

  const handleTourFinish = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    }
  }, []);

  const handleShowTour = useCallback(() => {
    setTourOpen(true);
  }, []);

  // ── Demo mode / deep-link: pre-load a project and jump to project-results ──
  const handleLoadProject = useCallback(async (code: string = DEMO_PROJECT_CODE) => {
    try {
      const projects = await getSDAProjects();
      const demo = projects.find(p => p.codigo === code);
      if (!demo) {
        go({ error: `Proyecto ${code} no encontrado` });
        return;
      }
      go({ view: "searching", query: `Demo · ${demo.nombre}`, dataReady: false, error: null, selectedProject: demo });
      const result = await getProjectRecommendations(demo);
      go({ view: "project-results", projectResult: result, dataReady: true });
    } catch (e) {
      go({ view: "home", error: (e as Error).message ?? "No se pudo cargar el proyecto" });
    }
  }, [go]);

  const handleDemoMode = useCallback(() => handleLoadProject(), [handleLoadProject]);

  // Read ?demo=SDA-XXXXX from URL on mount and auto-load the project (deep-link)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("demo");
    if (code && /^SDA-\d+$/.test(code)) {
      handleLoadProject(code);
      // Clean the URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("demo");
      window.history.replaceState({}, "", url.toString());
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Free-form search ────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    go({ view: "searching", query, dataReady: false, error: null });

    try {
      const result = await searchTalent(query);
      go({ searchResult: result, dataReady: true });
    } catch (e) {
      go({ dataReady: true, error: (e as Error).message ?? "Error en la búsqueda" });
    }
  }, [go]);

  const handleSearchComplete = useCallback(() => {
    if (state.error) {
      go({ view: "home" });
    } else {
      go({ view: "results" });
    }
  }, [state.error, go]);

  // ── Constellation ───────────────────────────────────────────────────────────

  const handleViewConstellation = useCallback(async (employeeId: string) => {
    try {
      const graphData = await getEmployeeGraph(employeeId);
      const employee  = state.searchResult?.candidatos.find(c => c.id === employeeId)
        ?? state.projectResult?.roles.flatMap(r => r.candidates).find(c => c.id === employeeId);

      if (!employee) return;
      go({ view: "constellation", graphData, selectedEmployeeId: employeeId });
    } catch (e) {
      go({ error: (e as Error).message ?? "Error cargando el grafo" });
    }
  }, [state.searchResult, state.projectResult, go]);

  const handleExploreEmployee = useCallback(async (employeeId: string) => {
    try {
      const graphData = await getEmployeeGraph(employeeId);
      go({ graphData, selectedEmployeeId: employeeId });
    } catch {
      /* silently ignore — graph just stays the same */
    }
  }, [go]);

  // ── Project Composer ────────────────────────────────────────────────────────

  const handleProjectSearch = useCallback(async (project: SDAProject) => {
    go({ selectedProject: project, error: null });
    try {
      const result = await getProjectRecommendations(project);
      go({ view: "project-results", projectResult: result });
    } catch (e) {
      go({ view: "project-composer", error: (e as Error).message ?? "Error al obtener recomendaciones" });
    }
  }, [go]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const selectedEmployee = (() => {
    if (!state.selectedEmployeeId) return null;
    return (
      state.searchResult?.candidatos.find(c => c.id === state.selectedEmployeeId) ??
      state.projectResult?.roles.flatMap(r => r.candidates).find(c => c.id === state.selectedEmployeeId) ??
      null
    );
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  const renderView = () => {
    switch (state.view) {

      case "home":
        return (
          <HomeView
            onSearch={handleSearch}
            onProjectComposer={() => go({ view: "project-composer" })}
            onNetworking={() => go({ view: "networking" })}
            onDemoMode={handleDemoMode}
            onShowTour={handleShowTour}
          />
        );

      case "searching":
        return (
          <SearchingAnimation
            query={state.query}
            dataReady={state.dataReady}
            onComplete={handleSearchComplete}
          />
        );

      case "results":
        if (!state.searchResult) return null;
        return (
          <ResultsView
            result={state.searchResult}
            onViewConstellation={handleViewConstellation}
            onNewSearch={() => go({ view: "home", searchResult: null })}
          />
        );

      case "constellation":
        if (!state.graphData || !selectedEmployee) return null;
        return (
          <ConstellationView
            graphData={state.graphData}
            employee={selectedEmployee}
            onBack={() => go({ view: state.projectResult ? "project-results" : "results" })}
            onExploreEmployee={handleExploreEmployee}
          />
        );

      case "project-composer":
        return (
          <TeamComposerView
            onSearch={handleProjectSearch}
            onBack={() => go({ view: "home" })}
          />
        );

      case "project-results":
        if (!state.projectResult || !state.selectedProject) return null;
        return (
          <ProjectResultsView
            project={state.selectedProject}
            result={state.projectResult}
            onViewGraph={handleViewConstellation}
            onBack={() => go({ view: "project-composer" })}
          />
        );

      case "networking":
        return (
          <NetworkingView
            onBack={() => go({ view: "home" })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      {state.error && (
        <ErrorToast message={state.error} onDismiss={() => go({ error: null })} />
      )}
      {state.view === "home" && (
        <OnboardingTour
          steps={ONBOARDING_STEPS}
          open={tourOpen}
          onClose={() => setTourOpen(false)}
          onFinish={handleTourFinish}
        />
      )}
    </>
  );
}
