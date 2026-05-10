import type { EmpleadoResult, Nivel, StaffingRecord, ExternalFeedback } from "./types";
import {
  avgFTE,
  avgProjectsPerQuarter,
  uniqueQuarters,
  uniqueProjects,
  avgRating,
} from "./staffing-mock";

// ── Output types ─────────────────────────────────────────────────────────

export type StaffingPattern =
  | "single-project"   // siempre 1.0 FTE en un solo proyecto
  | "split-50"         // típicamente dividido 50/50 entre 2 proyectos
  | "split-multi"      // dividido en 3+ proyectos (perfil muy demandado)
  | "no-history";      // sin historial — primera asignación

export type Confidence = "high" | "medium" | "low";

export type ReasoningWeight = "primary" | "supporting" | "constraint";

export interface ReasoningItem {
  label: string;
  detail: string;
  weight: ReasoningWeight;
}

export type RiskSeverity = "high" | "medium" | "low";

export interface RiskSignal {
  severity: RiskSeverity;
  message: string;
  /** Contexto adicional: proyecto, quarter, manager que dio el feedback */
  context?: string;
}

export interface HistoricalSummary {
  quartersAnalyzed: number;
  avgFte: number;
  avgProjectsPerQuarter: number;
  pattern: StaffingPattern;
  /** Lista de proyectos únicos en el historial */
  pastProjects: { codigo: string; nombre: string }[];
}

export interface StaffingRecommendation {
  /** FTE sugerido entre 0.25 y 1.0 (en pasos de 0.25 / 0.5) */
  recommendedFte: number;
  confidence: Confidence;
  reasoning: ReasoningItem[];
  historicalSummary: HistoricalSummary;
  riskSignals: RiskSignal[];
  /** FTEs alternativos válidos para que el manager elija */
  alternativeFtes: number[];
}

// ── Helpers ──────────────────────────────────────────────────────────────

function detectPattern(records: StaffingRecord[]): StaffingPattern {
  if (records.length === 0) return "no-history";
  const projsPerQ = avgProjectsPerQuarter(records);
  if (projsPerQ >= 2.5) return "split-multi";
  if (projsPerQ >= 1.5) return "split-50";
  return "single-project";
}

function clampToCommonFte(value: number): number {
  // Snap to common BBVA staffing fractions
  const buckets = [0.25, 0.4, 0.5, 0.6, 0.75, 1.0];
  let best = buckets[0];
  let bestDist = Infinity;
  for (const b of buckets) {
    const d = Math.abs(b - value);
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  }
  return best;
}

function fteForSeniority(nivel: Nivel, baseFte: number): number {
  // Analysts rarely split — they need focused mentorship and ramp-up
  if (nivel === "Analyst") {
    return baseFte >= 0.7 ? 1.0 : 0.5;
  }
  // Associate can split 50/50 max
  if (nivel === "Associate") {
    return baseFte >= 0.7 ? 1.0 : baseFte >= 0.4 ? 0.5 : 0.4;
  }
  // Expert (top tier IC) can go to any fraction
  return clampToCommonFte(baseFte);
}

// ── Main: recommendStaffing ─────────────────────────────────────────────

