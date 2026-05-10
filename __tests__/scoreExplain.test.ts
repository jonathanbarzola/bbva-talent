import { explainMatchScore } from "@/lib/scoreExplain";
import type { EmpleadoResult } from "@/lib/types";

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
    ...overrides,
  };
}

describe("explainMatchScore", () => {
  it("returns the score as a percent (0-100)", () => {
    const c = emp({ score: 0.92 });
    expect(explainMatchScore(c).totalScore).toBe(92);
  });

  it("includes a 'skills' factor based on role keywords", () => {
    const c = emp({
      habilidades: [
        { nombre: "Python", categoria: "Lang", score: 0.9 },
        { nombre: "TensorFlow", categoria: "ML", score: 0.85 },
        { nombre: "Machine Learning", categoria: "Domain", score: 0.9 },
      ],
    });
    const out = explainMatchScore(c, { roleName: "ML Engineer" });
    const skillsFactor = out.factors.find(f => f.category === "skills");
    expect(skillsFactor).toBeDefined();
    expect(skillsFactor!.contribution).toBeGreaterThan(0);
    expect(skillsFactor!.detail).toMatch(/Python|TensorFlow|Machine Learning/i);
  });

  it("includes Trust Score factor when present", () => {
    const c = emp({
      trust_score: { overall: 80, tier: "gold", breakdown: { manager: 80, edi: 80, peers: 80, tenure: 70, skills: 80 } },
    });
    const out = explainMatchScore(c);
    const trust = out.factors.find(f => f.category === "trust");
    expect(trust).toBeDefined();
    expect(trust!.contribution).toBeGreaterThan(15); // 80% of 25 = 20
  });

  it("gives a positive availability bonus when 'disponible'", () => {
    const c = emp({ disponibilidad: "disponible" });
    const out = explainMatchScore(c);
    const av = out.factors.find(f => f.category === "availability");
    expect(av).toBeDefined();
    expect(av!.contribution).toBeGreaterThan(0);
  });

  it("gives a NEGATIVE availability score when 'asignado'", () => {
    const c = emp({ disponibilidad: "asignado", proyecto_asignado: "OTHER" });
    const out = explainMatchScore(c);
    const av = out.factors.find(f => f.category === "availability");
    expect(av).toBeDefined();
    expect(av!.contribution).toBeLessThan(0);
  });

  it("emits a warning for non-available statuses", () => {
    const cVac = emp({ disponibilidad: "vacaciones", disponibilidad_hasta: "2025-08-15" });
    const out = explainMatchScore(cVac);
    expect(out.warnings.length).toBeGreaterThan(0);
    expect(out.warnings.join(" ")).toMatch(/vacaciones/i);
  });

  it("rewards domain experience when past projects match the project's dominio", () => {
    const c = emp({
      proyectos: [
        { id: "p1", nombre: "Pagos Old",  dominio: "Pagos", estado: "En Producción" },
        { id: "p2", nombre: "Pagos New",  dominio: "Pagos", estado: "En Producción" },
      ],
    });
    const out = explainMatchScore(c, { projectDomain: "Pagos" });
    const dom = out.factors.find(f => f.category === "domain");
    expect(dom).toBeDefined();
    expect(dom!.contribution).toBeGreaterThan(5);
    expect(dom!.detail).toMatch(/Pagos/i);
  });

  it("includes EDI factor when present, weighted by rating", () => {
    const exceeds = emp({
      edi: { año: 2025, rating: 1, manager_rating: 1, manager_comment: "", peer_comments: [] },
    });
    const meets = emp({
      edi: { año: 2025, rating: 2, manager_rating: 2, manager_comment: "", peer_comments: [] },
    });
    const improve = emp({
      edi: { año: 2025, rating: 3, manager_rating: 3, manager_comment: "", peer_comments: [] },
    });

    expect(explainMatchScore(exceeds).factors.find(f => f.category === "edi")!.contribution).toBeGreaterThan(
      explainMatchScore(meets).factors.find(f => f.category === "edi")!.contribution
    );
    expect(explainMatchScore(meets).factors.find(f => f.category === "edi")!.contribution).toBeGreaterThan(
      explainMatchScore(improve).factors.find(f => f.category === "edi")!.contribution
    );
  });

  it("warns when EDI rating is 'Necesita mejorar' (3)", () => {
    const c = emp({
      edi: { año: 2025, rating: 3, manager_rating: 3, manager_comment: "x", peer_comments: [] },
    });
    const out = explainMatchScore(c);
    expect(out.warnings.join(" ")).toMatch(/EDI|mejorar/i);
  });

  it("includes collaboration bonus when team members are shared collaborators", () => {
    const c = emp({
      id: "candidate",
      colaboradores: [
        { id: "team1", nombre: "T1", rol: "Eng", weight: 0.9 },
        { id: "team2", nombre: "T2", rol: "Eng", weight: 0.8 },
      ],
    });
    const out = explainMatchScore(c, { teamMemberIds: ["team1", "team2", "team3"] });
    const col = out.factors.find(f => f.category === "collaboration");
    expect(col).toBeDefined();
    expect(col!.contribution).toBeGreaterThan(0);
    expect(col!.detail).toMatch(/2 miembro/i);
  });

  it("orders factors by absolute contribution descending", () => {
    const c = emp({
      score: 0.95,
      trust_score: { overall: 90, tier: "platinum", breakdown: { manager: 90, edi: 90, peers: 90, tenure: 80, skills: 90 } },
      habilidades: [
        { nombre: "Python", categoria: "Lang", score: 0.9 },
        { nombre: "ML", categoria: "Domain", score: 0.85 },
      ],
      disponibilidad: "disponible",
    });
    const out = explainMatchScore(c, { roleName: "ML Engineer" });
    const contribs = out.factors.map(f => Math.abs(f.contribution));
    for (let i = 1; i < contribs.length; i++) {
      expect(contribs[i - 1]).toBeGreaterThanOrEqual(contribs[i]);
    }
  });

  it("produces a summary that mentions the candidate's first name", () => {
    const c = emp({ nombre: "Valentina Ríos", score: 0.9 });
    const out = explainMatchScore(c);
    expect(out.summary).toMatch(/Valentina/);
    expect(out.summary).toMatch(/90%/);
  });
});
