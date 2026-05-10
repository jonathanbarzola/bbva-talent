"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { analyzeSilos, buildDashboardKPIs } from "@/lib/siloAnalysis";
import {
  WORKFORCE_DATA,
  TECH_CATEGORIES,
  WORKFORCE_BY_TYPE,
  TOTAL_OPEN_PROJECTS,
} from "@/lib/workforce-stats";
import {
  TechDistributionBarChart,
  SeniorityPyramid,
  AvailabilityDonut,
  DemandSupplyChart,
  TechCard,
} from "@/components/WorkforceCharts";
import { SiloRiskCard } from "@/components/SiloRiskCard";
import ThemeToggle from "@/components/ThemeToggle";
import CurrentUserSelector from "@/components/CurrentUserSelector";

export default function DashboardPage() {
  const router = useRouter();

  const risks = useMemo(() => analyzeSilos(), []);
  const kpis = useMemo(() => buildDashboardKPIs(risks), [risks]);

  const criticalRisks = risks.filter(r => r.overallSeverity === "critical");
  const highRisks = risks.filter(r => r.overallSeverity === "high");

  // Top recommendation seleccionada del primer riesgo crítico
  const headlineSuggestion = criticalRisks[0]?.aiSuggestions[0]
    ?? highRisks[0]?.aiSuggestions[0]
    ?? "Sin riesgos críticos detectados — la distribución de talento luce saludable.";

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-page)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.electricBlue}1c 0%, transparent 65%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${BBVA.purple}10 0%, transparent 65%)`, filter: "blur(80px)" }} />
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
            Workforce Intelligence
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
            BBVA Engineering · {kpis.totalWorkforce.toLocaleString("es")} colaboradores
          </span>
          <CurrentUserSelector compact />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Hero with title + headline insight */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "var(--theme-text-primary)" }}>
            <span className="text-gradient">Mapa del talento</span> de Engineering
          </h1>
          <p className="text-sm sm:text-base max-w-3xl leading-relaxed mb-5" style={{ color: "var(--theme-text-secondary)" }}>
            Vista en tiempo real para managers y staffers: distribución por tecnología, riesgos de silos
            de conocimiento, y recomendaciones proactivas de la IA para anticipar gaps antes de que sean
            problema operacional.
          </p>

          {/* AI Headline insight */}
          <div
            className="rounded-2xl p-4 sm:p-5 flex items-start gap-3"
            style={{
              background: `linear-gradient(135deg, ${BBVA.purple}14, ${BBVA.electricBlue}10)`,
              border: `1px solid ${BBVA.purple}38`,
              boxShadow: `0 0 30px ${BBVA.purple}1a`,
            }}
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base font-black"
              style={{ background: `linear-gradient(135deg, ${BBVA.purple}, #4a00b4)`, boxShadow: `0 0 20px ${BBVA.purple}55`, color: "#fff" }}
            >
              ✦
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: BBVA.purple }}>
                Insight prioritario · IA
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-primary)" }}>
                {headlineSuggestion}
              </p>
              {(criticalRisks.length > 0 || highRisks.length > 0) && (
                <p className="font-mono text-[11px] mt-2" style={{ color: "var(--theme-text-secondary)" }}>
                  {criticalRisks.length > 0 && (
                    <span style={{ color: "#fca5a5" }}>{criticalRisks.length} silo{criticalRisks.length !== 1 ? "s" : ""} crítico{criticalRisks.length !== 1 ? "s" : ""}</span>
                  )}
                  {criticalRisks.length > 0 && highRisks.length > 0 && " · "}
                  {highRisks.length > 0 && (
                    <span style={{ color: "#fb923c" }}>{highRisks.length} de riesgo alto</span>
                  )}
                  {" · revisá la sección abajo para ver factores y plan de acción."}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* KPI strip */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <KPI
            label="Headcount Engineering"
            value={kpis.totalWorkforce.toLocaleString("es")}
            sub={`${WORKFORCE_DATA.length} áreas tecnológicas`}
            color={BBVA.sereneBlue}
          />
          <KPI
            label="Silos en riesgo"
            value={kpis.techsAtRisk.toString()}
            sub={`${kpis.criticalTechs} crítico${kpis.criticalTechs !== 1 ? "s" : ""}`}
            color={kpis.criticalTechs > 0 ? "#fb923c" : BBVA.canary}
          />
          <KPI
            label="Cobertura demanda global"
            value={`${Math.round(kpis.globalCoverageRatio * 100)}%`}
            sub={`${kpis.totalEffectiveAvailable.toLocaleString("es")} disp · ${kpis.totalDemandedHeadcount.toLocaleString("es")} demanda`}
            color={kpis.globalCoverageRatio >= 0.85 ? BBVA.lime : kpis.globalCoverageRatio >= 0.6 ? BBVA.canary : "#fb923c"}
          />
          <KPI
            label="Mentores activos"
            value={kpis.totalMentors.toString()}
            sub={`${(kpis.mentorRatio * 100).toFixed(1)}% del headcount`}
            color={BBVA.purple}
          />
        </motion.section>

        {/* Workforce by type strip */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <TypeCard label="Legacy" count={WORKFORCE_BY_TYPE.legacy} total={kpis.totalWorkforce} color="#fb923c" detail="HOST + ASO" />
          <TypeCard label="Propietario BBVA" count={WORKFORCE_BY_TYPE.proprietary} total={kpis.totalWorkforce} color={BBVA.purple} detail="NACAR · APX · Cells" />
          <TypeCard label="Stack moderno" count={WORKFORCE_BY_TYPE.modern} total={kpis.totalWorkforce} color={BBVA.sereneBlue} detail="Mobile · Web · Cloud · Data" />
          <TypeCard label="Emergente" count={WORKFORCE_BY_TYPE.emerging} total={kpis.totalWorkforce} color={BBVA.lime} detail="AI Engineering" />
        </motion.section>

        {/* Tech distribution */}
        <TechDistributionBarChart />

        {/* Silos at risk */}
        <section>
          <header className="mb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: BBVA.purple }}>
              Silos de conocimiento detectados
            </p>
            <p className="font-bold text-base sm:text-lg" style={{ color: "var(--theme-text-primary)" }}>
              {risks.length} tecnologías con factores de riesgo activos
            </p>
            <p className="font-mono text-[11px] mt-1" style={{ color: "var(--theme-text-muted)" }}>
              Click en cada card para ver factores detectados, recomendaciones de la IA y distribución de seniority.
            </p>
          </header>

          <div className="space-y-3">
            {risks.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: `${BBVA.lime}08`, border: `1px solid ${BBVA.lime}28` }}
              >
                <p className="font-bold text-base" style={{ color: BBVA.lime }}>✓ Sin silos detectados</p>
                <p className="font-mono text-xs mt-1" style={{ color: "var(--theme-text-muted)" }}>
                  Todas las áreas tecnológicas presentan distribución saludable.
                </p>
              </div>
            ) : (
              risks.map((r, i) => <SiloRiskCard key={r.techId} risk={r} index={i} />)
            )}
          </div>
        </section>

        {/* Demand vs supply + Donut */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DemandSupplyChart />
          <div className="space-y-4">
            <AvailabilityDonut />
            <SeniorityPyramid />
          </div>
        </section>

        {/* Tech cards grid (without silos) */}
        <section>
          <header className="mb-3">
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--theme-text-muted)" }}>
              Snapshot por tecnología
            </p>
            <p className="font-bold text-base" style={{ color: "var(--theme-text-primary)" }}>
              Métricas clave de las {WORKFORCE_DATA.length} áreas
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {WORKFORCE_DATA.map(w => {
              const cat = TECH_CATEGORIES.find(c => c.id === w.techId)!;
              return <TechCard key={w.techId} workforce={w} category={cat} />;
            })}
          </div>
        </section>

        {/* Footer with disclaimer */}
        <footer
          className="rounded-xl px-4 py-3 flex items-start gap-2.5"
          style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
        >
          <span style={{ color: BBVA.sereneBlue, fontSize: 12 }}>ⓘ</span>
          <p className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
            Datos sintéticos basados en distribución típica observada en bancos LATAM con stack mixto legacy + moderno.
            En producción se conecta a HR Hub para refresh diario y a SDA Catalog para demanda en tiempo real.
            <span className="ml-1.5" style={{ color: "var(--theme-text-dim)" }}>· {TOTAL_OPEN_PROJECTS} proyectos SDA abiertos en este momento.</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Inline UI helpers ────────────────────────────────────────────────────

