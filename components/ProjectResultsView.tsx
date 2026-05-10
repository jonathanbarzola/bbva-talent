"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import TrustScoreBadge from "./TrustScoreBadge";
import BTokenBadge from "./BTokenBadge";
import CandidateComparison from "./CandidateComparison";
import GapAnalysisPanel from "./GapAnalysisPanel";
import RefinementChat from "./RefinementChat";
import WhyCandidateModal from "./WhyCandidateModal";
import TeamBalancePanel from "./TeamBalancePanel";
import TeamConstellation from "./TeamConstellation";
import ExportTeamMenu from "./ExportTeamMenu";
import { analyzeGaps } from "@/lib/gapAnalysis";
import { applyToTeam, EMPTY_FILTERS, isEmpty as isEmptyFilters, type RefinementFilters } from "@/lib/mockChatRefinement";
import type { TeamCompositionResponse, SDAProject, EmpleadoResult } from "@/lib/types";

interface Props {
  project: SDAProject;
  result: TeamCompositionResponse;
  onViewGraph: (employeeId: string) => void;
  onBack: () => void;
}

const SKILL_COLORS = [BBVA.lime, BBVA.ice, BBVA.sereneBlue, BBVA.purple, BBVA.canary];

const DOMAIN_COLORS: Record<string, string> = {
  "Payments":        BBVA.sereneBlue,
  "Risk & Fraud":    "#f87171",
  "Data & Analytics":BBVA.canary,
  "Platform":        BBVA.lime,
  "Lending":         BBVA.mandarin,
};

function CandidateRow({
  candidate,
  rank,
  onViewGraph,
  isSelected,
  onToggleSelect,
  onExplain,
}: {
  candidate: EmpleadoResult;
  rank: number;
  onViewGraph: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onExplain: (id: string) => void;
}) {
  const initials = candidate.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
  const pct      = Math.round(candidate.score * 100);
  const ringColor = pct >= 90 ? BBVA.lime : pct >= 75 ? BBVA.sereneBlue : BBVA.canary;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200"
      style={{
        background: isSelected ? `${BBVA.lime}10` : "var(--theme-tile-soft)",
        border: `1px solid ${isSelected ? BBVA.lime + "55" : "var(--theme-tile-medium)"}`,
      }}
      onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-medium)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-border-strong)"; } }}
      onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-soft)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--theme-tile-medium)"; } }}
    >
      {/* Select checkbox */}
      <button
        onClick={() => onToggleSelect(candidate.id)}
        title={isSelected ? "Quitar de comparación" : "Agregar a comparación"}
        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
        style={{
          background: isSelected ? `${BBVA.lime}25` : "var(--theme-tile-soft)",
          border: `1.5px solid ${isSelected ? BBVA.lime + "aa" : "var(--theme-border-strong)"}`,
          cursor: "pointer",
        }}
      >
        {isSelected && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M2 4.5L3.8 6.5L7 2.5" stroke={BBVA.lime} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Rank */}
      <span className="font-mono text-[10px] w-6 text-center flex-shrink-0" style={{ color: "var(--theme-text-dim)" }}>
        #{rank}
      </span>

      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #001391, #0020cc)", color: "#fff" }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--theme-text-primary)" }}>{candidate.nombre}</p>
          {candidate.registro && (
            <span
              className="hidden sm:inline-flex font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: candidate.tipo_contrato === "externo" ? `${BBVA.mandarin}15` : `${BBVA.sereneBlue}15`,
                color: candidate.tipo_contrato === "externo" ? BBVA.mandarin : BBVA.sereneBlue,
                border: `1px solid ${candidate.tipo_contrato === "externo" ? BBVA.mandarin : BBVA.sereneBlue}40`,
              }}
              title={candidate.tipo_contrato === "externo" ? `Externo · ${candidate.consultora ?? ""}` : "Interno BBVA"}
            >
              {candidate.registro}
            </span>
          )}
        </div>
        <p className="text-[11px] truncate" style={{ color: "var(--theme-text-muted)" }}>
          {candidate.rol_bbva && (
            <span className="font-mono font-bold mr-1" style={{ color: BBVA.sereneBlue }}>{candidate.rol_bbva}</span>
          )}
          {candidate.rol} · {candidate.squad}
        </p>
      </div>

      {/* Trust compact — hidden on small screens to avoid overflow */}
      {candidate.trust_score && (
        <div className="hidden sm:inline-flex">
          <TrustScoreBadge trust={candidate.trust_score} compact />
        </div>
      )}
      {candidate.b_tokens && (
        <div className="hidden md:inline-flex">
          <BTokenBadge wallet={candidate.b_tokens} compact />
        </div>
      )}

      {/* Match */}
      <span className="font-black font-mono text-sm flex-shrink-0" style={{ color: ringColor }}>
        {pct}%
      </span>

      {/* Why button */}
      <button
        onClick={() => onExplain(candidate.id)}
        title="¿Por qué este candidato?"
        aria-label={`Ver explicación del match de ${candidate.nombre}`}
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition-all"
        style={{
          background: `${BBVA.purple}10`,
          border: `1px solid ${BBVA.purple}30`,
          color: BBVA.purple,
          cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}24`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${BBVA.purple}10`; }}
      >
        ?
      </button>

      {/* CTA */}
      <button
        onClick={() => onViewGraph(candidate.id)}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150"
        style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--theme-border-strong)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--theme-tile-medium)"; }}
      >
        360°
      </button>
    </div>
  );
}

