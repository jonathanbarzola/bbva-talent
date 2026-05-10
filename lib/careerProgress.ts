// ── Career Progress — heurística auditable de avance hacia el nivel siguiente
//
// Compara al usuario actual contra el percentil 75 (top quartile) del nivel
// siguiente para detectar gaps técnicos, soft skills y mapearlos contra
// CampusBBVA + TechU + TheNinjaProject.
//
// Diseño deliberado en la línea de `lib/scoreExplain.ts` y `lib/trust-score.ts`:
// - Las heurísticas viven en este archivo, son auditables.
// - No hay caja negra — cada recomendación viene con su "por qué".
// - Se puede explicar a un manager o a un empleado de RR.HH. cómo se decidió.

import type { EmpleadoResult, Nivel, PeerComment } from "./types";
import { CAMPUS_BBVA_COURSES, type CampusCourse } from "./campus-bbva-mock";
import { TECHU_COURSES, type TechUCourse } from "./techu-mock";
import { NINJA_CERTIFICATIONS, type NinjaCertification } from "./ninja-project-mock";

// ── Promotion ladder ─────────────────────────────────────────────────────

const NIVEL_LADDER: Nivel[] = ["Analyst", "Associate", "Expert"];

export function nextNivel(current: Nivel): Nivel | null {
  const idx = NIVEL_LADDER.indexOf(current);
  if (idx < 0 || idx >= NIVEL_LADDER.length - 1) return null;
  return NIVEL_LADDER[idx + 1];
}

// ── Output types ─────────────────────────────────────────────────────────

export type CourseSource = "campus-bbva" | "techu";

export interface CourseRec {
  id: string;
  source: CourseSource;
  nombre: string;
  provider?: string;
  duracion_horas: number;
  dificultad: Nivel;
  skills: string[];
  descripcion: string;
  /** Por qué se recomienda este curso al usuario — evidencia */
  why: string;
  /** Cuántas skills del gap del usuario cubre este curso */
  coverage: number;
}

export interface CertRec {
  id: string;
  source: "ninja-project";
  nombre: string;
  provider: string;
  costo_bt: number;
  prep_horas: number;
  dificultad: Nivel;
  trust_score_boost: number;
  skills: string[];
  descripcion: string;
  why: string;
  coverage: number;
  /** True si el usuario tiene B-Tokens suficientes para inscribirse */
  affordable: boolean;
}

export interface SkillGap {
  skill: string;
  /** 0..1 — score del user (0 si no la tiene) */
  currentScore: number;
  /** 0..1 — p75 del nivel siguiente */
  targetScore: number;
  /** target - current (positivo = gap) */
  delta: number;
  /** True si la skill está completamente ausente del perfil del user */
  isMissing: boolean;
  /** Cuántos % del cohorte target tienen esta skill */
  cohortCoverage: number;
}

export type SoftSkillBucket =
  | "communication"
  | "ownership"
  | "mentoring"
  | "systems-design"
  | "stakeholder-mgmt";

export interface SoftSkillInsight {
  bucket: SoftSkillBucket;
  label: string;
  /** True si los peer/manager comments del user evidencian este skill */
  confirmed: boolean;
  /** True si este skill es esperado para el nivel TARGET y el user no lo tiene confirmado */
  isGap: boolean;
  /** Phrases extraídas de los comments — solo si confirmed */
  evidence: string[];
  /** Acción concreta sugerida — solo si isGap */
  action?: string;
}

export interface CareerFactor {
  label: string;
  category: "skills" | "trust" | "edi" | "tenure" | "mentorship" | "soft";
  status: "ahead" | "on-track" | "below";
  /** Valor del user en la unidad correspondiente */
  current: number;
  /** Valor target (p75 del nivel siguiente) */
  target: number;
  unit: string;
  detail: string;
  /** Aporte 0..maxContribution al overallProgress */
  contribution: number;
  maxContribution: number;
}

export interface CareerProgress {
  user: {
    id: string;
    nombre: string;
    nivel: Nivel;
  };
  /** True si el user ya está en el tier más alto (Expert) — modo "stay sharp" */
  isTopTier: boolean;
  /** Nivel objetivo o null si ya es top */
  targetNivel: Nivel | null;
  /** Tamaño del cohorte target (cuántos empleados tienen ese nivel) */
  cohortSize: number;

  /** 0..100 — estimación global de avance al siguiente nivel */
  overallProgress: number;

  factors: CareerFactor[];

  /** Top skill gaps ordenados por delta desc (más urgentes primero) */
  skillGaps: SkillGap[];

