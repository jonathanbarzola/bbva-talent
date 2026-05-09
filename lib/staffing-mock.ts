import type {
  EmpleadoResult,
  TipoContrato,
  RolBBVA,
  StaffingRecord,
  ExternalFeedback,
} from "./types";

// ── Mapping de nivel actual → rol BBVA oficial ──────────────────────────

const NIVEL_TO_ROL_BBVA: Record<string, RolBBVA> = {
  Junior: "Analyst",
  Mid:    "Associate",
  Senior: "Expert",
  Staff:  "Lead",
};

export function getRolBBVA(nivel: string): RolBBVA {
  return NIVEL_TO_ROL_BBVA[nivel] ?? "Associate";
}

// ── Consultoras conocidas en BBVA Perú ──────────────────────────────────

export const KNOWN_CONSULTORAS = [
  "Indra",
  "Neoris",
  "Bluetab",
  "Everis (NTT Data)",
  "Capgemini",
  "Globant",
  "Accenture",
] as const;

// ── Perfiles de staffing por empleado ───────────────────────────────────
// Mezcla deliberada de patrones para que el demo muestre variedad:
//   - Internos siempre 1.0 FTE en un solo proyecto (perfil clásico)
//   - Internos divididos 0.5/0.5 entre 2 proyectos (Senior/Expert)
//   - Internos divididos 0.4/0.4/0.2 (Staff/Lead muy demandados)
//   - Externos con feedback mixto (señal a managers)
//   - Externos con feedback excelente (bajo riesgo)
//   - Externos con feedback negativo (bandera roja)

interface StaffingProfile {
  tipo_contrato: TipoContrato;
  registro: string;
  consultora?: string;
  staffing_historico: StaffingRecord[];
  feedback_externo?: ExternalFeedback[];
}

