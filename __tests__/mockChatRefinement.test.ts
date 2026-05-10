import {
  parseCommand,
  applyRefinement,
  applyToTeam,
  recomputeCoverage,
  summarizeImpact,
  EMPTY_FILTERS,
  isEmpty,
  type RefinementFilters,
} from "@/lib/mockChatRefinement";
import type {
  EmpleadoResult,
  RoleMatch,
  TeamCompositionResponse,
} from "@/lib/types";

function emp(overrides: Partial<EmpleadoResult> = {}): EmpleadoResult {
  return {
    id: "emp_x",
    nombre: "X",
    email: "x@bbva.com",
    rol: "Eng",
    squad: "Pagos",
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

describe("parseCommand", () => {
  it("returns 'unknown' for empty input", () => {
    expect(parseCommand("").type).toBe("unknown");
    expect(parseCommand("   ").type).toBe("unknown");
  });

  it("returns 'reset' for variants of 'volvé al equipo original'", () => {
    expect(parseCommand("volvé al equipo original").type).toBe("reset");
    expect(parseCommand("vuelve al equipo original").type).toBe("reset");
    expect(parseCommand("reiniciar").type).toBe("reset");
    expect(parseCommand("limpiar filtros").type).toBe("reset");
    expect(parseCommand("empezar de nuevo").type).toBe("reset");
  });

  it("returns 'info' on help-style queries", () => {
    expect(parseCommand("ayuda").type).toBe("info");
    expect(parseCommand("qué podes hacer").type).toBe("info");
  });

  it("excludes squad on 'quitá los de Pagos'", () => {
    const out = parseCommand("quitá los de Pagos");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      expect(out.patch.excludeSquads).toContain("Pagos");
    }
  });

  it("excludes squad on tuteo neutral 'quita los de Pagos'", () => {
    const out = parseCommand("quita los de Pagos");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      expect(out.patch.excludeSquads).toContain("Pagos");
    }
  });

  it("requires skill on 'que tengan Kafka'", () => {
    const out = parseCommand("que tengan Kafka");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      expect(out.patch.requireSkills).toContain("Kafka");
    }
  });

  it("excludes availability on 'sin nadie de vacaciones'", () => {
    const out = parseCommand("sin nadie de vacaciones");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      expect(out.patch.excludeAvailability).toContain("vacaciones");
    }
  });

  it("requires level on 'solo Senior y Staff' (mapeado a Expert)", () => {
    const out = parseCommand("solo Senior y Staff");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      // Tanto Senior como Staff colapsan a Expert en la nueva taxonomía BBVA
      expect(out.patch.requireLevels).toEqual(["Expert"]);
    }
  });

  it("excludes level on 'excluí Juniors' (mapeado a Analyst)", () => {
    const out = parseCommand("excluí Juniors");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      expect(out.patch.excludeLevels).toContain("Analyst");
    }
  });

  it("translates 'que estén disponibles' to exclude all non-available statuses", () => {
    const out = parseCommand("que estén disponibles");
    expect(out.type).toBe("filter");
    if (out.type === "filter") {
      // Should exclude all OTHER statuses
      expect(out.patch.excludeAvailability).toEqual(
        expect.arrayContaining(["asignado", "vacaciones", "maternidad", "licencia", "descanso_medico", "parcial"])
      );
    }
  });

  it("returns 'unknown' when no entity is detected", () => {
    const out = parseCommand("hello world");
    expect(out.type).toBe("unknown");
  });
});