function KPI({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{ background: "var(--theme-bg-surface-soft)", border: `1px solid ${color}28`, backdropFilter: "blur(12px)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--theme-text-dim)" }}>
        {label}
      </p>
      <p className="font-black font-mono leading-none mb-1" style={{ color, fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
        {value}
      </p>
      <p className="font-mono text-[10px]" style={{ color: color, opacity: 0.65 }}>
        {sub}
      </p>
    </div>
  );
}

function TypeCard({ label, count, total, color, detail }: { label: string; count: number; total: number; color: string; detail: string }) {
  const pct = ((count / total) * 100).toFixed(1);
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ background: `${color}0a`, border: `1px solid ${color}28` }}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}40` }}
      >
        <span className="font-black font-mono text-xs" style={{ color }}>{pct}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color, opacity: 0.85 }}>{label}</p>
        <p className="font-black font-mono text-base leading-none mt-0.5" style={{ color }}>
          {count.toLocaleString("es")}
          <span className="font-mono text-[10px] font-normal ml-1.5" style={{ color: color, opacity: 0.6 }}>
            colaboradores
          </span>
        </p>
        <p className="font-mono text-[9px] mt-0.5 truncate" style={{ color: color, opacity: 0.5 }}>
          {detail}
        </p>
      </div>
    </div>
  );
}
