import type {
  RoleMatch,
  EmpleadoResult,
  AvailabilityStatus,
  TeamCompositionResponse,
} from "./types";

// ── Domain dictionaries ─────────────────────────────────────────────────────

/** Known squads/areas (lowercase). Maps user-said term → canonical squad name */
const SQUAD_ALIASES: Record<string, string[]> = {
  Pagos: ["pagos", "payments", "pago", "pagos digitales"],
  Riesgos: ["riesgos", "riesgo", "risk", "riesgos & fraude"],
  Mercados: ["mercados", "markets", "trading"],
  Plataforma: ["plataforma", "platform"],
  Datos: ["datos", "data", "analytics", "data & analytics"],
  "IA & ML": ["ia", "ai", "ml", "machine learning", "inteligencia artificial"],
  Compliance: ["compliance", "regulatorio", "regulación", "cumplimiento"],
  Seguridad: ["seguridad", "security", "ciberseguridad"],
  "Banca Digital": ["banca digital", "digital", "banca"],
  Canales: ["canales", "channels"],
  Inversiones: ["inversiones", "wealth"],
};

/** Known skills (lowercase keywords → canonical name) */
const SKILL_ALIASES: Record<string, string[]> = {
  Python: ["python", "py"],
  Java: ["java"],
  Go: ["go", "golang"],
  Kafka: ["kafka"],
  AWS: ["aws", "amazon"],
  GCP: ["gcp", "google cloud"],
  Azure: ["azure"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s", "kube"],
  Cloud: ["cloud"],
  React: ["react"],
  TypeScript: ["typescript", "ts"],
  Node: ["node", "nodejs"],
  ML: ["ml", "machine learning"],
  AI: ["ai", "ia", "inteligencia artificial"],
  SQL: ["sql"],
  NoSQL: ["nosql", "mongo", "cassandra"],
  Spark: ["spark"],
  Hadoop: ["hadoop"],
  Microservices: ["microservicios", "microservices"],
  Security: ["security", "seguridad", "criptografía"],
};

const LEVELS = ["Junior", "Mid", "Senior", "Staff"] as const;
const LEVEL_ALIASES: Record<(typeof LEVELS)[number], string[]> = {
  Junior: ["junior", "jr", "juniors", "jrs"],
  Mid: ["mid", "semi senior", "semi-senior", "mids"],
  Senior: ["senior", "sr", "seniors", "srs"],
  Staff: ["staff", "principal", "lead técnico", "lead tecnico"],
};

const AVAILABILITY_ALIASES: Record<AvailabilityStatus, string[]> = {
  disponible: ["disponible", "disponibles"],
  parcial: ["parcial", "media disponibilidad", "50%"],
  asignado: ["asignado", "asignados", "ocupado", "ocupados"],
  vacaciones: ["vacaciones", "vacación", "vacacion"],
  maternidad: ["maternidad", "maternal"],
  licencia: ["licencia", "licencias"],
  descanso_medico: ["descanso", "descanso médico", "médico", "medico", "enfermo"],
};

// ── Filter state ────────────────────────────────────────────────────────────

export interface RefinementFilters {
  excludeSquads: string[];
  excludeAvailability: AvailabilityStatus[];
  requireSkills: string[];
  excludeLevels: string[];
  requireLevels: string[];
}

export const EMPTY_FILTERS: RefinementFilters = {
  excludeSquads: [],
  excludeAvailability: [],
  requireSkills: [],
  excludeLevels: [],
  requireLevels: [],
};

export function isEmpty(f: RefinementFilters): boolean {
  return (
    f.excludeSquads.length === 0 &&
    f.excludeAvailability.length === 0 &&
    f.requireSkills.length === 0 &&
    f.excludeLevels.length === 0 &&
    f.requireLevels.length === 0
  );
}

// ── Parsing ─────────────────────────────────────────────────────────────────

export type ParseAction =
  | {
      type: "filter";
      patch: Partial<RefinementFilters>;
      explain: string;
    }
  | { type: "reset"; explain: string }
  | { type: "info"; explain: string }
  | { type: "unknown"; explain: string };

const REMOVE_VERBS = /\b(quit[áa]|excluí?|excluid?|sin|saca[rd]?|no quiero|no me sirven?|elimin[áa]r?|fuera|out|borr[áa]r?)\b/i;
const REQUIRE_VERBS = /\b(necesito|con|que (tengan?|sepan?|conozcan?|domine[ne]?)|busc[áa]r?|agreg[áaá]r?|añad[íi]r?|dame|que sea|requiero|debe(?:r[aá])?\s+(?:tener|saber))\b/i;
const RESET_PATTERNS = /\b(reset|reinici[áa]r?|volv[éeéer]?\s*(?:al|a)\s*(?:equipo\s*)?(?:original|inicial)|empez[áa]r?\s*de\s*nuevo|limpi[áa]r?\s*filtros?)\b/i;
const HELP_PATTERNS = /\b(ayud[aá]|help|qu[ée]\s*pod[ée]s\s*hacer|c[óo]mo\s*funciona|comandos?)\b/i;

function findEntity<T extends string>(
  text: string,
  aliases: Record<T, string[]>
): T[] {
  const found: T[] = [];
  const lower = text.toLowerCase();
  for (const [canonical, alts] of Object.entries(aliases) as [T, string[]][]) {
    for (const alt of alts) {
      // Word-boundary match for short aliases ("ml", "ai"), substring otherwise
      const re = alt.length <= 3
        ? new RegExp(`\\b${alt}\\b`, "i")
        : new RegExp(escapeRegex(alt), "i");
      if (re.test(lower)) {
        if (!found.includes(canonical)) found.push(canonical);
        break;
      }
    }
  }
  return found;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseCommand(text: string): ParseAction {
  const cleanText = text.trim();
  if (!cleanText) {
    return { type: "unknown", explain: "Decime algo concreto, hermano." };
  }

  // Reset
  if (RESET_PATTERNS.test(cleanText)) {
    return { type: "reset", explain: "Listo, vuelvo al equipo original sin filtros." };
  }

  // Help
  if (HELP_PATTERNS.test(cleanText)) {
    return {
      type: "info",
      explain:
        'Probá pedidos como: "quitá los que están en Pagos", "que tengan Kafka", "sin nadie de vacaciones", "excluí Juniors", o "volvé al equipo original".',
    };
  }

  const isRemoval = REMOVE_VERBS.test(cleanText);
  const isRequirement = REQUIRE_VERBS.test(cleanText);

  const squads = findEntity(cleanText, SQUAD_ALIASES);
  const skills = findEntity(cleanText, SKILL_ALIASES);
  const levels = findEntity(cleanText, LEVEL_ALIASES);
  const availability = findEntity(cleanText, AVAILABILITY_ALIASES);

  const patch: Partial<RefinementFilters> = {};
  const explainParts: string[] = [];

  if (squads.length > 0 && (isRemoval || (!isRequirement && availability.length === 0))) {
    patch.excludeSquads = squads;
    explainParts.push(`squad${squads.length > 1 ? "s" : ""} ${squads.join(", ")}`);
  }

  if (availability.length > 0) {
    // "sin gente de vacaciones" / "quitá los asignados" → exclude
    // "que estén disponibles" → require disponible (but we model this as "exclude all OTHER states")
    if (availability.includes("disponible") && !isRemoval) {
      // Require disponible = exclude every OTHER status
      const allStatuses: AvailabilityStatus[] = ["asignado", "vacaciones", "maternidad", "licencia", "descanso_medico", "parcial"];
      patch.excludeAvailability = allStatuses;
      explainParts.push("solo gente disponible al 100%");
    } else {
      patch.excludeAvailability = availability;
      explainParts.push(`gente en estado: ${availability.join(", ")}`);
    }
  }

  if (skills.length > 0) {
    if (isRemoval) {
      // "sin python" — interpretarlo como excluir, pero no soportamos exclude-skill todavía.
      // Lo modelamos como require-NOT, pero por simplicidad lo mapeamos a require: dejaremos solo los que SÍ tengan.
      // Mejor decisión: requerir las otras = no implementado. Devolvemos info.
      return {
        type: "info",
        explain: `"Sin ${skills.join(", ")}" todavía no lo soporto — sí puedo "que tengan ${skills.join(", ")}" o filtrar por squad/disponibilidad/seniority.`,
      };
    }
    patch.requireSkills = skills;
    explainParts.push(`skill${skills.length > 1 ? "s" : ""} requerida${skills.length > 1 ? "s" : ""}: ${skills.join(", ")}`);
  }

  if (levels.length > 0) {
    if (isRemoval) {
      patch.excludeLevels = levels;
      explainParts.push(`excluyo nivel${levels.length > 1 ? "es" : ""}: ${levels.join(", ")}`);
    } else if (isRequirement) {
      patch.requireLevels = levels;
      explainParts.push(`solo nivel${levels.length > 1 ? "es" : ""}: ${levels.join(", ")}`);
    } else {
      // Sin verbo claro pero sí nivel detectado — asumimos require
      patch.requireLevels = levels;
      explainParts.push(`solo nivel${levels.length > 1 ? "es" : ""}: ${levels.join(", ")}`);
    }
  }

  if (Object.keys(patch).length === 0) {
    return {
      type: "unknown",
      explain:
        'No detecté ninguna entidad conocida. Probá con squad (Pagos, Riesgos, IA), skill (Python, Kafka, AWS), nivel (Senior, Junior) o disponibilidad (vacaciones, asignados).',
    };
  }

  return {
    type: "filter",
    patch,
    explain: `Filtro aplicado: ${explainParts.join(" · ")}.`,
  };
}

// ── Apply ───────────────────────────────────────────────────────────────────

function passes(c: EmpleadoResult, f: RefinementFilters): boolean {
  if (f.excludeSquads.some(sq => c.squad.toLowerCase().includes(sq.toLowerCase()))) return false;
  if (c.disponibilidad && f.excludeAvailability.includes(c.disponibilidad)) return false;
  if (f.excludeLevels.includes(c.nivel)) return false;
  if (f.requireLevels.length > 0 && !f.requireLevels.includes(c.nivel)) return false;

  if (f.requireSkills.length > 0) {
    const lowerSkills = c.habilidades.map(h => h.nombre.toLowerCase());
    const allMatch = f.requireSkills.every(req => lowerSkills.some(s => s.includes(req.toLowerCase())));
    if (!allMatch) return false;
  }

  return true;
}

export function applyRefinement(
  roles: RoleMatch[],
  filters: RefinementFilters
): RoleMatch[] {
  if (isEmpty(filters)) return roles;
  return roles.map(r => ({
    ...r,
    candidates: r.candidates.filter(c => passes(c, filters)),
  }));
}

export function recomputeCoverage(roles: RoleMatch[]): { coverage_score: number; total_skills: number; gaps: string[] } {
  let totalRequired = 0;
  let totalCovered = 0;
  const gaps: string[] = [];
  const skillSet = new Set<string>();

  for (const r of roles) {
    totalRequired += r.quantity;
    totalCovered += Math.min(r.quantity, r.candidates.length);
    if (r.candidates.length < r.quantity) {
      gaps.push(`${r.role} ${r.candidates.length}/${r.quantity}`);
    }
    for (const c of r.candidates.slice(0, r.quantity)) {
      for (const s of c.habilidades) skillSet.add(s.nombre);
    }
  }

  return {
    coverage_score: totalRequired === 0 ? 100 : Math.round((totalCovered / totalRequired) * 100),
    total_skills: skillSet.size,
    gaps,
  };
}

export function summarizeImpact(before: RoleMatch[], after: RoleMatch[]): string {
  const beforeCount = before.reduce((s, r) => s + r.candidates.length, 0);
  const afterCount = after.reduce((s, r) => s + r.candidates.length, 0);
  const removed = beforeCount - afterCount;

  if (removed === 0) return "Ningún candidato cambió — no había nadie que matchee el filtro.";
  if (afterCount === 0) return `⚠ Todos los candidatos quedaron fuera (${removed}). Probá un filtro menos restrictivo.`;

  const beforeCov = recomputeCoverage(before);
  const afterCov = recomputeCoverage(after);
  const covDelta = afterCov.coverage_score - beforeCov.coverage_score;

  const parts: string[] = [];
  parts.push(`${removed} candidato${removed > 1 ? "s" : ""} fuera`);
  if (covDelta !== 0) {
    parts.push(`cobertura ${covDelta > 0 ? "+" : ""}${covDelta}%`);
  }
  if (afterCov.gaps.length > 0) {
    parts.push(`gaps: ${afterCov.gaps.join(", ")}`);
  }
  return parts.join(" · ");
}

// ── Composing the final result ──────────────────────────────────────────────

export function applyToTeam(
  base: TeamCompositionResponse,
  filters: RefinementFilters
): TeamCompositionResponse {
  const roles = applyRefinement(base.roles, filters);
  const stats = recomputeCoverage(roles);
  return {
    ...base,
    roles,
    coverage_score: stats.coverage_score,
    total_skills: stats.total_skills,
    gaps: stats.gaps,
  };
}
