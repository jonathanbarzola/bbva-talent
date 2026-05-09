import type { EmpleadoResult, AvailabilityStatus } from "./types";

export interface ScoreFactor {
  /** Short label shown on the chart row */
  label: string;
  /** Long-form description (one short sentence) */
  detail: string;
  /** Points contributed to the final score (can be negative for penalties) */
  contribution: number;
  /** Maximum possible points for this factor (used to render the bar's "fill") */
  maxContribution: number;
  /** Visual category — drives icon + color */
  category: "skills" | "trust" | "availability" | "domain" | "collaboration" | "seniority" | "edi";
}

export interface MatchExplanation {
  totalScore: number;       // 0-100
  factors: ScoreFactor[];   // sorted by absolute contribution desc
  summary: string;          // human-readable headline
  warnings: string[];       // negative factors highlighted separately
}

export interface ExplainContext {
  roleName?: string;
  projectDomain?: string;
  projectName?: string;
  teamMemberIds?: string[];
}

const AVAIL_BONUS: Partial<Record<AvailabilityStatus, number>> = {
  disponible: 12,
  parcial: 6,
  vacaciones: -3,
  asignado: -8,
  maternidad: -5,
  licencia: -5,
  descanso_medico: -5,
};

const ROLE_KEYWORDS: Record<string, string[]> = {
  "ML Engineer": ["python", "ml", "machine learning", "tensorflow", "pytorch", "ai", "data science"],
  "Data Engineer": ["python", "spark", "kafka", "airflow", "sql", "bigquery", "data"],
  "Backend Engineer": ["java", "go", "node", "python", "kotlin", "spring", "api", "microservices"],
  "Frontend Engineer": ["react", "typescript", "next", "vue", "angular", "css", "html"],
  "DevOps Engineer": ["docker", "kubernetes", "k8s", "terraform", "aws", "gcp", "azure", "ci/cd"],
  "Security Engineer": ["security", "kyc", "aml", "owasp", "iam", "criptografía", "pentest"],
  "Solutions Architect": ["architecture", "design patterns", "microservices", "cloud", "scalability"],
  "Scrum Master": ["scrum", "agile", "kanban", "product", "facilitation"],
};

function findMatchingSkills(candidate: EmpleadoResult, keywords: string[]): string[] {
  const lower = candidate.habilidades.map(h => h.nombre.toLowerCase());
  const matched: string[] = [];
  for (const kw of keywords) {
    const hit = lower.find(s => s.includes(kw));
    if (hit && !matched.includes(hit)) matched.push(hit);
  }
  return matched;
}

function inferDomainKeywords(domain: string): string[] {
  const d = domain.toLowerCase();
  const buckets: Array<{ test: RegExp; words: string[] }> = [
    { test: /(pago|payment)/, words: ["payment", "pagos", "transactions"] },
    { test: /(riesgo|risk|fraud)/, words: ["risk", "fraud", "anti-fraud", "compliance"] },
    { test: /(seguri|security|kyc|aml)/, words: ["security", "kyc", "aml"] },
    { test: /(data|analytics)/, words: ["data", "analytics", "etl"] },
    { test: /(ia|ai|ml)/, words: ["ml", "ai", "machine learning"] },
    { test: /(crédito|credit)/, words: ["credit", "lending", "scoring"] },
    { test: /(mobile|onboarding)/, words: ["mobile", "ios", "android"] },
    { test: /(cloud|infraestructura|platform)/, words: ["cloud", "kubernetes", "aws"] },
  ];
  for (const b of buckets) if (b.test.test(d)) return b.words;
  return [];
}

