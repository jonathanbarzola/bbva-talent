import { BBVA, NODE_COLORS, LINK_COLORS } from "@/lib/bbva-colors";

describe("BBVA color palette", () => {
  it("has all required primary colors defined", () => {
    expect(BBVA.electricBlue).toBe("#001391");
    expect(BBVA.sereneBlue).toBe("#85C8FF");
    expect(BBVA.midnight).toBe("#070E46");
  });

  it("has all accent colors defined as valid hex strings", () => {
    const accents = [BBVA.lime, BBVA.mandarin, BBVA.canary, BBVA.ice, BBVA.purple];
    accents.forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("has all grey shades defined", () => {
    const greys = [BBVA.sand, BBVA.grey1, BBVA.grey2, BBVA.grey3, BBVA.grey4, BBVA.grey5];
    expect(greys).toHaveLength(6);
    greys.forEach(color => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe("NODE_COLORS", () => {
  it("assigns electricBlue to empleado nodes", () => {
    expect(NODE_COLORS.empleado).toBe(BBVA.electricBlue);
  });

  it("assigns lime to habilidad nodes", () => {
    expect(NODE_COLORS.habilidad).toBe(BBVA.lime);
  });

  it("assigns mandarin to proyecto nodes", () => {
    expect(NODE_COLORS.proyecto).toBe(BBVA.mandarin);
  });

  it("covers all node types used in the graph", () => {
    const requiredTypes = ["empleado", "colaborador", "habilidad", "proyecto"];
    requiredTypes.forEach(t => {
      expect(NODE_COLORS[t]).toBeDefined();
    });
  });
});

describe("LINK_COLORS", () => {
  it("covers all relationship types used in the graph", () => {
    const requiredRels = ["HAS_SKILL", "WORKED_ON", "COLLABORATES_WITH", "RELATED_TO"];
    requiredRels.forEach(rel => {
      expect(LINK_COLORS[rel]).toBeDefined();
      expect(LINK_COLORS[rel]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
