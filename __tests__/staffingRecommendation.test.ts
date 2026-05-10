import { recommendStaffing, fteToLabel, fteToBucketName, patternToLabel } from "@/lib/staffingRecommendation";
import type { EmpleadoResult, StaffingRecord, ExternalFeedback } from "@/lib/types";

function emp(overrides: Partial<EmpleadoResult> = {}): EmpleadoResult {
  return {
    id: "emp_x",
    nombre: "Test Person",
    email: "x@bbva.com",
    rol: "Engineer",
    squad: "Squad",
    nivel: "Expert",
    ubicacion: "Lima",
    bio: "",
    score: 0.85,
    habilidades: [],
    proyectos: [],
    colaboradores: [],
    años_empresa: 5,
    es_mentor: false,
    disponible_networking: false,
    tipo_contrato: "interno",
    registro: "P099999",
    ...overrides,
  };
}

function record(quarter: string, code: string, fte: number): StaffingRecord {
  return {
    quarter,
    proyecto_codigo: code,
    proyecto_nombre: `Project ${code}`,
    fte,
    dominio: "Pagos",
  };
}

describe("recommendStaffing", () => {
  it("falls back to 100% with low confidence when there's no history", () => {
    const c = emp({ staffing_historico: [] });
    const rec = recommendStaffing(c);
    expect(rec.recommendedFte).toBe(1.0);
    expect(rec.confidence).toBe("low");
    expect(rec.historicalSummary.pattern).toBe("no-history");
    expect(rec.reasoning[0].label).toMatch(/Sin historial/i);
  });

  it("flags external with no history as medium risk", () => {
    const c = emp({
      tipo_contrato: "externo",
      registro: "XP12345",
      consultora: "Indra",
      staffing_historico: [],
    });
    const rec = recommendStaffing(c);
    expect(rec.riskSignals.length).toBeGreaterThan(0);
    expect(rec.riskSignals[0].severity).toBe("medium");
    expect(rec.riskSignals[0].message).toMatch(/Externo|Indra|antecedentes/i);
  });

  it("recommends 100% with high confidence for a single-project pattern", () => {
    const c = emp({
      staffing_historico: [
        record("2025-Q1", "SDA-001", 1.0),
        record("2024-Q4", "SDA-001", 1.0),
        record("2024-Q3", "SDA-002", 1.0),
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.recommendedFte).toBe(1.0);
    expect(rec.confidence).toBe("high");
    expect(rec.historicalSummary.pattern).toBe("single-project");
  });

  it("recommends 50% for split-50 pattern (2 projects/Q)", () => {
    const c = emp({
      staffing_historico: [
        record("2025-Q1", "SDA-A", 0.5),
        record("2025-Q1", "SDA-B", 0.5),
        record("2024-Q4", "SDA-A", 0.6),
        record("2024-Q4", "SDA-C", 0.4),
        record("2024-Q3", "SDA-A", 0.5),
        record("2024-Q3", "SDA-D", 0.5),
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.recommendedFte).toBe(0.5);
    expect(rec.historicalSummary.pattern).toBe("split-50");
    expect(rec.reasoning[0].detail).toMatch(/50%|dividir/i);
  });

  it("recommends fractional FTE for split-multi pattern (3+ projects/Q)", () => {
    const c = emp({
      staffing_historico: [
        record("2025-Q1", "A", 0.4),
        record("2025-Q1", "B", 0.3),
        record("2025-Q1", "C", 0.3),
        record("2024-Q4", "A", 0.4),
        record("2024-Q4", "B", 0.3),
        record("2024-Q4", "C", 0.3),
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.recommendedFte).toBeLessThan(1.0);
    expect(rec.historicalSummary.pattern).toBe("split-multi");
  });

  it("constrains Analyst to max 50% even when history shows multi-project", () => {
    const c = emp({
      nivel: "Analyst",
      staffing_historico: [
        record("2025-Q1", "A", 0.5),
        record("2025-Q1", "B", 0.5),
        record("2024-Q4", "A", 0.5),
        record("2024-Q4", "B", 0.5),
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.recommendedFte).toBeLessThanOrEqual(0.5);
  });

  it("flags external with very low feedback rating as HIGH risk", () => {
    const c = emp({
      tipo_contrato: "externo",
      consultora: "Capgemini",
      staffing_historico: [record("2025-Q1", "A", 1.0)],
      feedback_externo: [
        {
          manager_nombre: "Manager",
          proyecto_codigo: "A",
          proyecto_nombre: "A",
          quarter: "2024-Q4",
          rating: 2,
          comentario: "no recomiendo re-contratar",
        },
      ],
    });
    const rec = recommendStaffing(c);
    const high = rec.riskSignals.find(r => r.severity === "high");
    expect(high).toBeDefined();
    expect(high!.message).toMatch(/2.0\/5|negativo|2\/5/);
  });

  it("flags external with mid-range feedback (3-3.7) as MEDIUM risk", () => {
    const c = emp({
      tipo_contrato: "externo",
      consultora: "Bluetab",
      staffing_historico: [record("2025-Q1", "A", 1.0)],
      feedback_externo: [
        {
          manager_nombre: "M",
          proyecto_codigo: "A",
          proyecto_nombre: "A",
          quarter: "2024-Q4",
          rating: 3,
          comentario: "curva de aprendizaje",
        },
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.riskSignals.some(r => r.severity === "medium")).toBe(true);
  });

  it("treats high-rated externals as low-risk (positive supporting reason)", () => {
    const c = emp({
      tipo_contrato: "externo",
      consultora: "Indra",
      staffing_historico: [record("2025-Q1", "A", 1.0)],
      feedback_externo: [
        {
          manager_nombre: "M",
          proyecto_codigo: "A",
          proyecto_nombre: "A",
          quarter: "2024-Q4",
          rating: 5,
          comentario: "excelente",
        },
      ],
    });
    const rec = recommendStaffing(c);
    expect(rec.riskSignals.find(r => r.severity === "high" || r.severity === "medium")).toBeUndefined();
    expect(rec.reasoning.some(r => r.label.match(/positivo/i))).toBe(true);
  });

  it("provides alternative FTEs (excluding the recommended)", () => {
    const c = emp({ staffing_historico: [record("2025-Q1", "A", 1.0)] });
    const rec = recommendStaffing(c);
    expect(rec.alternativeFtes.length).toBeGreaterThan(0);
    expect(rec.alternativeFtes).not.toContain(rec.recommendedFte);
  });

  it("limits Analyst alternatives to 1.0 and 0.5 (no fragmentation)", () => {
    const c = emp({
      nivel: "Analyst",
      staffing_historico: [],
    });
    const rec = recommendStaffing(c);
    expect(rec.alternativeFtes.every(f => f === 1.0 || f === 0.5)).toBe(true);
  });

  it("cites previous projects in the reasoning when history exists", () => {
    const c = emp({
      staffing_historico: [
        record("2025-Q1", "SDA-AAA", 0.5),
        record("2025-Q1", "SDA-BBB", 0.5),
      ],
    });
    const rec = recommendStaffing(c);
    const supporting = rec.reasoning.find(r => r.weight === "supporting");
    expect(supporting).toBeDefined();
    expect(supporting!.detail).toMatch(/SDA-AAA|SDA-BBB/);
  });
});

describe("format helpers", () => {
  it("fteToLabel formats correctly", () => {
    expect(fteToLabel(1.0)).toBe("100%");
    expect(fteToLabel(0.5)).toBe("50%");
    expect(fteToLabel(0.25)).toBe("25%");
  });

  it("fteToBucketName uses descriptive labels", () => {
    expect(fteToBucketName(1.0)).toBe("Full-time");
    expect(fteToBucketName(0.5)).toBe("Half-time");
  });

  it("patternToLabel returns Spanish labels", () => {
    expect(patternToLabel("single-project")).toMatch(/completa/i);
    expect(patternToLabel("split-50")).toMatch(/50/);
    expect(patternToLabel("split-multi")).toMatch(/multi/i);
    expect(patternToLabel("no-history")).toMatch(/sin historial/i);
  });
});
