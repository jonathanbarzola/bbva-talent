import type { EmpleadoResult, TrustScore, TrustTier, TrustScoreBreakdown, BTokenTier } from "./types";

// Weights must sum to 1.0 — manager feedback is the most important signal
const WEIGHTS = {
  manager: 0.35,
  edi:     0.25,
  peers:   0.20,
  tenure:  0.10,
  skills:  0.10,
} as const;

// EDI rating 1-3 → normalized score 0-100
// 1 (Exceeds) → 100, 2 (Meets) → 65, 3 (Needs Improvement) → 30
function ratingToScore(rating: 1 | 2 | 3): number {
  switch (rating) {
    case 1: return 100;
    case 2: return 65;
    case 3: return 30;
  }
}

function tierFromOverall(score: number): TrustTier {
  if (score >= 85) return "platinum";
  if (score >= 70) return "gold";
  if (score >= 50) return "silver";
  return "bronze";
}

export function calculateTrustScore(employee: EmpleadoResult): TrustScore {
  const { edi, años_empresa, habilidades } = employee;

  const managerScore = edi ? ratingToScore(edi.manager_rating) : 65;
  const ediScore     = edi ? ratingToScore(edi.rating)         : 65;
  const peerScore    =
    edi && edi.peer_comments.length > 0
      ? edi.peer_comments.reduce((s, c) => s + c.sentiment_score, 0) / edi.peer_comments.length
      : 65;
  const tenureScore  = Math.min((años_empresa / 12) * 100, 100);
  const skillsScore  = Math.min((habilidades.length / 10) * 100, 100);

  const overall =
    managerScore * WEIGHTS.manager +
    ediScore     * WEIGHTS.edi    +
    peerScore    * WEIGHTS.peers  +
    tenureScore  * WEIGHTS.tenure +
    skillsScore  * WEIGHTS.skills;

  const breakdown: TrustScoreBreakdown = {
    manager: Math.round(managerScore),
    edi:     Math.round(ediScore),
    peers:   Math.round(peerScore),
    tenure:  Math.round(tenureScore),
    skills:  Math.round(skillsScore),
  };

  return {
    overall: Math.round(overall),
    tier: tierFromOverall(overall),
    breakdown,
  };
}

export function btokenTierFromBalance(balance: number): BTokenTier {
  if (balance >= 500) return "platinum";
  if (balance >= 300) return "gold";
  if (balance >= 100) return "silver";
  return "apprentice";
}

// Visual config for Trust tier display
export const TRUST_TIER_CONFIG: Record<TrustTier, { label: string; color: string; bg: string; border: string }> = {
  platinum: {
    label: "Platinum",
    color: "#c0e0ff",
    bg:    "rgba(192,224,255,0.10)",
    border:"rgba(192,224,255,0.25)",
  },
  gold: {
    label: "Gold",
    color: "#FFE761",
    bg:    "rgba(255,231,97,0.10)",
    border:"rgba(255,231,97,0.25)",
  },
  silver: {
    label: "Silver",
    color: "#8BE1E9",
    bg:    "rgba(139,225,233,0.10)",
    border:"rgba(139,225,233,0.25)",
  },
  bronze: {
    label: "Bronce",
    color: "#FFB56B",
    bg:    "rgba(255,181,107,0.10)",
    border:"rgba(255,181,107,0.25)",
  },
};

export const BTOKEN_TIER_CONFIG: Record<BTokenTier, { label: string; color: string; icon: string }> = {
  platinum: { label: "Platinum", color: "#c0e0ff", icon: "✦✦✦" },
  gold:     { label: "Gold",     color: "#FFE761", icon: "✦✦"  },
  silver:   { label: "Silver",   color: "#8BE1E9", icon: "✦"   },
  apprentice:{ label: "Aprendiz",color: "#6b7fa3", icon: "◇"   },
};
