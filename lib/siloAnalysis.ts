import {
  TECH_CATEGORIES,
  WORKFORCE_DATA,
  type TechCategory,
  type TechWorkforce,
  effectiveAvailable,
  demandSatisfaction,
} from "./workforce-stats";

export type SiloSeverity = "critical" | "high" | "medium" | "low";

export type SiloRiskKind =
  | "bus-factor"          // Pocas personas en una tech crítica
  | "succession"          // Alta concentración Senior+Staff sin pipeline Junior
  | "tenure-concentration"// Tenure promedio alto → riesgo retiro
  | "no-pipeline"         // Sin Juniors, sin formación de futuros expertos
  | "demand-supply"       // Demanda > supply (déficit operacional)
  | "low-mentorship";     // Pocos mentores → conocimiento no se transmite

export interface SiloRiskFactor {
  kind: SiloRiskKind;
  severity: SiloSeverity;
  detail: string;
}

export interface SiloRisk {
  techId: string;
  category: TechCategory;
  workforce: TechWorkforce;
  /** Severidad GLOBAL de esta tech — el peor factor */
  overallSeverity: SiloSeverity;
  factors: SiloRiskFactor[];
  /** Sugerencias accionables para managers/staffers */
  aiSuggestions: string[];
}

const SEVERITY_RANK: Record<SiloSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function worstSeverity(factors: SiloRiskFactor[]): SiloSeverity {
  if (factors.length === 0) return "low";
  return factors
    .map(f => f.severity)
    .reduce((worst, s) => (SEVERITY_RANK[s] < SEVERITY_RANK[worst] ? s : worst), "low" as SiloSeverity);
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
}

// ── Reglas heurísticas ──────────────────────────────────────────────────

function checkBusFactor(w: TechWorkforce, cat: TechCategory): SiloRiskFactor | null {
  if (w.total === 0) return null;
  if (w.total <= 10 && cat.isCritical) {
    return {
      kind: "bus-factor",
      severity: "critical",
      detail: `Solo ${w.total} colaboradores en una tecnología crítica para operaciones del banco. Bus factor estimado: ${w.busFactor}/5.`,
    };
  }
  if (w.total <= 20 && cat.isCritical) {
    return {
      kind: "bus-factor",
      severity: "high",
      detail: `${w.total} colaboradores · bus factor ${w.busFactor}/5. Concentración de conocimiento en pocas personas.`,
    };
  }
  if (w.total <= 10 && !cat.isCritical) {
    return {
      kind: "bus-factor",
      severity: "high",
      detail: `Solo ${w.total} colaboradores. Difícil escalar o cubrir bajas no planificadas.`,
    };
  }
  return null;
}

function checkSuccession(w: TechWorkforce, _cat: TechCategory): SiloRiskFactor | null {
  if (w.total < 5) return null;
  const expertCount = w.seniority.expert;
  const expertRatio = expertCount / w.total;

  if (expertRatio >= 0.85 && w.total >= 10) {
    return {
      kind: "succession",
      severity: "high",
      detail: `${pct(expertCount, w.total)}% del staff es Expert (${expertCount}/${w.total}). Sin plan de sucesión formal, las salidas concentran conocimiento crítico.`,
    };
  }
  if (expertRatio >= 0.7 && w.total >= 10) {
    return {
      kind: "succession",
      severity: "medium",
      detail: `${pct(expertCount, w.total)}% Expert. Pipeline de promoción Analyst→Associate no está alimentando suficiente.`,
    };
  }
  return null;
}

function checkTenureConcentration(w: TechWorkforce, _cat: TechCategory): SiloRiskFactor | null {
  if (w.avgTenureYears >= 18) {
    return {
      kind: "tenure-concentration",
      severity: "critical",
      detail: `Tenure promedio: ${w.avgTenureYears} años en BBVA. Riesgo alto de retiros/jubilaciones en los próximos 5 años sin transferencia de conocimiento.`,
    };
  }
  if (w.avgTenureYears >= 12) {
    return {
      kind: "tenure-concentration",
      severity: "high",
      detail: `Tenure promedio: ${w.avgTenureYears} años. Conocimiento concentrado en cohortes con mucha antigüedad.`,
    };
  }
  return null;
}

