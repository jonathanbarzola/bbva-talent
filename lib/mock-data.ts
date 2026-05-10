import type {
  SearchResponse, GraphResponse, EmpleadoResult, TeamRequest,
  TeamCompositionResponse, SDAProject, NetworkingProfile, BTokenTransaction,
} from "./types";
import { calculateTrustScore, btokenTierFromBalance } from "./trust-score";

// ── B-Token wallet builder ────────────────────────────────────────────────

function wallet(balance: number, historial: BTokenTransaction[]) {
  return { balance, tier: btokenTierFromBalance(balance), historial };
}

// ── Raw employee pool (no trust_score yet) ────────────────────────────────

const RAW: Omit<EmpleadoResult, "trust_score">[] = [
  {
    id: "emp_001", nombre: "Valentina Ríos", email: "v.rios@bbva.com",
    rol: "Senior Backend Engineer", squad: "Pagos Digitales", nivel: "Senior",
    ubicacion: "Buenos Aires", años_empresa: 7,
    bio: "Especialista en arquitecturas de microservicios para procesamiento de pagos en tiempo real. Certificada en AWS y experta en PSD2/Open Banking.",
    score: 0.94, disponibilidad: "disponible",
    habilidades: [
      { nombre: "Python",             categoria: "Lenguaje",   score: 0.9  },
      { nombre: "FastAPI",            categoria: "Framework",  score: 0.85 },
      { nombre: "PSD2",               categoria: "Regulación", score: 0.98 },
      { nombre: "Pasarelas de Pago",  categoria: "Dominio",    score: 0.96 },
      { nombre: "AWS",                categoria: "Cloud",      score: 0.88 },
      { nombre: "OAuth2",             categoria: "Protocolo",  score: 0.9  },
      { nombre: "PostgreSQL",         categoria: "DB",         score: 0.8  },
    ],
    proyectos: [
      { id: "proj_core_pagos", nombre: "Core-Pagos",  dominio: "Pagos Digitales", estado: "En Producción" },
      { id: "proj_open_api",   nombre: "BBVA Open API",dominio: "Open Banking",   estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_004", nombre: "Rodrigo Montoya",   rol: "Cloud & DevOps Architect", weight: 0.92 },
      { id: "emp_006", nombre: "Sebastián Molina",  rol: "Security Engineer",        weight: 0.88 },
      { id: "emp_007", nombre: "Isabela Carrasco",  rol: "Product Engineer",         weight: 0.85 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Valentina es un pilar del equipo. Su dominio técnico en PSD2 y arquitecturas de microservicios es excepcional. Lidera con el ejemplo y eleva el nivel de todos.",
      peer_comments: [
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya",  comentario: "Valentina siempre tiene una solución elegante para los problemas más complejos. Aprendo mucho trabajando con ella.", sentiment_score: 88 },
        { autor_id: "emp_006", autor_nombre: "Sebastián Molina", comentario: "Su comprensión de seguridad en APIs financieras es de primer nivel. Revisa el código con mucho criterio.", sentiment_score: 92 },
        { autor_id: "emp_007", autor_nombre: "Isabela Carrasco", comentario: "Excelente colaboradora. Siempre disponible y muy clara en la comunicación técnica.", sentiment_score: 85 },
      ],
    },
    b_tokens: wallet(285, [
      { id: "t001", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-15", contraparte_nombre: "Paula Jiménez" },
      { id: "t002", tipo: "earned", motivo: "Conexión de networking", cantidad: 20, fecha: "2026-03-08" },
      { id: "t003", tipo: "spent",  motivo: "Solicitud de mentoría",   cantidad: -30, fecha: "2026-02-20", contraparte_nombre: "Carlos Méndez" },
      { id: "t004", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
    ]),
    es_mentor: true, disponible_networking: true,
    networking_tags: ["PSD2 & Open Banking", "Microservicios", "APIs Financieras"],
  },

  {
    id: "emp_002", nombre: "Matías Fernández", email: "m.fernandez@bbva.com",
    rol: "ML Engineer", squad: "Data & AI", nivel: "Senior",
    ubicacion: "Buenos Aires", años_empresa: 5,
    bio: "Especialista en modelos de ML para detección de fraude y scoring crediticio. Certif. Google Cloud Professional ML Engineer.",
    score: 0.93, disponibilidad: "parcial", proyecto_asignado: "FraudeAI",
    habilidades: [
      { nombre: "Python",       categoria: "Lenguaje",     score: 0.95 },
      { nombre: "TensorFlow",   categoria: "Framework ML", score: 0.91 },
      { nombre: "MLflow",       categoria: "MLOps",        score: 0.87 },
      { nombre: "Scikit-learn", categoria: "Framework ML", score: 0.89 },
      { nombre: "Apache Spark", categoria: "Data",         score: 0.80 },
      { nombre: "Docker",       categoria: "DevOps",       score: 0.74 },
    ],
    proyectos: [
      { id: "proj_fraude_ai", nombre: "FraudeAI",      dominio: "Seguridad & Riesgo", estado: "En Producción" },
      { id: "proj_scoring",   nombre: "Smart Scoring",  dominio: "Créditos",          estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_009", nombre: "Andrea Palacios", rol: "Backend Engineer", weight: 0.88 },
      { id: "emp_001", nombre: "Valentina Ríos",  rol: "Senior Backend",   weight: 0.82 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Matías es el mejor ML Engineer que he tenido. Sus modelos de detección de fraude son de clase mundial y él lidera con humildad y generosidad de conocimiento.",
      peer_comments: [
        { autor_id: "emp_009", autor_nombre: "Andrea Palacios", comentario: "Matías tiene una capacidad impresionante para explicar conceptos complejos de ML de forma simple. Es un referente.", sentiment_score: 92 },
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",  comentario: "Colaborar con él en el pipeline de fraude fue una experiencia enriquecedora. Muy proactivo.", sentiment_score: 88 },
        { autor_id: "emp_010", autor_nombre: "Lucía Vargas",    comentario: "Matías eleva el nivel de calidad de todo lo que toca. Gran sentido de equipo.", sentiment_score: 85 },
      ],
    },
    b_tokens: wallet(580, [
      { id: "t010", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-04-01", contraparte_nombre: "Diego Restrepo" },
      { id: "t011", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-20", contraparte_nombre: "Paula Jiménez" },
      { id: "t012", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-15" },
      { id: "t013", tipo: "spent",  motivo: "Solicitud de mentoría",          cantidad: -30, fecha: "2026-02-10", contraparte_nombre: "Carlos Méndez" },
    ]),
    es_mentor: true, disponible_networking: true,
    networking_tags: ["Machine Learning", "Detección de Fraude", "MLOps"],
  },

  {
    id: "emp_003", nombre: "Camila Orozco", email: "c.orozco@bbva.com",
    rol: "Full-Stack Engineer", squad: "Experiencia Digital", nivel: "Mid",
    ubicacion: "Buenos Aires", años_empresa: 3,
    bio: "Desarrolla productos end-to-end con React, TypeScript y Node.js. Especialista en micro-frontends.",
    score: 0.82, disponibilidad: "disponible",
    habilidades: [
      { nombre: "React",           categoria: "Frontend",     score: 0.93 },
      { nombre: "TypeScript",      categoria: "Lenguaje",     score: 0.90 },
      { nombre: "Node.js",         categoria: "Backend",      score: 0.85 },
      { nombre: "GraphQL",         categoria: "API",          score: 0.82 },
      { nombre: "Micro-frontends", categoria: "Arquitectura", score: 0.78 },
    ],
    proyectos: [
      { id: "proj_bbva_connect", nombre: "BBVA Connect", dominio: "Experiencia Digital", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_007", nombre: "Isabela Carrasco", rol: "Product Engineer", weight: 0.78 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 1,
      manager_comment: "Camila tiene excelente potencial técnico y su trabajo en micro-frontends es de alta calidad. Está trabajando en mejorar la comunicación proactiva y los plazos de entrega.",
      peer_comments: [
        { autor_id: "emp_007", autor_nombre: "Isabela Carrasco", comentario: "Camila domina el stack frontend muy bien. A veces tarda en compartir bloqueos pero cuando lo hace resuelve rápido.", sentiment_score: 60 },
        { autor_id: "emp_018", autor_nombre: "Tomás Vega",       comentario: "Buen nivel técnico. Aprendemos juntos bien.", sentiment_score: 65 },
      ],
    },
    b_tokens: wallet(88, [
      { id: "t020", tipo: "earned", motivo: "Conexión de networking",   cantidad: 20, fecha: "2026-03-10" },
      { id: "t021", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
      { id: "t022", tipo: "spent",  motivo: "Solicitud de conexión",    cantidad: -15, fecha: "2026-02-05" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["React & TypeScript", "Micro-frontends", "Full-Stack"],
  },

  {
    id: "emp_004", nombre: "Rodrigo Montoya", email: "r.montoya@bbva.com",
    rol: "Cloud & DevOps Architect", squad: "Platform Engineering", nivel: "Staff",
    ubicacion: "Madrid", años_empresa: 9,
    bio: "Arquitecto de plataforma cloud con foco en Kubernetes, GitOps y CI/CD para sistemas financieros de alta disponibilidad.",
    score: 0.90, disponibilidad: "asignado", proyecto_asignado: "BBVA Platform",
    habilidades: [
      { nombre: "Kubernetes", categoria: "Infra",      score: 0.96 },
      { nombre: "AWS",        categoria: "Cloud",      score: 0.93 },
      { nombre: "Terraform",  categoria: "IaC",        score: 0.91 },
      { nombre: "GitOps",     categoria: "DevOps",     score: 0.88 },
      { nombre: "Docker",     categoria: "Contenedor", score: 0.92 },
      { nombre: "CI/CD",      categoria: "DevOps",     score: 0.90 },
    ],
    proyectos: [
      { id: "proj_platform",   nombre: "BBVA Platform", dominio: "Platform Engineering", estado: "En Producción" },
      { id: "proj_core_pagos", nombre: "Core-Pagos",    dominio: "Pagos Digitales",      estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_001", nombre: "Valentina Ríos", rol: "Senior Backend Engineer", weight: 0.92 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Rodrigo es indispensable. Su expertise en cloud native y liderazgo técnico es invaluable para BBVA. Mentoriza activamente a todo el equipo de plataforma.",
      peer_comments: [
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",  comentario: "Rodrigo resuelve problemas de infra que para el resto de nosotros son imposibles. Un referente.", sentiment_score: 90 },
        { autor_id: "emp_014", autor_nombre: "Diego Restrepo",  comentario: "Aprendo enormemente cada vez que trabajamos juntos. Muy generoso con su conocimiento.", sentiment_score: 85 },
        { autor_id: "emp_011", autor_nombre: "Carlos Méndez",   comentario: "Rodrigo tiene visión arquitectónica de largo plazo. Es confiable al 100%.", sentiment_score: 88 },
      ],
    },
    b_tokens: wallet(380, [
      { id: "t030", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-25", contraparte_nombre: "Diego Restrepo" },
      { id: "t031", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-02-28", contraparte_nombre: "Ana Durán" },
      { id: "t032", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-08" },
      { id: "t033", tipo: "spent",  motivo: "Solicitud de mentoría",          cantidad: -30, fecha: "2025-12-15", contraparte_nombre: "Carlos Méndez" },
    ]),
    es_mentor: true, disponible_networking: false,
    networking_tags: ["Kubernetes & GitOps", "Cloud Architecture", "CI/CD"],
  },

  {
    id: "emp_006", nombre: "Sebastián Molina", email: "s.molina@bbva.com",
    rol: "Security Engineer", squad: "Ciberseguridad", nivel: "Senior",
    ubicacion: "Madrid", años_empresa: 11,
    bio: "Especialista en seguridad de APIs financieras, OAuth2, mTLS y normativas PCI-DSS. Lidera el programa de bug bounty interno.",
    score: 0.81, disponibilidad: "disponible",
    habilidades: [
      { nombre: "OAuth2",   categoria: "Protocolo",  score: 0.97 },
      { nombre: "PCI-DSS",  categoria: "Regulación", score: 0.95 },
      { nombre: "PSD2",     categoria: "Regulación", score: 0.82 },
      { nombre: "AWS",      categoria: "Cloud",      score: 0.78 },
      { nombre: "Python",   categoria: "Lenguaje",   score: 0.75 },
    ],
    proyectos: [
      { id: "proj_open_api",   nombre: "BBVA Open API", dominio: "Open Banking",   estado: "En Producción" },
      { id: "proj_core_pagos", nombre: "Core-Pagos",    dominio: "Pagos Digitales",estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_001", nombre: "Valentina Ríos",   rol: "Senior Backend Engineer", weight: 0.88 },
      { id: "emp_007", nombre: "Isabela Carrasco", rol: "Product Engineer",        weight: 0.80 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Sebastián es nuestro referente en seguridad. Su expertise en PCI-DSS y OAuth2 nos ha salvado de múltiples vulnerabilidades críticas. Su bug bounty interno generó ROI inmediato.",
      peer_comments: [
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",   comentario: "Sebastián es invaluable para revisar la seguridad de nuestros endpoints. Muy meticuloso.", sentiment_score: 92 },
        { autor_id: "emp_007", autor_nombre: "Isabela Carrasco", comentario: "Siempre encuentra el detalle de seguridad que todos pasamos por alto. Muy proactivo.", sentiment_score: 94 },
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya",  comentario: "Sebastián lleva la seguridad de BBVA a otro nivel. Un referente absoluto.", sentiment_score: 88 },
      ],
    },
    b_tokens: wallet(445, [
      { id: "t040", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-04-05", contraparte_nombre: "Ana Durán" },
      { id: "t041", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-12" },
      { id: "t042", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-14" },
    ]),
    es_mentor: true, disponible_networking: true,
    networking_tags: ["Seguridad de APIs", "PCI-DSS", "OAuth2 & mTLS"],
  },

  {
    id: "emp_007", nombre: "Isabela Carrasco", email: "i.carrasco@bbva.com",
    rol: "Product Engineer", squad: "Open Banking", nivel: "Mid",
    ubicacion: "Lima", años_empresa: 4,
    bio: "Trabaja en la intersección de producto y tecnología. Especialista en integraciones con APIs de terceros bajo el estándar PSD2 y Open Finance.",
    score: 0.87, disponibilidad: "disponible",
    habilidades: [
      { nombre: "PSD2",         categoria: "Regulación", score: 0.92 },
      { nombre: "Open Banking", categoria: "Dominio",    score: 0.95 },
      { nombre: "OAuth2",       categoria: "Protocolo",  score: 0.85 },
      { nombre: "FastAPI",      categoria: "Framework",  score: 0.78 },
      { nombre: "PostgreSQL",   categoria: "DB",         score: 0.75 },
    ],
    proyectos: [
      { id: "proj_open_api",     nombre: "BBVA Open API", dominio: "Open Banking",       estado: "En Producción" },
      { id: "proj_bbva_connect", nombre: "BBVA Connect",  dominio: "Experiencia Digital",estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_001", nombre: "Valentina Ríos",   rol: "Senior Backend Engineer", weight: 0.85 },
      { id: "emp_006", nombre: "Sebastián Molina", rol: "Security Engineer",       weight: 0.80 },
      { id: "emp_003", nombre: "Camila Orozco",    rol: "Full-Stack Engineer",     weight: 0.78 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 2,
      manager_comment: "Isabela tiene buenas habilidades técnicas en Open Banking. El trabajo cross-funcional es su área de mejora — necesita ser más proactiva en la alineación con el equipo de backend.",
      peer_comments: [
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",   comentario: "Isabela conoce muy bien el dominio de Open Banking pero a veces tarda en escalar bloqueos.", sentiment_score: 65 },
        { autor_id: "emp_006", autor_nombre: "Sebastián Molina", comentario: "Buen conocimiento de PSD2. Puede mejorar en la documentación de integraciones.", sentiment_score: 58 },
      ],
    },
    b_tokens: wallet(75, [
      { id: "t050", tipo: "earned", motivo: "Conexión de networking",   cantidad: 20, fecha: "2026-02-20" },
      { id: "t051", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
      { id: "t052", tipo: "spent",  motivo: "Solicitud de mentoría",   cantidad: -30, fecha: "2026-01-25", contraparte_nombre: "Valentina Ríos" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["Open Banking", "PSD2", "Product Engineering"],
  },

  {
    id: "emp_009", nombre: "Andrea Palacios", email: "a.palacios@bbva.com",
    rol: "Backend Engineer", squad: "Créditos & Riesgos", nivel: "Mid",
    ubicacion: "Bogotá", años_empresa: 3,
    bio: "Especialista en sistemas de scoring crediticio y motores de decisión en tiempo real. Trabaja con Python, FastAPI y arquitecturas orientadas a eventos.",
    score: 0.73, disponibilidad: "disponible",
    habilidades: [
      { nombre: "Python",            categoria: "Lenguaje",   score: 0.9  },
      { nombre: "FastAPI",           categoria: "Framework",  score: 0.88 },
      { nombre: "Scoring Crediticio",categoria: "Dominio",    score: 0.93 },
      { nombre: "Apache Kafka",      categoria: "Tecnología", score: 0.82 },
      { nombre: "PostgreSQL",        categoria: "DB",         score: 0.8  },
    ],
    proyectos: [
      { id: "proj_credito_360", nombre: "Crédito 360",dominio: "Créditos & Riesgos", estado: "En Desarrollo" },
      { id: "proj_fraude_ai",   nombre: "FraudeAI",   dominio: "Seguridad & Riesgo", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_002", nombre: "Matías Fernández", rol: "ML Engineer", weight: 0.82 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 2,
      manager_comment: "Andrea muestra buen conocimiento de los sistemas de scoring. Necesita profundizar en arquitectura de eventos y mejorar la documentación técnica de sus componentes.",
      peer_comments: [
        { autor_id: "emp_002", autor_nombre: "Matías Fernández", comentario: "Andrea entiende bien el dominio de créditos. La documentación de sus APIs podría ser más detallada.", sentiment_score: 62 },
        { autor_id: "emp_010", autor_nombre: "Lucía Vargas",     comentario: "Buena compañera de trabajo. Cumple con sus compromisos.", sentiment_score: 68 },
      ],
    },
    b_tokens: wallet(60, [
      { id: "t060", tipo: "earned", motivo: "Feedback EDI completado",  cantidad: 30, fecha: "2026-01-10" },
      { id: "t061", tipo: "earned", motivo: "Conexión de networking",   cantidad: 20, fecha: "2026-02-15" },
      { id: "t062", tipo: "spent",  motivo: "Solicitud de conexión",    cantidad: -15, fecha: "2026-03-01" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["Scoring Crediticio", "Python/FastAPI", "Kafka"],
  },

  {
    id: "emp_010", nombre: "Lucía Vargas", email: "l.vargas@bbva.com",
    rol: "Senior Data Engineer", squad: "Data Platform", nivel: "Senior",
    ubicacion: "Bogotá", años_empresa: 6,
    bio: "Construye pipelines de datos a escala con Kafka, Spark y Airflow. Arquitecturas de datos para analítica en tiempo real.",
    score: 0.88, disponibilidad: "disponible",
    habilidades: [
      { nombre: "Apache Kafka",   categoria: "Streaming",      score: 0.95 },
      { nombre: "Apache Spark",   categoria: "Procesamiento",  score: 0.92 },
      { nombre: "Apache Airflow", categoria: "Orquestación",   score: 0.88 },
      { nombre: "dbt",            categoria: "Transformación", score: 0.83 },
      { nombre: "Python",         categoria: "Lenguaje",       score: 0.88 },
      { nombre: "Snowflake",      categoria: "Data Warehouse", score: 0.81 },
    ],
    proyectos: [
      { id: "proj_datalake", nombre: "BBVA DataLake",       dominio: "Data Platform", estado: "En Producción" },
      { id: "proj_realtime", nombre: "Real-time Analytics", dominio: "Analytics",     estado: "En Desarrollo" },
    ],
    colaboradores: [
      { id: "emp_002", nombre: "Matías Fernández", rol: "ML Engineer", weight: 0.85 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Lucía construyó nuestra plataforma de datos desde cero. Su comprensión de arquitecturas de streaming es la más alta del equipo. Referente técnico del área.",
      peer_comments: [
        { autor_id: "emp_002", autor_nombre: "Matías Fernández", comentario: "Lucía diseña pipelines que se escalan sin esfuerzo. Aprendo mucho de su enfoque.", sentiment_score: 78 },
        { autor_id: "emp_009", autor_nombre: "Andrea Palacios",  comentario: "Muy colaborativa y siempre dispuesta a ayudar con dudas sobre Kafka y Spark.", sentiment_score: 82 },
      ],
    },
    b_tokens: wallet(220, [
      { id: "t070", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-30", contraparte_nombre: "Diego Restrepo" },
      { id: "t071", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-12" },
      { id: "t072", tipo: "earned", motivo: "Conexión de networking",          cantidad: 20, fecha: "2026-02-25" },
    ]),
    es_mentor: true, disponible_networking: true,
    networking_tags: ["Data Engineering", "Kafka & Spark", "Real-time Analytics"],
  },

  {
    id: "emp_011", nombre: "Carlos Méndez", email: "c.mendez@bbva.com",
    rol: "Solutions Architect", squad: "Enterprise Architecture", nivel: "Staff",
    ubicacion: "Ciudad de México", años_empresa: 12,
    bio: "Arquitecto de soluciones con 12 años en banca. Arquitecturas hexagonales, DDD y estrategias de migración cloud.",
    score: 0.86, disponibilidad: "descanso_medico", disponibilidad_hasta: "2026-04-30",
    habilidades: [
      { nombre: "Arquit. Hexagonal",    categoria: "Diseño",       score: 0.95 },
      { nombre: "Microservicios",        categoria: "Arquitectura", score: 0.93 },
      { nombre: "AWS",                   categoria: "Cloud",        score: 0.88 },
      { nombre: "Domain-Driven Design",  categoria: "Metodología",  score: 0.91 },
      { nombre: "Event Sourcing",        categoria: "Patrón",       score: 0.85 },
      { nombre: "API Gateway",           categoria: "Infra",        score: 0.82 },
    ],
    proyectos: [
      { id: "proj_migration", nombre: "Cloud Migration 2025", dominio: "Enterprise",      estado: "En Producción" },
      { id: "proj_core_pagos",nombre: "Core-Pagos",           dominio: "Pagos Digitales", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_004", nombre: "Rodrigo Montoya", rol: "Cloud & DevOps Architect", weight: 0.90 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Carlos representa lo mejor del talento senior de BBVA. 12 años de impacto consistente. Su visión arquitectónica es un activo estratégico para la organización.",
      peer_comments: [
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya",  comentario: "Carlos tiene la visión más amplia que he visto en un arquitecto. Aprendo inmensamente de sus reviews.", sentiment_score: 88 },
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",   comentario: "Sus sesiones de arquitectura son de las mejores inversiones de tiempo del equipo.", sentiment_score: 91 },
        { autor_id: "emp_017", autor_nombre: "Mariana Costa",    comentario: "Carlos es mentor nata. Paciente, riguroso y muy generoso con su experiencia.", sentiment_score: 85 },
      ],
    },
    b_tokens: wallet(520, [
      { id: "t080", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-01", contraparte_nombre: "Mariana Costa" },
      { id: "t081", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-02-10", contraparte_nombre: "Valentina Ríos" },
      { id: "t082", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-09" },
    ]),
    es_mentor: true, disponible_networking: false,
    networking_tags: ["Arquitectura Hexagonal", "DDD", "Cloud Migration"],
  },

  {
    id: "emp_012", nombre: "Sofía Herrera", email: "s.herrera@bbva.com",
    rol: "Agile Coach / Scrum Master", squad: "Agile Center of Excellence", nivel: "Senior",
    ubicacion: "Lima", años_empresa: 8,
    bio: "Certificada SAFe y CSM. Lidera transformaciones ágiles en múltiples squads. Especialista en OKRs y Team Topologies.",
    score: 0.89, disponibilidad: "maternidad", disponibilidad_hasta: "2026-07-15",
    habilidades: [
      { nombre: "Scrum",        categoria: "Metodología", score: 0.97 },
      { nombre: "SAFe",         categoria: "Framework",   score: 0.92 },
      { nombre: "Kanban",       categoria: "Metodología", score: 0.88 },
      { nombre: "OKRs",         categoria: "Gestión",     score: 0.90 },
      { nombre: "Jira",         categoria: "Herramienta", score: 0.95 },
      { nombre: "Facilitación", categoria: "Soft Skills", score: 0.93 },
    ],
    proyectos: [
      { id: "proj_agile", nombre: "Agile at Scale", dominio: "Transformación", estado: "En Producción" },
    ],
    colaboradores: [],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Sofía transformó cómo trabajamos como organización. Su expertise en SAFe y facilitación elevó la madurez ágil de toda la empresa. Es una referente indiscutida.",
      peer_comments: [
        { autor_id: "emp_016", autor_nombre: "Felipe Castro",  comentario: "Sofía es el estándar de lo que debe ser un Agile Coach. Sus retrospectivas son transformadoras.", sentiment_score: 88 },
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos", comentario: "Gracias a Sofía nuestro squad mejoró enormemente en predictibilidad y bienestar.", sentiment_score: 84 },
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya",comentario: "Sofía tiene una capacidad única para hacer que equipos complejos funcionen bien.", sentiment_score: 90 },
      ],
    },
    b_tokens: wallet(310, [
      { id: "t090", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-02-15", contraparte_nombre: "Felipe Castro" },
      { id: "t091", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-11" },
      { id: "t092", tipo: "earned", motivo: "Conexión de networking",          cantidad: 20, fecha: "2026-01-20" },
    ]),
    es_mentor: true, disponible_networking: false,
    networking_tags: ["Agile Coaching", "SAFe", "OKRs & Facilitación"],
  },

  {
    id: "emp_013", nombre: "Paula Jiménez", email: "p.jimenez@bbva.com",
    rol: "ML Engineer", squad: "Data & AI", nivel: "Mid",
    ubicacion: "Lima", años_empresa: 2,
    bio: "ML Engineer con foco en NLP y modelos de lenguaje para personalización de productos financieros.",
    score: 0.84, disponibilidad: "disponible",
    habilidades: [
      { nombre: "Python",      categoria: "Lenguaje",     score: 0.90 },
      { nombre: "HuggingFace", categoria: "Framework ML", score: 0.88 },
      { nombre: "PyTorch",     categoria: "Framework ML", score: 0.85 },
      { nombre: "Vertex AI",   categoria: "MLOps",        score: 0.80 },
      { nombre: "FastAPI",     categoria: "Framework",    score: 0.78 },
    ],
    proyectos: [
      { id: "proj_nlp", nombre: "NLP Personalización", dominio: "Experiencia Digital", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_002", nombre: "Matías Fernández", rol: "ML Engineer", weight: 0.82 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 2,
      manager_comment: "Paula tiene buenas bases en NLP y sus modelos de personalización muestran resultados prometedores. Le falta experiencia en producción a escala y en manejo de incidentes.",
      peer_comments: [
        { autor_id: "emp_002", autor_nombre: "Matías Fernández", comentario: "Paula aprende muy rápido. Sus experimentos con HuggingFace son creativos y bien documentados.", sentiment_score: 65 },
        { autor_id: "emp_010", autor_nombre: "Lucía Vargas",     comentario: "Buena actitud de colaboración. Crece bien.", sentiment_score: 60 },
      ],
    },
    b_tokens: wallet(45, [
      { id: "t100", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
      { id: "t101", tipo: "earned", motivo: "Conexión de networking",  cantidad: 20, fecha: "2026-03-05" },
      { id: "t102", tipo: "spent",  motivo: "Solicitud de mentoría",   cantidad: -30, fecha: "2026-02-01", contraparte_nombre: "Matías Fernández" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["NLP", "HuggingFace", "ML para Finanzas"],
  },

  {
    id: "emp_014", nombre: "Diego Restrepo", email: "d.restrepo@bbva.com",
    rol: "DevOps Engineer", squad: "Platform Engineering", nivel: "Mid",
    ubicacion: "Bogotá", años_empresa: 3,
    bio: "Especialista en CI/CD, observabilidad y automatización de infraestructura para entornos financieros en AWS y GCP.",
    score: 0.83, disponibilidad: "parcial", proyecto_asignado: "API Marketplace",
    habilidades: [
      { nombre: "GitHub Actions", categoria: "CI/CD",   score: 0.92 },
      { nombre: "ArgoCD",         categoria: "GitOps",  score: 0.88 },
      { nombre: "Prometheus",     categoria: "Monitor", score: 0.85 },
      { nombre: "Helm",           categoria: "K8s",     score: 0.82 },
      { nombre: "GCP",            categoria: "Cloud",   score: 0.79 },
    ],
    proyectos: [
      { id: "proj_api_mkt", nombre: "API Marketplace", dominio: "Platform", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_004", nombre: "Rodrigo Montoya", rol: "Cloud & DevOps Architect", weight: 0.88 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 2,
      manager_comment: "Diego gestiona bien la CI/CD pero necesita mejorar en observabilidad avanzada y en la respuesta a incidentes de producción fuera del horario laboral.",
      peer_comments: [
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya",  comentario: "Diego tiene buen conocimiento de GitOps. Necesita más experiencia en incidentes complejos.", sentiment_score: 55 },
        { autor_id: "emp_015", autor_nombre: "Ana Durán",        comentario: "Trabajar con Diego es agradable. Me ayuda cuando tengo dudas de Jenkins.", sentiment_score: 62 },
      ],
    },
    b_tokens: wallet(30, [
      { id: "t110", tipo: "earned", motivo: "Conexión de networking",  cantidad: 20, fecha: "2026-02-10" },
      { id: "t111", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
      { id: "t112", tipo: "spent",  motivo: "Solicitud de mentoría",   cantidad: -30, fecha: "2026-01-20", contraparte_nombre: "Rodrigo Montoya" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["CI/CD", "Observabilidad", "GitOps"],
  },

  {
    id: "emp_015", nombre: "Ana Durán", email: "a.duran@bbva.com",
    rol: "DevOps Engineer", squad: "Platform Engineering", nivel: "Junior",
    ubicacion: "Madrid", años_empresa: 1,
    bio: "Automatiza despliegues y mantiene pipelines de integración continua. Experiencia en entornos regulados del sector financiero.",
    score: 0.76, disponibilidad: "disponible",
    habilidades: [
      { nombre: "Docker",  categoria: "Contenedor", score: 0.88 },
      { nombre: "Jenkins", categoria: "CI/CD",      score: 0.84 },
      { nombre: "AWS",     categoria: "Cloud",      score: 0.78 },
      { nombre: "Linux",   categoria: "Infra",      score: 0.85 },
      { nombre: "Bash",    categoria: "Scripting",  score: 0.80 },
    ],
    proyectos: [
      { id: "proj_devops_onboarding", nombre: "DevOps Onboarding", dominio: "Platform", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_014", nombre: "Diego Restrepo", rol: "DevOps Engineer", weight: 0.84 },
    ],
    edi: {
      año: 2025, rating: 3, manager_rating: 3,
      manager_comment: "Ana necesita mejorar significativamente la calidad de sus entregas. Ha habido problemas recurrentes en despliegues y la comunicación de bloqueos es tardía. Requiere plan de desarrollo activo.",
      peer_comments: [
        { autor_id: "emp_014", autor_nombre: "Diego Restrepo",  comentario: "Ana está en proceso de aprendizaje. Necesita más supervisión en tareas de producción.", sentiment_score: 30 },
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya", comentario: "Tiene disposición para aprender pero la ejecución autónoma todavía es inconsistente.", sentiment_score: 40 },
      ],
    },
    b_tokens: wallet(10, [
      { id: "t120", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
      { id: "t121", tipo: "spent",  motivo: "Solicitud de mentoría",   cantidad: -30, fecha: "2026-01-15", contraparte_nombre: "Rodrigo Montoya" },
    ]),
    es_mentor: false, disponible_networking: true,
    networking_tags: ["DevOps Junior", "Docker", "Jenkins"],
  },

  {
    id: "emp_016", nombre: "Felipe Castro", email: "f.castro@bbva.com",
    rol: "Scrum Master", squad: "Pagos Digitales", nivel: "Mid",
    ubicacion: "Buenos Aires", años_empresa: 5,
    bio: "Scrum Master certificado CSM y CSPO. Facilita equipos de producto en squads de pagos e innovación.",
    score: 0.81, disponibilidad: "vacaciones", disponibilidad_hasta: "2026-05-20",
    habilidades: [
      { nombre: "Scrum",        categoria: "Metodología", score: 0.93 },
      { nombre: "Kanban",       categoria: "Metodología", score: 0.88 },
      { nombre: "Jira",         categoria: "Herramienta", score: 0.92 },
      { nombre: "Confluence",   categoria: "Herramienta", score: 0.88 },
      { nombre: "Facilitación", categoria: "Soft Skills", score: 0.85 },
    ],
    proyectos: [
      { id: "proj_pagos_team", nombre: "Squad Pagos v2", dominio: "Pagos Digitales", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_012", nombre: "Sofía Herrera", rol: "Agile Coach", weight: 0.86 },
    ],
    edi: {
      año: 2025, rating: 2, manager_rating: 1,
      manager_comment: "Felipe hace un trabajo sólido como Scrum Master. Su facilitación es clara y el squad lo valora. Puede mejorar en la gestión de impedimentos escalados y en las métricas de equipo.",
      peer_comments: [
        { autor_id: "emp_012", autor_nombre: "Sofía Herrera",  comentario: "Felipe aplica bien las prácticas ágiles. Sus retrospectivas han mejorado mucho este año.", sentiment_score: 65 },
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos", comentario: "Felipe mantiene el ritmo del squad ordenado. Es un apoyo importante.", sentiment_score: 70 },
      ],
    },
    b_tokens: wallet(90, [
      { id: "t130", tipo: "earned", motivo: "Conexión de networking",  cantidad: 20, fecha: "2026-03-15" },
      { id: "t131", tipo: "earned", motivo: "Feedback EDI completado", cantidad: 30, fecha: "2026-01-10" },
    ]),
    es_mentor: false, disponible_networking: false,
    networking_tags: ["Scrum", "Facilitación", "Gestión Ágil"],
  },

  {
    id: "emp_017", nombre: "Mariana Costa", email: "m.costa@bbva.com",
    rol: "Solutions Architect", squad: "Architecture Guild", nivel: "Senior",
    ubicacion: "Lima", años_empresa: 7,
    bio: "Diseña arquitecturas cloud-native para productos de banca digital. Especializada en API-first y event-driven systems.",
    score: 0.84, disponibilidad: "disponible",
    habilidades: [
      { nombre: "API-first Design",   categoria: "Arquitectura", score: 0.93 },
      { nombre: "Event-driven Arch.", categoria: "Arquitectura", score: 0.90 },
      { nombre: "Azure",              categoria: "Cloud",        score: 0.87 },
      { nombre: "OpenAPI",            categoria: "Estándar",     score: 0.88 },
      { nombre: "Kafka",              categoria: "Messaging",    score: 0.82 },
    ],
    proyectos: [
      { id: "proj_api_design", nombre: "API Design Standards", dominio: "Platform", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_011", nombre: "Carlos Méndez", rol: "Solutions Architect", weight: 0.88 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Mariana define el estándar de diseño de APIs en BBVA. Su trabajo en API-first y event-driven architecture ha sido adoptado por 8 squads. Excelente referente técnica.",
      peer_comments: [
        { autor_id: "emp_011", autor_nombre: "Carlos Méndez",   comentario: "Mariana tiene una visión muy clara de hacia dónde debe ir nuestra arquitectura. Excelente trabajo.", sentiment_score: 80 },
        { autor_id: "emp_004", autor_nombre: "Rodrigo Montoya", comentario: "Sus estándares de API nos ahorran tiempo en todos los proyectos. Gran aporte.", sentiment_score: 85 },
      ],
    },
    b_tokens: wallet(165, [
      { id: "t140", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-20", contraparte_nombre: "Felipe Castro" },
      { id: "t141", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-12" },
      { id: "t142", tipo: "spent",  motivo: "Solicitud de mentoría",          cantidad: -30, fecha: "2026-02-01", contraparte_nombre: "Carlos Méndez" },
    ]),
    es_mentor: true, disponible_networking: true,
    networking_tags: ["API-first Design", "Event-driven", "Cloud Architecture"],
  },

  {
    id: "emp_018", nombre: "Tomás Vega", email: "t.vega@bbva.com",
    rol: "Frontend Engineer", squad: "Experiencia Digital", nivel: "Senior",
    ubicacion: "Buenos Aires", años_empresa: 6,
    bio: "Desarrolla interfaces de alta performance para productos bancarios. Experto en accesibilidad, design systems y React.",
    score: 0.85, disponibilidad: "asignado", proyecto_asignado: "BBVA Connect",
    habilidades: [
      { nombre: "React",          categoria: "Frontend",     score: 0.95 },
      { nombre: "TypeScript",     categoria: "Lenguaje",     score: 0.92 },
      { nombre: "Next.js",        categoria: "Framework",    score: 0.88 },
      { nombre: "Design Systems", categoria: "UI",           score: 0.90 },
      { nombre: "Web Perf.",      categoria: "Optimización", score: 0.85 },
    ],
    proyectos: [
      { id: "proj_bbva_connect", nombre: "BBVA Connect", dominio: "Experiencia Digital", estado: "En Producción" },
    ],
    colaboradores: [
      { id: "emp_003", nombre: "Camila Orozco", rol: "Full-Stack Engineer", weight: 0.88 },
    ],
    edi: {
      año: 2025, rating: 1, manager_rating: 1,
      manager_comment: "Tomás eleva la barra de calidad del frontend de BBVA. Sus design systems son adoptados por múltiples equipos y su atención a la accesibilidad es ejemplar.",
      peer_comments: [
        { autor_id: "emp_003", autor_nombre: "Camila Orozco",  comentario: "Tomás es el referente de calidad de UI. Sus code reviews siempre aportan mucho valor.", sentiment_score: 85 },
        { autor_id: "emp_007", autor_nombre: "Isabela Carrasco",comentario: "El design system que construyó Tomás nos ahorra semanas de trabajo. Muy buena colaboración.", sentiment_score: 90 },
        { autor_id: "emp_001", autor_nombre: "Valentina Ríos",  comentario: "Tomás siempre está disponible para ayudar. Muy buen compañero de equipo.", sentiment_score: 82 },
      ],
    },
    b_tokens: wallet(200, [
      { id: "t150", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-03-18", contraparte_nombre: "Camila Orozco" },
      { id: "t151", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-13" },
      { id: "t152", tipo: "earned", motivo: "Conexión de networking",          cantidad: 20, fecha: "2026-02-28" },
    ]),
    es_mentor: true, disponible_networking: false,
    networking_tags: ["React & Next.js", "Design Systems", "Web Performance"],
  },
];

// ── Augment with calculated trust scores ──────────────────────────────────

function augment(raw: Omit<EmpleadoResult, "trust_score">): EmpleadoResult {
  return { ...raw, trust_score: calculateTrustScore(raw as EmpleadoResult) };
}

export const CANDIDATE_POOL: Record<string, EmpleadoResult> =
  Object.fromEntries(RAW.map(e => [e.id, augment(e)]));

// ── Mock user wallet (the logged-in manager persona) ──────────────────────

export const MOCK_USER_WALLET = wallet(245, [
  { id: "u001", tipo: "earned", motivo: "Sesión de mentoría completada", cantidad: 50, fecha: "2026-04-10", contraparte_nombre: "Valentina Ríos" },
  { id: "u002", tipo: "earned", motivo: "Feedback EDI completado",        cantidad: 30, fecha: "2026-01-08" },
  { id: "u003", tipo: "spent",  motivo: "Solicitud de mentoría",          cantidad: -30, fecha: "2026-03-05", contraparte_nombre: "Carlos Méndez" },
]);

// ── Search results ────────────────────────────────────────────────────────

export const MOCK_SEARCH_RESULT: SearchResponse = {
  query: "Necesito un experto en pasarelas de pago y PSD2",
  intencion_detectada:
    "Perfil senior con experiencia en integración de pasarelas de pago, normativa PSD2 y APIs financieras seguras (OAuth2, mTLS).",
  total: 4,
  candidatos: [
    CANDIDATE_POOL["emp_001"],
    CANDIDATE_POOL["emp_007"],
    CANDIDATE_POOL["emp_006"],
    CANDIDATE_POOL["emp_009"],
  ],
};

// ── Graph data ────────────────────────────────────────────────────────────

export const MOCK_GRAPH: Record<string, GraphResponse> = {
  emp_001: {
    nodes: [
      { id: "emp_emp_001",    label: "Valentina Ríos",       type: "empleado",    properties: { rol: "Senior Backend Engineer", squad: "Pagos Digitales", nivel: "Senior", ubicacion: "Buenos Aires" } },
      { id: "skill_Python",   label: "Python",                type: "habilidad",   properties: { categoria: "Lenguaje" } },
      { id: "skill_FastAPI",  label: "FastAPI",               type: "habilidad",   properties: { categoria: "Framework" } },
      { id: "skill_PSD2",     label: "PSD2",                  type: "habilidad",   properties: { categoria: "Regulación" } },
      { id: "skill_Pasarelas",label: "Pasarelas de Pago",     type: "habilidad",   properties: { categoria: "Dominio" } },
      { id: "skill_AWS",      label: "AWS",                   type: "habilidad",   properties: { categoria: "Cloud" } },
      { id: "skill_OAuth2",   label: "OAuth2",                type: "habilidad",   properties: { categoria: "Protocolo" } },
      { id: "proj_core_pagos",label: "Core-Pagos",            type: "proyecto",    properties: { dominio: "Pagos Digitales", estado: "En Producción" } },
      { id: "proj_open_api",  label: "BBVA Open API",         type: "proyecto",    properties: { dominio: "Open Banking", estado: "En Producción" } },
      { id: "emp_emp_004",    label: "Rodrigo Montoya",       type: "colaborador", properties: { rol: "Cloud & DevOps Architect" } },
      { id: "emp_emp_006",    label: "Sebastián Molina",      type: "colaborador", properties: { rol: "Security Engineer" } },
      { id: "emp_emp_007",    label: "Isabela Carrasco",      type: "colaborador", properties: { rol: "Product Engineer" } },
    ],
    links: [
      { source: "emp_emp_001", target: "skill_Python",    type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_001", target: "skill_FastAPI",   type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_001", target: "skill_PSD2",      type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_001", target: "skill_Pasarelas", type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_001", target: "skill_AWS",       type: "HAS_SKILL",        properties: { nivel_dominio: "Avanzado" } },
      { source: "emp_emp_001", target: "skill_OAuth2",    type: "HAS_SKILL",        properties: { nivel_dominio: "Avanzado" } },
      { source: "emp_emp_001", target: "proj_core_pagos", type: "WORKED_ON",        properties: { rol_en_proyecto: "Lead" } },
      { source: "emp_emp_001", target: "proj_open_api",   type: "WORKED_ON",        properties: { rol_en_proyecto: "Contributor" } },
      { source: "emp_emp_001", target: "emp_emp_004",     type: "COLLABORATES_WITH",properties: { weight: 0.92 } },
      { source: "emp_emp_001", target: "emp_emp_006",     type: "COLLABORATES_WITH",properties: { weight: 0.88 } },
      { source: "emp_emp_001", target: "emp_emp_007",     type: "COLLABORATES_WITH",properties: { weight: 0.85 } },
    ],
  },
  emp_007: {
    nodes: [
      { id: "emp_emp_007",       label: "Isabela Carrasco",  type: "empleado",    properties: { rol: "Product Engineer", squad: "Open Banking", nivel: "Mid", ubicacion: "Lima" } },
      { id: "skill_PSD2",        label: "PSD2",              type: "habilidad",   properties: { categoria: "Regulación" } },
      { id: "skill_OpenBanking", label: "Open Banking",      type: "habilidad",   properties: { categoria: "Dominio" } },
      { id: "skill_OAuth2",      label: "OAuth2",            type: "habilidad",   properties: { categoria: "Protocolo" } },
      { id: "skill_FastAPI",     label: "FastAPI",           type: "habilidad",   properties: { categoria: "Framework" } },
      { id: "skill_PostgreSQL",  label: "PostgreSQL",        type: "habilidad",   properties: { categoria: "Base de Datos" } },
      { id: "proj_open_api",     label: "BBVA Open API",     type: "proyecto",    properties: { dominio: "Open Banking", estado: "En Producción" } },
      { id: "proj_bbva_connect", label: "BBVA Connect",      type: "proyecto",    properties: { dominio: "Experiencia Digital", estado: "En Producción" } },
      { id: "emp_emp_001",       label: "Valentina Ríos",    type: "colaborador", properties: { rol: "Senior Backend Engineer" } },
      { id: "emp_emp_006",       label: "Sebastián Molina",  type: "colaborador", properties: { rol: "Security Engineer" } },
      { id: "emp_emp_003",       label: "Camila Orozco",     type: "colaborador", properties: { rol: "Full-Stack Engineer" } },
    ],
    links: [
      { source: "emp_emp_007", target: "skill_PSD2",        type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_007", target: "skill_OpenBanking",  type: "HAS_SKILL",        properties: { nivel_dominio: "Experto" } },
      { source: "emp_emp_007", target: "skill_OAuth2",       type: "HAS_SKILL",        properties: { nivel_dominio: "Avanzado" } },
      { source: "emp_emp_007", target: "skill_FastAPI",      type: "HAS_SKILL",        properties: { nivel_dominio: "Avanzado" } },
      { source: "emp_emp_007", target: "skill_PostgreSQL",   type: "HAS_SKILL",        properties: { nivel_dominio: "Intermedio" } },
      { source: "emp_emp_007", target: "proj_open_api",      type: "WORKED_ON",        properties: { rol_en_proyecto: "Lead" } },
      { source: "emp_emp_007", target: "proj_bbva_connect",  type: "WORKED_ON",        properties: { rol_en_proyecto: "Contributor" } },
      { source: "emp_emp_007", target: "emp_emp_001",        type: "COLLABORATES_WITH",properties: { weight: 0.85 } },
      { source: "emp_emp_007", target: "emp_emp_006",        type: "COLLABORATES_WITH",properties: { weight: 0.80 } },
      { source: "emp_emp_007", target: "emp_emp_003",        type: "COLLABORATES_WITH",properties: { weight: 0.78 } },
    ],
  },
};

export function getMockGraph(employeeId: string): GraphResponse {
  return MOCK_GRAPH[employeeId] ?? MOCK_GRAPH["emp_001"];
}

// ── Role categorization + team composition ────────────────────────────────

const ROLE_CANDIDATES: Record<string, string[]> = {
  ml:       ["emp_002", "emp_013", "emp_009"],
  devops:   ["emp_004", "emp_014", "emp_015"],
  data:     ["emp_010", "emp_009", "emp_002"],
  arch:     ["emp_011", "emp_017", "emp_004"],
  scrum:    ["emp_012", "emp_016", "emp_007"],
  backend:  ["emp_001", "emp_009", "emp_003", "emp_014"],
  frontend: ["emp_003", "emp_007", "emp_018"],
  security: ["emp_006", "emp_001", "emp_011"],
  product:  ["emp_007", "emp_012", "emp_016"],
  default:  ["emp_001", "emp_009", "emp_003"],
};

function categorizeRole(role: string): string {
  const n = role.toLowerCase();
  if (n.includes("ml") || n.includes("machine") || n.includes("ia") || n.includes("ai") || n.includes("modelo")) return "ml";
  if (n.includes("devops") || n.includes("cloud") || n.includes("platform") || n.includes("sre") || n.includes("infra")) return "devops";
  if (n.includes("data eng") || n.includes("data engineer") || n.includes("pipeline") || n.includes("kafka")) return "data";
  if (n.includes("architect") || n.includes("solutions") || n.includes("arquitecto")) return "arch";
  if (n.includes("scrum") || n.includes("agile") || n.includes("coach")) return "scrum";
  if (n.includes("frontend") || n.includes("ios") || n.includes("android") || n.includes("react") || n.includes("ux")) return "frontend";
  if (n.includes("security") || n.includes("seguridad") || n.includes("cyber")) return "security";
  if (n.includes("product") || n.includes("po") || n.includes("owner")) return "product";
  if (n.includes("backend") || n.includes("api") || n.includes("python") || n.includes("node")) return "backend";
  return "default";
}

export function getMockTeamComposition(request: { project_name: string; roles: { role: string; quantity: number }[] }): TeamCompositionResponse {
  const MIN_CANDIDATES = 3;

  const roleMatches = request.roles.map(({ role, quantity }) => {
    const cat = categorizeRole(role);
    const ids = ROLE_CANDIDATES[cat] ?? ROLE_CANDIDATES["default"];
    const candidates = ids
      .map(id => CANDIDATE_POOL[id])
      .filter(Boolean)
      .slice(0, Math.max(quantity, MIN_CANDIDATES))
      .sort((a, b) => (b.trust_score?.overall ?? 0) - (a.trust_score?.overall ?? 0))
      .map((c, i) => ({ ...c, score: Math.min(0.99, c.score - i * 0.03) }));
    return { role, quantity, candidates };
  });

  const allSkills = new Set<string>();
  roleMatches.forEach(rm => rm.candidates.forEach(c => c.habilidades.forEach(h => allSkills.add(h.nombre))));
  const filledRoles = roleMatches.filter(rm => rm.candidates.length >= rm.quantity).length;
  const gaps = roleMatches
    .filter(rm => rm.candidates.length < rm.quantity)
    .map(rm => `${rm.role} (${rm.candidates.length}/${rm.quantity})`);

  return {
    project_name: request.project_name,
    roles: roleMatches,
    coverage_score: Math.round((filledRoles / roleMatches.length) * 100),
    total_skills: allSkills.size,
    gaps,
  };
}

// ── Networking profiles ───────────────────────────────────────────────────

/**
 * Returns a deterministic pseudo-random number 0..n-1 derived from a string seed.
 * Used to keep mentor capacity stable across renders (always same mentees count
 * for the same employee id) without committing to one hardcoded value per employee.
 */
function seededInt(seed: string, n: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % n;
}

/** Returns an ISO date `weeks` weeks ahead of today */
function dateWeeksAhead(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function getMockNetworkingProfiles(): NetworkingProfile[] {
  const MENTOR_CUPO = 2; // BBVA Perú policy: 2 mentees max simultaneous

  const mentors: NetworkingProfile[] = RAW
    .filter(e => e.es_mentor && e.disponible_networking)
    .map(e => {
      // Deterministic mentor capacity: 0, 1 or 2 active mentees
      const menteesActuales = seededInt(e.id + "mentees", 3);
      const isFull = menteesActuales >= MENTOR_CUPO;

      return {
        empleado: CANDIDATE_POOL[e.id],
        tipo: "mentor" as const,
        disponibilidad_horaria: "Lunes y Miércoles 17:00-18:00",
        temas: e.networking_tags ?? [],
        costo_bt: 30,
        mentees_actuales: menteesActuales,
        cupo_maximo: MENTOR_CUPO,
        // Si el cupo está lleno, fecha tentativa entre 4 y 12 semanas adelante
        ...(isFull ? { proxima_disponibilidad: dateWeeksAhead(4 + seededInt(e.id + "date", 9)) } : {}),
      };
    });

  const peers: NetworkingProfile[] = RAW
    .filter(e => !e.es_mentor && e.disponible_networking && (CANDIDATE_POOL[e.id].trust_score?.overall ?? 0) >= 50)
    .map(e => ({
      empleado: CANDIDATE_POOL[e.id],
      tipo: "peer" as const,
      disponibilidad_horaria: "Flexible",
      temas: e.networking_tags ?? [],
      costo_bt: 15,
    }));

  return [...mentors, ...peers].sort(
    (a, b) => (b.empleado.trust_score?.overall ?? 0) - (a.empleado.trust_score?.overall ?? 0)
  );
}

// ── SDA Projects ──────────────────────────────────────────────────────────

export const MOCK_SDA_PROJECTS: SDAProject[] = [
  { codigo: "SDA-53021", nombre: "FX Tracker",                  dominio: "Pagos Digitales",    estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 2 }, { role: "Backend Engineer", quantity: 1 }, { role: "DevOps Engineer", quantity: 1 }] },
  { codigo: "SDA-53022", nombre: "Open Banking Hub",            dominio: "Open Banking",        estado: "En desarrollo",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "Security Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53023", nombre: "Credit Score Engine",         dominio: "Créditos & Riesgos",  estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 2 }, { role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }] },
  { codigo: "SDA-53024", nombre: "Fraud Detection AI",          dominio: "Seguridad & Riesgo",  estado: "En desarrollo",
    roles: [{ role: "ML Engineer", quantity: 2 }, { role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53025", nombre: "Payment Gateway 3.0",         dominio: "Pagos Digitales",     estado: "En planificación",
    roles: [{ role: "Backend Engineer", quantity: 2 }, { role: "Security Engineer", quantity: 1 }, { role: "DevOps Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53026", nombre: "Mobile Onboarding",           dominio: "Experiencia Digital", estado: "En desarrollo",
    roles: [{ role: "Frontend Engineer", quantity: 2 }, { role: "Backend Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53027", nombre: "Risk Analytics Platform",     dominio: "Gestión de Riesgo",   estado: "En planificación",
    roles: [{ role: "Data Engineer", quantity: 2 }, { role: "ML Engineer", quantity: 1 }, { role: "Solutions Architect", quantity: 1 }] },
  { codigo: "SDA-53028", nombre: "KYC Automation",              dominio: "Compliance",          estado: "En desarrollo",
    roles: [{ role: "ML Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Security Engineer", quantity: 1 }] },
  { codigo: "SDA-53029", nombre: "Wealth Management API",       dominio: "Inversiones",         estado: "En planificación",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53030", nombre: "BNPL Engine",                 dominio: "Créditos",            estado: "En desarrollo",
    roles: [{ role: "ML Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "DevOps Engineer", quantity: 1 }] },
  { codigo: "SDA-53031", nombre: "Carbon Footprint Tracker",    dominio: "Sostenibilidad",      estado: "En planificación",
    roles: [{ role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Frontend Engineer", quantity: 1 }] },
  { codigo: "SDA-53032", nombre: "SME Lending Platform",        dominio: "Créditos PyME",       estado: "En planificación",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "ML Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53033", nombre: "Real-time Notifications",     dominio: "Plataforma",          estado: "En desarrollo",
    roles: [{ role: "Backend Engineer", quantity: 1 }, { role: "DevOps Engineer", quantity: 1 }, { role: "Frontend Engineer", quantity: 1 }] },
  { codigo: "SDA-53034", nombre: "Regulatory Reporting v2",     dominio: "Compliance",          estado: "En planificación",
    roles: [{ role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53035", nombre: "Customer 360 Dashboard",      dominio: "CRM",                 estado: "En desarrollo",
    roles: [{ role: "Data Engineer", quantity: 1 }, { role: "Frontend Engineer", quantity: 1 }, { role: "ML Engineer", quantity: 1 }] },
  { codigo: "SDA-53036", nombre: "Transaction Categorization",  dominio: "IA & Analytics",      estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 2 }, { role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }] },
  { codigo: "SDA-53037", nombre: "Digital Wallet 2.0",          dominio: "Pagos",               estado: "En desarrollo",
    roles: [{ role: "Frontend Engineer", quantity: 2 }, { role: "Backend Engineer", quantity: 1 }, { role: "Security Engineer", quantity: 1 }] },
  { codigo: "SDA-53038", nombre: "AML Monitor",                 dominio: "Compliance",          estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 1 }, { role: "Data Engineer", quantity: 1 }, { role: "Security Engineer", quantity: 1 }] },
  { codigo: "SDA-53039", nombre: "API Marketplace",             dominio: "Plataforma",          estado: "En producción",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "DevOps Engineer", quantity: 1 }] },
  { codigo: "SDA-53040", nombre: "Data Governance Platform",    dominio: "Datos",               estado: "En planificación",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Data Engineer", quantity: 2 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53041", nombre: "Conversational Banking",      dominio: "IA",                  estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 2 }, { role: "Backend Engineer", quantity: 1 }, { role: "Frontend Engineer", quantity: 1 }] },
  { codigo: "SDA-53042", nombre: "Invoice Financing",           dominio: "Créditos",            estado: "En desarrollo",
    roles: [{ role: "Backend Engineer", quantity: 1 }, { role: "ML Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53043", nombre: "Insurance Integration",       dominio: "Seguros",             estado: "En planificación",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53044", nombre: "Branch Digitalization",       dominio: "Canales",             estado: "En desarrollo",
    roles: [{ role: "Frontend Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Scrum Master", quantity: 1 }] },
  { codigo: "SDA-53045", nombre: "Crypto Custody Pilot",        dominio: "Digital Assets",      estado: "En planificación",
    roles: [{ role: "Security Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "DevOps Engineer", quantity: 1 }] },
  { codigo: "SDA-53046", nombre: "ESG Scoring Engine",          dominio: "Sostenibilidad",      estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 1 }, { role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }] },
  { codigo: "SDA-53047", nombre: "Biometric Authentication",    dominio: "Seguridad",           estado: "En desarrollo",
    roles: [{ role: "Security Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "ML Engineer", quantity: 1 }] },
  { codigo: "SDA-53048", nombre: "Treasury Management",         dominio: "Tesorería",           estado: "En planificación",
    roles: [{ role: "Solutions Architect", quantity: 1 }, { role: "Backend Engineer", quantity: 2 }, { role: "Data Engineer", quantity: 1 }] },
  { codigo: "SDA-53049", nombre: "Mortgage Calculator AI",      dominio: "Hipotecas",           estado: "En planificación",
    roles: [{ role: "ML Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "Frontend Engineer", quantity: 1 }] },
  { codigo: "SDA-53050", nombre: "Intraday Liquidity Monitor",  dominio: "Tesorería",           estado: "En desarrollo",
    roles: [{ role: "Data Engineer", quantity: 1 }, { role: "Backend Engineer", quantity: 1 }, { role: "DevOps Engineer", quantity: 1 }] },
];