  softSkills: SoftSkillInsight[];

  /** Top 5 cursos priorizados (CampusBBVA + TechU mezclados) */
  topCourses: CourseRec[];
  /** Top 3 certs priorizadas */
  topCertifications: CertRec[];
}

// ── Soft skill heuristic dictionaries ────────────────────────────────────

const SOFT_SKILL_KEYWORDS: Record<SoftSkillBucket, { label: string; keywords: RegExp; expectedAtTarget: Record<Nivel, boolean> }> = {
  communication: {
    label: "Comunicación técnica",
    keywords: /\b(comunic|claridad|explica|comparte|presenta|articul|expone)\w*/i,
    expectedAtTarget: { Analyst: false, Associate: true, Expert: true },
  },
  ownership: {
    label: "Ownership e iniciativa",
    keywords: /\b(ownership|iniciativ|lidera|drive|conduc|toma decisi|prop[óo]ne)\w*/i,
    expectedAtTarget: { Analyst: false, Associate: true, Expert: true },
  },
  mentoring: {
    label: "Mentoring de pares y juniors",
    keywords: /\b(mentor|ayud|ense[ñn]|gu[íi]a|onboarde|pair|cross-train|junior|apoy)\w*/i,
    expectedAtTarget: { Analyst: false, Associate: false, Expert: true },
  },
  "systems-design": {
    label: "Arquitectura y diseño de sistemas",
    keywords: /\b(arquitect|dise[ñn]o|patterns?|patrones|trade.?off|escalab|complej|distribu)\w*/i,
    expectedAtTarget: { Analyst: false, Associate: false, Expert: true },
  },
  "stakeholder-mgmt": {
    label: "Gestión de stakeholders y negocio",
    keywords: /\b(stakeholder|negoci|presenta|product owner|cliente|managers?)\w*/i,
    expectedAtTarget: { Analyst: false, Associate: false, Expert: true },
  },
};

const SOFT_SKILL_ACTION: Record<SoftSkillBucket, string> = {
  communication:
    "Inscribite en 'Communication for Software Engineers' (CampusBBVA · LinkedIn Learning · 3h). Practica escribiendo 1 RFC por sprint y pidiendo feedback explícito a tu manager.",
  ownership:
    "Pedí a tu manager liderar al menos 1 deliverable end-to-end este Q. Propon mejoras a ítems del backlog en lugar de esperar tickets asignados.",
  mentoring:
    "Postulate como mentor en Networking & Mentores. Comenzá con 1 mentee Analyst — el cupo BBVA es 2/2 max. Esto suma B-Tokens y aparece en tu próximo EDI.",
  "systems-design":
    "Apuntate al 'Cells Migration Workshop' en TechU (Expert level). Pedí participar en design reviews de tu squad — incluso si no te invitan, asistí como observer.",
  "stakeholder-mgmt":
    "Acompañá a tu manager a la próxima reunión con Product Owner. Ofrecete a presentar la sección técnica de la próxima demo de squad.",
};

// ── Heuristic helpers ────────────────────────────────────────────────────

function percentile<T>(values: T[], p: number, accessor: (v: T) => number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].map(accessor).sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function extractEvidence(comments: PeerComment[], managerComment: string | undefined, re: RegExp): string[] {
  const out: string[] = [];
  for (const c of comments) {
    if (re.test(c.comentario)) {
      // Trim long comments to avoid bloating the UI
      const truncated = c.comentario.length > 140 ? c.comentario.slice(0, 138) + "…" : c.comentario;
      out.push(`${c.autor_nombre}: "${truncated}"`);
    }
  }
  if (managerComment && re.test(managerComment)) {
    const truncated = managerComment.length > 140 ? managerComment.slice(0, 138) + "…" : managerComment;
    out.push(`Manager: "${truncated}"`);
  }
  return out;
}

function statusFor(current: number, target: number, lowerIsBetter = false): CareerFactor["status"] {
  if (target === 0) return "on-track";
  const ratio = lowerIsBetter ? target / Math.max(current, 0.01) : current / Math.max(target, 0.01);
  if (ratio >= 1.05) return "ahead";
  if (ratio >= 0.85) return "on-track";
  return "below";
}

// ── Main analysis ────────────────────────────────────────────────────────

