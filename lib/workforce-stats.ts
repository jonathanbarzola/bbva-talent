import { BBVA } from "./bbva-colors";

// ── Categorías de tecnología ─────────────────────────────────────────────

export type TechType = "legacy" | "proprietary" | "modern" | "emerging";

export interface TechCategory {
  id: string;
  name: string;
  description: string;
  type: TechType;
  color: string;
  /** Tecnología crítica para operaciones del banco — no puede caer */
  isCritical: boolean;
}

export const TECH_CATEGORIES: TechCategory[] = [
  // ── Legacy críticos del core bancario ──
  {
    id: "host",
    name: "HOST",
    description: "Mainframe z/OS · COBOL · JCL · core bancario transaccional",
    type: "legacy",
    color: "#fb923c",
    isCritical: true,
  },
  {
    id: "aso",
    name: "ASO",
    description: "Arquitectura de Servicios Orientada · middleware BBVA legacy",
    type: "legacy",
    color: "#fb923c",
    isCritical: true,
  },

  // ── Frameworks propietarios BBVA ──
  {
    id: "nacar",
    name: "NACAR",
    description: "Framework frontend propietario BBVA · banca digital web/mobile",
    type: "proprietary",
    color: BBVA.purple,
    isCritical: true,
  },
  {
    id: "apx",
    name: "APX",
    description: "Application Platform eXperience · plataforma de aplicaciones BBVA",
    type: "proprietary",
    color: BBVA.purple,
    isCritical: false,
  },
  {
    id: "cells",
    name: "Cells",
    description: "Plataforma de microservicios BBVA · arquitectura celular",
    type: "proprietary",
    color: BBVA.purple,
    isCritical: false,
  },

  // ── Stack moderno ──
  {
    id: "ai",
    name: "AI Engineering",
    description: "ML, LLMs, GenAI, vector databases · talento escaso global",
    type: "emerging",
    color: BBVA.lime,
    isCritical: false,
  },
  {
    id: "data",
    name: "Data Engineering",
    description: "Spark, Kafka, Airflow, BigQuery · pipelines de datos",
    type: "modern",
    color: BBVA.sereneBlue,
    isCritical: false,
  },
  {
    id: "mobile",
    name: "Mobile Development",
    description: "iOS Swift · Android Kotlin · React Native",
    type: "modern",
    color: BBVA.sereneBlue,
    isCritical: false,
  },
  {
    id: "frontend",
    name: "Frontend Web",
    description: "React, Angular, Vue, TypeScript · banca online",
    type: "modern",
    color: BBVA.sereneBlue,
    isCritical: false,
  },
  {
    id: "backend",
    name: "Backend Web",
    description: "Java/Spring, Node, Go, Python · APIs y servicios",
    type: "modern",
    color: BBVA.sereneBlue,
    isCritical: false,
  },
  {
    id: "devops",
    name: "DevOps & Cloud",
    description: "Kubernetes, Terraform, AWS, GCP · plataforma e infra",
    type: "modern",
    color: BBVA.sereneBlue,
    isCritical: false,
  },
  {
    id: "security",
    name: "Security Engineering",
    description: "PCI-DSS, OAuth, KYC, AML · cumplimiento regulatorio",
    type: "modern",
    color: BBVA.canary,
    isCritical: true,
  },
  {
    id: "ux",
    name: "UX & Product Design",
    description: "Figma, research, design systems · experiencia digital",
    type: "modern",
    color: BBVA.ice,
    isCritical: false,
  },
  {
    id: "scrum",
    name: "Scrum Masters",
    description: "SAFe, Agile coaching, facilitation · entrega ágil",
    type: "modern",
    color: BBVA.canary,
    isCritical: false,
  },
];

// ── Workforce por tecnología ─────────────────────────────────────────────

export interface TechWorkforce {
  techId: string;
  /** Cantidad total de colaboradores en esta tech */
  total: number;
  seniority: {
    junior: number;
    mid: number;
    senior: number;
    staff: number;
  };
  availability: {
    available: number;
    partial: number;
    assigned: number;
    onLeave: number; // vacaciones + maternidad + licencia + descanso médico
  };
  /** Años promedio en BBVA del staff de esta tech */
  avgTenureYears: number;
  /** Cantidad de mentores activos */
  mentors: number;
  /** Bus factor 1-5: cuántas personas son 'únicas' / indispensables (5 = saludable) */
  busFactor: number;
  /** Proyectos SDA abiertos que requieren esta tecnología */
  openProjects: number;
  /** Headcount total demandado en proyectos abiertos */
  demandedHeadcount: number;
}

