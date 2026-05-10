import { analyzeSilos, buildDashboardKPIs } from "@/lib/siloAnalysis";
import { TECH_CATEGORIES, WORKFORCE_DATA, WORKFORCE_TOTAL } from "@/lib/workforce-stats";

describe("analyzeSilos", () => {
  const risks = analyzeSilos();

  it("returns a non-empty list given the seeded mock data", () => {
    expect(risks.length).toBeGreaterThan(0);
  });

  it("identifies HOST as critical (legacy + tenure 22 + bus factor 2)", () => {
    const host = risks.find(r => r.techId === "host");
    expect(host).toBeDefined();
    expect(host!.overallSeverity).toBe("critical");
    // Should hit multiple rules: bus-factor + tenure + no-pipeline
    const kinds = host!.factors.map(f => f.kind);
    expect(kinds).toEqual(expect.arrayContaining(["tenure-concentration"]));
  });

  it("identifies AI Engineering with high demand-supply imbalance", () => {
    const ai = risks.find(r => r.techId === "ai");
    expect(ai).toBeDefined();
    const ds = ai!.factors.find(f => f.kind === "demand-supply");
    expect(ds).toBeDefined();
  });

  it("never returns a risk with zero factors", () => {
    for (const r of risks) {
      expect(r.factors.length).toBeGreaterThan(0);
    }
  });

  it("attaches at least one AI suggestion to every detected risk", () => {
    for (const r of risks) {
      expect(r.aiSuggestions.length).toBeGreaterThan(0);
      for (const s of r.aiSuggestions) {
        expect(typeof s).toBe("string");
        expect(s.length).toBeGreaterThan(20);
      }
    }
  });

  it("sorts risks by severity (critical first)", () => {
    const order = ["critical", "high", "medium", "low"];
    for (let i = 1; i < risks.length; i++) {
      const prev = order.indexOf(risks[i - 1].overallSeverity);
      const curr = order.indexOf(risks[i].overallSeverity);
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it("never reports a tech that doesn't exist in TECH_CATEGORIES", () => {
    const knownIds = new Set(TECH_CATEGORIES.map(c => c.id));
    for (const r of risks) {
      expect(knownIds.has(r.techId)).toBe(true);
    }
  });
});

describe("buildDashboardKPIs", () => {
  it("totalWorkforce equals the sum of all WORKFORCE_DATA totals (1800 expected)", () => {
    const kpis = buildDashboardKPIs();
    expect(kpis.totalWorkforce).toBe(WORKFORCE_TOTAL);
    expect(kpis.totalWorkforce).toBe(1800);
  });

  it("techsAtRisk equals analyzeSilos length", () => {
    const risks = analyzeSilos();
    const kpis = buildDashboardKPIs(risks);
    expect(kpis.techsAtRisk).toBe(risks.length);
  });

  it("criticalTechs counts only critical-severity risks", () => {
    const risks = analyzeSilos();
    const expected = risks.filter(r => r.overallSeverity === "critical").length;
    const kpis = buildDashboardKPIs(risks);
    expect(kpis.criticalTechs).toBe(expected);
  });

  it("globalCoverageRatio is positive and finite", () => {
    const kpis = buildDashboardKPIs();
    expect(kpis.globalCoverageRatio).toBeGreaterThan(0);
    expect(Number.isFinite(kpis.globalCoverageRatio)).toBe(true);
  });

  it("mentorRatio sits between 0 and 1", () => {
    const kpis = buildDashboardKPIs();
    expect(kpis.mentorRatio).toBeGreaterThan(0);
    expect(kpis.mentorRatio).toBeLessThan(1);
  });

  it("totalDemandedHeadcount > 0 (we have open projects)", () => {
    const kpis = buildDashboardKPIs();
    expect(kpis.totalDemandedHeadcount).toBeGreaterThan(0);
  });
});

describe("WORKFORCE_DATA seed sanity", () => {
  it("totals 1800 collaborators (the headline KPI)", () => {
    const total = WORKFORCE_DATA.reduce((s, w) => s + w.total, 0);
    expect(total).toBe(1800);
  });

  it("seniority breakdown sums to total per tech", () => {
    for (const w of WORKFORCE_DATA) {
      const sum = w.seniority.analyst + w.seniority.associate + w.seniority.expert;
      expect(sum).toBe(w.total);
    }
  });

  it("availability breakdown sums to total per tech", () => {
    for (const w of WORKFORCE_DATA) {
      const sum = w.availability.available + w.availability.partial + w.availability.assigned + w.availability.onLeave;
      expect(sum).toBe(w.total);
    }
  });

  it("each tech has a category in TECH_CATEGORIES", () => {
    const knownIds = new Set(TECH_CATEGORIES.map(c => c.id));
    for (const w of WORKFORCE_DATA) {
      expect(knownIds.has(w.techId)).toBe(true);
    }
  });
});
