import { MOCK_SEARCH_RESULT, MOCK_GRAPH, getMockGraph } from "@/lib/mock-data";

describe("MOCK_SEARCH_RESULT", () => {
  it("has required top-level fields", () => {
    expect(MOCK_SEARCH_RESULT.query).toBeTruthy();
    expect(MOCK_SEARCH_RESULT.intencion_detectada).toBeTruthy();
    expect(Array.isArray(MOCK_SEARCH_RESULT.candidatos)).toBe(true);
    expect(MOCK_SEARCH_RESULT.total).toBe(MOCK_SEARCH_RESULT.candidatos.length);
  });

  it("has at least one candidate", () => {
    expect(MOCK_SEARCH_RESULT.candidatos.length).toBeGreaterThan(0);
  });

  it("each candidate has required fields", () => {
    MOCK_SEARCH_RESULT.candidatos.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.nombre).toBeTruthy();
      expect(c.email).toMatch(/@bbva\.com$/);
      expect(c.rol).toBeTruthy();
      expect(c.score).toBeGreaterThan(0);
      expect(c.score).toBeLessThanOrEqual(1);
      expect(Array.isArray(c.habilidades)).toBe(true);
      expect(Array.isArray(c.proyectos)).toBe(true);
      expect(Array.isArray(c.colaboradores)).toBe(true);
    });
  });

  it("candidates are sorted by score descending", () => {
    const scores = MOCK_SEARCH_RESULT.candidatos.map(c => c.score);
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  it("all skill categories are non-empty strings", () => {
    MOCK_SEARCH_RESULT.candidatos.forEach(c => {
      c.habilidades.forEach(s => {
        expect(s.nombre).toBeTruthy();
        expect(s.categoria).toBeTruthy();
      });
    });
  });
});

describe("MOCK_GRAPH", () => {
  it("has graph data for emp_001", () => {
    expect(MOCK_GRAPH["emp_001"]).toBeDefined();
    expect(Array.isArray(MOCK_GRAPH["emp_001"].nodes)).toBe(true);
    expect(Array.isArray(MOCK_GRAPH["emp_001"].links)).toBe(true);
  });

  it("emp_001 graph has a central empleado node", () => {
    const graph = MOCK_GRAPH["emp_001"];
    const central = graph.nodes.find(n => n.type === "empleado");
    expect(central).toBeDefined();
  });

  it("emp_001 graph has skill, project and collaborator nodes", () => {
    const graph = MOCK_GRAPH["emp_001"];
    const types = new Set(graph.nodes.map(n => n.type));
    expect(types.has("habilidad")).toBe(true);
    expect(types.has("proyecto")).toBe(true);
    expect(types.has("colaborador")).toBe(true);
  });

  it("all link sources and targets reference existing node ids", () => {
    Object.values(MOCK_GRAPH).forEach(graph => {
      const nodeIds = new Set(graph.nodes.map(n => n.id));
      graph.links.forEach(link => {
        expect(nodeIds.has(link.source as string)).toBe(true);
        expect(nodeIds.has(link.target as string)).toBe(true);
      });
    });
  });

  it("all link types are known relationship types", () => {
    const validTypes = new Set(["HAS_SKILL", "WORKED_ON", "COLLABORATES_WITH", "RELATED_TO"]);
    Object.values(MOCK_GRAPH).forEach(graph => {
      graph.links.forEach(link => {
        expect(validTypes.has(link.type)).toBe(true);
      });
    });
  });
});

describe("getMockGraph", () => {
  it("returns the correct graph for a known employee", () => {
    expect(getMockGraph("emp_001")).toBe(MOCK_GRAPH["emp_001"]);
  });

  it("falls back to emp_001 graph for unknown employee ids", () => {
    const fallback = getMockGraph("emp_999");
    expect(fallback).toBe(MOCK_GRAPH["emp_001"]);
  });
});