/**
 * Distribución total: 1800 colaboradores en BBVA Engineering.
 *
 * Diseñada para mostrar contrastes:
 * - HOST y ASO con muy pocas personas + alta seniority + alto tenure → RIESGO CRÍTICO
 * - NACAR demandado pero supply estable
 * - AI con apenas 5 personas y 8 proyectos abiertos → DESBALANCE
 * - Backend/Mobile/Scrum como mayoría sana
 */
export const WORKFORCE_DATA: TechWorkforce[] = [
  // ── Legacy crítico — los silos más peligrosos ──
  {
    techId: "host",
    total: 12,
    seniority: { junior: 0, mid: 1, senior: 4, staff: 7 },
    availability: { available: 3, partial: 6, assigned: 2, onLeave: 1 },
    avgTenureYears: 22,
    mentors: 3,
    busFactor: 2,
    openProjects: 4,
    demandedHeadcount: 8,
  },
  {
    techId: "aso",
    total: 18,
    seniority: { junior: 0, mid: 2, senior: 8, staff: 8 },
    availability: { available: 4, partial: 9, assigned: 4, onLeave: 1 },
    avgTenureYears: 18,
    mentors: 4,
    busFactor: 3,
    openProjects: 6,
    demandedHeadcount: 12,
  },

  // ── Frameworks BBVA ──
  {
    techId: "nacar",
    total: 87,
    seniority: { junior: 12, mid: 32, senior: 31, staff: 12 },
    availability: { available: 18, partial: 45, assigned: 20, onLeave: 4 },
    avgTenureYears: 8,
    mentors: 11,
    busFactor: 4,
    openProjects: 14,
    demandedHeadcount: 32,
  },
  {
    techId: "apx",
    total: 65,
    seniority: { junior: 8, mid: 24, senior: 23, staff: 10 },
    availability: { available: 15, partial: 30, assigned: 18, onLeave: 2 },
    avgTenureYears: 7,
    mentors: 8,
    busFactor: 4,
    openProjects: 9,
    demandedHeadcount: 18,
  },
  {
    techId: "cells",
    total: 125,
    seniority: { junior: 22, mid: 48, senior: 40, staff: 15 },
    availability: { available: 30, partial: 60, assigned: 30, onLeave: 5 },
    avgTenureYears: 6,
    mentors: 13,
    busFactor: 5,
    openProjects: 12,
    demandedHeadcount: 24,
  },

  // ── Talento escaso / hot skills ──
  {
    techId: "ai",
    total: 5,
    seniority: { junior: 0, mid: 1, senior: 3, staff: 1 },
    availability: { available: 1, partial: 2, assigned: 2, onLeave: 0 },
    avgTenureYears: 5,
    mentors: 1,
    busFactor: 1,
    openProjects: 8,
    demandedHeadcount: 14,
  },

  // ── Modernos saludables ──
  {
    techId: "data",
    total: 148,
    seniority: { junior: 32, mid: 60, senior: 42, staff: 14 },
    availability: { available: 36, partial: 78, assigned: 30, onLeave: 4 },
    avgTenureYears: 5,
    mentors: 14,
    busFactor: 5,
    openProjects: 16,
    demandedHeadcount: 38,
  },
  {
    techId: "mobile",
    total: 200,
    seniority: { junior: 45, mid: 80, senior: 60, staff: 15 },
    availability: { available: 48, partial: 110, assigned: 38, onLeave: 4 },
    avgTenureYears: 4,
    mentors: 18,
    busFactor: 5,
    openProjects: 18,
    demandedHeadcount: 42,
  },
  {
    techId: "frontend",
    total: 180,
    seniority: { junior: 42, mid: 72, senior: 52, staff: 14 },
    availability: { available: 45, partial: 95, assigned: 36, onLeave: 4 },
    avgTenureYears: 4,
    mentors: 16,
    busFactor: 5,
    openProjects: 14,
    demandedHeadcount: 35,
  },
  {
    techId: "backend",
    total: 410,
    seniority: { junior: 95, mid: 168, senior: 117, staff: 30 },
    availability: { available: 102, partial: 210, assigned: 88, onLeave: 10 },
    avgTenureYears: 5,
    mentors: 38,
    busFactor: 5,
    openProjects: 22,
    demandedHeadcount: 65,
  },
  {
    techId: "devops",
    total: 110,
    seniority: { junior: 18, mid: 42, senior: 38, staff: 12 },
    availability: { available: 28, partial: 58, assigned: 22, onLeave: 2 },
    avgTenureYears: 5,
    mentors: 10,
    busFactor: 5,
    openProjects: 14,
    demandedHeadcount: 28,
  },
  {
    techId: "security",
    total: 75,
    seniority: { junior: 8, mid: 22, senior: 32, staff: 13 },
    availability: { available: 18, partial: 38, assigned: 17, onLeave: 2 },
    avgTenureYears: 7,
    mentors: 10,
    busFactor: 4,
    openProjects: 10,
    demandedHeadcount: 18,
  },
  {
    techId: "ux",
    total: 75,
    seniority: { junior: 18, mid: 30, senior: 22, staff: 5 },
    availability: { available: 18, partial: 40, assigned: 15, onLeave: 2 },
    avgTenureYears: 4,
    mentors: 6,
    busFactor: 5,
    openProjects: 11,
    demandedHeadcount: 22,
  },
  {
    techId: "scrum",
    total: 290,
    seniority: { junior: 28, mid: 116, senior: 126, staff: 20 },
    availability: { available: 72, partial: 144, assigned: 64, onLeave: 10 },
    avgTenureYears: 6,
    mentors: 27,
    busFactor: 5,
    openProjects: 30,
    demandedHeadcount: 50,
  },
];