function checkNoPipeline(w: TechWorkforce, _cat: TechCategory): SiloRiskFactor | null {
  if (w.total < 8) return null;
  if (w.seniority.analyst === 0) {
    return {
      kind: "no-pipeline",
      severity: "high",
      detail: `Cero Analysts en una tech con ${w.total} personas. Sin pipeline de formación interna — toda contratación nueva debe venir del mercado.`,
    };
  }
  const analystRatio = w.seniority.analyst / w.total;
  if (analystRatio < 0.05 && w.total >= 30) {
    return {
      kind: "no-pipeline",
      severity: "medium",
      detail: `Solo ${pct(w.seniority.analyst, w.total)}% Analysts (${w.seniority.analyst}/${w.total}). Pipeline débil para reemplazo natural.`,
    };
  }
  return null;
}

function checkDemandSupply(w: TechWorkforce, _cat: TechCategory): SiloRiskFactor | null {
  if (w.demandedHeadcount === 0) return null;
  const ratio = demandSatisfaction(w);
  const eff = effectiveAvailable(w);

  if (ratio < 0.3) {
    return {
      kind: "demand-supply",
      severity: "critical",
      detail: `Demanda: ${w.demandedHeadcount} headcount en ${w.openProjects} proyectos abiertos. Supply efectivo: ${eff}. Cobertura: ${pct(eff, w.demandedHeadcount)}%.`,
    };
  }
  if (ratio < 0.6) {
    return {
      kind: "demand-supply",
      severity: "high",
      detail: `Demanda ${w.demandedHeadcount} vs supply ${eff} · cobertura ${pct(eff, w.demandedHeadcount)}%. Múltiples proyectos competirán por las mismas personas.`,
    };
  }
  if (ratio < 0.85) {
    return {
      kind: "demand-supply",
      severity: "medium",
      detail: `Cobertura ${pct(eff, w.demandedHeadcount)}% (${eff}/${w.demandedHeadcount}). Algunos proyectos esperarán o aceptarán perfiles sub-óptimos.`,
    };
  }
  return null;
}

function checkMentorship(w: TechWorkforce, cat: TechCategory): SiloRiskFactor | null {
  if (w.total < 10) return null;
  const mentorRatio = w.mentors / w.total;

  if (cat.isCritical && mentorRatio < 0.05) {
    return {
      kind: "low-mentorship",
      severity: "high",
      detail: `Solo ${w.mentors} mentores activos (${pct(w.mentors, w.total)}%) en una tech crítica. Sin transmisión estructurada de conocimiento.`,
    };
  }
  if (mentorRatio < 0.04) {
    return {
      kind: "low-mentorship",
      severity: "medium",
      detail: `${w.mentors} mentores (${pct(w.mentors, w.total)}%). Recomendado: ≥8% del staff como mentores activos.`,
    };
  }
  return null;
}

// ── AI suggestions builder ───────────────────────────────────────────────

