"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { useCurrentUser } from "@/lib/current-user";
import { CANDIDATE_POOL } from "@/lib/mock-data";
import { analyzeCareerProgress, type CareerFactor } from "@/lib/careerProgress";
import CurrentUserSelector from "@/components/CurrentUserSelector";
import ThemeToggle from "@/components/ThemeToggle";
import CareerProgressHero from "@/components/CareerProgressHero";
import SkillGapTable from "@/components/SkillGapTable";
import EDIInsights from "@/components/EDIInsights";
import LearningPlanCards from "@/components/LearningPlanCards";

export default function MePage() {
  const router = useRouter();
  const { user, mounted } = useCurrentUser();

  const pool = useMemo(() => Object.values(CANDIDATE_POOL), []);

  const progress = useMemo(() => {
    if (!user) return null;
    return analyzeCareerProgress(user, pool);
  }, [user, pool]);

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-page)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.purple}1c 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.electricBlue}10 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
      </div>

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderBottom: "1px solid rgba(133,200,255,0.08)", background: "var(--theme-bg-overlay-strong)", backdropFilter: "blur(20px)" }}
      >
        <button
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: "var(--theme-tile-medium)", border: "1px solid rgba(133,200,255,0.14)", color: BBVA.sereneBlue, cursor: "pointer" }}
        >
          ← Volver
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
            style={{ background: `${BBVA.purple}1c`, color: BBVA.purple, border: `1px solid ${BBVA.purple}40` }}
          >
            Mi carrera
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
            BBVA Talent · plan personal
          </span>
          <CurrentUserSelector />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {!mounted || !user || !progress ? (
          <LoadingState />
        ) : (
          <>
            <CareerProgressHero progress={progress} />

            <FactorsGrid factors={progress.factors} />

            <SkillGapTable progress={progress} />

            {progress.softSkills.length > 0 && <EDIInsights progress={progress} />}

            <LearningPlanCards progress={progress} />

            <Footer />
          </>
        )}
      </main>
    </div>
  );
}

// ── Factor cards (6 sub-factors of the score) ──────────────────────────

function FactorsGrid({ factors }: { factors: CareerFactor[] }) {
  return (
    <section>
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.purple }}>
          Desglose · 6 factores auditables
        </p>
        <p className="font-bold text-base" style={{ color: "var(--theme-text-primary)" }}>
          Cómo se compone tu avance
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {factors.map((f, i) => (
          <FactorCard key={f.label} factor={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FactorCard({ factor, index }: { factor: CareerFactor; index: number }) {
  const statusColor = factor.status === "ahead" ? BBVA.lime : factor.status === "on-track" ? BBVA.canary : "#fb923c";
  const fillRatio = factor.maxContribution > 0 ? factor.contribution / factor.maxContribution : 0;

  const statusLabel = factor.status === "ahead" ? "Adelante" : factor.status === "on-track" ? "En camino" : "Atrasado";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-2xl p-4"
      style={{
        background: "var(--theme-bg-surface-soft)",
        border: `1px solid ${statusColor}28`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-bold text-[12px] leading-tight" style={{ color: "var(--theme-text-primary)" }}>
          {factor.label}
        </p>
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${statusColor}1c`, color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <p className="font-black font-mono text-2xl leading-none" style={{ color: statusColor }}>
          {factor.current}
        </p>
        <p className="font-mono text-[10px] mb-1" style={{ color: "var(--theme-text-dim)" }}>
          / {factor.target} {factor.unit}
        </p>
      </div>

      {/* Mini progress bar */}
      <div className="relative h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--theme-tile-medium)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillRatio * 100}%` }}
          transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${statusColor}66, ${statusColor})` }}
        />
      </div>

      <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
        {factor.detail}
      </p>

      <p className="font-mono text-[9px] mt-2" style={{ color: "var(--theme-text-dim)" }}>
        Aporta <strong style={{ color: statusColor }}>{factor.contribution}</strong> de {factor.maxContribution} pts al avance global.
      </p>
    </motion.div>
  );
}

// ── Loading + Footer ──────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl h-44 animate-pulse" style={{ background: "var(--theme-tile-soft)" }} />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: "var(--theme-tile-soft)" }} />
        ))}
      </div>
      <div className="rounded-2xl h-64 animate-pulse" style={{ background: "var(--theme-tile-soft)" }} />
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="rounded-xl px-4 py-3 flex items-start gap-2.5"
      style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <span style={{ color: BBVA.sereneBlue, fontSize: 12 }}>ⓘ</span>
      <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
        Las recomendaciones son sintéticas · datos de cohorte calculados sobre los 18 perfiles del demo. En producción
        este análisis se ejecutaría sobre el HR Hub completo, comparando contra el cohorte de tu vertical específico
        (no la totalidad del banco). El cálculo respeta GDPR Art. 22 — cada factor es auditable en
        <code className="font-mono mx-1">lib/careerProgress.ts</code>.
      </p>
    </footer>
  );
}