export const STAFFING_PROFILES: Record<string, StaffingProfile> = {
  // ── Internos ──

  // emp_001 Valentina Ríos — Senior Backend, Pagos Digitales
  // Patrón: siempre dividida 0.5/0.5 — perfil reaprovechado en múltiples proyectos
  emp_001: {
    tipo_contrato: "interno",
    registro: "P043769",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52994", proyecto_nombre: "Open Banking PSD2 Refresh", fte: 0.5, dominio: "Open Banking" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.6, dominio: "Pagos Digitales" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 0.4, dominio: "Pagos Digitales" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 0.5, dominio: "CRM" },
    ],
  },

  // emp_002 — Senior Frontend
  emp_002: {
    tipo_contrato: "interno",
    registro: "P052413",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
    ],
  },

  // emp_003 — Mid ML
  emp_003: {
    tipo_contrato: "interno",
    registro: "P061205",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Fraud Detection v2",       fte: 1.0, dominio: "Seguridad & Riesgo" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52988", proyecto_nombre: "Fraud Detection v2",       fte: 0.7, dominio: "Seguridad & Riesgo" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.3, dominio: "Créditos" },
    ],
  },

  // emp_004 — Staff Cloud/Infra
  // Patrón: muy demandado, dividido en 3 proyectos
  emp_004: {
    tipo_contrato: "interno",
    registro: "P028144",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.4, dominio: "Pagos Digitales" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.3, dominio: "Créditos" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52944", proyecto_nombre: "Cells Migration Wave 3",   fte: 0.3, dominio: "Plataforma" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52944", proyecto_nombre: "Cells Migration Wave 3",   fte: 0.5, dominio: "Plataforma" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 0.4, dominio: "CRM" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52944", proyecto_nombre: "Cells Migration Wave 3",   fte: 0.6, dominio: "Plataforma" },
    ],
  },

  // emp_005 — Mid Security
  emp_005: {
    tipo_contrato: "interno",
    registro: "P073882",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 0.5, dominio: "Compliance" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 1.0, dominio: "Compliance" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52914", proyecto_nombre: "KYC Automation",           fte: 1.0, dominio: "Compliance" },
    ],
  },

  // ── Externos (XP-registro) ──

  // emp_006 — Externo de Indra · feedback EXCELENTE
  emp_006: {
    tipo_contrato: "externo",
    registro: "XP54221",
    consultora: "Indra",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
    ],
    feedback_externo: [
      {
        manager_nombre: "Lucas Fernández (Tech Lead)",
        proyecto_codigo: "SDA-52994",
        proyecto_nombre: "Mobile Onboarding v3",
        quarter: "2025-Q1",
        rating: 5,
        comentario: "Excepcional dominio de Kotlin y Compose. Onboardeó al squad sin fricción y propuso mejoras al design system. Lo volvería a contratar sin dudas.",
      },
      {
        manager_nombre: "Marcela Vidal (Manager)",
        proyecto_codigo: "SDA-52902",
        proyecto_nombre: "Customer 360 v1",
        quarter: "2024-Q4",
        rating: 5,
        comentario: "Profesional, comunicativo, entrega antes de plazo. Mentor informal de los Juniors del squad.",
      },
    ],
  },

  // emp_007 — Externo de Neoris · siempre dividido en 2 proyectos
  emp_007: {
    tipo_contrato: "externo",
    registro: "XP67154",
    consultora: "Neoris",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.5, dominio: "Créditos" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.6, dominio: "Créditos" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52933", proyecto_nombre: "BNPL Engine",              fte: 0.4, dominio: "Créditos" },
    ],
    feedback_externo: [
      {
        manager_nombre: "Jorge Ramos (Tech Lead)",
        proyecto_codigo: "SDA-52915",
        proyecto_nombre: "Credit Scoring ML",
        quarter: "2024-Q4",
        rating: 4,
        comentario: "Buen Data Engineer. Cumple plazos. A veces necesita más contexto de negocio antes de empezar a modelar.",
      },
    ],
  },

  // emp_008 — Externo de Bluetab · feedback MIXTO (medio)
  emp_008: {
    tipo_contrato: "externo",
    registro: "XP38901",
    consultora: "Bluetab",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 1.0, dominio: "Compliance" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 1.0, dominio: "Compliance" },
    ],
    feedback_externo: [
      {
        manager_nombre: "Patricia Núñez (Manager)",
        proyecto_codigo: "SDA-52961",
        proyecto_nombre: "AML Monitor v2",
        quarter: "2024-Q4",
        rating: 3,
        comentario: "Tiene los conocimientos en papel pero le costó adaptarse al stack interno (NACAR + APX). Curva de aprendizaje de ~6 semanas. Mejoró progresivamente.",
      },
    ],
  },

  // emp_009 — Externo de Capgemini · feedback NEGATIVO (bandera roja)
  emp_009: {
    tipo_contrato: "externo",
    registro: "XP71402",
    consultora: "Capgemini",
    staffing_historico: [
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52933", proyecto_nombre: "BNPL Engine",              fte: 1.0, dominio: "Créditos" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52914", proyecto_nombre: "KYC Automation",          fte: 1.0, dominio: "Compliance" },
    ],
    feedback_externo: [
      {
        manager_nombre: "Roberto Salinas (Tech Lead)",
        proyecto_codigo: "SDA-52933",
        proyecto_nombre: "BNPL Engine",
        quarter: "2024-Q4",
        rating: 2,
        comentario: "El CV declaraba expertise en Cells y Microservicios pero requirió pair programming intensivo durante 2 meses. Generó retraso en el roadmap. NO recomiendo re-contratar para roles seniors.",
      },
      {
        manager_nombre: "Carla Mendoza (Manager)",
        proyecto_codigo: "SDA-52914",
        proyecto_nombre: "KYC Automation",
        quarter: "2024-Q3",
        rating: 3,
        comentario: "Perfil correcto para tareas operativas. No funciona como Senior técnico — necesita ownership claro y supervisión.",
      },
    ],
  },

  // emp_010 — Externo de Globant · sin historial (recién llegado)
  emp_010: {
    tipo_contrato: "externo",
    registro: "XP88017",
    consultora: "Globant",
    staffing_historico: [],
    // Sin feedback_externo — primera vez en BBVA
  },

  // ── Resto de internos con patrones variados ──

  emp_011: {
    tipo_contrato: "interno",
    registro: "P019856",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 0.5, dominio: "Compliance" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52914", proyecto_nombre: "KYC Automation",          fte: 0.5, dominio: "Compliance" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52914", proyecto_nombre: "KYC Automation",          fte: 1.0, dominio: "Compliance" },
    ],
  },

  emp_012: {
    tipo_contrato: "interno",
    registro: "P099234",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
      { quarter: "2024-Q3", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 1.0, dominio: "Pagos Digitales" },
    ],
  },

  emp_013: {
    tipo_contrato: "interno",
    registro: "P115302",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 0.7, dominio: "Experiencia Digital" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.3, dominio: "Pagos Digitales" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
    ],
  },

  emp_014: {
    tipo_contrato: "interno",
    registro: "P028991",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 1.0, dominio: "Pagos Digitales" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 1.0, dominio: "Pagos Digitales" },
    ],
  },

  emp_015: {
    tipo_contrato: "interno",
    registro: "P064215",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.4, dominio: "Créditos" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Fraud Detection v2",       fte: 0.4, dominio: "Seguridad & Riesgo" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52961", proyecto_nombre: "AML Monitor v2",           fte: 0.2, dominio: "Compliance" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52915", proyecto_nombre: "Credit Scoring ML",        fte: 0.5, dominio: "Créditos" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52988", proyecto_nombre: "Fraud Detection v2",       fte: 0.5, dominio: "Seguridad & Riesgo" },
    ],
  },

  emp_016: {
    tipo_contrato: "interno",
    registro: "P122087",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52902", proyecto_nombre: "Customer 360 v1",          fte: 1.0, dominio: "CRM" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52914", proyecto_nombre: "KYC Automation",          fte: 1.0, dominio: "Compliance" },
    ],
  },

  emp_017: {
    tipo_contrato: "interno",
    registro: "P032455",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52988", proyecto_nombre: "Payment Gateway 2.0",      fte: 0.5, dominio: "Pagos Digitales" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52951", proyecto_nombre: "FX Rates Engine",          fte: 1.0, dominio: "Pagos Digitales" },
    ],
  },

  emp_018: {
    tipo_contrato: "interno",
    registro: "P057193",
    staffing_historico: [
      { quarter: "2025-Q1", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
      { quarter: "2024-Q4", proyecto_codigo: "SDA-52994", proyecto_nombre: "Mobile Onboarding v3",     fte: 1.0, dominio: "Experiencia Digital" },
    ],
  },
};

