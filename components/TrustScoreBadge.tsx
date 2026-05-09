"use client";

import { TRUST_TIER_CONFIG } from "@/lib/trust-score";
import type { TrustScore } from "@/lib/types";

interface Props {
  trust: TrustScore;
  compact?: boolean;
}

export default function TrustScoreBadge({ trust, compact = false }: Props) {
  const cfg = TRUST_TIER_CONFIG[trust.tier];

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <span className="font-black font-mono text-xs leading-none" style={{ color: cfg.color }}>
          {trust.overall}
        </span>
        <span className="font-mono text-[10px]" style={{ color: cfg.color + "99" }}>
          {cfg.label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-black font-mono text-3xl leading-none" style={{ color: cfg.color }}>
            {trust.overall}
          </span>
          <div>
            <p className="font-bold text-xs leading-tight" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="font-mono text-[10px]" style={{ color: cfg.color + "77" }}>Trust Score</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {(
          [
            { label: "Manager",  value: trust.breakdown.manager, weight: "35%" },
            { label: "EDI",      value: trust.breakdown.edi,     weight: "25%" },
            { label: "Peers",    value: trust.breakdown.peers,   weight: "20%" },
            { label: "Tenure",   value: trust.breakdown.tenure,  weight: "10%" },
            { label: "Skills",   value: trust.breakdown.skills,  weight: "10%" },
          ] as const
        ).map(({ label, value, weight }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-mono text-[10px]" style={{ color: cfg.color + "aa" }}>
                {label}
                <span className="ml-1 opacity-50">{weight}</span>
              </span>
              <span className="font-mono text-[10px] font-bold" style={{ color: cfg.color }}>{value}</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: `${cfg.color}18` }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${value}%`, background: cfg.color + "88" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
