"""
BBVA Talent — Neo4j Seed Script
Pobla la base de datos con 10 empleados hiperrealistas + relaciones + embeddings simulados.
Requiere: pip install neo4j openai python-dotenv
"""

import os
import random
import time
from dotenv import load_dotenv
from neo4j import GraphDatabase
from openai import OpenAI

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)


# ─── Datos Maestros ────────────────────────────────────────────────────────────

EMPLEADOS = [
    {
        "id": "emp_001",
        "nombre": "Valentina Ríos",
        "email": "v.rios@bbva.com",
        "rol": "Senior Backend Engineer",
        "squad": "Pagos Digitales",
        "nivel": "Senior",
        "ubicacion": "Buenos Aires",
        "bio": "Especialista en arquitecturas de microservicios para procesamiento de pagos en tiempo real. Certificada en AWS y experta en PSD2/Open Banking.",
    },
    {
        "id": "emp_002",
        "nombre": "Matías Fernández",
        "email": "m.fernandez@bbva.com",
        "rol": "Machine Learning Engineer",
        "squad": "Data & AI",
        "nivel": "Senior",
        "ubicacion": "Madrid",
        "bio": "Especializado en modelos predictivos para detección de fraude y scoring crediticio. Contribuidor activo en proyectos de MLOps.",
    },
    {
        "id": "emp_003",
        "nombre": "Camila Orozco",
        "email": "c.orozco@bbva.com",
        "rol": "Full-Stack Engineer",
        "squad": "Experiencia Digital",
        "nivel": "Mid",
        "ubicacion": "México DF",
        "bio": "Desarrolladora apasionada por las interfaces de usuario accesibles. Especialista en React, Next.js y arquitecturas frontend escalables.",
    },
    {
        "id": "emp_004",
        "nombre": "Rodrigo Montoya",
        "email": "r.montoya@bbva.com",
        "rol": "Cloud & DevOps Architect",
        "squad": "Platform Engineering",
        "nivel": "Staff",
        "ubicacion": "Bogotá",
        "bio": "Arquitecto de infraestructura cloud-native en AWS y GCP. Experto en Kubernetes, Terraform y estrategias de GitOps para entornos financieros regulados.",
    },
    {
        "id": "emp_005",
        "nombre": "Luciana Vargas",
        "email": "l.vargas@bbva.com",
        "rol": "Data Engineer",
        "squad": "Data & AI",
        "nivel": "Mid",
        "ubicacion": "Buenos Aires",
        "bio": "Especialista en pipelines de datos con Apache Spark y Kafka. Construye la base de datos analítica que alimenta los modelos de riesgo del banco.",
    },
    {
        "id": "emp_006",
        "nombre": "Sebastián Molina",
        "email": "s.molina@bbva.com",
        "rol": "Security Engineer",
        "squad": "Ciberseguridad",
        "nivel": "Senior",
        "ubicacion": "Madrid",
        "bio": "Especialista en seguridad de APIs financieras, OAuth2, mTLS y normativas PCI-DSS. Lidera el programa de bug bounty interno.",
    },
    {
        "id": "emp_007",
        "nombre": "Isabela Carrasco",
        "email": "i.carrasco@bbva.com",
        "rol": "Product Engineer",
        "squad": "Open Banking",
        "nivel": "Mid",
        "ubicacion": "Lima",
        "bio": "Trabaja en la intersección de producto y tecnología. Especialista en integraciones con APIs de terceros bajo el estándar PSD2 y Open Finance.",
    },
    {
        "id": "emp_008",
        "nombre": "Tomás Gutiérrez",
        "email": "t.gutierrez@bbva.com",
        "rol": "iOS Engineer",
        "squad": "Mobile Banking",
        "nivel": "Senior",
        "ubicacion": "Buenos Aires",
        "bio": "Desarrollador iOS con 8 años de experiencia en la app de BBVA. Experto en SwiftUI, rendimiento y accesibilidad en aplicaciones financieras de alta escala.",
    },
    {
        "id": "emp_009",
        "nombre": "Andrea Palacios",
        "email": "a.palacios@bbva.com",
        "rol": "Backend Engineer",
        "squad": "Créditos & Riesgos",
        "nivel": "Mid",
        "ubicacion": "Bogotá",
        "bio": "Especialista en sistemas de scoring crediticio y motores de decisión en tiempo real. Trabaja con Python, FastAPI y arquitecturas orientadas a eventos.",
    },
    {
        "id": "emp_010",
        "nombre": "Felipe Salas",
        "email": "f.salas@bbva.com",
        "rol": "Platform Engineer",
        "squad": "Platform Engineering",
        "nivel": "Mid",
        "ubicacion": "México DF",
        "bio": "Especialista en observabilidad, SRE y gestión de incidentes. Implementa SLOs, dashboards con Grafana y pipelines de alertas para servicios críticos.",
    },
]

