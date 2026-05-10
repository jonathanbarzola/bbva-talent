// ── Campus BBVA — plataforma interna con alianzas Coursera + LinkedIn Learning
//
// Catálogo curado de 20 cursos disponibles para empleados BBVA.
// Cada curso enseña 1-3 skills; usado por careerProgress.ts para mapear
// gaps técnicos del usuario contra contenido formativo.

import type { Nivel } from "./types";

export type CampusProvider = "Coursera" | "LinkedIn Learning";

export interface CampusCourse {
  id: string;
  plataforma: "campus-bbva";
  provider: CampusProvider;
  nombre: string;
  /** Skills que enseña — lowercase para fuzzy matching */
  skills: string[];
  duracion_horas: number;
  /** Nivel objetivo — quién se beneficia más */
  dificultad: Nivel;
  descripcion: string;
  /** URL relativa o slug — sirve solo para mostrar el catálogo */
  slug: string;
}

export const CAMPUS_BBVA_COURSES: CampusCourse[] = [
  // ── Lenguajes y backend ──
  {
    id: "cb-001",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Python for Everybody Specialization",
    skills: ["python"],
    duracion_horas: 32,
    dificultad: "Analyst",
    descripcion: "Charles Severance · University of Michigan. Bases sólidas de Python desde cero hasta análisis de datos con Pandas.",
    slug: "coursera/python-for-everybody",
  },
  {
    id: "cb-002",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Java Programming and Software Engineering Fundamentals",
    skills: ["java"],
    duracion_horas: 40,
    dificultad: "Analyst",
    descripcion: "Duke University. Especialización completa en Java aplicado a la industria — incluye Spring básico al final.",
    slug: "coursera/java-programming",
  },
  {
    id: "cb-003",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Go for Backend — Programming with Google",
    skills: ["go", "golang"],
    duracion_horas: 18,
    dificultad: "Associate",
    descripcion: "Google Cloud. Concurrencia con goroutines, channels, y patrones de microservicios en Go.",
    slug: "coursera/go-programming",
  },
  {
    id: "cb-004",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "Spring Boot 3 Essential Training",
    skills: ["java", "spring", "spring boot", "microservices"],
    duracion_horas: 6,
    dificultad: "Associate",
    descripcion: "Frank Moley. Construir APIs REST production-ready con Spring Boot 3 + Spring Security 6.",
    slug: "linkedin/spring-boot-3",
  },

  // ── Frontend ──
  {
    id: "cb-005",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Meta Front-End Developer Professional Certificate",
    skills: ["react", "javascript", "typescript", "html", "css"],
    duracion_horas: 80,
    dificultad: "Analyst",
    descripcion: "Meta (Facebook). Programa profesional completo de React + ecosistema moderno frontend.",
    slug: "coursera/meta-frontend",
  },
  {
    id: "cb-006",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "Advanced React: Hooks, Patterns and Performance",
    skills: ["react", "typescript"],
    duracion_horas: 8,
    dificultad: "Associate",
    descripcion: "Eve Porcello. Patrones avanzados — render props, context optimizado, useReducer, suspense, server components.",
    slug: "linkedin/advanced-react",
  },
  {
    id: "cb-007",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "TypeScript for JavaScript Developers",
    skills: ["typescript", "javascript"],
    duracion_horas: 5,
    dificultad: "Associate",
    descripcion: "Jess Chadwick. De any al type-safe — generics, conditional types, declaration merging.",
    slug: "linkedin/typescript-jsdev",
  },

  // ── Data, ML, AI ──
  {
    id: "cb-008",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Machine Learning Specialization",
    skills: ["ml", "machine learning", "python"],
    duracion_horas: 60,
    dificultad: "Associate",
    descripcion: "Andrew Ng · Stanford / DeepLearning.AI. Reboot del curso clásico — ahora con TensorFlow y refuerzo.",
    slug: "coursera/ml-specialization",
  },
  {
    id: "cb-009",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Deep Learning Specialization",
    skills: ["deep learning", "ai", "ml", "python", "tensorflow", "pytorch"],
    duracion_horas: 90,
    dificultad: "Expert",
    descripcion: "Andrew Ng · DeepLearning.AI. CNNs, RNNs, Transformers, attention. Pre-requisito para LLMs aplicados.",
    slug: "coursera/deep-learning",
  },
  {
    id: "cb-010",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Generative AI with Large Language Models",
    skills: ["ai", "llm", "gen ai", "python"],
    duracion_horas: 16,
    dificultad: "Expert",
    descripcion: "AWS + DeepLearning.AI. Fine-tuning, RAG, RLHF, deployment. Para arquitectos de IA generativa en producción.",
    slug: "coursera/genai-llm",
  },
  {
    id: "cb-011",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Apache Kafka for Beginners",
    skills: ["kafka", "data engineering", "streaming"],
    duracion_horas: 12,
    dificultad: "Associate",
    descripcion: "Stephane Maarek. Producers, consumers, streams, KSQL — patrones de event-driven architecture.",
    slug: "coursera/kafka-beginners",
  },
  {
    id: "cb-012",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "Apache Spark Essential Training",
    skills: ["spark", "data engineering", "python"],
    duracion_horas: 4,
    dificultad: "Associate",
    descripcion: "Ben Sullins. PySpark fundamentals — RDDs, DataFrames, MLlib, optimización de jobs.",
    slug: "linkedin/spark-essential",
  },
  {
    id: "cb-013",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "SQL Essential Training",
    skills: ["sql", "postgresql", "data"],
    duracion_horas: 4,
    dificultad: "Analyst",
    descripcion: "Bill Weinman. SQL desde cero hasta ventanas y CTEs. Aplicable a PostgreSQL, MySQL, BigQuery.",
    slug: "linkedin/sql-essential",
  },

  // ── Cloud y DevOps ──
  {
    id: "cb-014",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "AWS Cloud Practitioner Essentials",
    skills: ["aws", "cloud"],
    duracion_horas: 14,
    dificultad: "Analyst",
    descripcion: "AWS oficial. Pre-requisito para certificaciones más serias en TheNinjaProject. Cubre los 5 pilares del WAF.",
    slug: "coursera/aws-practitioner",
  },
  {
    id: "cb-015",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Google Cloud Fundamentals: Core Infrastructure",
    skills: ["gcp", "cloud"],
    duracion_horas: 10,
    dificultad: "Analyst",
    descripcion: "Google Cloud. Compute Engine, GKE, Cloud Run, IAM, networking. Buen complemento si ya conocés AWS.",
    slug: "coursera/gcp-fundamentals",
  },
  {
    id: "cb-016",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "Kubernetes: Hands-On for Developers",
    skills: ["kubernetes", "k8s", "docker", "cloud"],
    duracion_horas: 6,
    dificultad: "Associate",
    descripcion: "Karthik Gaekwad. Pods, deployments, services, helm charts. Para devs que despliegan, no solo SREs.",
    slug: "linkedin/k8s-developers",
  },
  {
    id: "cb-017",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "Terraform Associate Preparation",
    skills: ["terraform", "iac", "devops"],
    duracion_horas: 18,
    dificultad: "Associate",
    descripcion: "HashiCorp partner. State, modules, workspaces, providers. Prep directo al examen TF Associate.",
    slug: "coursera/terraform-associate",
  },

  // ── Seguridad ──
  {
    id: "cb-018",
    plataforma: "campus-bbva",
    provider: "Coursera",
    nombre: "OAuth 2.0 and OpenID Connect for Engineers",
    skills: ["oauth2", "security", "api"],
    duracion_horas: 8,
    dificultad: "Associate",
    descripcion: "Auth0. Authorization code flow, PKCE, JWT, scopes — esencial para APIs financieras y Open Banking.",
    slug: "coursera/oauth2-openid",
  },
  {
    id: "cb-019",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "OWASP Top 10 for Developers",
    skills: ["security", "owasp"],
    duracion_horas: 4,
    dificultad: "Associate",
    descripcion: "Caroline Wong. Las 10 vulnerabilidades más comunes y cómo escribir código que no las introduzca.",
    slug: "linkedin/owasp-top10",
  },

  // ── Soft skills + ágil ──
  {
    id: "cb-020",
    plataforma: "campus-bbva",
    provider: "LinkedIn Learning",
    nombre: "Communication for Software Engineers",
    skills: ["communication", "soft-skills"],
    duracion_horas: 3,
    dificultad: "Analyst",
    descripcion: "Doug Rose. Cómo presentar diseños técnicos, escribir RFCs claros, dar feedback a peers. Para Analysts que quieren dar el salto a Associate.",
    slug: "linkedin/eng-communication",
  },
];
