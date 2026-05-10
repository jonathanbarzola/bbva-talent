// ── TechU — escuela técnica interna BBVA
//
// Cursos PROPIOS del banco para tecnologías propietarias y stacks legacy
// críticos: APX (Application Platform eXperience), Cells (microservicios),
// NACAR (frontend BBVA), HOST (mainframe z/OS · COBOL), ASO (middleware).
// Estos cursos no existen fuera de BBVA — son la única fuente formal de
// formación en estas tecnologías.

import type { Nivel } from "./types";

export interface TechUCourse {
  id: string;
  plataforma: "techu";
  nombre: string;
  /** Skills que enseña — lowercase para fuzzy matching */
  skills: string[];
  duracion_horas: number;
  dificultad: Nivel;
  descripcion: string;
  /** Tipo de tecnología que cubre — afecta cómo aparece en los gaps */
  tech_type: "legacy" | "proprietary";
  /** Instructor BBVA — algunos son Experts internos referentes */
  instructor: string;
}

export const TECHU_COURSES: TechUCourse[] = [
  // ── Frameworks BBVA propietarios ──
  {
    id: "tu-001",
    plataforma: "techu",
    nombre: "APX 360 — Application Platform eXperience",
    skills: ["apx", "bbva-platform"],
    duracion_horas: 24,
    dificultad: "Analyst",
    descripcion: "Onboarding completo a APX. Arquitectura, lifecycle, integraciones con Cells y NACAR. Obligatorio para nuevos joiners en squads APX.",
    tech_type: "proprietary",
    instructor: "Equipo Architecture Guild · BBVA Madrid",
  },
  {
    id: "tu-002",
    plataforma: "techu",
    nombre: "Cells — Microservicios celulares en BBVA",
    skills: ["cells", "microservices", "bbva-platform"],
    duracion_horas: 32,
    dificultad: "Associate",
    descripcion: "Arquitectura celular BBVA: cell topology, blast-radius, cross-cell communication. Patrones que NO encontrás en libros públicos.",
    tech_type: "proprietary",
    instructor: "Rodrigo Montoya · Cloud & DevOps Architect",
  },
  {
    id: "tu-003",
    plataforma: "techu",
    nombre: "NACAR avanzado — frontend BBVA mobile-first",
    skills: ["nacar", "frontend", "mobile", "bbva-platform"],
    duracion_horas: 20,
    dificultad: "Associate",
    descripcion: "Framework NACAR para banca digital BBVA. Componentes, theming, performance, integración con APX. Solo para internos.",
    tech_type: "proprietary",
    instructor: "Paula Jiménez · Frontend Engineer",
  },
  {
    id: "tu-004",
    plataforma: "techu",
    nombre: "Cells Migration Workshop — de monolitos a celular",
    skills: ["cells", "microservices", "migration", "architecture"],
    duracion_horas: 16,
    dificultad: "Expert",
    descripcion: "Workshop hands-on. Casos reales SDA-52944 — migrar un monolito Java a arquitectura Cells sin downtime. Para Experts que lideran migraciones.",
    tech_type: "proprietary",
    instructor: "Rodrigo Montoya · Cloud & DevOps Architect",
  },

  // ── Legacy crítico ──
  {
    id: "tu-005",
    plataforma: "techu",
    nombre: "COBOL & z/OS Fundamentals para nuevas generaciones",
    skills: ["cobol", "host", "mainframe"],
    duracion_horas: 40,
    dificultad: "Analyst",
    descripcion: "Programa de cross-training para Analysts modernos que quieren entender HOST. Sin background COBOL previo. Bus-factor crítico — solo 12 personas en BBVA dominan esto.",
    tech_type: "legacy",
    instructor: "Equipo HOST Legacy · BBVA",
  },
  {
    id: "tu-006",
    plataforma: "techu",
    nombre: "ASO — Arquitectura de Servicios Orientada en BBVA",
    skills: ["aso", "soa", "middleware"],
    duracion_horas: 28,
    dificultad: "Associate",
    descripcion: "Middleware legacy de BBVA. ESB, mensajería asíncrona, integraciones con HOST. Si trabajás con sistemas pre-2018, esto te ahorra meses de descubrimiento.",
    tech_type: "legacy",
    instructor: "Equipo Integration Engineering",
  },

  // ── PSD2 & Open Banking (vertical regulatorio crítico BBVA) ──
  {
    id: "tu-007",
    plataforma: "techu",
    nombre: "PSD2 & Open Banking — implementación BBVA",
    skills: ["psd2", "open banking", "api", "regulación"],
    duracion_horas: 18,
    dificultad: "Associate",
    descripcion: "Cómo BBVA implementa PSD2 sobre APX + OAuth2. Strong Customer Authentication, Account Information Services, Payment Initiation. Crítico para squads de Pagos.",
    tech_type: "proprietary",
    instructor: "Valentina Ríos · Senior Backend, Pagos Digitales",
  },

  // ── DevOps interno ──
  {
    id: "tu-008",
    plataforma: "techu",
    nombre: "Plataforma Ether — el PaaS interno de BBVA",
    skills: ["ether", "devops", "kubernetes", "cells", "bbva-platform"],
    duracion_horas: 14,
    dificultad: "Associate",
    descripcion: "Cómo desplegar, operar y monitorear servicios sobre Ether. CI/CD pipelines, observabilidad, secrets management. Reemplaza tu necesidad de saber Terraform 'puro'.",
    tech_type: "proprietary",
    instructor: "Equipo Platform Engineering",
  },
];