HABILIDADES = [
    # Backend
    {"nombre": "Python", "categoria": "Lenguaje", "descripcion": "Lenguaje de programación de alto nivel para backend y data science"},
    {"nombre": "FastAPI", "categoria": "Framework", "descripcion": "Framework moderno de Python para APIs REST de alto rendimiento"},
    {"nombre": "Java", "categoria": "Lenguaje", "descripcion": "Lenguaje para sistemas enterprise de alta disponibilidad"},
    {"nombre": "Go", "categoria": "Lenguaje", "descripcion": "Lenguaje eficiente para microservicios y sistemas concurrentes"},
    # Frontend
    {"nombre": "React", "categoria": "Framework", "descripcion": "Librería JavaScript para construir interfaces de usuario reactivas"},
    {"nombre": "Next.js", "categoria": "Framework", "descripcion": "Framework React para aplicaciones web full-stack con SSR"},
    {"nombre": "TypeScript", "categoria": "Lenguaje", "descripcion": "Superset tipado de JavaScript para proyectos escalables"},
    # Data / ML
    {"nombre": "Machine Learning", "categoria": "Disciplina", "descripcion": "Construcción de modelos predictivos con datos históricos"},
    {"nombre": "Apache Spark", "categoria": "Tecnología", "descripcion": "Motor de procesamiento distribuido para big data"},
    {"nombre": "Apache Kafka", "categoria": "Tecnología", "descripcion": "Plataforma de streaming de eventos en tiempo real"},
    {"nombre": "PyTorch", "categoria": "Framework", "descripcion": "Framework de deep learning para investigación y producción"},
    {"nombre": "MLOps", "categoria": "Práctica", "descripcion": "Prácticas para desplegar y mantener modelos ML en producción"},
    # Cloud / DevOps
    {"nombre": "AWS", "categoria": "Cloud", "descripcion": "Plataforma de servicios cloud de Amazon"},
    {"nombre": "Kubernetes", "categoria": "Tecnología", "descripcion": "Orquestador de contenedores para despliegues a escala"},
    {"nombre": "Terraform", "categoria": "Tecnología", "descripcion": "Infraestructura como código para entornos cloud"},
    {"nombre": "Docker", "categoria": "Tecnología", "descripcion": "Plataforma de contenerización de aplicaciones"},
    # Fintech / Pagos
    {"nombre": "PSD2", "categoria": "Regulación", "descripcion": "Directiva europea de servicios de pago que habilita Open Banking"},
    {"nombre": "Open Banking", "categoria": "Dominio", "descripcion": "Ecosistema de APIs financieras abiertas e interoperables"},
    {"nombre": "Pasarelas de Pago", "categoria": "Dominio", "descripcion": "Sistemas de procesamiento y autorización de transacciones"},
    {"nombre": "Scoring Crediticio", "categoria": "Dominio", "descripcion": "Modelos para evaluación automática de riesgo de crédito"},
    # Seguridad
    {"nombre": "OAuth2", "categoria": "Protocolo", "descripcion": "Protocolo estándar de autorización para APIs seguras"},
    {"nombre": "PCI-DSS", "categoria": "Regulación", "descripcion": "Estándar de seguridad para el manejo de datos de tarjetas"},
    # Mobile
    {"nombre": "Swift", "categoria": "Lenguaje", "descripcion": "Lenguaje de Apple para desarrollo nativo iOS/macOS"},
    {"nombre": "SwiftUI", "categoria": "Framework", "descripcion": "Framework declarativo de Apple para interfaces iOS modernas"},
    # Base de Datos
    {"nombre": "PostgreSQL", "categoria": "Base de Datos", "descripcion": "Sistema de gestión de bases de datos relacional avanzado"},
    {"nombre": "Neo4j", "categoria": "Base de Datos", "descripcion": "Base de datos de grafos para relaciones complejas"},
    # Observabilidad
    {"nombre": "Grafana", "categoria": "Herramienta", "descripcion": "Plataforma de visualización para métricas y logs"},
    {"nombre": "SRE", "categoria": "Práctica", "descripcion": "Site Reliability Engineering para alta disponibilidad"},
]

