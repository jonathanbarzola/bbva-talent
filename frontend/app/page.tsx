"use client";

import { useState, useCallback, useRef } from "react";
import { searchTalent, getEmployeeGraph } from "@/lib/api";
import { BBVA } from "@/lib/bbva-colors";
import type { SearchResponse, GraphResponse, EmpleadoResult } from "@/lib/types";
import SearchingAnimation from "@/components/SearchingAnimation";
import ResultsView from "@/components/ResultsView";
import ConstellationView from "@/components/ConstellationView";

// ── View state machine ────────────────────────────────────────────────────────
type View = "home" | "searching" | "results" | "constellation";

const SUGGESTED_QUERIES = [
  "Experto en pasarelas de pago y PSD2",
  "ML engineer para detección de fraude",
  "Arquitecto cloud con Kubernetes y AWS",
  "iOS senior para GloMo",
  "Open Banking y fintechs",
];

// Source logo colors in rgb format to avoid SSR hex→rgb normalization
const SOURCE_LOGOS = [
  { label: "Jira",         color: "rgba(0,82,204,1)"   },
  { label: "GitHub",       color: "rgba(110,64,201,1)" },
  { label: "Bitbucket",    color: "rgba(7,71,166,1)"   },
  { label: "Google Meet",  color: "rgba(0,131,45,1)"   },
  { label: "Neo4j",        color: "var(--color-lime)"  },
];

