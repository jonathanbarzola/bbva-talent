export interface SkillNode {
  nombre: string;
  categoria: string;
  score: number;
}

export interface ProyectoNode {
  id: string;
  nombre: string;
  dominio: string;
  estado: string;
}

export interface ColaboradorRef {
  id: string;
  nombre: string;
  rol: string;
  weight: number;
}

// ── EDI (Evaluación de Desempeño Individual) ──────────────────────────────

export interface PeerComment {
  autor_id: string;
  autor_nombre: string;
  comentario: string;
  sentiment_score: number; // 0-100
}

export type EDIRating = 1 | 2 | 3;
// 1 = Supera expectativas (Exceeds)
// 2 = Cumple expectativas (Meets)
// 3 = Necesita mejorar (Needs Improvement)

export interface EDI {
  año: number;
  rating: EDIRating;
  manager_rating: EDIRating;
  manager_comment: string;
  peer_comments: PeerComment[];
}

// ── Trust Score ───────────────────────────────────────────────────────────

export type TrustTier = "platinum" | "gold" | "silver" | "bronze";

export interface TrustScoreBreakdown {
  manager: number;  // 0-100
  edi: number;      // 0-100
  peers: number;    // 0-100
  tenure: number;   // 0-100
  skills: number;   // 0-100
}

export interface TrustScore {
  overall: number;  // 0-100
  tier: TrustTier;
  breakdown: TrustScoreBreakdown;
}

// ── B-Tokens ──────────────────────────────────────────────────────────────

export type BTokenTier = "platinum" | "gold" | "silver" | "apprentice";

export interface BTokenTransaction {
  id: string;
  tipo: "earned" | "spent";
  motivo: string;
  cantidad: number;
  fecha: string;
  contraparte_nombre?: string;
}

export interface BTokenWallet {
  balance: number;
  tier: BTokenTier;
  historial: BTokenTransaction[];
}

// ── Empleado ──────────────────────────────────────────────────────────────

export type AvailabilityStatus =
  | "disponible"
  | "parcial"
  | "asignado"
  | "vacaciones"
  | "maternidad"
  | "licencia"
  | "descanso_medico";

// ── Tipo de contrato BBVA ──────────────────────────────────────────────────
// Internos: P-registro (P043769) → empleados directos del banco
// Externos: XP-registro (XP43769) → vienen de fábricas/consultoras
//   (Indra, Neoris, Bluetab, Everis, Capgemini, Globant, Accenture)

export type TipoContrato = "interno" | "externo";

// ── Nivel BBVA (taxonomía oficial banking) ───────────────────────────────
// 3 niveles: Analyst → Associate → Expert
// Modelo de carrera lineal — Expert es el top tier IC.
export type Nivel = "Analyst" | "Associate" | "Expert";

/** @deprecated usar Nivel — alias retenido temporalmente para evitar romper callers */
export type RolBBVA = Nivel;

export interface StaffingRecord {
  /** Período fiscal: "2024-Q3", "2024-Q4", "2025-Q1", "2025-Q2" */
  quarter: string;
  proyecto_codigo: string;
  proyecto_nombre: string;
  /** FTE 0..1 — fracción del tiempo del Q dedicado a este proyecto */
  fte: number;
  /** Squad/dominio del proyecto */
  dominio?: string;
}

export interface ExternalFeedback {
  /** Manager o tech lead que dio el feedback */
  manager_nombre: string;
  /** Proyecto en el cual se trabajó con este externo */
  proyecto_codigo: string;
  proyecto_nombre: string;
  /** Período del feedback */
  quarter: string;
  /** Rating 1-5 — 5 = excelente, 1 = no contratar de nuevo */
  rating: 1 | 2 | 3 | 4 | 5;
  comentario: string;
}

export interface EmpleadoResult {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  squad: string;
  nivel: Nivel;
  ubicacion: string;
  bio: string;
  score: number;
  habilidades: SkillNode[];
  proyectos: ProyectoNode[];
  colaboradores: ColaboradorRef[];
  // Availability
  disponibilidad?: AvailabilityStatus;
  disponibilidad_hasta?: string;
  proyecto_asignado?: string;
  // EDI & Trust
  años_empresa: number;
  edi?: EDI;
  trust_score?: TrustScore;
  // B-Tokens
  b_tokens?: BTokenWallet;
  // Networking
  es_mentor: boolean;
  disponible_networking: boolean;
  networking_tags?: string[];
  // ── BBVA contract & staffing data ──
  /** Tipo de contrato: interno (P-registro) o externo (XP-registro de consultora) */
  tipo_contrato?: TipoContrato;
  /** Registro BBVA: P043769 (interno) o XP43769 (externo) */
  registro?: string;
  /** Consultora de origen — solo aplica para externos (Indra, Neoris, Bluetab, etc.) */
  consultora?: string;
  /** Histórico de staffing — últimos 4 quarters con FTE asignado por proyecto */
  staffing_historico?: StaffingRecord[];
  /** Feedback de jefes anteriores — solo aplica para externos */
  feedback_externo?: ExternalFeedback[];
}

// ── Search ────────────────────────────────────────────────────────────────

export interface SearchResponse {
  query: string;
  intencion_detectada: string;
  candidatos: EmpleadoResult[];
  total: number;
}

// ── Graph ─────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, string | number>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  properties: Record<string, string | number>;
}

export interface GraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ── Team / Project ────────────────────────────────────────────────────────

export interface RoleRequest {
  role: string;
  quantity: number;
}

export interface TeamRequest {
  project_name: string;
  roles: RoleRequest[];
}

export interface RoleMatch {
  role: string;
  quantity: number;
  candidates: EmpleadoResult[];
}

export interface TeamCompositionResponse {
  project_name: string;
  roles: RoleMatch[];
  coverage_score: number;
  total_skills: number;
  gaps: string[];
}

export interface SDAProject {
  codigo: string;
  nombre: string;
  dominio: string;
  estado: "En planificación" | "En desarrollo" | "En producción";
  roles: RoleRequest[];
}

// ── Networking ────────────────────────────────────────────────────────────

export type NetworkingTipo = "mentor" | "peer" | "mentee";

export interface NetworkingProfile {
  empleado: EmpleadoResult;
  tipo: NetworkingTipo;
  disponibilidad_horaria: string;
  temas: string[];
  costo_bt: number;
  /** Mentees activos asignados (solo aplica para tipo "mentor") */
  mentees_actuales?: number;
  /** Cupo máximo de mentees simultáneos. Default: 2 en BBVA Perú */
  cupo_maximo?: number;
  /** Fecha tentativa de disponibilidad si el cupo está lleno (ISO 8601) */
  proxima_disponibilidad?: string;
}

export interface NetworkingSearchResponse {
  query: string;
  tipo: NetworkingTipo | "all";
  perfiles: NetworkingProfile[];
  total: number;
}
