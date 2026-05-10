// ── TheNinjaProject — plataforma BBVA de certificaciones de mercado
//
// Permite a los colaboradores certificarse en cloud providers (AWS, Azure,
// GCP) o cualquier certificación de peso del mercado actual (CKA, CKAD,
// HashiCorp, ITIL, OWASP, etc.). El banco subsidia el costo del examen
// vía B-Tokens; cada cert tiene un costo en BT que el empleado debe tener
// en su wallet para inscribirse.

import type { Nivel } from "./types";

export type CertProvider =
  | "AWS"
  | "Microsoft Azure"
  | "Google Cloud"
  | "CNCF (Kubernetes)"
  | "HashiCorp"
  | "Hyperledger"
  | "Linux Foundation"
  | "Scrum Alliance"
  | "ITIL"
  | "Oracle"
  | "MongoDB"
  | "Confluent (Kafka)"
  | "ISC2 (Security)"
  | "Databricks";

export interface NinjaCertification {
  id: string;
  plataforma: "ninja-project";
  provider: CertProvider;
  nombre: string;
  /** Skills validadas — lowercase para fuzzy matching */
  skills: string[];
  /** Costo en B-Tokens que descuenta de tu wallet al inscribirte */
  costo_bt: number;
  dificultad: Nivel;
  descripcion: string;
  /** Estimado en horas de prep — para roadmap del usuario */
  prep_horas: number;
  /** Validez en años (la mayoría 3, algunas 2) */
  validez_años: number;
  /** Trust Score boost — impacta el factor 'skills' del Trust Score si la pasás */
  trust_score_boost: number;
}

