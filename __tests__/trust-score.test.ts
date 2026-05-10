import {
  calculateTrustScore,
  btokenTierFromBalance,
  TRUST_TIER_CONFIG,
  BTOKEN_TIER_CONFIG,
} from "@/lib/trust-score";
import type { EmpleadoResult } from "@/lib/types";

function makeEmployee(overrides: Partial<EmpleadoResult> = {}): EmpleadoResult {
  return {
    id: "emp_test",
    nombre: "Test Person",
    email: "test@bbva.com",
    rol: "Engineer",
    squad: "Test Squad",
    nivel: "Associate",
    ubicacion: "Lima",
    bio: "",
    score: 0.85,
    habilidades: [],
    proyectos: [],
    colaboradores: [],
    años_empresa: 5,
    es_mentor: false,
    disponible_networking: false,
    ...overrides,
  };
}

describe("calculateTrustScore", () => {
  it("returns platinum (>=85) for an excellent employee", () => {
    const emp = makeEmployee({
      años_empresa: 12,
      habilidades: Array.from({ length: 10 }, (_, i) => ({
        nombre: `Skill${i}`,
        categoria: "Tech",
        score: 0.9,
      })),
      edi: {
        año: 2025,
        rating: 1, // Exceeds
        manager_rating: 1,
        manager_comment: "stellar",
        peer_comments: [
          { autor_id: "a", autor_nombre: "A", comentario: "great", sentiment_score: 95 },
          { autor_id: "b", autor_nombre: "B", comentario: "great", sentiment_score: 90 },
        ],
      },
    });

    const trust = calculateTrustScore(emp);
    expect(trust.overall).toBeGreaterThanOrEqual(85);
    expect(trust.tier).toBe("platinum");
    expect(trust.breakdown.manager).toBe(100); // rating 1 → 100
    expect(trust.breakdown.edi).toBe(100);
  });

  it("returns bronze (<50) for a low-performing recent hire", () => {
    const emp = makeEmployee({
      años_empresa: 1,
      habilidades: [{ nombre: "Skill1", categoria: "Tech", score: 0.5 }],
      edi: {
        año: 2025,
        rating: 3, // Needs Improvement
        manager_rating: 3,
        manager_comment: "underperformed",
        peer_comments: [{ autor_id: "a", autor_nombre: "A", comentario: "x", sentiment_score: 25 }],
      },
    });

    const trust = calculateTrustScore(emp);
    expect(trust.overall).toBeLessThan(50);
    expect(trust.tier).toBe("bronze");
  });

  it("uses neutral defaults (65) when EDI is missing", () => {
    const emp = makeEmployee({ años_empresa: 6, habilidades: [] });

    const trust = calculateTrustScore(emp);
    expect(trust.breakdown.manager).toBe(65);
    expect(trust.breakdown.edi).toBe(65);
    expect(trust.breakdown.peers).toBe(65);
  });

  it("respects the documented weights (manager 35% + edi 25% + peers 20% + tenure 10% + skills 10%)", () => {
    const emp = makeEmployee({
      años_empresa: 12, // tenure → 100
      habilidades: Array.from({ length: 10 }, () => ({ nombre: "x", categoria: "y", score: 1 })), // skills → 100
      edi: {
        año: 2025,
        rating: 1, // edi → 100
        manager_rating: 1, // manager → 100
        manager_comment: "",
        peer_comments: [{ autor_id: "a", autor_nombre: "A", comentario: "x", sentiment_score: 100 }],
      },
    });
    const trust = calculateTrustScore(emp);
    // All factors at 100 → overall must be 100
    expect(trust.overall).toBe(100);
  });

  it("clamps tenure at 12 years (caps the contribution)", () => {
    const empLong = makeEmployee({ años_empresa: 25 });
    const empCap = makeEmployee({ años_empresa: 12 });
    expect(calculateTrustScore(empLong).breakdown.tenure).toBe(100);
    expect(calculateTrustScore(empCap).breakdown.tenure).toBe(100);
  });
});

describe("btokenTierFromBalance", () => {
  it("classifies tiers correctly", () => {
    expect(btokenTierFromBalance(50)).toBe("apprentice");
    expect(btokenTierFromBalance(100)).toBe("silver");
    expect(btokenTierFromBalance(299)).toBe("silver");
    expect(btokenTierFromBalance(300)).toBe("gold");
    expect(btokenTierFromBalance(499)).toBe("gold");
    expect(btokenTierFromBalance(500)).toBe("platinum");
    expect(btokenTierFromBalance(9999)).toBe("platinum");
  });
});

describe("TRUST_TIER_CONFIG and BTOKEN_TIER_CONFIG", () => {
  it("expose all 4 trust tiers with required fields", () => {
    for (const tier of ["platinum", "gold", "silver", "bronze"] as const) {
      expect(TRUST_TIER_CONFIG[tier]).toBeDefined();
      expect(TRUST_TIER_CONFIG[tier].label).toBeTruthy();
      expect(TRUST_TIER_CONFIG[tier].color).toMatch(/^#/);
    }
  });

  it("expose all 4 b-token tiers with required fields", () => {
    for (const tier of ["platinum", "gold", "silver", "apprentice"] as const) {
      expect(BTOKEN_TIER_CONFIG[tier]).toBeDefined();
      expect(BTOKEN_TIER_CONFIG[tier].label).toBeTruthy();
      expect(BTOKEN_TIER_CONFIG[tier].icon).toBeTruthy();
    }
  });
});