function buildAISuggestions(
  w: TechWorkforce,
  cat: TechCategory,
  factors: SiloRiskFactor[]
): string[] {
  const suggestions: string[] = [];
  const kinds = new Set(factors.map(f => f.kind));

  if (kinds.has("bus-factor") && cat.isCritical) {
    suggestions.push(
      `Iniciar plan de cross-training de ${cat.name}. Identificar 3-5 colaboradores de tecnologías adyacentes que puedan rotar 6 meses para diversificar el knowledge pool.`
    );
  }

  if (kinds.has("tenure-concentration")) {
    suggestions.push(
      `Documentar runbooks y decisiones arquitectónicas de ${cat.name} en formato accesible. Programar pair-coding sessions con cohortes Junior/Mid para transferencia activa.`
    );
    if (w.avgTenureYears >= 18) {
      suggestions.push(
        `Identificar a las 2-3 personas más senior con tenure >20 años y diseñar un plan de "shadow & succeed" antes de su posible retiro.`
      );
    }
  }

  if (kinds.has("no-pipeline")) {
    suggestions.push(
      `Habilitar tracks de formación Analyst en ${cat.name}: bootcamp interno + asignación gradual a proyectos no críticos. Meta: 8-12% del headcount sea Analyst en 12 meses.`
    );
  }

  if (kinds.has("demand-supply")) {
    const ratio = demandSatisfaction(w);
    if (ratio < 0.5) {
      suggestions.push(
        `Priorizar contratación externa de ${cat.name} (${w.demandedHeadcount - effectiveAvailable(w)} perfiles pendientes). Considerar partnerships con bootcamps o consultoras especializadas.`
      );
    } else {
      suggestions.push(
        `Re-priorizar el portfolio de ${w.openProjects} proyectos abiertos: alinear con People Ops cuáles esperan supply orgánico vs cuáles requieren contratación urgente.`
      );
    }
  }

  if (kinds.has("succession") && !kinds.has("no-pipeline")) {
    suggestions.push(
      `Promover Associate → Expert aceleradamente con ownership real en ${cat.name}. Evitar que los Experts actuales se conviertan en cuello de botella para code review y arquitectura.`
    );
  }

  if (kinds.has("low-mentorship")) {
    suggestions.push(
      `Designar formalmente nuevos mentores de ${cat.name} (objetivo: ${Math.max(8, Math.ceil(w.total * 0.08))} mentores). Asignar B-Tokens y tiempo protegido para mentoría como parte del rol.`
    );
  }

  // Always add a strategic note for emerging tech
  if (cat.type === "emerging" && factors.length > 0) {
    suggestions.push(
      `${cat.name} es talento escaso a nivel global. Considerar L&D agresivo: rotaciones desde Data/Backend, partnerships con universidades, y compensación competitiva específica.`
    );
  }

  // Always add a note for legacy tech in risk
  if (cat.type === "legacy" && factors.some(f => f.severity === "critical" || f.severity === "high")) {
    suggestions.push(
      `Evaluar plan de modernización a 3-5 años de ${cat.name}. Cualquier proyecto nuevo en esta tech debe venir con presupuesto de mentoría y documentación obligatoria.`
    );
  }

  return suggestions;
}

// ── Main analysis ────────────────────────────────────────────────────────

export function analyzeSilos(): SiloRisk[] {
  const risks: SiloRisk[] = [];

  for (const w of WORKFORCE_DATA) {
    const cat = TECH_CATEGORIES.find(c => c.id === w.techId);
    if (!cat) continue;

    const factors: SiloRiskFactor[] = [];
    const checks = [
      checkBusFactor(w, cat),
      checkSuccession(w, cat),
      checkTenureConcentration(w, cat),
      checkNoPipeline(w, cat),
      checkDemandSupply(w, cat),
      checkMentorship(w, cat),
    ];

    for (const f of checks) if (f) factors.push(f);

    if (factors.length === 0) continue;

    const overallSeverity = worstSeverity(factors);
    const aiSuggestions = buildAISuggestions(w, cat, factors);

    risks.push({
      techId: w.techId,
      category: cat,
      workforce: w,
      overallSeverity,
      factors: factors.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]),
      aiSuggestions,
    });
  }

  return risks.sort((a, b) => SEVERITY_RANK[a.overallSeverity] - SEVERITY_RANK[b.overallSeverity]);
}

// ── KPIs globales ────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalWorkforce: number;
  techsAtRisk: number;          // Cuántas techs tienen al menos 1 factor de riesgo
  criticalTechs: number;        // Techs con severity critical
  totalDemandedHeadcount: number;
  totalEffectiveAvailable: number;
  globalCoverageRatio: number;  // 0-1
  totalMentors: number;
  mentorRatio: number;          // mentors / total workforce
}

export function buildDashboardKPIs(risks: SiloRisk[] = analyzeSilos()): DashboardKPIs {
  const totalWorkforce = WORKFORCE_DATA.reduce((s, w) => s + w.total, 0);
  const totalDemandedHeadcount = WORKFORCE_DATA.reduce((s, w) => s + w.demandedHeadcount, 0);
  const totalEffectiveAvailable = WORKFORCE_DATA.reduce((s, w) => s + effectiveAvailable(w), 0);
  const totalMentors = WORKFORCE_DATA.reduce((s, w) => s + w.mentors, 0);

  return {
    totalWorkforce,
    techsAtRisk: risks.length,
    criticalTechs: risks.filter(r => r.overallSeverity === "critical").length,
    totalDemandedHeadcount,
    totalEffectiveAvailable,
    globalCoverageRatio: totalDemandedHeadcount === 0 ? 1 : totalEffectiveAvailable / totalDemandedHeadcount,
    totalMentors,
    mentorRatio: totalMentors / totalWorkforce,
  };
}