PROYECTOS = [
    {
        "id": "proj_glomo",
        "nombre": "GloMo",
        "descripcion": "Rediseño global de la app móvil de BBVA para iOS y Android con arquitectura modular",
        "dominio": "Mobile Banking",
        "estado": "En Producción",
    },
    {
        "id": "proj_core_pagos",
        "nombre": "Core-Pagos",
        "descripcion": "Migración del núcleo de procesamiento de pagos a microservicios en AWS",
        "dominio": "Pagos Digitales",
        "estado": "En Producción",
    },
    {
        "id": "proj_fraude_ai",
        "nombre": "FraudeAI",
        "descripcion": "Motor de detección de fraude en tiempo real usando modelos de ML y grafos de transacciones",
        "dominio": "Seguridad & Riesgo",
        "estado": "En Producción",
    },
    {
        "id": "proj_open_api",
        "nombre": "BBVA Open API",
        "descripcion": "Plataforma de APIs abiertas bajo estándar PSD2 para el ecosistema de fintechs",
        "dominio": "Open Banking",
        "estado": "En Producción",
    },
    {
        "id": "proj_data_lake",
        "nombre": "DataLake 2.0",
        "descripcion": "Arquitectura de lago de datos en AWS S3 + Glue + Redshift para analítica avanzada",
        "dominio": "Data & AI",
        "estado": "En Desarrollo",
    },
    {
        "id": "proj_credito_360",
        "nombre": "Crédito 360",
        "descripcion": "Sistema de decisión crediticia en tiempo real con modelos de scoring alternativos",
        "dominio": "Créditos & Riesgos",
        "estado": "En Desarrollo",
    },
    {
        "id": "proj_platform_k8s",
        "nombre": "Platform K8s",
        "descripcion": "Plataforma interna de Kubernetes multi-tenant para todos los squads de ingeniería",
        "dominio": "Platform Engineering",
        "estado": "En Producción",
    },
    {
        "id": "proj_bbva_connect",
        "nombre": "BBVA Connect",
        "descripcion": "App web de banca digital para PYMES con integración contable y fiscal",
        "dominio": "Experiencia Digital",
        "estado": "En Producción",
    },
]

# ─── Asignaciones: empleado → habilidades ────────────────────────────────────

EMP_SKILLS = {
    "emp_001": ["Python", "FastAPI", "PostgreSQL", "AWS", "Pasarelas de Pago", "PSD2", "Kafka", "Docker"],
    "emp_002": ["Python", "Machine Learning", "PyTorch", "MLOps", "Apache Spark", "PostgreSQL"],
    "emp_003": ["React", "Next.js", "TypeScript", "Python", "FastAPI", "PostgreSQL"],
    "emp_004": ["AWS", "Kubernetes", "Terraform", "Docker", "Go", "SRE"],
    "emp_005": ["Python", "Apache Spark", "Apache Kafka", "PostgreSQL", "AWS"],
    "emp_006": ["Python", "OAuth2", "PCI-DSS", "PSD2", "AWS"],
    "emp_007": ["Python", "FastAPI", "Open Banking", "PSD2", "OAuth2", "PostgreSQL"],
    "emp_008": ["Swift", "SwiftUI", "TypeScript", "React"],
    "emp_009": ["Python", "FastAPI", "Scoring Crediticio", "Machine Learning", "PostgreSQL", "Apache Kafka"],
    "emp_010": ["Python", "Kubernetes", "Grafana", "SRE", "Docker", "AWS"],
}

# ─── Asignaciones: empleado → proyectos ──────────────────────────────────────

EMP_PROJECTS = {
    "emp_001": ["proj_core_pagos", "proj_open_api"],
    "emp_002": ["proj_fraude_ai", "proj_data_lake"],
    "emp_003": ["proj_bbva_connect", "proj_open_api"],
    "emp_004": ["proj_platform_k8s", "proj_core_pagos"],
    "emp_005": ["proj_data_lake", "proj_fraude_ai"],
    "emp_006": ["proj_open_api", "proj_core_pagos"],
    "emp_007": ["proj_open_api", "proj_bbva_connect"],
    "emp_008": ["proj_glomo", "proj_bbva_connect"],
    "emp_009": ["proj_credito_360", "proj_fraude_ai"],
    "emp_010": ["proj_platform_k8s", "proj_core_pagos"],
}

# ─── Red de colaboración (simulando Google Meet / reuniones frecuentes) ───────

