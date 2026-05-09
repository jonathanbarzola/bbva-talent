"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BBVA } from "@/lib/bbva-colors";
import { TRUST_TIER_CONFIG, BTOKEN_TIER_CONFIG } from "@/lib/trust-score";
import type { EmpleadoResult, TrustTier, BTokenTier, EDIRating } from "@/lib/types";

interface TeamBalancePanelProps {
  team: EmpleadoResult[];
}

const NIVEL_COLOR: Record<string, string> = {
  Junior: BBVA.ice,
  Mid:    BBVA.canary,
  Senior: BBVA.lime,
  Staff:  BBVA.mandarin,
};

const RATING_COLOR: Record<EDIRating, string> = {
  1: "#4ade80",
  2: "#FFE761",
  3: "#f87171",
};

const RATING_LABEL: Record<EDIRating, string> = {
  1: "Supera",
  2: "Cumple",
  3: "A mejorar",
};

function dominantTier<T extends string>(counts: Record<T, number>): T | null {
  let max = 0;
  let result: T | null = null;
  for (const [tier, n] of Object.entries(counts) as [T, number][]) {
    if (n > max) {
      max = n;
      result = tier;
    }
  }
  return result;
}

function MiniBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] w-14 flex-shrink-0" style={{ color: "#6b7fa3" }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(133,200,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
      <span className="font-mono text-[10px] font-bold w-6 text-right flex-shrink-0" style={{ color }}>{count}</span>
    </div>
  );
}