describe("applyRefinement / applyToTeam", () => {
  function makeTeam(): TeamCompositionResponse {
    const roles: RoleMatch[] = [
      {
        role: "Backend",
        quantity: 2,
        candidates: [
          emp({ id: "1", nivel: "Expert", squad: "Pagos", habilidades: [{ nombre: "Java", categoria: "Lang", score: 0.9 }] }),
          emp({ id: "2", nivel: "Associate", squad: "Pagos", habilidades: [{ nombre: "Kafka", categoria: "Tool", score: 0.8 }] }),
          emp({ id: "3", nivel: "Expert", squad: "Riesgos", habilidades: [{ nombre: "Java", categoria: "Lang", score: 0.85 }, { nombre: "Kafka", categoria: "Tool", score: 0.85 }] }),
        ],
      },
    ];
    return { project_name: "T", roles, coverage_score: 100, total_skills: 3, gaps: [] };
  }

  it("returns the same team when filters are empty", () => {
    const t = makeTeam();
    const out = applyToTeam(t, EMPTY_FILTERS);
    expect(out.roles[0].candidates.length).toBe(3);
  });

  it("filters by excluded squad", () => {
    const t = makeTeam();
    const out = applyToTeam(t, { ...EMPTY_FILTERS, excludeSquads: ["Pagos"] });
    expect(out.roles[0].candidates.map(c => c.id)).toEqual(["3"]);
  });

  it("filters by required skill (must have it)", () => {
    const t = makeTeam();
    const out = applyToTeam(t, { ...EMPTY_FILTERS, requireSkills: ["Kafka"] });
    expect(out.roles[0].candidates.map(c => c.id).sort()).toEqual(["2", "3"]);
  });

  it("filters by required level", () => {
    const t = makeTeam();
    const out = applyToTeam(t, { ...EMPTY_FILTERS, requireLevels: ["Senior"] });
    expect(out.roles[0].candidates.map(c => c.id).sort()).toEqual(["1", "3"]);
  });

  it("filters by excluded level", () => {
    const t = makeTeam();
    const out = applyToTeam(t, { ...EMPTY_FILTERS, excludeLevels: ["Mid"] });
    expect(out.roles[0].candidates.map(c => c.id).sort()).toEqual(["1", "3"]);
  });

  it("recomputes coverage after filtering", () => {
    const t = makeTeam();
    const out = applyToTeam(t, { ...EMPTY_FILTERS, requireSkills: ["NonExistentSkill"] });
    expect(out.coverage_score).toBe(0);
    expect(out.gaps.length).toBeGreaterThan(0);
  });
});

describe("isEmpty", () => {
  it("returns true for EMPTY_FILTERS", () => {
    expect(isEmpty(EMPTY_FILTERS)).toBe(true);
  });

  it("returns false when any filter has entries", () => {
    expect(isEmpty({ ...EMPTY_FILTERS, requireSkills: ["Kafka"] })).toBe(false);
    expect(isEmpty({ ...EMPTY_FILTERS, excludeSquads: ["Pagos"] })).toBe(false);
  });
});

describe("recomputeCoverage", () => {
  it("returns 100% when all roles are covered", () => {
    const roles: RoleMatch[] = [
      {
        role: "A",
        quantity: 2,
        candidates: [emp({ id: "1" }), emp({ id: "2" })],
      },
    ];
    expect(recomputeCoverage(roles).coverage_score).toBe(100);
  });

  it("flags missing slots as gaps", () => {
    const roles: RoleMatch[] = [
      { role: "A", quantity: 2, candidates: [emp({ id: "1" })] }, // 1/2
    ];
    const out = recomputeCoverage(roles);
    expect(out.coverage_score).toBe(50);
    expect(out.gaps[0]).toContain("A 1/2");
  });
});

describe("summarizeImpact", () => {
  const baseRoles: RoleMatch[] = [
    {
      role: "Backend",
      quantity: 3,
      candidates: [emp({ id: "1" }), emp({ id: "2" }), emp({ id: "3" })],
    },
  ];

  it("reports zero changes when filter has no effect", () => {
    const after = baseRoles; // same
    expect(summarizeImpact(baseRoles, after)).toContain("Ningún candidato cambió");
  });

  it("warns when all candidates are filtered out", () => {
    const after: RoleMatch[] = [{ role: "Backend", quantity: 3, candidates: [] }];
    expect(summarizeImpact(baseRoles, after)).toContain("⚠");
  });

  it("describes how many candidates dropped", () => {
    const after: RoleMatch[] = [
      {
        role: "Backend",
        quantity: 3,
        candidates: [emp({ id: "1" }), emp({ id: "2" })], // 1 removed
      },
    ];
    const summary = summarizeImpact(baseRoles, after);
    expect(summary).toMatch(/1 candidato fuera/i);
  });
});