// ── Helpers de agregación ────────────────────────────────────────────────

export function getTechCategory(techId: string): TechCategory | undefined {
  return TECH_CATEGORIES.find(t => t.id === techId);
}

export function getTechWorkforce(techId: string): TechWorkforce | undefined {
  return WORKFORCE_DATA.find(w => w.techId === techId);
}

export const WORKFORCE_TOTAL = WORKFORCE_DATA.reduce((s, w) => s + w.total, 0);

export const WORKFORCE_BY_TYPE: Record<TechType, number> = WORKFORCE_DATA.reduce(
  (acc, w) => {
    const cat = getTechCategory(w.techId);
    if (cat) acc[cat.type] = (acc[cat.type] ?? 0) + w.total;
    return acc;
  },
  { legacy: 0, proprietary: 0, modern: 0, emerging: 0 } as Record<TechType, number>
);

export interface AggregatedSeniority {
  junior: number;
  mid: number;
  senior: number;
  staff: number;
}

export const SENIORITY_TOTALS: AggregatedSeniority = WORKFORCE_DATA.reduce(
  (acc, w) => ({
    junior: acc.junior + w.seniority.junior,
    mid: acc.mid + w.seniority.mid,
    senior: acc.senior + w.seniority.senior,
    staff: acc.staff + w.seniority.staff,
  }),
  { junior: 0, mid: 0, senior: 0, staff: 0 }
);

export const AVAILABILITY_TOTALS = WORKFORCE_DATA.reduce(
  (acc, w) => ({
    available: acc.available + w.availability.available,
    partial: acc.partial + w.availability.partial,
    assigned: acc.assigned + w.availability.assigned,
    onLeave: acc.onLeave + w.availability.onLeave,
  }),
  { available: 0, partial: 0, assigned: 0, onLeave: 0 }
);

export const TOTAL_MENTORS = WORKFORCE_DATA.reduce((s, w) => s + w.mentors, 0);
export const TOTAL_OPEN_PROJECTS = WORKFORCE_DATA.reduce((s, w) => s + w.openProjects, 0);
export const TOTAL_DEMANDED_HEADCOUNT = WORKFORCE_DATA.reduce((s, w) => s + w.demandedHeadcount, 0);

/** Disponibilidad efectiva = available + partial (50% de los partial cuenta) */
export function effectiveAvailable(w: TechWorkforce): number {
  return w.availability.available + Math.floor(w.availability.partial * 0.5);
}

/** Demand satisfaction ratio: 1.0 = 100% cubierto, <1 = déficit, >1 = supérabit */
export function demandSatisfaction(w: TechWorkforce): number {
  if (w.demandedHeadcount === 0) return 1;
  return effectiveAvailable(w) / w.demandedHeadcount;
}