export function analyzeCareerProgress(
  employee: EmpleadoResult,
  pool: EmpleadoResult[],
): CareerProgress {
  const target = nextNivel(employee.nivel);
  const isTopTier = target === null;

  // Cohort = all employees at target level (or same level if top tier — we
  // compare against peers to identify what to maintain).
  const cohortNivel: Nivel = target ?? employee.nivel;
  const cohort = pool.filter(p => p.nivel === cohortNivel && p.id !== employee.id);

  // ── Skill gap detection ─────────────────────────────────────────────────
  const cohortSkillCounts = new Map<string, { sum: number; count: number; total: number }>();
  for (const c of cohort) {
    const seen = new Set<string>();
    for (const h of c.habilidades) {
      const key = h.nombre;
      if (!cohortSkillCounts.has(key)) {
        cohortSkillCounts.set(key, { sum: 0, count: 0, total: cohort.length });
      }
      const entry = cohortSkillCounts.get(key)!;
      entry.sum += h.score;
      entry.count += 1;
      seen.add(key);
    }
  }

  const userSkills = new Map(employee.habilidades.map(h => [h.nombre, h.score]));

  // For each skill the cohort has, check user's gap
  const skillGaps: SkillGap[] = [];
  for (const [skillName, stats] of cohortSkillCounts.entries()) {
    const cohortCoverage = stats.count / stats.total;
    // Only consider skills that >= 30% of the cohort has — otherwise it's a niche
    if (cohortCoverage < 0.3) continue;

    const targetScore = stats.sum / stats.count;
    const currentScore = userSkills.get(skillName) ?? 0;
    const delta = targetScore - currentScore;

    if (delta > 0.05) { // meaningful gap
      skillGaps.push({
        skill: skillName,
        currentScore,
        targetScore,
        delta,
        isMissing: currentScore === 0,
        cohortCoverage,
      });
    }
  }

  // Sort: missing first, then by delta desc
  skillGaps.sort((a, b) => {
    if (a.isMissing !== b.isMissing) return a.isMissing ? -1 : 1;
    return b.delta - a.delta;
  });

  // ── Soft skill detection from EDI ───────────────────────────────────────
  const softSkills: SoftSkillInsight[] = [];
  const peerComments = employee.edi?.peer_comments ?? [];
  const managerComment = employee.edi?.manager_comment;

  for (const [bucket, def] of Object.entries(SOFT_SKILL_KEYWORDS) as [SoftSkillBucket, typeof SOFT_SKILL_KEYWORDS[SoftSkillBucket]][]) {
    const evidence = extractEvidence(peerComments, managerComment, def.keywords);
    const confirmed = evidence.length > 0;
    const expectedAtTarget = def.expectedAtTarget[cohortNivel];
    const isGap = expectedAtTarget && !confirmed;

    softSkills.push({
      bucket,
      label: def.label,
      confirmed,
      isGap,
      evidence: evidence.slice(0, 2), // cap at 2 for UI
      action: isGap ? SOFT_SKILL_ACTION[bucket] : undefined,
    });
  }

  // ── Career factors (auditable scoring) ──────────────────────────────────
  const factors: CareerFactor[] = [];

  // Skills coverage (max 30 pts)
  const skillsCovered = Math.max(0, cohortSkillCounts.size - skillGaps.length);
  const skillsTotal = cohortSkillCounts.size;
  const skillsRatio = skillsTotal > 0 ? skillsCovered / skillsTotal : 1;
  const skillsContribution = Math.round(skillsRatio * 30);
  factors.push({
    label: "Cobertura de skills del cohorte",
    category: "skills",
    status: statusFor(skillsCovered, skillsTotal * 0.85),
    current: skillsCovered,
    target: Math.round(skillsTotal * 0.85),
    unit: "skills",
    detail: skillsTotal === 0
      ? "Sin cohorte de comparación — perfil único."
      : `Cubris ${skillsCovered} de ${skillsTotal} skills frecuentes en ${cohortNivel}s. Te faltan ${skillGaps.length}.`,
    contribution: skillsContribution,
    maxContribution: 30,
  });

  // Trust Score (max 25 pts)
  const userTrust = employee.trust_score?.overall ?? 0;
  const cohortTrustP75 = percentile(cohort.filter(c => c.trust_score), 75, c => c.trust_score?.overall ?? 0);
  const trustRatio = cohortTrustP75 > 0 ? Math.min(1, userTrust / cohortTrustP75) : 0.7;
  const trustContribution = Math.round(trustRatio * 25);
  factors.push({
    label: "Trust Score vs p75 del nivel siguiente",
    category: "trust",
    status: statusFor(userTrust, cohortTrustP75),
    current: userTrust,
    target: Math.round(cohortTrustP75),
    unit: "/100",
    detail: cohortTrustP75 === 0
      ? "Cohorte sin Trust Score — comparación no disponible."
      : `Tu Trust Score: ${userTrust}/100. P75 del cohorte: ${Math.round(cohortTrustP75)}/100.`,
    contribution: trustContribution,
    maxContribution: 25,
  });

  // EDI rating (max 15 pts) — 1 = best, 3 = worst, so lower is better
  const userEDI = employee.edi?.rating ?? 2;
  const ediPoints = userEDI === 1 ? 15 : userEDI === 2 ? 9 : 3;
  factors.push({
    label: `EDI ${employee.edi?.año ?? "—"}`,
    category: "edi",
    status: userEDI === 1 ? "ahead" : userEDI === 2 ? "on-track" : "below",
    current: userEDI,
    target: 1,
    unit: "rating",
    detail: userEDI === 1
      ? "Última evaluación: Supera expectativas. Ratificación clara para promoción."
      : userEDI === 2
        ? "Última evaluación: Cumple expectativas. Foco en factores diferenciadores para destacar."
        : "Última evaluación: Necesita mejorar. Revisar plan con manager antes de aspirar a promoción.",
    contribution: ediPoints,
    maxContribution: 15,
  });

  // Tenure (max 10 pts)
  const userTenure = employee.años_empresa;
  const cohortTenureP75 = percentile(cohort, 75, c => c.años_empresa);
  const tenureRatio = cohortTenureP75 > 0 ? Math.min(1, userTenure / cohortTenureP75) : 0.7;
  const tenureContribution = Math.round(tenureRatio * 10);
  factors.push({
    label: "Tenure en BBVA",
    category: "tenure",
    status: statusFor(userTenure, cohortTenureP75),
    current: userTenure,
    target: Math.round(cohortTenureP75),
    unit: "años",
    detail: `${userTenure} años · p75 del nivel siguiente: ${Math.round(cohortTenureP75)} años.`,
    contribution: tenureContribution,
    maxContribution: 10,
  });

  // Mentorship (max 10 pts) — only matters at Associate→Expert
  const cohortMentorRate = cohort.length > 0
    ? cohort.filter(c => c.es_mentor).length / cohort.length
    : 0;
  const userIsMentor = employee.es_mentor;
  const expectsMentorship = cohortNivel === "Expert"; // mentoring expected for Experts
  const mentorContribution = !expectsMentorship
    ? 10 // not gating
    : userIsMentor ? 10 : 4;
  factors.push({
    label: "Mentoring activo",
    category: "mentorship",
    status: !expectsMentorship ? "on-track" : userIsMentor ? "ahead" : "below",
    current: userIsMentor ? 1 : 0,
    target: expectsMentorship ? 1 : 0,
    unit: "boolean",
    detail: !expectsMentorship
      ? `Para ${cohortNivel}, el mentoring no es requisito formal todavía.`
      : userIsMentor
        ? `Sos mentor activo. ${Math.round(cohortMentorRate * 100)}% del cohorte ${cohortNivel} también lo es.`
        : `${Math.round(cohortMentorRate * 100)}% del cohorte ${cohortNivel} es mentor activo. Sumarte a Networking & Mentores acelera la promoción.`,
    contribution: mentorContribution,
    maxContribution: 10,
  });

  // Soft skills (max 10 pts)
  const softGapsCount = softSkills.filter(s => s.isGap).length;
  const softExpectedCount = softSkills.filter(s => SOFT_SKILL_KEYWORDS[s.bucket].expectedAtTarget[cohortNivel]).length;
  const softCoveredCount = softExpectedCount - softGapsCount;
  const softRatio = softExpectedCount > 0 ? softCoveredCount / softExpectedCount : 1;
  const softContribution = Math.round(softRatio * 10);
  factors.push({
    label: "Soft skills evidenciados en EDI",
    category: "soft",
    status: statusFor(softCoveredCount, softExpectedCount),
    current: softCoveredCount,
    target: softExpectedCount,
    unit: "skills",
    detail: softExpectedCount === 0
      ? "Sin soft skills críticos para este nivel."
      : `${softCoveredCount} de ${softExpectedCount} soft skills esperados están confirmados en tus peer/manager comments.`,
    contribution: softContribution,
    maxContribution: 10,
  });

  // Overall progress = sum of contributions / sum of max
  const totalContrib = factors.reduce((s, f) => s + f.contribution, 0);
  const totalMax = factors.reduce((s, f) => s + f.maxContribution, 0);
  const overallProgress = Math.round((totalContrib / totalMax) * 100);

  // ── Map gaps to courses + certs ─────────────────────────────────────────
  const gapSkillsLower = new Set(skillGaps.map(g => g.skill.toLowerCase()));

  // Score each course by how many of the user's gap skills it covers
  function scoreCourse(courseSkills: string[]): { coverage: number; matched: string[] } {
    const matched: string[] = [];
    for (const cs of courseSkills) {
      for (const gs of gapSkillsLower) {
        if (cs.includes(gs) || gs.includes(cs)) {
          matched.push(cs);
          break;
        }
      }
    }
    return { coverage: matched.length, matched };
  }

  const wallet = employee.b_tokens?.balance ?? 0;

  // ── Course recommendations ──────────────────────────────────────────────
  const courseRecs: CourseRec[] = [];

  // CampusBBVA — match by skills
  for (const c of CAMPUS_BBVA_COURSES) {
    const { coverage, matched } = scoreCourse(c.skills);
    if (coverage === 0) continue;
    courseRecs.push({
      id: c.id,
      source: "campus-bbva",
      nombre: c.nombre,
      provider: c.provider,
      duracion_horas: c.duracion_horas,
      dificultad: c.dificultad,
      skills: c.skills,
      descripcion: c.descripcion,
      why: matched.length === 1
        ? `Cubre tu gap en ${matched[0]}.`
        : `Cubre ${matched.length} de tus gaps: ${matched.slice(0, 3).join(", ")}.`,
      coverage,
    });
  }

  // TechU — siempre incluir si el user trabaja en squads que requieren proprietary
  for (const c of TECHU_COURSES) {
    const { coverage, matched } = scoreCourse(c.skills);
    if (coverage === 0) continue;
    // Boost TechU for proprietary tech because there's NO alternative
    const adjustedCoverage = c.tech_type === "proprietary" ? coverage + 0.5 : coverage;
    courseRecs.push({
      id: c.id,
      source: "techu",
      nombre: c.nombre,
      provider: c.tech_type === "proprietary" ? "BBVA TechU" : "BBVA TechU · Legacy",
      duracion_horas: c.duracion_horas,
      dificultad: c.dificultad,
      skills: c.skills,
      descripcion: c.descripcion,
      why: c.tech_type === "proprietary"
        ? `Tecnología propietaria BBVA — solo TechU enseña esto. Cubre: ${matched.slice(0, 3).join(", ")}.`
        : `Cubre ${matched.length} de tus gaps en stack legacy: ${matched.slice(0, 3).join(", ")}.`,
      coverage: adjustedCoverage,
    });
  }

  // Sort by coverage desc, then by duration asc (shorter first if tied)
  courseRecs.sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    return a.duracion_horas - b.duracion_horas;
  });

  // ── Cert recommendations ────────────────────────────────────────────────
  const certRecs: CertRec[] = [];
  for (const c of NINJA_CERTIFICATIONS) {
    const { coverage, matched } = scoreCourse(c.skills);
    if (coverage === 0) continue;
    certRecs.push({
      id: c.id,
      source: "ninja-project",
      nombre: c.nombre,
      provider: c.provider,
      costo_bt: c.costo_bt,
      prep_horas: c.prep_horas,
      dificultad: c.dificultad,
      trust_score_boost: c.trust_score_boost,
      skills: c.skills,
      descripcion: c.descripcion,
      why: matched.length === 1
        ? `Valida tu skill en ${matched[0]} y suma +${c.trust_score_boost} al Trust Score.`
        : `Valida ${matched.slice(0, 3).join(", ")} y suma +${c.trust_score_boost} al Trust Score.`,
      coverage,
      affordable: wallet >= c.costo_bt,
    });
  }

  // Sort by: dificultad relevant to target → trust_score_boost desc → coverage desc
  certRecs.sort((a, b) => {
    // Prefer certs at the target level (or below)
    const aRelevant = a.dificultad === cohortNivel ? 0 : a.dificultad === "Expert" && cohortNivel === "Associate" ? 1 : 2;
    const bRelevant = b.dificultad === cohortNivel ? 0 : b.dificultad === "Expert" && cohortNivel === "Associate" ? 1 : 2;
    if (aRelevant !== bRelevant) return aRelevant - bRelevant;
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    return b.trust_score_boost - a.trust_score_boost;
  });

  return {
    user: {
      id: employee.id,
      nombre: employee.nombre,
      nivel: employee.nivel,
    },
    isTopTier,
    targetNivel: target,
    cohortSize: cohort.length,
    overallProgress,
    factors,
    skillGaps: skillGaps.slice(0, 8), // top 8
    softSkills,
    topCourses: courseRecs.slice(0, 5),
    topCertifications: certRecs.slice(0, 3),
  };
}