export const NINJA_CERTIFICATIONS: NinjaCertification[] = [
  // ── AWS ──
  {
    id: "np-001",
    plataforma: "ninja-project",
    provider: "AWS",
    nombre: "AWS Certified Solutions Architect — Associate",
    skills: ["aws", "cloud", "architecture", "iam"],
    costo_bt: 60,
    dificultad: "Associate",
    descripcion: "La cert más demandada del mercado cloud. SAA-C03 — diseño de soluciones tolerantes a fallos en AWS.",
    prep_horas: 80,
    validez_años: 3,
    trust_score_boost: 4,
  },
  {
    id: "np-002",
    plataforma: "ninja-project",
    provider: "AWS",
    nombre: "AWS Certified Solutions Architect — Professional",
    skills: ["aws", "cloud", "architecture", "multi-account"],
    costo_bt: 120,
    dificultad: "Expert",
    descripcion: "SAP-C02. Para arquitectos que diseñan landing zones, multi-account orgs, y migraciones enterprise.",
    prep_horas: 180,
    validez_años: 3,
    trust_score_boost: 8,
  },
  {
    id: "np-003",
    plataforma: "ninja-project",
    provider: "AWS",
    nombre: "AWS Certified Machine Learning — Specialty",
    skills: ["aws", "ml", "ai", "sagemaker"],
    costo_bt: 100,
    dificultad: "Expert",
    descripcion: "MLS-C01. SageMaker, deployment de modelos, MLOps en AWS. Cert escasa — talento ML+Cloud combinado.",
    prep_horas: 140,
    validez_años: 3,
    trust_score_boost: 7,
  },

  // ── Azure ──
  {
    id: "np-004",
    plataforma: "ninja-project",
    provider: "Microsoft Azure",
    nombre: "Microsoft Certified: Azure Administrator (AZ-104)",
    skills: ["azure", "cloud"],
    costo_bt: 50,
    dificultad: "Associate",
    descripcion: "Administración de Azure — VMs, networking, storage, IAM. BBVA Mexico usa Azure como secundaria — útil para multicloud.",
    prep_horas: 70,
    validez_años: 2,
    trust_score_boost: 3,
  },
  {
    id: "np-005",
    plataforma: "ninja-project",
    provider: "Microsoft Azure",
    nombre: "Microsoft Certified: Azure Solutions Architect Expert",
    skills: ["azure", "cloud", "architecture"],
    costo_bt: 100,
    dificultad: "Expert",
    descripcion: "AZ-305. Diseño de soluciones enterprise en Azure. Hybrid scenarios con on-prem.",
    prep_horas: 150,
    validez_años: 2,
    trust_score_boost: 6,
  },

  // ── GCP ──
  {
    id: "np-006",
    plataforma: "ninja-project",
    provider: "Google Cloud",
    nombre: "Google Cloud — Professional Cloud Architect",
    skills: ["gcp", "cloud", "architecture"],
    costo_bt: 80,
    dificultad: "Expert",
    descripcion: "PCA. La cert más respetada del ecosistema GCP. BBVA está migrando workloads de Data hacia GCP — útil acá.",
    prep_horas: 130,
    validez_años: 2,
    trust_score_boost: 6,
  },
  {
    id: "np-007",
    plataforma: "ninja-project",
    provider: "Google Cloud",
    nombre: "Google Cloud — Professional Data Engineer",
    skills: ["gcp", "data engineering", "bigquery", "dataflow"],
    costo_bt: 80,
    dificultad: "Associate",
    descripcion: "PDE. BigQuery, Dataflow, Pub/Sub, Composer. Crítica para squads de Data Platform.",
    prep_horas: 100,
    validez_años: 2,
    trust_score_boost: 5,
  },

  // ── Kubernetes ──
  {
    id: "np-008",
    plataforma: "ninja-project",
    provider: "CNCF (Kubernetes)",
    nombre: "Certified Kubernetes Administrator (CKA)",
    skills: ["kubernetes", "k8s", "linux", "devops"],
    costo_bt: 70,
    dificultad: "Associate",
    descripcion: "Examen 100% práctico — 2 horas haciendo cosas en clusters reales. Hard pass para SREs y Platform Engineers.",
    prep_horas: 90,
    validez_años: 3,
    trust_score_boost: 5,
  },
  {
    id: "np-009",
    plataforma: "ninja-project",
    provider: "CNCF (Kubernetes)",
    nombre: "Certified Kubernetes Application Developer (CKAD)",
    skills: ["kubernetes", "k8s", "docker"],
    costo_bt: 70,
    dificultad: "Associate",
    descripcion: "Para devs que despliegan en K8s — pods, deployments, configmaps, helm. Más accesible que CKA.",
    prep_horas: 60,
    validez_años: 3,
    trust_score_boost: 4,
  },

  // ── HashiCorp ──
  {
    id: "np-010",
    plataforma: "ninja-project",
    provider: "HashiCorp",
    nombre: "HashiCorp Certified: Terraform Associate",
    skills: ["terraform", "iac", "devops"],
    costo_bt: 35,
    dificultad: "Associate",
    descripcion: "Cert oficial Terraform. State, modules, workspaces, sentinel. La más fácil de la lista — buen primer paso.",
    prep_horas: 30,
    validez_años: 2,
    trust_score_boost: 3,
  },

  // ── Streaming / Data ──
  {
    id: "np-011",
    plataforma: "ninja-project",
    provider: "Confluent (Kafka)",
    nombre: "Confluent Certified Developer for Apache Kafka",
    skills: ["kafka", "streaming", "data engineering"],
    costo_bt: 60,
    dificultad: "Associate",
    descripcion: "CCDAK. Producers, consumers, streams, connect. Si trabajás en cualquier squad de Pagos o Riesgos, te toca.",
    prep_horas: 50,
    validez_años: 2,
    trust_score_boost: 4,
  },
  {
    id: "np-012",
    plataforma: "ninja-project",
    provider: "Databricks",
    nombre: "Databricks Certified Data Engineer Associate",
    skills: ["spark", "data engineering", "databricks", "python"],
    costo_bt: 50,
    dificultad: "Associate",
    descripcion: "Spark + Delta Lake en producción. BBVA Data está migrando pipelines a Databricks — cert útil ya.",
    prep_horas: 40,
    validez_años: 2,
    trust_score_boost: 3,
  },

  // ── Security ──
  {
    id: "np-013",
    plataforma: "ninja-project",
    provider: "ISC2 (Security)",
    nombre: "Certified Information Systems Security Professional (CISSP)",
    skills: ["security", "compliance", "owasp"],
    costo_bt: 100,
    dificultad: "Expert",
    descripcion: "La cert reina de seguridad. Requiere 5 años de experiencia. Crítica para squads de Ciberseguridad y Compliance.",
    prep_horas: 200,
    validez_años: 3,
    trust_score_boost: 8,
  },

  // ── Agile ──
  {
    id: "np-014",
    plataforma: "ninja-project",
    provider: "Scrum Alliance",
    nombre: "Certified Scrum Master (CSM)",
    skills: ["scrum", "agile"],
    costo_bt: 40,
    dificultad: "Associate",
    descripcion: "Cert básica de Scrum. 2 días de curso + examen. Para devs que quieren rotar a SM o tech leads que necesitan vocabulario común.",
    prep_horas: 20,
    validez_años: 2,
    trust_score_boost: 2,
  },

  // ── Specialty ──
  {
    id: "np-015",
    plataforma: "ninja-project",
    provider: "Linux Foundation",
    nombre: "Certified Hyperledger Fabric Developer",
    skills: ["blockchain", "hyperledger"],
    costo_bt: 80,
    dificultad: "Expert",
    descripcion: "Para devs interesados en TradFi+blockchain. BBVA tiene squad pequeño explorando custody y settlement.",
    prep_horas: 70,
    validez_años: 3,
    trust_score_boost: 5,
  },
];