function CoverageRing({ score }: { score: number }) {
  const pct    = Math.round(score);
  const size   = 80;
  const stroke = 5;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color  = pct >= 85 ? BBVA.lime : pct >= 65 ? BBVA.canary : "#f87171";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--theme-tile-medium)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black font-mono" style={{ fontSize: 18, lineHeight: 1, color }}>{pct}%</span>
        <span className="font-mono" style={{ fontSize: 8, color: "var(--theme-text-dim)" }}>coverage</span>
      </div>
    </div>
  );
}

export default function ProjectResultsView({ project, result, onViewGraph, onBack }: Props) {
  const domainColor = DOMAIN_COLORS[project.dominio] ?? BBVA.sereneBlue;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [filters, setFilters] = useState<RefinementFilters>(EMPTY_FILTERS);
  const [chatOpen, setChatOpen] = useState(false);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [teamConstellationOpen, setTeamConstellationOpen] = useState(false);

  // Apply refinement filters to the team in real-time
  const refinedResult = useMemo(() => applyToTeam(result, filters), [result, filters]);
  const hasFilters = !isEmptyFilters(filters);

  const allCandidates = useMemo(
    () => refinedResult.roles.flatMap(r => r.candidates),
    [refinedResult.roles]
  );

  const assignedTeam = useMemo(
    () => refinedResult.roles.flatMap(r => r.candidates.slice(0, r.quantity)),
    [refinedResult.roles]
  );

  const gaps = useMemo(() => analyzeGaps(refinedResult, project), [refinedResult, project]);

  const selectedCandidates = useMemo(
    () => allCandidates.filter(c => selectedIds.includes(c.id)),
    [allCandidates, selectedIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--theme-bg-page)", paddingBottom: selectedIds.length > 0 ? 88 : 0 }}>

      {/* Header */}
      <header
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-20"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "var(--theme-bg-overlay-strong)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
            style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.12)", color: BBVA.sereneBlue }}
          >
            ← Proyectos
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded font-bold"
                style={{ background: `${domainColor}18`, color: domainColor, border: `1px solid ${domainColor}30` }}
              >
                {project.dominio}
              </span>
              <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>{project.codigo}</span>
            </div>
            <h1 className="font-bold text-base mt-0.5" style={{ color: "var(--theme-text-primary)" }}>{project.nombre}</h1>
          </div>
        </div>

        {/* Coverage + skills summary */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <button
            onClick={() => setChatOpen(true)}
            title="Refinar el equipo con asistente conversacional"
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[11px] font-bold transition-all duration-200"
            style={{
              background: hasFilters
                ? `linear-gradient(135deg, ${BBVA.purple}28, ${BBVA.purple}10)`
                : `${BBVA.purple}10`,
              border: `1px solid ${hasFilters ? BBVA.purple + "55" : BBVA.purple + "30"}`,
              color: BBVA.purple,
              boxShadow: hasFilters ? `0 0 18px ${BBVA.purple}40` : "none",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${BBVA.purple}40, ${BBVA.purple}18)`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${BBVA.purple}55`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = hasFilters
                ? `linear-gradient(135deg, ${BBVA.purple}28, ${BBVA.purple}10)`
                : `${BBVA.purple}10`;
              (e.currentTarget as HTMLElement).style.boxShadow = hasFilters ? `0 0 18px ${BBVA.purple}40` : "none";
            }}
          >
            <span style={{ fontSize: 12 }}>✦</span>
            <span className="hidden sm:inline">Refinar con IA</span>
            <span className="sm:hidden">IA</span>
            {hasFilters && (
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${BBVA.purple}50`, color: "#fff" }}
              >
                ON
              </span>
            )}
          </button>
          <CoverageRing score={refinedResult.coverage_score} />
          <div className="text-right hidden sm:block">
            <p className="font-black font-mono text-2xl leading-none" style={{ color: BBVA.lime }}>
              {refinedResult.total_skills}
            </p>
            <p className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>skills totales</p>
          </div>
          <ExportTeamMenu project={project} team={refinedResult} />
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 space-y-6">

        {/* Gap Analysis (auto-generated from frontend heuristics) */}
        <GapAnalysisPanel gaps={gaps} />

        {/* Team Balance — aggregate stats of assigned team (Trust/EDI/B-Tokens/seniority) */}
        <TeamBalancePanel team={assignedTeam} />

        {/* Selection hint */}
        {selectedIds.length === 0 && allCandidates.length > 1 && (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center gap-3"
            style={{ background: "var(--theme-tile-soft)", border: "1px dashed rgba(133,200,255,0.18)" }}
          >
            <span style={{ color: BBVA.sereneBlue, fontSize: 13 }}>ⓘ</span>
            <p className="font-mono text-[11px]" style={{ color: "var(--theme-text-muted)" }}>
              Marca 2 o más candidatos con el checkbox para compararlos lado a lado.
            </p>
          </div>
        )}

        {/* Role sections */}
        {refinedResult.roles.map(roleMatch => {
          const skillsTotal = roleMatch.candidates
            .flatMap(c => c.habilidades.map(h => h.nombre));
          const uniqueSkills = [...new Set(skillsTotal)];

          return (
            <section key={roleMatch.role}>
              {/* Role header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: BBVA.sereneBlue }} />
                  <h2 className="font-bold text-sm" style={{ color: "var(--theme-text-primary)" }}>{roleMatch.role}</h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--theme-tile-medium)", color: "var(--theme-text-dim)" }}>
                    {roleMatch.candidates.length}/{roleMatch.quantity} cubiertos
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[280px]">
                  {uniqueSkills.slice(0, 5).map((s, i) => {
                    const c = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${c}10`, color: c }}>
                        {s}
                      </span>
                    );
                  })}
                  {uniqueSkills.length > 5 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--theme-tile-soft)", color: "var(--theme-text-dim)" }}>
                      +{uniqueSkills.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {roleMatch.candidates.length === 0 && (
                  <div
                    className="rounded-xl px-4 py-4 flex items-center gap-3"
                    style={{ background: "rgba(248,113,113,0.06)", border: "1px dashed rgba(248,113,113,0.25)" }}
                  >
                    <span style={{ color: "#fca5a5", fontSize: 14 }}>⊘</span>
                    <p className="font-mono text-[11px]" style={{ color: "#fca5a5" }}>
                      Ningún candidato para este rol con los filtros activos.
                      {hasFilters && (
                        <button
                          onClick={() => setFilters(EMPTY_FILTERS)}
                          className="ml-2 underline hover:opacity-80"
                          style={{ color: BBVA.purple, cursor: "pointer" }}
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </p>
                  </div>
                )}
                {roleMatch.candidates.slice(0, roleMatch.quantity).map((candidate, i) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    rank={i + 1}
                    onViewGraph={onViewGraph}
                    isSelected={selectedIds.includes(candidate.id)}
                    onToggleSelect={toggleSelect}
                    onExplain={setExplainingId}
                  />
                ))}
                {/* Reserve slots */}
                {roleMatch.candidates.slice(roleMatch.quantity).length > 0 && (
                  <>
                    <p className="font-mono text-[10px] pt-1 pb-0.5 pl-1" style={{ color: "var(--theme-text-dim)" }}>Reservas</p>
                    {roleMatch.candidates.slice(roleMatch.quantity).map((candidate, i) => (
                      <CandidateRow
                        key={candidate.id}
                        candidate={candidate}
                        rank={roleMatch.quantity + i + 1}
                        onViewGraph={onViewGraph}
                        isSelected={selectedIds.includes(candidate.id)}
                        onToggleSelect={toggleSelect}
                        onExplain={setExplainingId}
                      />
                    ))}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating comparison bar */}
      {selectedIds.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{
            background: "var(--theme-bg-overlay-strong)",
            borderTop: `1px solid ${BBVA.lime}30`,
            backdropFilter: "blur(24px)",
            boxShadow: `0 -16px 48px ${BBVA.lime}14`,
            animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
            <div className="flex-shrink-0">
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--theme-text-dim)" }}>Seleccionados</p>
              <p className="font-black text-lg leading-none" style={{ color: BBVA.lime }}>
                {selectedIds.length}
                <span className="font-mono text-[10px] font-normal ml-1" style={{ color: "var(--theme-text-dim)" }}>
                  candidato{selectedIds.length !== 1 ? "s" : ""}
                </span>
              </p>
            </div>

            <div className="w-px self-stretch" style={{ background: "var(--theme-border-default)" }} />

            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
              {selectedCandidates.map((c, i) => {
                const initials = c.nombre.split(" ").map(n => n[0]).slice(0, 2).join("");
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    title={`Quitar a ${c.nombre}`}
                    className="group relative w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0 transition-all duration-200"
                    style={{ background: `linear-gradient(135deg, hsl(${215 + i * 28},55%,18%), hsl(${235 + i * 28},55%,28%))`, border: "1px solid rgba(133,200,255,0.22)", color: BBVA.sereneBlue, cursor: "pointer" }}
                  >
                    {initials}
                    <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ background: "rgba(220,50,50,0.65)", fontSize: 12, color: "#fff" }}>×</div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 rounded-lg text-xs font-mono transition-opacity hover:opacity-70"
                style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.12)", color: "var(--theme-text-dim)", cursor: "pointer" }}
              >
                Limpiar
              </button>
              <button
                onClick={() => setComparisonOpen(true)}
                disabled={selectedIds.length < 2}
                title={selectedIds.length < 2 ? "Selecciona al menos 2" : "Comparar candidatos"}
                className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  background: "linear-gradient(135deg, #001391, #0020cc)",
                  color: "#fff",
                  letterSpacing: "0.07em",
                  boxShadow: selectedIds.length >= 2 ? "0 0 20px rgba(0,19,145,0.45)" : "none",
                  cursor: selectedIds.length >= 2 ? "pointer" : "not-allowed",
                  opacity: selectedIds.length < 2 ? 0.5 : 1,
                  minWidth: 160,
                }}
              >
                Comparar lado a lado →
              </button>
            </div>
          </div>
        </div>
      )}

      <CandidateComparison
        candidates={selectedCandidates}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        onRemove={toggleSelect}
        onViewGraph={(id) => { setComparisonOpen(false); onViewGraph(id); }}
        onViewTeamConstellation={() => { setComparisonOpen(false); setTeamConstellationOpen(true); }}
      />

      <TeamConstellation
        candidates={selectedCandidates}
        open={teamConstellationOpen}
        onClose={() => setTeamConstellationOpen(false)}
        onViewIndividual={(id) => { setTeamConstellationOpen(false); onViewGraph(id); }}
      />

      <RefinementChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        baseTeam={result}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <WhyCandidateModal
        candidate={allCandidates.find(c => c.id === explainingId) ?? null}
        open={explainingId !== null}
        onClose={() => setExplainingId(null)}
        context={{
          roleName: refinedResult.roles.find(r => r.candidates.some(c => c.id === explainingId))?.role,
          projectDomain: project.dominio,
          projectName: project.nombre,
          teamMemberIds: refinedResult.roles.flatMap(r => r.candidates.slice(0, r.quantity).map(c => c.id)),
        }}
      />

      {/* Floating chat trigger (when chat is closed) */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.3 }}
          onClick={() => setChatOpen(true)}
          aria-label="Abrir asistente de refinamiento"
          className="fixed z-[70] flex items-center gap-2 font-mono text-xs font-bold rounded-full transition-all"
          style={{
            right: 24,
            bottom: selectedIds.length > 0 ? 96 : 24,
            padding: "12px 18px",
            background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`,
            color: "#fff",
            boxShadow: `0 0 30px ${BBVA.purple}55, 0 8px 24px rgba(0,0,0,0.4)`,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14 }}>✦</span>
          <span>Refinar con IA</span>
          {hasFilters && (
            <span
              className="ml-1 font-mono text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}
            >
              ON
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
}