COLABORACIONES = [
    ("emp_001", "emp_004", 0.92, "Arquitectura de microservicios en Core-Pagos"),
    ("emp_001", "emp_006", 0.88, "Seguridad de APIs de pago"),
    ("emp_001", "emp_007", 0.85, "Integración PSD2"),
    ("emp_002", "emp_005", 0.95, "Pipeline de datos para FraudeAI"),
    ("emp_002", "emp_009", 0.82, "Modelos de scoring y riesgo"),
    ("emp_003", "emp_007", 0.78, "Frontend de Open API"),
    ("emp_003", "emp_008", 0.71, "Experiencia digital cross-platform"),
    ("emp_004", "emp_010", 0.93, "Platform Engineering y SRE"),
    ("emp_005", "emp_002", 0.95, "Data lake y features para ML"),
    ("emp_006", "emp_007", 0.80, "Seguridad en Open Banking"),
    ("emp_008", "emp_003", 0.71, "Componentes compartidos"),
    ("emp_009", "emp_002", 0.82, "Modelos predictivos crédito"),
    ("emp_010", "emp_004", 0.93, "Infraestructura platform"),
]

# ─── Conceptos relacionados (para expansión de queries de IA) ─────────────────

SKILL_CONCEPTS = [
    ("PSD2", "Open Banking"),
    ("PSD2", "Pasarelas de Pago"),
    ("PSD2", "OAuth2"),
    ("Machine Learning", "Scoring Crediticio"),
    ("Machine Learning", "MLOps"),
    ("Apache Spark", "Apache Kafka"),
    ("AWS", "Kubernetes"),
    ("AWS", "Terraform"),
    ("Pasarelas de Pago", "PCI-DSS"),
    ("Pasarelas de Pago", "OAuth2"),
    ("Open Banking", "OAuth2"),
    ("Scoring Crediticio", "Machine Learning"),
    ("SRE", "Grafana"),
    ("SRE", "Kubernetes"),
    ("FastAPI", "Python"),
    ("Next.js", "React"),
    ("SwiftUI", "Swift"),
]


def get_embedding(text: str) -> list[float]:
    """Obtiene embedding real de OpenAI o simulado si no hay API key."""
    if OPENAI_API_KEY:
        try:
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"  [WARN] OpenAI error: {e}. Usando embedding simulado.")

    # Embedding simulado: vector de 1536 dimensiones con valores pseudoaleatorios
    random.seed(hash(text) % (2**32))
    return [random.gauss(0, 0.1) for _ in range(1536)]


