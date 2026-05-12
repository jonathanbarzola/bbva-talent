"use client";

import { BTOKEN_TIER_CONFIG } from "@/lib/trust-score";
import type { BTokenWallet } from "@/lib/types";

interface Props {
  wallet: BTokenWallet;
  compact?: boolean;
}

export default function BTokenBadge({ wallet, compact = false }: Props) {
  const cfg = BTOKEN_TIER_CONFIG[wallet.tier];
  // cfg.color is a CSS var — color-mix replaces former hex-alpha concat.
  const mix = (pct: number) => `color-mix(in srgb, ${cfg.color} ${pct}%, transparent)`;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
        style={{ background: mix(7), border: `1px solid ${mix(19)}` }}
      >
        <span className="font-mono text-[10px]" style={{ color: cfg.color }}>{cfg.icon}</span>
        <span className="font-black font-mono text-xs leading-none" style={{ color: cfg.color }}>
          {wallet.balance}
        </span>
        <span className="font-mono text-[10px]" style={{ color: mix(60) }}>BT</span>
      </div>
    );
  }

  const recent = wallet.historial.slice(0, 4);

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: mix(5), border: `1px solid ${mix(16)}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-lg" style={{ color: cfg.color }}>{cfg.icon}</span>
          <div>
            <p className="font-black font-mono text-2xl leading-none" style={{ color: cfg.color }}>
              {wallet.balance}
              <span className="text-xs font-normal ml-1 opacity-60">BT</span>
            </p>
            <p className="font-bold text-[10px]" style={{ color: mix(60) }}>
              {cfg.label} · B-Tokens
            </p>
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="space-y-1.5">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <span
                className="font-mono text-[10px] truncate max-w-[160px]"
                style={{ color: mix(53) }}
                title={tx.motivo}
              >
                {tx.motivo}
              </span>
              <span
                className="font-mono text-[10px] font-bold ml-2 shrink-0"
                style={{ color: tx.tipo === "earned" ? "#4ade80" : "#f87171" }}
              >
                {tx.tipo === "earned" ? "+" : "-"}{tx.cantidad}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