export default function TeamBalancePanel({ team }: TeamBalancePanelProps) {
  const stats = useMemo(() => {
    const total = team.length;
    if (total === 0) {
      return null;
    }

    const withTrust = team.filter(c => c.trust_score);
    const trustAvg = withTrust.length
      ? Math.round(withTrust.reduce((s, c) => s + (c.trust_score?.overall ?? 0), 0) / withTrust.length)
      : null;

    const trustTierCounts: Record<TrustTier, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    for (const c of withTrust) if (c.trust_score) trustTierCounts[c.trust_score.tier]++;

    const withBT = team.filter(c => c.b_tokens);
    const btAvg = withBT.length
      ? Math.round(withBT.reduce((s, c) => s + (c.b_tokens?.balance ?? 0), 0) / withBT.length)
      : null;

    const btTierCounts: Record<BTokenTier, number> = { platinum: 0, gold: 0, silver: 0, apprentice: 0 };
    for (const c of withBT) if (c.b_tokens) btTierCounts[c.b_tokens.tier]++;

    const ediCounts: Record<EDIRating, number> = { 1: 0, 2: 0, 3: 0 };
    for (const c of team) if (c.edi) ediCounts[c.edi.rating]++;
    const ediTotal = (ediCounts[1] + ediCounts[2] + ediCounts[3]);

    const ediBalance = ediTotal > 0
      ? Math.round((ediCounts[1] * 100 + ediCounts[2] * 65 + ediCounts[3] * 30) / ediTotal)
      : null;

    const nivelCounts: Record<string, number> = { Junior: 0, Mid: 0, Senior: 0, Staff: 0 };
    for (const c of team) {
      if (nivelCounts[c.nivel] !== undefined) nivelCounts[c.nivel]++;
    }

    const mentors = team.filter(c => c.es_mentor).length;
    const tenureAvg = Math.round(team.reduce((s, c) => s + c.años_empresa, 0) / total);

    return {
      total,
      trustAvg,
      trustDominantTier: dominantTier(trustTierCounts),
      btAvg,
      btDominantTier: dominantTier(btTierCounts),
      ediCounts,
      ediTotal,
      ediBalance,
      nivelCounts,
      mentors,
      tenureAvg,
    };
  }, [team]);

  if (!stats || stats.total === 0) return null;

  const trustCfg = stats.trustDominantTier ? TRUST_TIER_CONFIG[stats.trustDominantTier] : null;
  const btCfg = stats.btDominantTier ? BTOKEN_TIER_CONFIG[stats.btDominantTier] : null;

  return (
    <section
      className="rounded-2xl p-4"
      style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(133,200,255,0.10)" }}
    >
      <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded"
            style={{ background: `${BBVA.lime}1c`, color: BBVA.lime, border: `1px solid ${BBVA.lime}30` }}
          >
            Team Balance
          </span>
          <span className="font-mono text-[10px]" style={{ color: "#3d4f6e" }}>
            {stats.total} miembro{stats.total !== 1 ? "s" : ""} asignado{stats.total !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {stats.mentors > 0 && (
            <span
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${BBVA.canary}18`, color: BBVA.canary, border: `1px solid ${BBVA.canary}40` }}
            >
              {stats.mentors} mentor{stats.mentors > 1 ? "es" : ""}
            </span>
          )}
          <span className="font-mono text-[9px]" style={{ color: "#3d4f6e" }}>
            tenure prom. {stats.tenureAvg} año{stats.tenureAvg !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Trust Score */}
        {stats.trustAvg !== null && trustCfg && (
          <div
            className="rounded-xl p-3.5"
            style={{ background: trustCfg.bg, border: `1px solid ${trustCfg.border}` }}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: trustCfg.color, opacity: 0.85 }}>
              Trust Score
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-black font-mono leading-none" style={{ color: trustCfg.color, fontSize: 28 }}>
                {stats.trustAvg}
              </span>
              <span className="font-bold text-[10px]" style={{ color: trustCfg.color, opacity: 0.8 }}>
                / 100 · {trustCfg.label}
              </span>
            </div>
            <p className="font-mono text-[10px]" style={{ color: trustCfg.color, opacity: 0.6 }}>
              promedio del equipo
            </p>
          </div>
        )}

        {/* B-Tokens */}
        {stats.btAvg !== null && btCfg && (
          <div
            className="rounded-xl p-3.5"
            style={{ background: `${btCfg.color}0c`, border: `1px solid ${btCfg.color}28` }}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: btCfg.color, opacity: 0.85 }}>
              B-Tokens · {btCfg.icon}
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-black font-mono leading-none" style={{ color: btCfg.color, fontSize: 28 }}>
                {stats.btAvg}
              </span>
              <span className="font-bold text-[10px]" style={{ color: btCfg.color, opacity: 0.8 }}>
                BT · {btCfg.label}
              </span>
            </div>
            <p className="font-mono text-[10px]" style={{ color: btCfg.color, opacity: 0.6 }}>
              wallet promedio
            </p>
          </div>
        )}

        {/* EDI Balance */}
        {stats.ediBalance !== null && stats.ediTotal > 0 && (
          <div
            className="rounded-xl p-3.5"
            style={{ background: "rgba(155,232,163,0.06)", border: "1px solid rgba(155,232,163,0.22)" }}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "#9be8a3", opacity: 0.85 }}>
              EDI Balance
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-black font-mono leading-none" style={{ color: "#9be8a3", fontSize: 28 }}>
                {stats.ediBalance}
              </span>
              <span className="font-bold text-[10px]" style={{ color: "#9be8a3", opacity: 0.8 }}>
                / 100
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([1, 2, 3] as EDIRating[]).map(r => stats.ediCounts[r] > 0 && (
                <span
                  key={r}
                  className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${RATING_COLOR[r]}18`, color: RATING_COLOR[r], border: `1px solid ${RATING_COLOR[r]}38` }}
                >
                  {stats.ediCounts[r]} {RATING_LABEL[r]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seniority distribution */}
      <div className="mt-3 rounded-xl px-4 py-3" style={{ background: "rgba(133,200,255,0.03)", border: "1px solid rgba(133,200,255,0.08)" }}>
        <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: "#6b7fa3" }}>
          Distribución de seniority
        </p>
        <div className="space-y-1.5">
          {(["Staff", "Senior", "Mid", "Junior"] as const).map(level => {
            const count = stats.nivelCounts[level] ?? 0;
            if (count === 0) return null;
            return (
              <MiniBar
                key={level}
                label={level}
                count={count}
                total={stats.total}
                color={NIVEL_COLOR[level] ?? BBVA.sereneBlue}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