def seed_database(driver):
    with driver.session() as session:
        print("\n🔥 Limpiando base de datos...")
        session.run("MATCH (n) DETACH DELETE n")

        # ── Crear índices ─────────────────────────────────────────────────────
        print("📐 Creando índices...")
        session.run("CREATE INDEX emp_id IF NOT EXISTS FOR (e:Empleado) ON (e.id)")
        session.run("CREATE INDEX skill_nombre IF NOT EXISTS FOR (s:Habilidad) ON (s.nombre)")
        session.run("CREATE INDEX proj_id IF NOT EXISTS FOR (p:Proyecto) ON (p.id)")

        # ── Crear Habilidades con embeddings ──────────────────────────────────
        print("\n🧠 Creando habilidades con embeddings...")
        for skill in HABILIDADES:
            text = f"{skill['nombre']}: {skill['descripcion']}"
            embedding = get_embedding(text)
            session.run(
                """
                CREATE (s:Habilidad {
                    nombre: $nombre,
                    categoria: $categoria,
                    descripcion: $descripcion,
                    embedding: $embedding
                })
                """,
                nombre=skill["nombre"],
                categoria=skill["categoria"],
                descripcion=skill["descripcion"],
                embedding=embedding,
            )
            print(f"  ✅ {skill['nombre']}")
            time.sleep(0.1)  # Throttle para no saturar la API

        # ── Crear Proyectos con embeddings ────────────────────────────────────
        print("\n🚀 Creando proyectos con embeddings...")
        for proj in PROYECTOS:
            text = f"{proj['nombre']}: {proj['descripcion']}"
            embedding = get_embedding(text)
            session.run(
                """
                CREATE (p:Proyecto {
                    id: $id,
                    nombre: $nombre,
                    descripcion: $descripcion,
                    dominio: $dominio,
                    estado: $estado,
                    embedding: $embedding
                })
                """,
                **proj,
                embedding=embedding,
            )
            print(f"  ✅ {proj['nombre']}")
            time.sleep(0.1)

        # ── Crear Empleados con embeddings ────────────────────────────────────
        print("\n👥 Creando empleados con embeddings...")
        for emp in EMPLEADOS:
            text = f"{emp['nombre']}, {emp['rol']}: {emp['bio']}"
            embedding = get_embedding(text)
            session.run(
                """
                CREATE (e:Empleado {
                    id: $id,
                    nombre: $nombre,
                    email: $email,
                    rol: $rol,
                    squad: $squad,
                    nivel: $nivel,
                    ubicacion: $ubicacion,
                    bio: $bio,
                    embedding: $embedding
                })
                """,
                **emp,
                embedding=embedding,
            )
            print(f"  ✅ {emp['nombre']}")
            time.sleep(0.1)

        # ── Relaciones Empleado → Habilidad ───────────────────────────────────
        print("\n🔗 Creando relaciones HAS_SKILL...")
        for emp_id, skills in EMP_SKILLS.items():
            for skill_name in skills:
                session.run(
                    """
                    MATCH (e:Empleado {id: $emp_id}), (s:Habilidad {nombre: $skill_name})
                    CREATE (e)-[:HAS_SKILL {nivel_dominio: $nivel}]->(s)
                    """,
                    emp_id=emp_id,
                    skill_name=skill_name,
                    nivel=random.choice(["Experto", "Avanzado", "Intermedio"]),
                )

        # ── Relaciones Empleado → Proyecto ────────────────────────────────────
        print("🔗 Creando relaciones WORKED_ON...")
        for emp_id, projects in EMP_PROJECTS.items():
            for proj_id in projects:
                session.run(
                    """
                    MATCH (e:Empleado {id: $emp_id}), (p:Proyecto {id: $proj_id})
                    CREATE (e)-[:WORKED_ON {rol_en_proyecto: $rol}]->(p)
                    """,
                    emp_id=emp_id,
                    proj_id=proj_id,
                    rol=random.choice(["Lead", "Contributor", "Reviewer"]),
                )

        # ── Relaciones Empleado ↔ Empleado (COLLABORATES_WITH) ─────────────
        print("🔗 Creando relaciones COLLABORATES_WITH...")
        for emp1_id, emp2_id, weight, contexto in COLABORACIONES:
            session.run(
                """
                MATCH (e1:Empleado {id: $emp1}), (e2:Empleado {id: $emp2})
                CREATE (e1)-[:COLLABORATES_WITH {weight: $weight, contexto: $contexto}]->(e2)
                CREATE (e2)-[:COLLABORATES_WITH {weight: $weight, contexto: $contexto}]->(e1)
                """,
                emp1=emp1_id,
                emp2=emp2_id,
                weight=weight,
                contexto=contexto,
            )

        # ── Relaciones Habilidad → Concepto (RELATED_TO) ───────────────────
        print("🔗 Creando relaciones RELATED_TO entre habilidades...")
        for skill1, skill2 in SKILL_CONCEPTS:
            session.run(
                """
                MATCH (s1:Habilidad {nombre: $skill1}), (s2:Habilidad {nombre: $skill2})
                MERGE (s1)-[:RELATED_TO]->(s2)
                """,
                skill1=skill1,
                skill2=skill2,
            )

        # ── Verificación final ─────────────────────────────────────────────
        result = session.run("""
            MATCH (e:Empleado) WITH count(e) AS emp
            MATCH (s:Habilidad) WITH emp, count(s) AS skills
            MATCH (p:Proyecto) WITH emp, skills, count(p) AS projects
            MATCH ()-[r:HAS_SKILL]->() WITH emp, skills, projects, count(r) AS hs
            MATCH ()-[r:WORKED_ON]->() WITH emp, skills, projects, hs, count(r) AS wo
            MATCH ()-[r:COLLABORATES_WITH]->() WITH emp, skills, projects, hs, wo, count(r) AS cw
            RETURN emp, skills, projects, hs, wo, cw
        """)
        stats = result.single()
        print(f"""
╔══════════════════════════════════════╗
║   ✅ SEED COMPLETADO                 ║
╠══════════════════════════════════════╣
║  Empleados:         {stats['emp']:>4}               ║
║  Habilidades:       {stats['skills']:>4}               ║
║  Proyectos:         {stats['projects']:>4}               ║
║  Rel. HAS_SKILL:    {stats['hs']:>4}               ║
║  Rel. WORKED_ON:    {stats['wo']:>4}               ║
║  Rel. COLLABORATES: {stats['cw']:>4}               ║
╚══════════════════════════════════════╝
        """)


if __name__ == "__main__":
    print("🏦 BBVA Talent — Neo4j Seed")
    print(f"   Conectando a {NEO4J_URI}...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    try:
        driver.verify_connectivity()
        print("   ✅ Conexión exitosa")
        seed_database(driver)
    finally:
        driver.close()
