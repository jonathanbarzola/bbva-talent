"use client";

import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import {
  WORKFORCE_DATA,
  TECH_CATEGORIES,
  WORKFORCE_TOTAL,
  SENIORITY_TOTALS,
  AVAILABILITY_TOTALS,
  effectiveAvailable,
  demandSatisfaction,
  type TechWorkforce,
  type TechCategory,
} from "@/lib/workforce-stats";

// ── Tech Distribution Bar Chart ──────────────────────────────────────────

export function TechDistributionBarChart() {
  const enriched = WORKFORCE_DATA
    .map(w => {
      const cat = TECH_CATEGORIES.find(c => c.id === w.techId)!;
      return { w, cat };
    })
    .sort((a, b) => b.w.total - a.w.total);

  const max = enriched[0].w.total;

  return (
    <section
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <header className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--theme-text-muted)" }}>
            Distribución por tecnología
          </p>
          <h3 className="font-black text-base" style={{ color: "var(--theme-text-primary)" }}>
            {WORKFORCE_TOTAL.toLocaleString("es")} colaboradores en {WORKFORCE_DATA.length} áreas
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LegendDot label="Legacy" color="#fb923c" />
          <LegendDot label="Propietario BBVA" color={BBVA.purple} />
          <LegendDot label="Moderno" color={BBVA.sereneBlue} />
          <LegendDot label="Emergente" color={BBVA.lime} />
        </div>
      </header>

      <div className="space-y-2.5">
        {enriched.map(({ w, cat }, i) => {
          const widthPct = (w.total / max) * 100;
          return (
            <div key={w.techId} className="flex items-center gap-3">
              <div className="w-32 flex-shrink-0">
                <p className="font-bold text-xs leading-tight truncate" style={{ color: "var(--theme-text-primary)" }}>
                  {cat.name}
                </p>
                <p className="font-mono text-[9px] truncate" style={{ color: "var(--theme-text-muted)" }}>
                  {cat.type === "legacy" ? "Legacy" : cat.type === "proprietary" ? "BBVA" : cat.type === "emerging" ? "Emergente" : "Moderno"}
                  {cat.isCritical && " · crítico"}
                </p>
              </div>

              <div className="flex-1 h-7 rounded-md overflow-hidden relative" style={{ background: "var(--theme-tile-soft)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-md flex items-center justify-end px-2"
                  style={{
                    background: `linear-gradient(90deg, ${cat.color}55, ${cat.color}aa)`,
                    boxShadow: `inset 0 0 12px ${cat.color}22`,
                  }}
                >
                  <span className="font-mono text-[10px] font-bold" style={{ color: "#0a1628" }}>
                    {w.total.toLocaleString("es")}
                  </span>
                </motion.div>
              </div>

              <div className="w-12 flex-shrink-0 text-right">
                <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>
                  {((w.total / WORKFORCE_TOTAL) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[9px]" style={{ color: "var(--theme-text-muted)" }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// ── Seniority Pyramid ───────────────────────────────────────────────────

export function SeniorityPyramid() {
  const total = SENIORITY_TOTALS.junior + SENIORITY_TOTALS.mid + SENIORITY_TOTALS.senior + SENIORITY_TOTALS.staff;
  const levels = [
    { label: "Staff",  count: SENIORITY_TOTALS.staff,  color: BBVA.mandarin },
    { label: "Senior", count: SENIORITY_TOTALS.senior, color: BBVA.lime },
    { label: "Mid",    count: SENIORITY_TOTALS.mid,    color: BBVA.canary },
    { label: "Junior", count: SENIORITY_TOTALS.junior, color: BBVA.ice },
  ];
  const max = Math.max(...levels.map(l => l.count));

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: "var(--theme-text-muted)" }}>
        Pirámide de seniority
      </p>

      <div className="space-y-2">
        {levels.map((lv, i) => {
          const widthPct = (lv.count / max) * 100;
          const sharePct = ((lv.count / total) * 100).toFixed(1);
          return (
            <div key={lv.label} className="flex items-center gap-3">
              <div className="w-14 flex-shrink-0 text-right">
                <span className="font-mono text-[11px] font-bold" style={{ color: lv.color }}>
                  {lv.label}
                </span>
              </div>
              <div className="flex-1 h-6 rounded-md overflow-hidden relative" style={{ background: "var(--theme-tile-soft)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-md flex items-center px-2"
                  style={{
                    background: `linear-gradient(90deg, ${lv.color}66, ${lv.color}aa)`,
                  }}
                >
                  <span className="font-mono text-[10px] font-bold" style={{ color: "#0a1628" }}>
                    {lv.count.toLocaleString("es")}
                  </span>
                </motion.div>
              </div>
              <div className="w-10 flex-shrink-0 text-right">
                <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-dim)" }}>{sharePct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[10px] mt-4 leading-relaxed" style={{ color: "var(--theme-text-dim)" }}>
        ⓘ Una pirámide saludable tiene base ancha (40-50% Junior+Mid) para alimentar promociones futuras.
      </p>
    </section>
  );
}

// ── Availability Donut ──────────────────────────────────────────────────

export function AvailabilityDonut() {
  const total = AVAILABILITY_TOTALS.available + AVAILABILITY_TOTALS.partial + AVAILABILITY_TOTALS.assigned + AVAILABILITY_TOTALS.onLeave;
  const segments = [
    { label: "Disponible 100%", count: AVAILABILITY_TOTALS.available, color: BBVA.lime },
    { label: "Disponible 50%",  count: AVAILABILITY_TOTALS.partial,   color: BBVA.canary },
    { label: "Asignado",        count: AVAILABILITY_TOTALS.assigned,  color: "#f87171" },
    { label: "En licencia",     count: AVAILABILITY_TOTALS.onLeave,   color: BBVA.ice },
  ];

  // Donut SVG
  const size = 180;
  const stroke = 28;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  let cumPct = 0;
  const arcs = segments.map(s => {
    const pct = total === 0 ? 0 : s.count / total;
    const dasharray = `${pct * circ} ${circ}`;
    const offset = -cumPct * circ;
    cumPct += pct;
    return { ...s, dasharray, offset, pct };
  });

  // Free capacity = available + partial * 0.5
  const freeCapacity = AVAILABILITY_TOTALS.available + Math.floor(AVAILABILITY_TOTALS.partial * 0.5);

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-4" style={{ color: "var(--theme-text-muted)" }}>
        Disponibilidad agregada
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--theme-tile-medium)"
              strokeWidth={stroke}
            />
            {arcs.map((a, i) => (
              <motion.circle
                key={a.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={stroke}
                strokeDasharray={a.dasharray}
                strokeDashoffset={a.offset}
                strokeLinecap="butt"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-black font-mono text-2xl leading-none" style={{ color: BBVA.lime }}>
              {freeCapacity.toLocaleString("es")}
            </span>
            <span className="font-mono text-[9px] mt-0.5" style={{ color: "var(--theme-text-muted)" }}>capacidad efectiva</span>
            <span className="font-mono text-[9px]" style={{ color: "var(--theme-text-dim)" }}>de {total.toLocaleString("es")}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {arcs.map(a => (
            <div key={a.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: a.color }} />
              <span className="font-mono text-[11px] flex-1 truncate" style={{ color: "var(--theme-text-secondary)" }}>
                {a.label}
              </span>
              <span className="font-mono text-[11px] font-bold" style={{ color: a.color }}>
                {a.count.toLocaleString("es")}
              </span>
              <span className="font-mono text-[10px] w-10 text-right" style={{ color: "var(--theme-text-dim)" }}>
                {((a.pct) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Demand vs Supply Chart ──────────────────────────────────────────────

export function DemandSupplyChart() {
  const items = WORKFORCE_DATA
    .filter(w => w.demandedHeadcount > 0)
    .map(w => {
      const cat = TECH_CATEGORIES.find(c => c.id === w.techId)!;
      const supply = effectiveAvailable(w);
      const ratio = demandSatisfaction(w);
      return { w, cat, supply, ratio };
    })
    .sort((a, b) => a.ratio - b.ratio); // peor cobertura primero

  const max = Math.max(...items.map(i => Math.max(i.supply, i.w.demandedHeadcount)));

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: "var(--theme-bg-surface-soft)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--theme-text-muted)" }}>
          Demanda vs supply efectivo
        </p>
        <p className="font-mono text-[11px]" style={{ color: "var(--theme-text-secondary)" }}>
          Headcount disponible (
          <span style={{ color: BBVA.lime }}>verde</span>) vs demandado en proyectos abiertos (
          <span style={{ color: BBVA.canary }}>amarillo</span>). Ordenado por peor cobertura.
        </p>
      </header>

      <div className="space-y-3">
        {items.map(({ w, cat, supply, ratio }, i) => {
          const supplyPct = (supply / max) * 100;
          const demandPct = (w.demandedHeadcount / max) * 100;
          const coverColor = ratio >= 0.85 ? BBVA.lime : ratio >= 0.6 ? BBVA.canary : "#f87171";

          return (
            <div key={w.techId}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs" style={{ color: "var(--theme-text-primary)" }}>{cat.name}</span>
                <span className="font-mono text-[10px] font-bold" style={{ color: coverColor }}>
                  {Math.round(ratio * 100)}% cobertura
                </span>
              </div>
              <div className="space-y-1">
                {/* Supply bar */}
                <div className="flex items-center gap-2">
                  <span className="w-12 font-mono text-[9px] flex-shrink-0" style={{ color: BBVA.lime }}>
                    supply
                  </span>
                  <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: "var(--theme-tile-soft)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${supplyPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${BBVA.lime}66, ${BBVA.lime}cc)` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[10px] font-bold" style={{ color: BBVA.lime }}>
                    {supply}
                  </span>
                </div>
                {/* Demand bar */}
                <div className="flex items-center gap-2">
                  <span className="w-12 font-mono text-[9px] flex-shrink-0" style={{ color: BBVA.canary }}>
                    demanda
                  </span>
                  <div className="flex-1 h-3 rounded-sm overflow-hidden" style={{ background: "var(--theme-tile-soft)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${demandPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${BBVA.canary}66, ${BBVA.canary}cc)` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[10px] font-bold" style={{ color: BBVA.canary }}>
                    {w.demandedHeadcount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Tech card with key metrics (used in grid) ──────────────────────────

export function TechCard({ workforce, category }: { workforce: TechWorkforce; category: TechCategory }) {
  const eff = effectiveAvailable(workforce);
  const ratio = demandSatisfaction(workforce);
  const ratioColor = ratio >= 0.85 ? BBVA.lime : ratio >= 0.6 ? BBVA.canary : "#f87171";

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--theme-bg-surface-soft)", border: `1px solid ${category.color}30` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--theme-text-primary)" }}>
            {category.name}
          </p>
          <p className="font-mono text-[10px] truncate" style={{ color: "var(--theme-text-muted)" }}>
            {category.type === "legacy" ? "Legacy" : category.type === "proprietary" ? "Propietario BBVA" : category.type === "emerging" ? "Emergente" : "Moderno"}
            {category.isCritical && " · crítico"}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-black font-mono leading-none" style={{ color: category.color, fontSize: 22 }}>
            {workforce.total}
          </p>
          <p className="font-mono text-[9px]" style={{ color: "var(--theme-text-dim)" }}>colaboradores</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <Stat label="tenure" value={`${workforce.avgTenureYears}a`} color={workforce.avgTenureYears >= 15 ? "#fb923c" : "var(--theme-text-secondary)"} />
        <Stat label="mentores" value={workforce.mentors} color={BBVA.purple} />
        <Stat label="bus factor" value={`${workforce.busFactor}/5`} color={workforce.busFactor <= 2 ? "#f87171" : workforce.busFactor === 3 ? BBVA.canary : BBVA.lime} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: "var(--theme-text-muted)" }}>
          cobertura demanda
        </span>
        <span className="font-mono text-[10px] font-bold" style={{ color: ratioColor }}>
          {eff}/{workforce.demandedHeadcount} · {Math.round(ratio * 100)}%
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className="rounded px-1.5 py-1 text-center"
      style={{ background: "var(--theme-tile-soft)", border: "1px solid rgba(133,200,255,0.06)" }}
    >
      <p className="font-mono font-bold text-[11px] leading-none" style={{ color }}>{value}</p>
      <p className="font-mono text-[8px] uppercase tracking-widest mt-0.5" style={{ color: "var(--theme-text-dim)" }}>{label}</p>
    </div>
  );
}
