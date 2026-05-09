import type {
  TeamCompositionResponse,
  SDAProject,
  EmpleadoResult,
  AvailabilityStatus,
} from "./types";

export type GapSeverity = "critical" | "high" | "medium" | "low";

export type GapCategory =
  | "coverage"
  | "availability"
  | "seniority"
  | "collaboration"
  | "trust"
  | "skills";

export interface Gap {
  id: string;
  severity: GapSeverity;
  category: GapCategory;
  title: string;
  detail: string;
  recommendation?: string;
}

const SEVERITY_RANK: Record<GapSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const RISKY_AVAILABILITY: AvailabilityStatus[] = [
  "asignado",
  "vacaciones",
  "maternidad",
  "licencia",
  "descanso_medico",
];

const JUNIOR_LEVELS = new Set(["Junior", "Mid"]);
const SENIOR_LEVELS = new Set(["Senior", "Staff"]);

function pickAssigned(
  candidates: EmpleadoResult[],
  quantity: number
): EmpleadoResult[] {
  return candidates.slice(0, quantity);
}

function formatDateOrFallback(d?: string): string {
  if (!d) return "fecha sin definir";
  return d;
}

export function analyzeGaps(
  result: TeamCompositionResponse,
  project?: SDAProject
): Gap[] {
  const gaps: Gap[] = [];

  // Build the "assigned team" — first N per role where N is the requested quantity
  const assignedTeam: EmpleadoResult[] = result.roles.flatMap(r =>
    pickAssigned(r.candidates, r.quantity)
  );

  // ── Rule 1 · Coverage gaps ─────────────────────────────────────────────────
  for (const role of result.roles) {
    const missing = role.quantity - role.candidates.length;
    if (missing > 0) {
      gaps.push({
        id: `coverage-${role.role}`,
        severity: missing >= 2 ? "critical" : "high",
        category: "coverage",
        title: `${role.role}: ${missing} cupo${missing > 1 ? "s" : ""} sin cubrir`,
        detail: `Se pidieron ${role.quantity} pero solo hay ${role.candidates.length} candidato${role.candidates.length === 1 ? "" : "s"} con match suficiente.`,
        recommendation:
          "Reforzar el pool ampliando la búsqueda de skills relacionadas o subiendo el threshold de match.",
      });
    }
  }

  // ── Rule 2 · Availability risk on assigned slots ───────────────────────────
  const riskyAssigned = assignedTeam.filter(
    c => c.disponibilidad && RISKY_AVAILABILITY.includes(c.disponibilidad)
  );

  if (riskyAssigned.length > 0) {
    const ratio = riskyAssigned.length / Math.max(1, assignedTeam.length);
    const severity: GapSeverity = ratio >= 0.5 ? "high" : "medium";

    const detailLines = riskyAssigned.slice(0, 3).map(c => {
      const status = c.disponibilidad ?? "sin estado";
      const until = formatDateOrFallback(c.disponibilidad_hasta);
      const label =
        status === "asignado"
          ? `asignado a ${c.proyecto_asignado ?? "otro proyecto"}`
          : `${status} hasta ${until}`;
      return `${c.nombre} — ${label}`;
    });

    gaps.push({
      id: "availability-risk",
      severity,
      category: "availability",
      title: `${riskyAssigned.length} de ${assignedTeam.length} con disponibilidad limitada`,
      detail: detailLines.join(" · "),
      recommendation:
        "Considerar las reservas o coordinar fecha de start con la disponibilidad real.",
    });
  }

  // ── Rule 3 · Seniority distribution ────────────────────────────────────────
  const juniorCount = assignedTeam.filter(c => JUNIOR_LEVELS.has(c.nivel)).length;
  const seniorCount = assignedTeam.filter(c => SENIOR_LEVELS.has(c.nivel)).length;
  const total = assignedTeam.length;

  if (total >= 3 && seniorCount === 0) {
    gaps.push({
      id: "seniority-no-senior",
      severity: "high",
      category: "seniority",
      title: "Equipo sin referente Senior/Staff",
      detail: `Los ${total} miembros asignados son Junior/Mid. Riesgo de ramp-up alto sin liderazgo técnico.`,
      recommendation:
        "Sumar al menos 1 Senior o Staff para acelerar onboarding y reducir riesgo técnico.",
    });
  } else if (total >= 4 && juniorCount / total >= 0.6 && seniorCount <= 1) {
    gaps.push({
      id: "seniority-imbalance",
      severity: "medium",
      category: "seniority",
      title: "Pirámide de seniority desbalanceada",
      detail: `${juniorCount}/${total} miembros son Junior/Mid y solo ${seniorCount} es Senior/Staff. Riesgo medio de ramp-up.`,
      recommendation:
        "Idealmente 30-40% Senior/Staff para distribuir mentoring y ownership.",
    });
  }

  // ── Rule 4 · Prior collaboration between members ───────────────────────────
  if (assignedTeam.length >= 2) {
    const ids = new Set(assignedTeam.map(c => c.id));
    let connections = 0;
    for (const member of assignedTeam) {
      for (const colab of member.colaboradores) {
        if (ids.has(colab.id)) connections++;
      }
    }
    // Each connection counted twice (A→B and B→A) — divide by 2 for unique pairs
    const uniquePairs = Math.floor(connections / 2);

    if (uniquePairs === 0 && assignedTeam.length >= 3) {
      gaps.push({
        id: "collaboration-none",
        severity: "medium",
        category: "collaboration",
        title: "Sin colaboraciones previas entre miembros",
        detail: "Ningún par del equipo asignado trabajó junto antes. Mayor tiempo de gel-up esperado.",
        recommendation:
          "Considerar reemplazar 1 candidato por uno que haya colaborado con el resto, si la skill match lo permite.",
      });
    } else if (uniquePairs > 0 && assignedTeam.length >= 3 && uniquePairs < assignedTeam.length / 2) {
      gaps.push({
        id: "collaboration-low",
        severity: "low",
        category: "collaboration",
        title: `Colaboración previa parcial — ${uniquePairs} par${uniquePairs > 1 ? "es" : ""} con historial`,
        detail: `Solo ${uniquePairs} de ${Math.floor((assignedTeam.length * (assignedTeam.length - 1)) / 2)} pares posibles trabajaron juntos antes.`,
      });
    }
  }

  // ── Rule 5 · Average Trust Score ───────────────────────────────────────────
  const withTrust = assignedTeam.filter(c => c.trust_score);
  if (withTrust.length >= 2) {
    const avgTrust =
      withTrust.reduce((sum, c) => sum + (c.trust_score?.overall ?? 0), 0) / withTrust.length;
    const bronzeCount = withTrust.filter(c => c.trust_score?.tier === "bronze").length;

    if (avgTrust < 60) {
      gaps.push({
        id: "trust-low-avg",
        severity: "medium",
        category: "trust",
        title: `Trust Score promedio bajo (${Math.round(avgTrust)}/100)`,
        detail: "El equipo asignado tiene un Trust Score promedio menor al recomendado (≥70).",
        recommendation:
          "Revisar EDI ratings recientes o sumar un perfil con Trust Score alto como referente.",
      });
    } else if (bronzeCount / withTrust.length >= 0.5) {
      gaps.push({
        id: "trust-bronze-heavy",
        severity: "low",
        category: "trust",
        title: `${bronzeCount} miembros en tier Bronze`,
        detail: "La mitad o más del equipo está en el tier más bajo de Trust Score.",
        recommendation:
          "Balancear con al menos un Gold o Platinum para confianza del manager.",
      });
    }
  }

  // ── Rule 6 · Skills heuristic from project name (lightweight NLP) ─────────
  if (project) {
    const teamSkills = new Set(
      assignedTeam.flatMap(c => c.habilidades.map(h => h.nombre.toLowerCase()))
    );
    const HINTS: Array<{ keywords: RegExp; skill: string; label: string }> = [
      { keywords: /(\bml\b|machine learning|ai|inteligencia)/i, skill: "machine learning", label: "Machine Learning" },
      { keywords: /(fraud|fraude|antifraud)/i, skill: "fraud detection", label: "Fraud Detection" },
      { keywords: /(payment|pagos|gateway)/i, skill: "payments", label: "Payments" },
      { keywords: /(security|seguridad|kyc|aml)/i, skill: "security", label: "Security" },
      { keywords: /(data|analytics|bigdata)/i, skill: "data engineering", label: "Data Engineering" },
      { keywords: /(blockchain|crypto|defi)/i, skill: "blockchain", label: "Blockchain" },
      { keywords: /(mobile|onboarding)/i, skill: "mobile", label: "Mobile" },
    ];

    for (const hint of HINTS) {
      if (hint.keywords.test(project.nombre) || hint.keywords.test(project.dominio)) {
        const has = Array.from(teamSkills).some(s => s.includes(hint.skill.split(" ")[0]));
        if (!has) {
          gaps.push({
            id: `skills-missing-${hint.skill}`,
            severity: "medium",
            category: "skills",
            title: `Sin cobertura aparente en "${hint.label}"`,
            detail: `El nombre/dominio del proyecto sugiere ${hint.label} pero ningún miembro asignado lo lista como skill.`,
            recommendation:
              "Verificar si esa skill es realmente requerida — si lo es, ampliar la búsqueda.",
          });
          break; // Solo levantar 1 skill-gap por proyecto para no spammear
        }
      }
    }
  }

  return gaps.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
