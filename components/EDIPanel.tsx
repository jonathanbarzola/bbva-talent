"use client";

import type { EDI, EDIRating } from "@/lib/types";

interface Props {
  edi: EDI;
}

const RATING_CONFIG: Record<EDIRating, { label: string; color: string; short: string }> = {
  1: { label: "Supera expectativas", color: "#4ade80", short: "Exceeds" },
  2: { label: "Cumple expectativas", color: "#FFE761", short: "Meets"   },
  3: { label: "Necesita mejorar",   color: "#f87171", short: "Improve"  },
};

function RatingPip({ rating }: { rating: EDIRating }) {
  const cfg = RATING_CONFIG[rating];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, color: cfg.color }}
    >
      {cfg.short}
    </span>
  );
}

export default function EDIPanel({ edi }: Props) {
  const managerCfg = RATING_CONFIG[edi.manager_rating];
  const selfCfg    = RATING_CONFIG[edi.rating];

  return (
    <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          EDI {edi.año}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Auto-eval</span>
          <RatingPip rating={edi.rating} />
        </div>
      </div>

      <div className="rounded-lg p-3 space-y-1" style={{ background: `${managerCfg.color}0d`, border: `1px solid ${managerCfg.color}22` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Manager feedback
          </span>
          <RatingPip rating={edi.manager_rating} />
        </div>
        <p className="text-xs leading-relaxed italic" style={{ color: "rgba(255,255,255,0.7)" }}>
          &ldquo;{edi.manager_comment}&rdquo;
        </p>
      </div>

      {edi.peer_comments.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Peer comments ({edi.peer_comments.length})
          </p>
          {edi.peer_comments.map((pc, i) => (
            <div
              key={i}
              className="rounded-lg p-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {pc.autor_nombre}
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: pc.sentiment_score >= 70 ? "#4ade80" : pc.sentiment_score >= 40 ? "#FFE761" : "#f87171" }}
                >
                  {pc.sentiment_score}/100
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {pc.comentario}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