export default function HomePage() {
  const [view, setView]                 = useState<View>("home");
  const [query, setQuery]               = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [graphData, setGraphData]       = useState<GraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [constellationEmployee, setConstellationEmployee] = useState<EmpleadoResult | null>(null);

  // Track whether the API response is ready (for SearchingAnimation)
  const [dataReady, setDataReady] = useState(false);

  // ── Search: fire fetch + transition to "searching" simultaneously ──────────
  const handleSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setError(null);
    setDataReady(false);
    setView("searching");

    try {
      const result = await searchTalent(trimmed);
      setSearchResult(result);
      setDataReady(true); // animation will wait for this
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setView("home"); // go back on error
    }
  }, []);

  // Called when SearchingAnimation finishes its sequence AND data is ready
  const handleAnimationComplete = useCallback(() => {
    setView("results");
  }, []);

  // ── Open constellation for a specific employee ───────────────────────────
  const handleViewConstellation = useCallback(async (employeeId: string) => {
    if (!searchResult) return;

    // Find employee in results
    const emp = searchResult.candidatos.find(c => c.id === employeeId);
    setConstellationEmployee(emp ?? null);
    setGraphLoading(true);

    try {
      const graph = await getEmployeeGraph(employeeId);
      setGraphData(graph);
      setView("constellation");
    } catch (e) {
      setError("No se pudo cargar el grafo.");
    } finally {
      setGraphLoading(false);
    }
  }, [searchResult]);

  // ── Explore a collaborator's graph (from inside constellation) ────────────
  const handleExploreEmployee = useCallback(async (employeeId: string) => {
    setGraphLoading(true);
    try {
      const graph = await getEmployeeGraph(employeeId);
      setGraphData(graph);
      // Try to find employee in results, otherwise create a minimal object
      if (searchResult) {
        const emp = searchResult.candidatos.find(c => c.id === employeeId);
        if (emp) setConstellationEmployee(emp);
      }
    } catch (e) {
      setError("No se pudo cargar el grafo del colaborador.");
    } finally {
      setGraphLoading(false);
    }
  }, [searchResult]);

  // ─────────────────────────────────────────────────────────────────────────
  // VIEWS
  // ─────────────────────────────────────────────────────────────────────────

  // ── Searching animation ───────────────────────────────────────────────────
  if (view === "searching") {
    return (
      <SearchingAnimation
        query={query}
        dataReady={dataReady}
        onComplete={handleAnimationComplete}
      />
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (view === "results" && searchResult) {
    return (
      <ResultsView
        result={searchResult}
        onViewConstellation={handleViewConstellation}
        onNewSearch={() => {
          setView("home");
          setSearchResult(null);
        }}
      />
    );
  }

  // ── Constellation 360° ────────────────────────────────────────────────────
  if (view === "constellation" && graphData && constellationEmployee) {
    return (
      <ConstellationView
        graphData={graphData}
        employee={constellationEmployee}
        onBack={() => setView("results")}
        onExploreEmployee={handleExploreEmployee}
      />
    );
  }

  // ── Home ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050a14", color: "var(--color-text-primary)" }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          backgroundImage: "radial-gradient(circle, rgba(0,19,145,0.18) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "-15%",
          width: 500, height: 500, borderRadius: "50%",
          backgroundImage: "radial-gradient(circle, rgba(133,200,255,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-5%", left: "35%",
          width: 400, height: 400, borderRadius: "50%",
          backgroundImage: "radial-gradient(circle, rgba(150,148,255,0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        <div className="absolute inset-0 bg-dot-grid opacity-50" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "rgba(133,200,255,0.07)",
          backgroundColor: "rgba(5,10,20,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm relative overflow-hidden"
            style={{
              backgroundImage: "linear-gradient(135deg, #001391, #0020cc)",
              boxShadow: "0 0 20px rgba(0,19,145,0.5)",
              color: "rgba(255,255,255,1)",
            }}
          >
            BB
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wide" style={{ color: "var(--color-text-primary)" }}>
              BBVA<span style={{ color: "var(--color-serene)" }}> Talent</span>
            </h1>
            <p className="font-mono text-[10px]" style={{ color: "var(--color-text-dim)" }}>
              Knowledge Graph · GenAI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px]"
            style={{
              backgroundColor: "rgba(136,231,131,0.07)",
              color: "var(--color-lime)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(136,231,131,0.19)",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: "var(--color-lime)",
              display: "inline-block",
              animation: "blink 2s ease-in-out infinite",
            }} />
            MOCK MODE
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          className="relative z-10 max-w-xl mx-auto mt-6 px-4 py-3 rounded-xl font-mono text-xs animate-fade-in"
          style={{
            backgroundColor: "rgba(255,50,50,0.08)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(255,80,80,0.2)",
            color: "rgba(255,107,107,1)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 text-center">
        <div
          className="w-full max-w-2xl"
          style={{ animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] mb-8"
            style={{
              backgroundColor: "rgba(133,200,255,0.06)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(133,200,255,0.14)",
              color: "var(--color-serene)",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="3" stroke="var(--color-serene)" strokeWidth="1.2"/>
              <circle cx="4" cy="4" r="1.2" fill="var(--color-serene)"/>
            </svg>
            Motor Semántico de Talento — Powered by GenAI
          </div>

          {/* Title */}
          <h2
            className="font-black mb-5 leading-none tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
          >
            <span className="text-gradient">Descubrí</span>
            <br />
            <span style={{ color: "var(--color-text-primary)" }}>el Talento Oculto</span>
          </h2>

          <p
            className="text-sm max-w-md mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(77,96,128,1)" }}
          >
            Describí el perfil que necesitás en lenguaje natural.
            La IA buscará en Jira, GitHub, Bitbucket y el grafo de conocimiento.
          </p>

          {/* Search */}
          <div
            className="flex gap-2 p-1.5 rounded-2xl mb-4 transition-all duration-300"
            style={{
              backgroundColor: "rgba(10,22,40,0.85)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(133,200,255,0.14)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 0 50px rgba(0,19,145,0.12)",
            }}
            onFocusCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.35)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(0,19,145,0.25)";
            }}
            onBlurCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.14)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(0,19,145,0.12)";
            }}
          >
            <div className="flex-1 flex items-center gap-2.5 px-4">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="4.5" stroke="var(--color-text-dim)" strokeWidth="1.3"/>
                <path d="M9.5 9.5L12.5 12.5" stroke="var(--color-text-dim)" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch(query)}
                placeholder="Necesito un experto en pasarelas de pago y PSD2..."
                className="flex-1 py-3 text-sm bg-transparent outline-none font-mono placeholder:opacity-25"
                style={{ color: "var(--color-text-primary)" }}
                autoFocus
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim()}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-30 hover:scale-[1.02]"
              style={{
                backgroundImage: "linear-gradient(135deg, #001391, #0020cc)",
                color: "rgba(255,255,255,1)",
                letterSpacing: "0.09em",
                boxShadow: "0 0 24px rgba(0,19,145,0.45)",
              }}
            >
              Buscar →
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); handleSearch(q); }}
                className="px-3 py-1.5 rounded-full font-mono text-[10px] transition-all duration-150"
                style={{
                  backgroundColor: "rgba(133,200,255,0.04)",
                  color: "var(--color-text-dim)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(133,200,255,0.08)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(133,200,255,0.09)";
                  (e.currentTarget as HTMLElement).style.color = BBVA.sereneBlue;
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.25)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(133,200,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-dim)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(133,200,255,0.08)";
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Source logos */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "rgba(30,45,68,1)" }}>
              Integra con
            </span>
            {SOURCE_LOGOS.map(src => (
              <span
                key={src.label}
                className="font-mono text-[9px] font-bold"
                style={{ color: src.color, opacity: 0.5 }}
              >
                {src.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