export function explainMatchScore(
  candidate: EmpleadoResult,
  context: ExplainContext = {}
): MatchExplanation {
  const totalScore = Math.round(candidate.score * 100);
  const factors: ScoreFactor[] = [];
  const warnings: string[] = [];

  // ── Factor 1 · Skills match against role/domain (max 30) ────────────────────
  const roleKeywords = context.roleName ? (ROLE_KEYWORDS[context.roleName] ?? []) : [];
  const domainKeywords = context.projectDomain ? inferDomainKeywords(context.projectDomain) : [];
  const allKeywords = Array.from(new Set([...roleKeywords, ...domainKeywords]));

  const matchedSkills = allKeywords.length > 0 ? findMatchingSkills(candidate, allKeywords) : [];
  const skillsRatio = allKeywords.length > 0
    ? Math.min(1, matchedSkills.length / Math.max(2, allKeywords.length / 2))
    : Math.min(1, candidate.habilidades.length / 8);

  factors.push({
    label: "Skills relevantes",
    detail: matchedSkills.length > 0
      ? `Coincide en ${matchedSkills.length} skills clave: ${matchedSkills.slice(0, 4).join(", ")}${matchedSkills.length > 4 ? "…" : ""}.`
      : `Tiene ${candidate.habilidades.length} skills declaradas, ninguna coincidencia textual fuerte con el rol/dominio.`,
    contribution: Math.round(skillsRatio * 30),
    maxContribution: 30,
    category: "skills",
  });

  // ── Factor 2 · Trust Score (max 25) ─────────────────────────────────────────
  if (candidate.trust_score) {
    const trustPoints = Math.round((candidate.trust_score.overall / 100) * 25);
    factors.push({
      label: `Trust Score · ${candidate.trust_score.tier}`,
      detail: `Manager ${candidate.trust_score.breakdown.manager}, EDI ${candidate.trust_score.breakdown.edi}, Peers ${candidate.trust_score.breakdown.peers}.`,
      contribution: trustPoints,
      maxContribution: 25,
      category: "trust",
    });
  } else {
    factors.push({
      label: "Trust Score · sin datos",
      detail: "Sin Trust Score calculado — usando promedio del banco como base.",
      contribution: 14,
      maxContribution: 25,
      category: "trust",
    });
  }

  // ── Factor 3 · Availability (max 12, can be negative) ──────────────────────
  const availStatus = candidate.disponibilidad;
  if (availStatus) {
    const bonus = AVAIL_BONUS[availStatus] ?? 0;
    let detail = "";
    switch (availStatus) {
      case "disponible":
        detail = "Disponible al 100% — puede empezar inmediatamente."; break;
      case "parcial":
        detail = `Disponibilidad parcial (50%)${candidate.proyecto_asignado ? ` — actualmente en ${candidate.proyecto_asignado}` : ""}.`; break;
      case "asignado":
        detail = `100% asignado a otro proyecto${candidate.proyecto_asignado ? ` (${candidate.proyecto_asignado})` : ""} — requeriría reasignación.`;
        warnings.push("No está disponible — verificar con su manager actual.");
        break;
      case "vacaciones":
        detail = `En vacaciones${candidate.disponibilidad_hasta ? ` hasta ${candidate.disponibilidad_hasta}` : ""}.`;
        warnings.push("Está en vacaciones — start date debe contemplarlo.");
        break;
      case "maternidad":
        detail = `En maternidad${candidate.disponibilidad_hasta ? ` hasta ${candidate.disponibilidad_hasta}` : ""}.`;
        warnings.push("En licencia de maternidad — no disponible en el corto plazo.");
        break;
      case "licencia":
        detail = `En licencia${candidate.disponibilidad_hasta ? ` hasta ${candidate.disponibilidad_hasta}` : ""}.`;
        break;
      case "descanso_medico":
        detail = `En descanso médico — fecha de retorno no garantizada.`;
        warnings.push("En descanso médico — sin fecha de retorno confirmada.");
        break;
    }
    factors.push({
      label: `Disponibilidad · ${availStatus}`,
      detail,
      contribution: bonus,
      maxContribution: 12,
      category: "availability",
    });
  }

  // ── Factor 4 · Domain experience via past projects (max 15) ─────────────────
  if (context.projectDomain && candidate.proyectos.length > 0) {
    const domainLower = context.projectDomain.toLowerCase();
    const matched = candidate.proyectos.filter(
      p => p.dominio.toLowerCase() === domainLower || domainLower.includes(p.dominio.toLowerCase())
    );
    if (matched.length > 0) {
      factors.push({
        label: "Experiencia previa en el dominio",
        detail: `Trabajó en ${matched.length} proyecto${matched.length > 1 ? "s" : ""} de ${context.projectDomain}: ${matched.slice(0, 2).map(p => p.nombre).join(", ")}.`,
        contribution: Math.min(15, 6 + matched.length * 4),
        maxContribution: 15,
        category: "domain",
      });
    } else if (candidate.proyectos.length > 0) {
      factors.push({
        label: "Experiencia previa",
        detail: `Trabajó en ${candidate.proyectos.length} proyecto${candidate.proyectos.length > 1 ? "s" : ""}, ninguno en ${context.projectDomain} específicamente.`,
        contribution: 6,
        maxContribution: 15,
        category: "domain",
      });
    }
  } else if (candidate.proyectos.length > 0) {
    factors.push({
      label: "Trayectoria de proyectos",
      detail: `${candidate.proyectos.length} proyecto${candidate.proyectos.length > 1 ? "s" : ""} en su historial.`,
      contribution: Math.min(10, candidate.proyectos.length * 3),
      maxContribution: 15,
      category: "domain",
    });
  }

  // ── Factor 5 · Collaboration with team (max 10) ─────────────────────────────
  if (context.teamMemberIds && context.teamMemberIds.length > 1) {
    const teamSet = new Set(context.teamMemberIds);
    teamSet.delete(candidate.id);
    const sharedColabs = candidate.colaboradores.filter(c => teamSet.has(c.id));
    if (sharedColabs.length > 0) {
      const avgWeight = sharedColabs.reduce((s, c) => s + c.weight, 0) / sharedColabs.length;
      factors.push({
        label: "Colaboraciones con el equipo",
        detail: `Trabajó previamente con ${sharedColabs.length} miembro${sharedColabs.length > 1 ? "s" : ""} del equipo (peso promedio ${(avgWeight * 100).toFixed(0)}%).`,
        contribution: Math.min(10, sharedColabs.length * 4),
        maxContribution: 10,
        category: "collaboration",
      });
    }
  } else if (candidate.colaboradores.length >= 5) {
    factors.push({
      label: "Red de colaboraciones",
      detail: `${candidate.colaboradores.length} colaboradores conocidos en el banco — buena conectividad organizacional.`,
      contribution: 5,
      maxContribution: 10,
      category: "collaboration",
    });
  }

  // ── Factor 6 · EDI rating (max 8) ───────────────────────────────────────────
  if (candidate.edi) {
    const r = candidate.edi.rating;
    const points = r === 1 ? 8 : r === 2 ? 5 : 1;
    factors.push({
      label: `EDI ${candidate.edi.año}`,
      detail: r === 1
        ? "Última evaluación: Supera expectativas."
        : r === 2
          ? "Última evaluación: Cumple expectativas."
          : "Última evaluación: Necesita mejorar.",
      contribution: points,
      maxContribution: 8,
      category: "edi",
    });
    if (r === 3) {
      warnings.push("EDI más reciente indica que necesita mejorar — revisar con manager.");
    }
  }

  // Sort by absolute contribution desc
  factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Build summary
  const top = factors.filter(f => f.contribution > 0).slice(0, 2);
  const summary = top.length > 0
    ? `${candidate.nombre.split(" ")[0]} obtiene ${totalScore}% principalmente por: ${top.map(f => f.label.toLowerCase()).join(" y ")}.`
    : `${candidate.nombre.split(" ")[0]} obtiene ${totalScore}% según la composición global de su perfil.`;

  return { totalScore, factors, summary, warnings };
}
