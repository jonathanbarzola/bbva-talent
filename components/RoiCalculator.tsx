"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";

const HOURS_MANUAL = 14;
const HOURS_WITH_TALENT = 0.36; // ~22 minutes
const MANAGER_HOURLY_COST_USD = 80;

const PRESETS = [
  { label: "Squad chico", value: 50 },
  { label: "Vertical", value: 200 },
  { label: "Toda la unidad", value: 600 },
];

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatHours(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K hs`;
  return `${Math.round(n)} hs`;
}

export default function RoiCalculator() {
  const [teams, setTeams] = useState(200);

  const stats = useMemo(() => {
    const hoursPerYear = teams * (HOURS_MANUAL - HOURS_WITH_TALENT);
    const dollarsPerYear = hoursPerYear * MANAGER_HOURLY_COST_USD;
    const fteEquivalent = hoursPerYear / 1800; // ~1800 productive hours per FTE/year
    return { hoursPerYear, dollarsPerYear, fteEquivalent };
  }, [teams]);

  return (
    <section
      className="relative w-full max-w-5xl mx-auto mt-10 mb-4 animate-fade-up rounded-2xl p-6 sm:p-7 overflow-hidden"
      style={{
        animationDelay: "0.46s",
        background: "rgba(10,22,40,0.7)",
        border: `1px solid ${BBVA.canary}28`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${BBVA.canary}1a 0%, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-6">

        {/* Left — slider */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
              style={{ background: `${BBVA.canary}1a`, color: BBVA.canary, border: `1px solid ${BBVA.canary}40` }}
            >
              Calculadora ROI
            </span>
          </div>

          <h3 className="font-black text-lg sm:text-xl mb-1.5" style={{ color: "#e8eeff" }}>
            ¿Cuánto ahorra tu unidad al año?
          </h3>
          <p className="font-mono text-xs mb-5 leading-relaxed" style={{ color: "#6b7fa3" }}>
            Mueve el slider con cuántos equipos arma tu unidad por año. Calculamos en vivo basándonos
            en {HOURS_MANUAL}h promedio por equipo manualmente vs {HOURS_WITH_TALENT * 60} min con BBVA Talent.
          </p>

          {/* Slider */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#6b7fa3" }}>
                Equipos formados al año
              </span>
              <span className="font-black font-mono text-2xl leading-none" style={{ color: BBVA.canary }}>
                {teams}
              </span>
            </div>

            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={teams}
              onChange={e => setTeams(Number(e.target.value))}
              aria-label="Cantidad de equipos formados al año"
              className="w-full"
              style={{
                accentColor: BBVA.canary,
                cursor: "pointer",
              }}
            />

            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>50</span>
              <span className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>1000</span>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="font-mono text-[10px] mr-1 self-center" style={{ color: "#3d4f6e" }}>presets:</span>
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setTeams(p.value)}
                className="font-mono text-[10px] px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: teams === p.value ? `${BBVA.canary}20` : "rgba(133,200,255,0.04)",
                  border: `1px solid ${teams === p.value ? BBVA.canary + "55" : "rgba(133,200,255,0.12)"}`,
                  color: teams === p.value ? BBVA.canary : "#a8b8d0",
                  cursor: "pointer",
                }}
              >
                {p.label} · {p.value}
              </button>
            ))}
          </div>
        </div>

        {/* Right — outputs */}
        <div className="lg:w-80 flex-shrink-0 grid grid-cols-3 lg:grid-cols-1 gap-2.5">
          <RoiStat
            value={formatUSD(stats.dollarsPerYear)}
            label="ahorro anual"
            detail={`@ $${MANAGER_HOURLY_COST_USD}/h del manager`}
            color={BBVA.lime}
          />
          <RoiStat
            value={formatHours(stats.hoursPerYear)}
            label="horas devueltas al banco"
            detail="que pueden invertirse en producto"
            color={BBVA.sereneBlue}
          />
          <RoiStat
            value={`${stats.fteEquivalent.toFixed(1)}`}
            suffix="FTE"
            label="equivalente liberado"
            detail="full-time-equivalent / año"
            color={BBVA.purple}
          />
        </div>
      </div>

      {/* Comparison bar */}
      <div className="relative z-10 mt-6 pt-5" style={{ borderTop: "1px solid rgba(133,200,255,0.08)" }}>
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "#6b7fa3" }}>
          Tiempo por equipo
        </p>

        <div className="space-y-2.5">
          <ComparisonBar label="Excel + Google Chat manual" hours={HOURS_MANUAL} maxHours={HOURS_MANUAL} color="#fb923c" detail="14 horas en promedio" />
          <ComparisonBar label="BBVA Talent" hours={HOURS_WITH_TALENT} maxHours={HOURS_MANUAL} color={BBVA.lime} detail="22 minutos · -97%" />
        </div>
      </div>

      <p className="relative z-10 font-mono text-[10px] mt-4 leading-relaxed" style={{ color: "#3d4f6e" }}>
        ⓘ Estimación basada en tiempos promedio observados en pilotos internos. Costo hora del manager según tarifario interno BBVA 2026.
      </p>
    </section>
  );
}

function RoiStat({
  value,
  suffix,
  label,
  detail,
  color,
}: {
  value: string;
  suffix?: string;
  label: string;
  detail: string;
  color: string;
}) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0.6, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-3"
      style={{ background: `${color}0d`, border: `1px solid ${color}28` }}
    >
      <p className="font-black font-mono leading-none flex items-baseline gap-1" style={{ color, fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}>
        {value}
        {suffix && <span className="text-[0.55em] opacity-80">{suffix}</span>}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color, opacity: 0.85 }}>
        {label}
      </p>
      <p className="font-mono text-[10px] mt-0.5" style={{ color: color, opacity: 0.55 }}>
        {detail}
      </p>
    </motion.div>
  );
}

function ComparisonBar({ label, hours, maxHours, color, detail }: { label: string; hours: number; maxHours: number; color: string; detail: string }) {
  const pct = (hours / maxHours) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px]" style={{ color: "#a8b8d0" }}>{label}</span>
        <span className="font-mono text-[10px] font-bold" style={{ color }}>{detail}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(133,200,255,0.05)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, pct)}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
    </div>
  );
}