// ── Enrich helper ────────────────────────────────────────────────────────

/**
 * Adds staffing/contract data to an EmpleadoResult based on the lookup.
 * Idempotent — returns the same object if no profile exists for that id.
 */
export function enrichEmpleado(emp: EmpleadoResult): EmpleadoResult {
  const profile = STAFFING_PROFILES[emp.id];
  if (!profile) {
    // Default fallback for any employee not in our profile map
    return {
      ...emp,
      rol_bbva: emp.rol_bbva ?? getRolBBVA(emp.nivel),
    };
  }
  return {
    ...emp,
    tipo_contrato: profile.tipo_contrato,
    registro: profile.registro,
    consultora: profile.consultora,
    rol_bbva: getRolBBVA(emp.nivel),
    staffing_historico: profile.staffing_historico,
    feedback_externo: profile.feedback_externo,
  };
}

// ── Aggregation helpers ──────────────────────────────────────────────────

export function avgFTE(records: StaffingRecord[]): number {
  if (records.length === 0) return 0;
  // Group by quarter, sum FTE per quarter, then average across quarters
  const byQuarter = new Map<string, number>();
  for (const r of records) {
    byQuarter.set(r.quarter, (byQuarter.get(r.quarter) ?? 0) + r.fte);
  }
  const totalFte = Array.from(byQuarter.values()).reduce((s, v) => s + v, 0);
  return totalFte / byQuarter.size;
}

export function avgProjectsPerQuarter(records: StaffingRecord[]): number {
  if (records.length === 0) return 0;
  const byQuarter = new Map<string, number>();
  for (const r of records) {
    byQuarter.set(r.quarter, (byQuarter.get(r.quarter) ?? 0) + 1);
  }
  const totalProjects = Array.from(byQuarter.values()).reduce((s, v) => s + v, 0);
  return totalProjects / byQuarter.size;
}

export function uniqueQuarters(records: StaffingRecord[]): string[] {
  return Array.from(new Set(records.map(r => r.quarter))).sort();
}

export function uniqueProjects(records: StaffingRecord[]): { codigo: string; nombre: string }[] {
  const seen = new Map<string, string>();
  for (const r of records) {
    if (!seen.has(r.proyecto_codigo)) seen.set(r.proyecto_codigo, r.proyecto_nombre);
  }
  return Array.from(seen.entries()).map(([codigo, nombre]) => ({ codigo, nombre }));
}

export function avgRating(feedback: ExternalFeedback[]): number {
  if (feedback.length === 0) return 0;
  return feedback.reduce((s, f) => s + f.rating, 0) / feedback.length;
}
