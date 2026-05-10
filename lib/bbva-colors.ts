/**
 * BBVA Brand Color Palette — Talent Platform
 */
export const BBVA = {
  electricBlue: "#001391",
  sereneBlue: "#85C8FF",
  midnight: "#070E46",
  lime: "#88E783",
  mandarin: "#FFB56B",
  canary: "#FFE761",
  ice: "#8BE1E9",
  purple: "#9694FF",
  sand: "#F7F8F8",
  grey1: "#E2E6EA",
  grey2: "#CAD1D8",
  grey3: "#ADB8C2",
  grey4: "#46536D",
  grey5: "#000519",
} as const;

export const NODE_COLORS: Record<string, string> = {
  empleado: BBVA.electricBlue,
  colaborador: BBVA.sereneBlue,
  habilidad: BBVA.lime,
  proyecto: BBVA.mandarin,
  concepto: BBVA.ice,
  // ── Enriquecidos con contexto temporal ──
  "proyecto-actual": BBVA.canary,   // proyecto en el que está participando AHORA
  teammate: BBVA.purple,            // compañero de proyecto actual (vínculo más fuerte que colaborador)
};

export const LINK_COLORS: Record<string, string> = {
  HAS_SKILL: BBVA.lime,
  WORKED_ON: BBVA.mandarin,
  COLLABORATES_WITH: BBVA.sereneBlue,
  RELATED_TO: BBVA.ice,
  // ── Enriquecidos con contexto temporal ──
  WORKING_ON: BBVA.canary,          // assignment activo en este quarter
  TEAMMATE_OF: BBVA.purple,         // misma asignación en este quarter
};