export function recommendStaffing(
  candidate: EmpleadoResult,
  /** Optional: project context for messaging */
  context?: { projectName?: string; projectDomain?: string }
): StaffingRecommendation {
  const records = candidate.staffing_historico ?? [];
  const feedback = candidate.feedback_externo ?? [];
  const isExternal = candidate.tipo_contrato === "externo";
  const nivel = candidate.nivel;

  const pattern = detectPattern(records);
  const avgFte = avgFTE(records);
  const projsPerQ = avgProjectsPerQuarter(records);
  const quarters = uniqueQuarters(records);
  const pastProjects = uniqueProjects(records);

  const reasoning: ReasoningItem[] = [];
  const riskSignals: RiskSignal[] = [];

  // ── 1. Sin historial ──
  if (pattern === "no-history") {
    const fte = fteForSeniority(nivel, 1.0);
    reasoning.push({
      label: "Sin historial previo en BBVA",
      detail: isExternal
        ? `Primer engagement de ${candidate.nombre} en BBVA${candidate.consultora ? ` (vía ${candidate.consultora})` : ""}. Sin patrones históricos para inferir un FTE óptimo, sugerimos 100% para reducir el riesgo de subutilización.`
        : `${candidate.nombre} no tiene historial de proyectos registrado en los últimos quarters. Sugerimos 100% como punto de partida.`,
      weight: "primary",
    });
    if (isExternal) {
      riskSignals.push({
        severity: "medium",
        message: `Externo sin antecedentes en BBVA — sin feedback de jefes anteriores ni patrón de FTE conocido. Considerar entrevista técnica adicional o ramp-up con mentor asignado.`,
      });
    }
    return {
      recommendedFte: fte,
      confidence: "low",
      reasoning,
      historicalSummary: {
        quartersAnalyzed: 0,
        avgFte: 0,
        avgProjectsPerQuarter: 0,
        pattern,
        pastProjects: [],
      },
      riskSignals,
      alternativeFtes: nivel === "Analyst" ? [1.0, 0.5] : [1.0, 0.75, 0.5],
    };
  }

  // ── 2. Pattern = single-project ──
  if (pattern === "single-project") {
    const fte = fteForSeniority(nivel, 1.0);
    reasoning.push({
      label: "Patrón histórico: dedicación completa",
      detail: `En los últimos ${quarters.length} quarter${quarters.length !== 1 ? "s" : ""}, ${candidate.nombre.split(" ")[0]} estuvo ${pattern === "single-project" ? "dedicado a un solo proyecto por Q" : ""} con FTE promedio ${(avgFte * 100).toFixed(0)}%. Mantener 100% en este nuevo proyecto.`,
      weight: "primary",
    });
    if (pastProjects.length > 0) {
      reasoning.push({
        label: `Proyectos previos (${pastProjects.length})`,
        detail: pastProjects.slice(0, 3).map(p => `${p.codigo} ${p.nombre}`).join(" · ") + (pastProjects.length > 3 ? ` · +${pastProjects.length - 3} más` : ""),
        weight: "supporting",
      });
    }
  }

  // ── 3. Pattern = split-50 ──
  if (pattern === "split-50") {
    const fte = fteForSeniority(nivel, 0.5);
    reasoning.push({
      label: "Patrón histórico: dividido entre 2 proyectos",
      detail: `Promedio de ${projsPerQ.toFixed(1)} proyectos por quarter en los últimos ${quarters.length} Qs (FTE prom. ${(avgFte * 100).toFixed(0)}%). ${candidate.nombre.split(" ")[0]} ya está acostumbrado a dividir su tiempo — staffearlo al ${(fte * 100).toFixed(0)}% es coherente con su track record.`,
      weight: "primary",
    });
    if (pastProjects.length > 0) {
      reasoning.push({
        label: `Proyectos en los que estuvo dividido`,
        detail: pastProjects.slice(0, 4).map(p => `${p.codigo} ${p.nombre}`).join(" · "),
        weight: "supporting",
      });
    }
    if (nivel === "Analyst") {
      reasoning.push({
        label: "Restricción por nivel (Analyst)",
        detail: "Los Analysts requieren foco para ramp-up. Aunque el historial sugiere split, recomendamos no dividir más allá de 50% para no comprometer el aprendizaje.",
        weight: "constraint",
      });
    }
  }

  // ── 4. Pattern = split-multi ──
  if (pattern === "split-multi") {
    const fte = fteForSeniority(nivel, 1 / projsPerQ);
    reasoning.push({
      label: "Patrón histórico: dividido en 3+ proyectos simultáneos",
      detail: `${candidate.nombre.split(" ")[0]} es un perfil altamente demandado: promedio de ${projsPerQ.toFixed(1)} proyectos por Q. Sugerimos un FTE bajo (${(fte * 100).toFixed(0)}%) y validar con su manager actual antes de comprometer.`,
      weight: "primary",
    });
    if (pastProjects.length > 0) {
      reasoning.push({
        label: `Proyectos donde colaboró fraccionalmente`,
        detail: pastProjects.slice(0, 5).map(p => `${p.codigo} ${p.nombre}`).join(" · "),
        weight: "supporting",
      });
    }
    if (nivel !== "Expert") {
      reasoning.push({
        label: "Constraint: solo Experts deben fracturarse en 3+",
        detail: `El nivel ${nivel} no debería estar dividido en más de 2 proyectos sin compromiso de calidad. Considerar promoción o re-priorización del portfolio.`,
        weight: "constraint",
      });
    }
  }

  // ── 5. External feedback signals ──
  if (isExternal) {
    if (feedback.length === 0 && records.length > 0) {
      riskSignals.push({
        severity: "low",
        message: "Externo con historial de staffing pero sin feedback formal cargado. Recomendamos pedir referencia a managers anteriores antes de asignar al proyecto.",
      });
    } else if (feedback.length > 0) {
      const rating = avgRating(feedback);
      const lastFeedback = feedback[feedback.length - 1];

      if (rating < 3) {
        riskSignals.push({
          severity: "high",
          message: `Feedback histórico negativo · rating promedio ${rating.toFixed(1)}/5. Re-staffearlo en un rol Senior puede impactar el roadmap del proyecto y la moral del squad.`,
          context: `Último feedback (${lastFeedback.proyecto_nombre}, ${lastFeedback.quarter}): "${lastFeedback.comentario}" — ${lastFeedback.manager_nombre}`,
        });
        reasoning.push({
          label: "⚠ Bandera roja: feedback histórico bajo",
          detail: `Considerá si este perfil es adecuado para este proyecto. Si sí, reducir el FTE para limitar exposición y asignar mentor sólido.`,
          weight: "constraint",
        });
      } else if (rating < 3.7) {
        riskSignals.push({
          severity: "medium",
          message: `Feedback mixto · rating promedio ${rating.toFixed(1)}/5. Curva de aprendizaje esperable de 4-8 semanas.`,
          context: `Último feedback (${lastFeedback.proyecto_nombre}): "${lastFeedback.comentario}" — ${lastFeedback.manager_nombre}`,
        });
      } else {
        reasoning.push({
          label: `Feedback histórico positivo (${rating.toFixed(1)}/5)`,
          detail: `${feedback.length} evaluación${feedback.length !== 1 ? "es" : ""} de jefes anteriores con buen rating promedio. Externo de bajo riesgo${candidate.consultora ? ` (${candidate.consultora})` : ""}.`,
          weight: "supporting",
        });
      }
    }
  }

  // Recompute final fte after applying constraints
  const baseFte = pattern === "single-project" ? 1.0 : pattern === "split-50" ? 0.5 : 1 / Math.max(projsPerQ, 2);
  const finalFte = fteForSeniority(nivel, baseFte);

  // Confidence: high if ≥3 quarters of consistent pattern, medium if 2, low otherwise
  let confidence: Confidence = "low";
  if (quarters.length >= 3) confidence = "high";
  else if (quarters.length >= 2) confidence = "medium";

  // Lower confidence if we have negative external feedback overriding history
  if (isExternal && feedback.length > 0 && avgRating(feedback) < 3) {
    confidence = "low";
  }

  // Alternatives — useful for the staffer to override
  const alternativeFtes = (
    nivel === "Analyst" ? [1.0, 0.5] :
    nivel === "Associate" ? [1.0, 0.5, 0.4] :
    [1.0, 0.75, 0.5, 0.4, 0.25]
  ).filter(f => f !== finalFte);

  return {
    recommendedFte: finalFte,
    confidence,
    reasoning,
    historicalSummary: {
      quartersAnalyzed: quarters.length,
      avgFte,
      avgProjectsPerQuarter: projsPerQ,
      pattern,
      pastProjects,
    },
    riskSignals,
    alternativeFtes,
  };
}

// ── Format helpers for UI ────────────────────────────────────────────────

export function fteToLabel(fte: number): string {
  if (fte >= 1.0) return "100%";
  return `${Math.round(fte * 100)}%`;
}

export function fteToBucketName(fte: number): string {
  if (fte >= 1.0) return "Full-time";
  if (fte >= 0.75) return "75%";
  if (fte >= 0.6) return "60%";
  if (fte >= 0.5) return "Half-time";
  if (fte >= 0.4) return "40%";
  if (fte >= 0.25) return "25%";
  return `${Math.round(fte * 100)}%`;
}

export function patternToLabel(p: StaffingPattern): string {
  switch (p) {
    case "single-project": return "Dedicación completa";
    case "split-50":       return "División 50/50";
    case "split-multi":    return "Multi-proyecto (3+)";
    case "no-history":     return "Sin historial";
  }
}
