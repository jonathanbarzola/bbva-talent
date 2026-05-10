import { analyzeGaps } from "@/lib/gapAnalysis";
import type {
  TeamCompositionResponse,
  EmpleadoResult,
  RoleMatch,
  SDAProject,
} from "@/lib/types";

function emp(overrides: Partial<EmpleadoResult> = {}): EmpleadoResult {
  return {
    id: "emp_test",
    nombre: "Test",
    email: "t@bbva.com",
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
    ...overrides,
  };
}

function team(roles: RoleMatch[], coverage = 100): TeamCompositionResponse {
  return {
    project_name: "Test Project",
    roles,
    coverage_score: coverage,
    total_skills: 10,
    gaps: [],
  };
}

const dummyProject: SDAProject = {
  codigo: "SDA-99999",
  nombre: "Test",
  dominio: "Pagos",
  estado: "En desarrollo",
  roles: [],
};

describe("analyzeGaps", () => {
  it("returns empty when team is fully staffed and balanced", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 2,
        candidates: [
          emp({ id: "1", nivel: "Expert", años_empresa: 5, disponibilidad: "disponible" }),
          emp({ id: "2", nivel: "Associate",    años_empresa: 4, disponibilidad: "disponible" }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps).toEqual([]);
  });

  it("flags coverage gap as critical when 2+ slots missing", () => {
    const t = team([{ role: "ML Engineer", quantity: 3, candidates: [] }]);
    const gaps = analyzeGaps(t);
    const cov = gaps.find(g => g.id.startsWith("coverage-"));
    expect(cov).toBeDefined();
    expect(cov!.severity).toBe("critical");
    expect(cov!.title).toContain("ML Engineer");
  });

  it("flags coverage gap as high when 1 slot missing", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 2,
        candidates: [emp({ id: "1", disponibilidad: "disponible" })],
      },
    ]);
    const gaps = analyzeGaps(t);
    const cov = gaps.find(g => g.id.startsWith("coverage-"));
    expect(cov).toBeDefined();
    expect(cov!.severity).toBe("high");
  });

  it("flags availability risk when most assigned members are vacation/assigned", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 4,
        candidates: [
          emp({ id: "1", disponibilidad: "vacaciones", disponibilidad_hasta: "2025-08-15" }),
          emp({ id: "2", disponibilidad: "asignado", proyecto_asignado: "OTHER" }),
          emp({ id: "3", disponibilidad: "disponible" }),
          emp({ id: "4", disponibilidad: "maternidad", disponibilidad_hasta: "2026-01-01" }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    const av = gaps.find(g => g.id === "availability-risk");
    expect(av).toBeDefined();
    expect(["high", "medium"]).toContain(av!.severity);
  });

  it("flags 'no Senior/Staff' team as high risk", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 4,
        candidates: [
          emp({ id: "1", nivel: "Analyst" }),
          emp({ id: "2", nivel: "Analyst" }),
          emp({ id: "3", nivel: "Associate" }),
          emp({ id: "4", nivel: "Associate" }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    const sn = gaps.find(g => g.id === "seniority-no-senior");
    expect(sn).toBeDefined();
    expect(sn!.severity).toBe("high");
  });

  it("flags imbalanced seniority pyramid as medium", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 5,
        candidates: [
          emp({ id: "1", nivel: "Analyst" }),
          emp({ id: "2", nivel: "Analyst" }),
          emp({ id: "3", nivel: "Associate" }),
          emp({ id: "4", nivel: "Associate" }),
          emp({ id: "5", nivel: "Expert" }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps.some(g => g.id === "seniority-imbalance")).toBe(true);
  });

  it("flags no prior collaborations between assigned members", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 3,
        candidates: [
          emp({ id: "1", colaboradores: [] }),
          emp({ id: "2", colaboradores: [] }),
          emp({ id: "3", colaboradores: [] }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps.some(g => g.id === "collaboration-none")).toBe(true);
  });

  it("does not flag collaboration when team has prior history", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 3,
        candidates: [
          emp({
            id: "1",
            colaboradores: [
              { id: "2", nombre: "Two", rol: "Eng", weight: 0.9 },
              { id: "3", nombre: "Three", rol: "Eng", weight: 0.85 },
            ],
          }),
          emp({
            id: "2",
            colaboradores: [
              { id: "1", nombre: "One", rol: "Eng", weight: 0.9 },
              { id: "3", nombre: "Three", rol: "Eng", weight: 0.8 },
            ],
          }),
          emp({
            id: "3",
            colaboradores: [
              { id: "1", nombre: "One", rol: "Eng", weight: 0.85 },
              { id: "2", nombre: "Two", rol: "Eng", weight: 0.8 },
            ],
          }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps.find(g => g.id === "collaboration-none")).toBeUndefined();
  });

  it("flags low average Trust Score as medium", () => {
    const t = team([
      {
        role: "Backend",
        quantity: 2,
        candidates: [
          emp({
            id: "1",
            trust_score: { overall: 45, tier: "bronze", breakdown: { manager: 40, edi: 50, peers: 50, tenure: 40, skills: 30 } },
          }),
          emp({
            id: "2",
            trust_score: { overall: 50, tier: "bronze", breakdown: { manager: 50, edi: 50, peers: 50, tenure: 40, skills: 30 } },
          }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps.some(g => g.id === "trust-low-avg")).toBe(true);
  });

  it("detects skill gap when project name implies a skill not in the team", () => {
    // Project "Fraud Detection AI" with a team that has zero ML/AI skills
    const project: SDAProject = {
      codigo: "SDA-99",
      nombre: "Fraud Detection AI",
      dominio: "Seguridad",
      estado: "En desarrollo",
      roles: [],
    };
    const t = team([
      {
        role: "Backend",
        quantity: 2,
        candidates: [
          emp({ id: "1", habilidades: [{ nombre: "Java", categoria: "Lang", score: 0.9 }] }),
          emp({ id: "2", habilidades: [{ nombre: "Spring", categoria: "Framework", score: 0.85 }] }),
        ],
      },
    ]);
    const gaps = analyzeGaps(t, project);
    expect(gaps.some(g => g.id.startsWith("skills-missing-"))).toBe(true);
  });

  it("sorts gaps by severity (critical first)", () => {
    const t = team([
      { role: "ML", quantity: 3, candidates: [] }, // critical (2+ missing)
      {
        role: "Backend",
        quantity: 2,
        candidates: [emp({ id: "1", disponibilidad: "disponible" })], // high (1 missing)
      },
    ]);
    const gaps = analyzeGaps(t);
    expect(gaps.length).toBeGreaterThanOrEqual(2);
    const severities = gaps.map(g => g.severity);
    // critical should come before high
    const critIdx = severities.indexOf("critical");
    const highIdx = severities.indexOf("high");
    if (critIdx !== -1 && highIdx !== -1) {
      expect(critIdx).toBeLessThan(highIdx);
    }
  });

  it("attaches a recommendation to each generated gap", () => {
    const t = team([{ role: "ML Engineer", quantity: 3, candidates: [] }]);
    const gaps = analyzeGaps(t);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].recommendation).toBeTruthy();
  });
});
