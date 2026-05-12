# BBVA Talent — Arquitectura de producción en AWS

> Documento técnico para la transición del MVP (frontend-only con mocks) hacia un sistema productivo en AWS. Orientado al jurado de **ableChallenge 2026** y a un futuro equipo de plataforma que vaya a implementarlo.

---

## 1. Resumen ejecutivo

BBVA Talent es una plataforma de descubrimiento y composición de equipos para los **1.800 colaboradores** de BBVA Engineering. Hoy es un MVP frontend-only (Next.js 16 + React 19) con datos mock; este documento describe el camino para llevarlo a producción multi-región sobre AWS.

| Aspecto | Decisión |
|---------|----------|
| **Cloud primaria** | AWS (Frankfurt `eu-central-1` como región principal, Madrid `eu-south-2` como secundaria) |
| **Frontend** | Next.js sobre **AWS Amplify Hosting** en MVP → **Open Next + CloudFront + Lambda** en escala |
| **Auth** | **Cognito** federado vía SAML con el IdP corporativo (Microsoft Entra ID / Okta) |
| **Datos** | **Aurora PostgreSQL Serverless v2** + **Neptune** (knowledge graph) + **OpenSearch** (vector + full-text) |
| **AI** | **Bedrock** (Claude Opus 4.7 para NL, Titan Embeddings para vectorización) |
| **Integraciones BBVA** | PrivateLink + Direct Connect a on-prem; EventBridge para eventos asincrónicos |
| **Compliance** | GDPR + PCI-DSS-aligned + ISO 27001 + audit WORM en S3 con Object Lock |
| **Costo MVP estimado** | ~**$2.500/mes** para 1.800 MAU con uso moderado de IA |
| **Timeline al GA** | **12 semanas** distribuidas en 4 fases |

---

## 2. Diagrama de alto nivel

```
                                  ┌────────────────────────────────┐
                                  │  Usuarios BBVA Engineering     │
                                  │  (browsers, VPN corp, móvil)   │
                                  └──────────────┬─────────────────┘
                                                 │ HTTPS
                                                 ▼
                                  ┌────────────────────────────────┐
                                  │  Route 53  (latency-based)     │
                                  └──────────────┬─────────────────┘
                                                 ▼
                                  ┌────────────────────────────────┐
                                  │  CloudFront + WAF + Shield     │
                                  └──────────────┬─────────────────┘
                                                 ▼
              ┌──────────────────────────────────┴──────────────────────────────────┐
              │                       Amplify Hosting (Next.js)                     │
              │                  SSR + ISR + Edge functions (feature flags)         │
              └──────────────────────────────────┬──────────────────────────────────┘
                                                 │ JWT (Cognito)
                                                 ▼
              ┌──────────────────────────────────┴──────────────────────────────────┐
              │                          API Gateway (REST + WebSocket)             │
              │              · JWT authorizer (Cognito)  · rate-limit  · usage plans│
              └────────┬─────────────────────┬─────────────────────┬────────────────┘
                       │                     │                     │
                       ▼                     ▼                     ▼
              ┌────────────────┐  ┌────────────────────┐  ┌─────────────────────┐
              │ Lambda          │  │ ECS Fargate         │  │ Step Functions      │
              │ (queries CRUD) │  │ (KG traversals,     │  │ (EDI cycles,        │
              │                │  │  ML orchestration)  │  │  onboarding flows)  │
              └────┬───────────┘  └─────────┬───────────┘  └─────────┬───────────┘
                   │                        │                        │
                   ▼                        ▼                        ▼
   ┌───────────────┴────────────────────────┴────────────────────────┴───────────────┐
   │                              Data & AI layer                                   │
   │                                                                                │
   │  ┌──────────────┐  ┌─────────┐  ┌───────────────┐  ┌──────────┐  ┌──────────┐  │
   │  │Aurora        │  │Neptune  │  │OpenSearch     │  │DynamoDB  │  │S3 (WORM) │  │
   │  │Postgres      │  │(KG)     │  │(vector + FT)  │  │(sessions │  │exports,  │  │
   │  │              │  │         │  │               │  │ ledger)  │  │audit logs│  │
   │  └──────────────┘  └─────────┘  └───────────────┘  └──────────┘  └──────────┘  │
   │                                                                                │
   │  ┌────────────────────────────────────────────────────────────────────────┐   │
   │  │                   AWS Bedrock                                          │   │
   │  │     · Claude Opus 4.7  (chat refinement, why-this-candidate)           │   │
   │  │     · Titan Embeddings  (perfiles, skills, proyectos → vectores)       │   │
   │  └────────────────────────────────────────────────────────────────────────┘   │
   │                                                                                │
   │  ┌────────────────────┐    ┌──────────────────────────────────────────────┐   │
   │  │ ElastiCache (Redis)│    │ SageMaker  (modelo propietario: predicción    │   │
   │  │  query cache, RT   │    │  de éxito de equipo, propensión a retención) │   │
   │  └────────────────────┘    └──────────────────────────────────────────────┘   │
   └────────────────────────────────────────┬───────────────────────────────────────┘
                                            │
                                            ▼
                ┌───────────────────────────┴──────────────────────────────┐
                │              Integration layer                           │
                │  · EventBridge bus  · SQS  · MSK (Kafka)  · Glue (ETL)   │
                └───────────────────────────┬──────────────────────────────┘
                                            │ PrivateLink / Direct Connect
                                            ▼
                ┌───────────────────────────┴──────────────────────────────┐
                │     Sistemas internos BBVA (on-prem / private cloud)     │
                │   · HR Hub (Workday/SAP SF)  · SDA  · EDI  · B-Tokens    │
                └──────────────────────────────────────────────────────────┘

   Observability cross-cutting:
   CloudWatch · X-Ray · Datadog · Macie · GuardDuty · Security Hub · Config · CloudTrail
```

---

## 3. Capas detalladas

### 3.1 Edge / CDN

| Servicio | Función |
|----------|---------|
| **CloudFront** | Distribución global con caching agresivo de assets estáticos; SSR-aware con Lambda@Edge para feature flags y experimentos A/B |
| **AWS WAF** | Managed Rules (OWASP Top 10, anti-bot, geo-blocking de países no aprobados por compliance BBVA) |
| **Shield Standard** | DDoS protection incluida; evaluar Shield Advanced si el target del jurado se expone públicamente |
| **Route 53** | DNS con latency-based routing entre regiones primaria (Frankfurt) y secundaria (Madrid); health checks para failover automático |
| **ACM** | Certificados TLS gestionados, rotación automática |

**Tradeoff:** CloudFront es la única opción razonable para un SaaS de BBVA. La pregunta es Shield Advanced vs Standard: el costo extra ($3.000/mes) solo se justifica si BBVA Talent termina expuesto a internet público. Para uso interno (VPN + corporate WiFi), Standard alcanza.

### 3.2 Frontend (Next.js 16)

**Recomendación MVP:** **AWS Amplify Hosting** — soporte nativo para Next.js 16, deploy desde GitHub Actions en minutos, SSR/ISR out-of-the-box, preview environments por PR, costo bajo.

**Recomendación escala (>5k MAU concurrentes):** migrar a **Open Next** desplegado como Lambda + CloudFront + S3. Más complejo pero permite separar SSR de assets estáticos y escala mejor con tráfico burst.

**Por qué NO Vercel:** aunque Vercel es la opción canónica para Next.js, BBVA requiere data residency en AWS por regulación interna. Federar Vercel a AWS añade complejidad sin beneficio claro.

**Por qué NO ECS Fargate del frontend en MVP:** requiere mantener un Dockerfile, gestionar imágenes en ECR, configurar ALB, target groups, scaling policies. Para un Next.js standard, Amplify lo hace todo y permite enfocar el esfuerzo en backend y AI.

### 3.3 Identity & Access

Los usuarios son **colaboradores internos de BBVA** — no se crean cuentas desde la app.

```
Usuario  →  Microsoft Entra ID (corporate IdP)  →  Cognito User Pool  →  JWT  →  API
            (SAML/OIDC)                            (federación)
```

| Componente | Función |
|------------|---------|
| **Cognito User Pool** | Federa con el IdP corporativo de BBVA (Entra ID típicamente); emite JWT con claims `employee_id`, `nivel`, `squad`, `roles` |
| **Cognito Identity Pool** | (opcional) Permite invocar AWS services directamente desde el browser para operaciones de bajo riesgo |
| **MFA** | Obligatorio para roles `manager` y `admin`; impulsado desde el IdP |
| **JWT scopes** | `talent:read`, `talent:write`, `talent:admin`, `bt:transfer`, `edi:write` — granularidad para autorización en API Gateway |
| **Session policy** | TTL 8h activa, refresh con sliding window de 30min de inactividad |

**Tradeoff:** Cognito como intermediario añade una capa, pero desacopla la app del IdP específico — si BBVA cambia de Entra ID a Okta en el futuro, solo cambia la federación, no la aplicación.

### 3.4 API Layer

| Componente | Workload típico |
|------------|-----------------|
| **API Gateway (REST)** | Endpoints CRUD: empleados, proyectos, equipos, EDI cycles, B-Tokens |
| **API Gateway (WebSocket)** | Chat de refinamiento (mensajes streaming desde Bedrock), notificaciones en tiempo real |
| **Lambda** | Queries simples, validación, agregaciones < 10s |
| **ECS Fargate** | Workloads >10s o que requieren cold start mínimo: traversals de Knowledge Graph, orquestación de inferencias ML, generación de PDFs de equipo |
| **Step Functions** | Workflows multi-paso con estado: ciclo anual de EDI, onboarding de nuevo empleado, mass team composition |

**Rate limiting:** API Gateway Usage Plans con quotas por rol (manager: 1000 req/min, employee: 100 req/min, admin: ilimitado).

### 3.5 Data layer

#### Aurora PostgreSQL Serverless v2 — datos estructurados

Tabla principal. Almacena:
- `empleados` (datos canónicos sincronizados desde HR Hub)
- `proyectos_sda` (catálogo de proyectos con roles requeridos)
- `team_composiciones` (historial de equipos formados, decisiones del manager)
- `edi_cycles` (auto-evals + manager feedback + peer comments)
- `b_tokens_ledger` (transacciones inmutables — append-only)
- `audit_log` (toda mutación queda registrada)

**Por qué Serverless v2:** la carga es bursty (picos durante ciclos EDI cada 6 meses, mass team composition al inicio de quarter). Scaling automático ACU 0.5 → 16 evita over-provisioning.

**Backup:** Continuous backups + snapshots cross-region cada 6h. RPO = 5min, RTO = 15min.

#### Neptune — Knowledge Graph

Almacena las relaciones complejas que hoy emulamos en `mock-data.ts`:

```
(:Empleado)-[:HAS_SKILL {nivel}]->(:Skill)
(:Empleado)-[:WORKED_ON {rol}]->(:Proyecto)
(:Empleado)-[:COLLABORATED_WITH {weight}]->(:Empleado)
(:Empleado)-[:MENTORS]->(:Empleado)
(:Empleado)-[:BELONGS_TO]->(:Squad)
(:Squad)-[:IN_DOMAIN]->(:Dominio)
(:Proyecto)-[:REQUIRES_ROLE {quantity}]->(:Rol)
```

Queries típicas:
- "Dame todos los empleados a 2 hops de Valentina con skill Python"
- "Mejor 5 candidatos para rol ML Engineer con disponibilidad y skill match"
- "Mostrá la red de colaboración del equipo X resaltando gaps"

**Por qué Neptune y no Neo4j AuraDB:** Neptune es managed AWS, queda dentro del VPC privado de BBVA por defecto, IAM-native, billing único. Neo4j Aura requiere salida a internet → complica el modelo de seguridad bancario.

**Tradeoff:** Cypher queries en Neptune (openCypher) son ~95% compatibles con Neo4j; algunas funciones avanzadas (APOC) faltan. Para BBVA Talent, suficiente.

#### OpenSearch — búsqueda semántica + full-text + facetada

Combina 3 capacidades:
1. **Búsqueda full-text** con BM25 + sinónimos (ES/EN/PT) sobre bios, descripciones de proyectos
2. **Vector search** (k-NN engine) sobre embeddings generados por Bedrock Titan — esto reemplaza el mock de `searchTalent()` con búsqueda semántica real
3. **Filtros facetados**: nivel, squad, dominio, disponibilidad, ubicación — sin necesidad de queries SQL complejas

**Cluster size MVP:** 3 nodos `r6g.large.search` (multi-AZ), $222/mes.

#### DynamoDB — operaciones de alto throughput

- **B-Tokens transactions:** stream append-only, partition key por `employee_id`. Trillones de escrituras posibles a costo predecible.
- **Sessions / presence:** quién está activo en la app, qué vista está viendo (para analytics y "X otros managers están viendo este proyecto")
- **Refinement chat state:** mensajes intermedios del chat de Bedrock antes de persistir el equipo final

Pay-per-request, ~$50/mes estimado a esta escala.

#### S3 — archivos y audit

- **`bbva-talent-exports`**: PDFs de equipos exportados, snapshots de propuestas
- **`bbva-talent-avatars`**: fotos de perfil (sincronizadas desde HR Hub)
- **`bbva-talent-audit-logs`**: **Object Lock en modo Compliance** + WORM por **7 años** (requisito regulatorio interno BBVA para audit trail de decisiones que afectan asignación de personal)
- **`bbva-talent-cloudtrail`**: trail completo de la cuenta AWS

Cifrado at-rest con KMS CMK específica por bucket. Versioning habilitado.

#### ElastiCache (Redis) — cache caliente

- Resultados de queries de Knowledge Graph (TTL 5min) — los grafos no cambian frecuentemente
- Embeddings de skills/proyectos (TTL 1h)
- Trust scores calculados (recálculo nocturno, sirve desde cache durante el día)

Cluster: `cache.t4g.small` × 2 (primary + replica), $60/mes.

### 3.6 AI / ML layer

#### Bedrock — LLM y embeddings

| Uso | Modelo | Costo unitario |
|-----|--------|----------------|
| **Refinement chat** (`"quitá los de Pagos"`) | Claude Opus 4.7 | $15 / 1M input, $75 / 1M output |
| **Why-this-candidate** (explainability) | Claude Sonnet 4.6 | $3 / 1M input, $15 / 1M output |
| **Embeddings de perfiles** | Titan Embeddings v2 | $0.02 / 1M tokens |
| **Resumen ejecutivo de equipo** | Claude Haiku 4.5 | $0.25 / 1M input, $1.25 / 1M output |

**Prompt caching de Bedrock obligatorio** para llamadas frecuentes: el system prompt + contexto del proyecto se cachean por 5min → 90% reducción de costo en chat refinement (ese flow tiene contexto largo y queries cortas).

**Bedrock Guardrails** para filtrar PII en outputs (DNI, salarios, datos sensibles que no deben aparecer en respuestas LLM).

**Estimación de consumo:** 1.800 usuarios × 5 sesiones/mes × 3 llamadas LLM = 27k requests/mes. Con caching, ~$300-500/mes.

#### SageMaker — modelos propietarios

Dos modelos custom entrenados con datos históricos de BBVA:

1. **`team-success-predictor`** — Regresión que predice probabilidad de éxito de un equipo dado (skills_overlap, prior_collaboration, seniority_balance, edi_balance) → score 0-1. Reentrenado quarterly con resultados reales.

2. **`retention-risk-classifier`** — Identifica empleados con alta probabilidad de fuga (input: tenure, EDI trend, B-Tokens spent vs earned, mentorship activity). Usado para alertar a managers cuando arman equipos que dependen de talento at-risk.

Serving en **SageMaker Endpoints (serverless)** — pay per invocation. ~$80/mes a esta escala.

### 3.7 Integration layer

#### EventBridge — bus de eventos asincrónicos

Eventos relevantes:
```
employee.hired          ← HR Hub  → trigger onboarding workflow
employee.promoted       ← HR Hub  → recompute trust_score, refresh embeddings
project.published       ← SDA     → notificar managers de squads relevantes
team.composed           ← internal → escribir al ledger, notificar al equipo
edi.cycle.opened        ← HR Hub  → abrir formularios EDI, notificar empleados
btoken.transferred      ← internal → actualizar wallets, registrar en audit
```

Cada evento dispara una **Step Function** o **Lambda** según complejidad.

#### MSK (Kafka) — streaming de eventos HR

Para sync near-realtime con el HR Hub: cuando un empleado cambia de squad o se promueve, el evento llega a Kafka → Lambda procesa → actualiza Aurora + Neptune + invalida cache.

**Por qué Kafka y no Kinesis:** BBVA usa Kafka internamente; mantener compatibilidad de schemas reduce fricción de integración. Si fuera greenfield, Kinesis Data Streams sería suficiente.

#### Glue — ETL batch

Para datos que llegan en batch (reportes mensuales, encuestas trimestrales): Glue jobs nocturnos transforman y cargan en Aurora.

### 3.8 Integración con sistemas internos BBVA

Conexión a on-prem via **AWS Direct Connect** (10Gbps dedicado) + **Transit Gateway** + **PrivateLink** para endpoints específicos.

| Sistema BBVA | Mecanismo | Frecuencia |
|--------------|-----------|------------|
| **HR Hub** (Workday/SAP SF) | REST API via PrivateLink + Kafka eventos | Eventos en tiempo real + batch nocturno de sync completo |
| **SDA** (catálogo de proyectos) | REST API | Pull cada 4h |
| **EDI System** | REST API + S3 drop de archivos batch | Ciclo semestral |
| **B-Tokens internal** | REST API + EventBridge custom event bus | Tiempo real |
| **LDAP/AD** | Federación via Cognito (no acceso directo) | — |
| **Datawarehouse** (Snowflake/Redshift) | Glue connector | Diario, para analytics retrospectivos |

**Sin acceso directo a internet desde la VPC de producción.** Todo tráfico de salida pasa por **NAT Gateway** + **AWS Network Firewall** con allowlist de dominios.

### 3.9 Observability

| Dimension | Herramienta |
|-----------|-------------|
| Métricas | CloudWatch Metrics + Datadog (preferido enterprise) |
| Logs | CloudWatch Logs → S3 (vía Kinesis Firehose) → Athena para queries históricas |
| Traces | AWS X-Ray (instrumentación nativa de Lambda + ECS + Bedrock SDK) |
| Synthetic monitoring | CloudWatch Synthetics canaries cada 5min en los flujos críticos (login, project composer, team results) |
| RUM (Real User Monitoring) | CloudWatch RUM o Datadog RUM — track de Web Vitals (LCP, FID, CLS) por geografía |
| Alarmas | SNS → PagerDuty para sev1/sev2; Slack para sev3 |

**SLOs definidos:**
- API p99 latency < **400ms**
- Frontend FCP p75 < **1.5s**
- AI response (chat refinement) p95 < **2s**
- Uptime mensual >= **99.95%** (= 21 min/mes de downtime tolerado)

### 3.10 Seguridad & Compliance

#### Encriptación

- **At rest:** KMS Customer Managed Keys, rotación anual automática. Una CMK por servicio (Aurora, S3, OpenSearch, Neptune) para granularidad de auditoría.
- **In transit:** TLS 1.3 obligatorio. Internal services usan **VPC endpoints** (PrivateLink) — el tráfico no sale a internet.

#### Acceso

- **Zero Trust** para acceso humano: IAM Identity Center (ex-SSO) federado con Entra ID, sin usuarios IAM long-lived. Permission Sets por rol.
- **IRSA** (IAM Roles for Service Accounts) para workloads — sin credenciales en código.
- **Secrets Manager** para credenciales de sistemas BBVA. Rotación automática cada 30 días.

#### Compliance

| Regulación / framework | Implementación |
|------------------------|----------------|
| **GDPR** (datos de empleados europeos) | Data residency en eu-central-1 / eu-south-2; right-to-erasure implementado vía proceso de borrado lógico + audit trail; DPIA documentado |
| **PCI-DSS** (aunque no procesamos pagos, BBVA mandatea controles equivalentes) | Network segmentation, encryption, access controls, vulnerability scanning continuo |
| **ISO 27001** (certificación interna BBVA) | Inventario de activos, control de acceso por roles, gestión de incidentes, recuperación tras desastre documentada |
| **Audit trail** | CloudTrail Organization Trail → S3 con Object Lock Compliance Mode 7 años |
| **PII detection** | Macie escanea S3 y Aurora exports semanalmente; alertas a Security Hub |
| **Vulnerability mgmt** | Inspector v2 sobre Lambda + ECS images; ECR scanning on push |
| **Threat detection** | GuardDuty + Security Hub + Detective para investigación |
| **Configuración** | AWS Config rules para verificar compliance continuo (S3 buckets cifrados, MFA enforced, etc.) |

#### Network

```
Internet
   │
   ▼
CloudFront + WAF
   │
   ▼
ALB (public subnet)
   │
   ▼  ┌───────────────────────────────────────────────────┐
      │  VPC bbva-talent-prod (10.0.0.0/16)               │
      │                                                   │
      │  ┌─────────────┐  ┌─────────────┐ ┌────────────┐  │
      │  │Private app  │  │Private data │ │Private mgmt│  │
      │  │subnet       │  │subnet       │ │subnet      │  │
      │  │             │  │             │ │            │  │
      │  │Lambda, ECS  │  │Aurora,      │ │Bastion,    │  │
      │  │            │  │Neptune,     │ │SSM         │  │
      │  │            │  │OpenSearch   │ │            │  │
      │  └─────────────┘  └─────────────┘ └────────────┘  │
      │                                                   │
      │  Network Firewall  +  VPC Endpoints (S3, KMS, etc)│
      └───────────┬───────────────────────────────────────┘
                  │
                  ▼  Transit Gateway → Direct Connect → BBVA on-prem
```

### 3.11 CI/CD & IaC

```
Developer  →  GitHub (BBVA Enterprise)
                   │
                   ▼ push / PR
              GitHub Actions
                   │ (lint, typecheck, jest)
                   ▼
              ECR (Docker images)
                   │
                   ▼ tag
              CodePipeline
                   │
                   ▼
   ┌──────────────┴───────────────┐
   ▼                              ▼
dev account                  staging account  →  prod account
(auto-deploy on main)        (manual approve)    (manual approve + 2 reviewers)
```

| Componente | Decisión |
|------------|----------|
| **VCS** | GitHub Enterprise (BBVA-managed) |
| **CI** | GitHub Actions (runners self-hosted en BBVA por compliance de código) |
| **CD** | CodePipeline orquesta deployments cross-account |
| **IaC** | **AWS CDK (TypeScript)** — consistente con el stack del frontend, fuerte tipado, mejor refactorability que Terraform para teams Node-first |
| **Containers** | ECR con scanning automático |
| **Multi-environment** | AWS Organizations con 3 cuentas (dev, staging, prod) — separación física |
| **Feature flags** | AppConfig — rollout progresivo (5% → 25% → 100%) con auto-rollback si error rate > X |

### 3.12 Multi-region & DR

**Estrategia:** Active-passive entre Frankfurt (primary) y Madrid (secondary). RPO 1min, RTO 15min.

| Servicio | Replica |
|----------|---------|
| Aurora PostgreSQL | Global Database con read replica en Madrid (lag ~1s) |
| DynamoDB | Global Tables (multi-master) |
| S3 | Cross-Region Replication automático |
| Neptune | Backup nightly → restore script en region B |
| OpenSearch | Cross-cluster replication |
| Bedrock | Multi-region invocations con fallback automático |
| Route 53 | Health check + failover record |

**Drill de DR cuatrimestral:** simular caída de Frankfurt completa, promover Madrid, validar RTO real. Documentado y firmado por el comité de continuidad de BBVA.

---

## 4. Decisiones arquitectónicas clave (ADRs)

### ADR-001: Bedrock vs OpenAI API directa

**Decisión:** Bedrock.

**Razón:** BBVA requiere que los datos sensibles (perfiles de empleados, comentarios EDI) no salgan de AWS. OpenAI API obligaría a egress + acuerdos de privacidad bilaterales. Bedrock corre dentro del VPC privado vía endpoint privado.

**Tradeoff:** menos modelos disponibles (no GPT-4o, no Gemini), latencia ligeramente superior. Compensado por: Claude Opus 4.7 cubre el caso de uso; latencia mitigada con prompt caching.

### ADR-002: Neptune vs Neo4j auto-hospedado

**Decisión:** Neptune.

**Razón:** Banco regulado → minimizar ops. Neptune es managed, IAM-native, dentro del VPC, integrado con backup/restore de AWS. Neo4j auto-hospedado requiere cluster management, parcheos, monitoreo dedicado.

**Tradeoff:** algunas funciones avanzadas de Neo4j (APOC, GDS algorithms) no están en Neptune. Para BBVA Talent las queries son traversals estándar — no afecta.

### ADR-003: Amplify Hosting vs ECS Fargate para el frontend

**Decisión MVP:** Amplify Hosting.
**Decisión escala:** Open Next + CloudFront + Lambda.

**Razón:** Amplify resuelve 90% de las necesidades de un Next.js con esfuerzo mínimo. Cuando el tráfico supere ~5k MAU concurrentes, el costo por request se vuelve menos predecible — ahí Open Next gana por separar SSR (Lambda) de assets (S3 + CloudFront).

### ADR-004: OpenSearch vs Pinecone para vector search

**Decisión:** OpenSearch.

**Razón:** Todo el stack debe estar en AWS por data residency. Pinecone es SaaS externo → no aprobado. OpenSearch con k-NN engine cubre el caso de uso de semantic search; el throughput es suficiente para 1.800 colaboradores.

**Tradeoff:** OpenSearch requiere más tuning que Pinecone para vector workloads (índices HNSW, replicas, shard sizing). Compensado con un cluster bien dimensionado desde el inicio.

### ADR-005: Cognito User Pool federado vs autenticación directa contra el IdP

**Decisión:** Cognito como capa intermedia.

**Razón:** Desacopla la app del IdP específico. Si BBVA migra de Entra ID a Okta dentro de 2 años, solo cambia la configuración de federación — la app sigue emitiendo y consumiendo JWT estándar. Sin Cognito, habría que reescribir la integración.

**Tradeoff:** una hop más en el flujo de login (~100ms extra). Aceptable.

### ADR-006: Aurora Serverless v2 vs Aurora Provisioned

**Decisión:** Serverless v2.

**Razón:** Carga es bursty (picos durante ciclos EDI, mass team composition). Serverless escala automáticamente ACU 0.5 → 16 sin reservar capacity. Costo más predecible para uso variable.

**Tradeoff:** ~10% más caro por hora a carga constante. A largo plazo, si la carga se estabiliza, migrar a provisioned con Reserved Instances reduciría costo en ~40%.

---

## 5. Plan de migración desde el MVP actual

### Fase 0 — Estado actual ✅
- Frontend Next.js con `IS_MOCK !== "false"` en `lib/api.ts`
- Mock data en `lib/mock-data.ts` (18 empleados + 30 proyectos + 1800 colaboradores agregados)
- Heurísticas en `lib/trust-score.ts`, `lib/gapAnalysis.ts`, `lib/scoreExplain.ts`, `lib/mockChatRefinement.ts`, `lib/staffingRecommendation.ts`, `lib/siloAnalysis.ts`
- Tests Jest: **88 passing**

### Fase 1 — Infraestructura base (semanas 1-3)

**Objetivo:** levantar la infraestructura sin tocar la app.

- [ ] Setup de cuentas AWS Organizations (dev/staging/prod)
- [ ] VPC + Transit Gateway + Direct Connect
- [ ] Aurora Serverless v2 provisionado con schema vacío
- [ ] Neptune cluster
- [ ] OpenSearch cluster
- [ ] DynamoDB tables
- [ ] S3 buckets (con Object Lock para audit)
- [ ] Cognito User Pool + federación con Entra ID staging
- [ ] CDK stack base committeado y revisado
- [ ] CloudTrail Organization Trail
- [ ] Datadog onboarding

**Entregable:** infraestructura idle, costo ~$800/mes, sin tráfico aún.

### Fase 2 — Backend funcional (semanas 4-6)

**Objetivo:** la app habla con APIs reales en lugar de mocks, pero los datos siguen siendo sintéticos (los del `mock-data.ts` migrados a Aurora).

- [ ] API Gateway + Lambda handlers para `searchTalent`, `getEmployeeGraph`, `getProjectRecommendations`, `getSDAProjects`
- [ ] ETL: cargar `mock-data.ts` en Aurora + Neptune + indexar embeddings en OpenSearch (generados desde Bedrock Titan)
- [ ] Reemplazar `lib/api.ts` para que apunte al API Gateway cuando `IS_MOCK=false`
- [ ] Tests de integración E2E con dataset sintético
- [ ] Deployment a `dev.bbva-talent.aws.bbva.com` con datos sintéticos públicamente accesibles para QA

**Entregable:** la app funcional end-to-end con backend real pero datos sintéticos. Es la primera demo creíble para stakeholders.

### Fase 3 — AI real + integración BBVA (semanas 7-9)

**Objetivo:** reemplazar mocks de IA por Bedrock real y conectar a HR Hub.

- [ ] Implementar `RefinementChat` contra Bedrock Claude Opus (reemplaza `mockChatRefinement.ts`)
- [ ] Implementar `WhyCandidate` contra Bedrock Claude Sonnet (reemplaza `scoreExplain.ts` para el copy generado)
- [ ] Embeddings de skills/bios/proyectos generados con Titan, indexados en OpenSearch
- [ ] **Las heurísticas se mantienen** como pre-filtro determinístico antes del LLM (importante para auditabilidad)
- [ ] Connector EventBridge → HR Hub para eventos `employee.*`
- [ ] Glue ETL nightly desde SDA
- [ ] Schema mapping y reconciliación (qué campos coinciden 1:1, qué transformaciones necesitamos)
- [ ] Deployment a `staging.bbva-talent.aws.bbva.com` con datos REALES sintéticos (10% del workforce, opt-in)

**Entregable:** demo a stakeholders con 180 empleados reales (10% del total) y AI en producción.

### Fase 4 — GA (semanas 10-12)

**Objetivo:** abrir a los 1.800 colaboradores, multi-region, SLA en producción.

- [ ] Promover staging → prod via CodePipeline
- [ ] Activar Aurora Global Database (Madrid secundario)
- [ ] DR drill completo
- [ ] Audit trail revisado por compliance interno
- [ ] Penetration test ejecutado y findings cerrados
- [ ] Documentación operativa (runbooks, dashboards) revisada por SRE
- [ ] Onboarding del primer batch (squads piloto)
- [ ] Rollout progresivo: 10% → 25% → 50% → 100% en 4 semanas con kill-switch

**Entregable:** GA público interno con SLO 99.95% comprometido.

---

## 6. Estimación de costos

Para una operación estable con **1.800 MAU** y uso moderado de IA (5 sesiones por usuario por mes):

| Categoría | Servicio | Costo mensual USD |
|-----------|----------|-------------------|
| **Edge** | CloudFront + WAF + Shield Standard | $100 |
| **Frontend** | Amplify Hosting | $300 |
| **Compute** | Lambda + API Gateway + ECS Fargate | $200 |
| **Data** | Aurora Serverless v2 (0.5–4 ACU típico) | $350 |
| | Neptune (1 instance r6g.large) | $250 |
| | OpenSearch (3 nodes r6g.large) | $222 |
| | DynamoDB (pay-per-request) | $50 |
| | ElastiCache (Redis t4g.small × 2) | $60 |
| | S3 + Object Lock | $50 |
| **AI/ML** | Bedrock (con prompt caching) | $400 |
| | SageMaker Endpoints (serverless) | $80 |
| **Integration** | EventBridge + MSK + Glue | $200 |
| **Networking** | Transit Gateway + NAT + Direct Connect share | $250 |
| **Observability** | CloudWatch + X-Ray + Datadog | $300 |
| **Security** | GuardDuty + Macie + Inspector + Config | $150 |
| **Otros** | KMS, Secrets Manager, CloudTrail | $80 |
| | **TOTAL MVP** | **~$3.050/mes** |
| | **TOTAL escala (5x uso IA, 2x carga DB)** | **~$5.500/mes** |

**Optimizaciones disponibles** (no aplicadas en el estimado base):
- Compute Savings Plans → 40% off Lambda + Fargate → ahorra ~$100/mes
- Reserved Instances de Neptune y OpenSearch a 1 año → 30% off → ahorra ~$140/mes
- DynamoDB Reserved Capacity → 50% off → ahorra ~$25/mes
- Llevando todo: **~$2.800/mes optimizado**

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Bedrock latency >2s en horas pico | Media | Alto (UX) | Prompt caching agresivo + fallback a Sonnet si Opus tarda > 1.5s |
| HR Hub API instabilidad | Alta | Alto (datos stale) | Cache local en Aurora + indicador en UI "última sync hace Xh" + eventos Kafka como path principal con batch como backup |
| Cost overrun en Bedrock (chat refinement viral) | Media | Medio | Quota por usuario (50 calls/día), monitoring con alerta a $X/día |
| Regression en heurísticas al migrar a LLM | Alta | Alto | Mantener tests Jest existentes + shadow mode: LLM y heurística corren en paralelo, comparamos resultados, switch solo cuando paridad >95% |
| Compliance bloquea uso de Bedrock | Baja | Crítico | Plan B documentado: SageMaker Endpoints con Llama 3.3 70B auto-hospedado en VPC privado |
| Vendor lock-in con AWS | Baja | Bajo (BBVA estandariza en AWS) | CDK código abierto, datos exportables, modelos LLM intercambiables |

---

## 8. Métricas de éxito en producción

**SLOs técnicos:**
- API p99 latency < **400ms**
- Frontend FCP p75 < **1.5s**
- AI response (chat refinement) p95 < **2s**
- Uptime mensual >= **99.95%**

**Métricas de producto:**
- **Time-to-team:** medianas baja de 21 días → < 3 días en 6 meses
- **Manager acceptance rate:** > 80% de recomendaciones aceptadas en primer paso
- **Talent discovery:** > 15% de los equipos formados incluyen al menos un perfil "no top-of-mind" (que el manager no hubiera buscado proactivamente)

**Métricas de negocio:**
- Adopción: 70% de los managers de BBVA Engineering usan la app al menos 1×/mes en 6 meses
- ROI: ahorro de 14h → 22min por composición de equipo × ~200 equipos/año = ~2.700 horas-manager/año

---

## 9. Para el jurado del ableChallenge

Esta arquitectura demuestra **viabilidad real**:

1. **No es un toy project:** los componentes elegidos (Aurora, Neptune, OpenSearch, Bedrock) son los mismos que usan productos de BBVA en producción hoy.
2. **No es vendor lock-in agresivo:** todo es AWS native pero los modelos LLM se pueden intercambiar, los datos son portables, el código es CDK estándar.
3. **Compliance-first:** GDPR, audit WORM, encryption everywhere, separación de cuentas — los controles que BBVA ya exige a sus sistemas críticos.
4. **Escalable:** desde 1.800 colaboradores en MVP hasta los ~120.000 empleados globales de BBVA si el rollout se expande, sin cambios arquitectónicos disruptivos.
5. **Costo razonable:** $2.800–5.500/mes para reemplazar un proceso manual que cuesta ~2.700 horas-manager por año (~$135.000 USD asumiendo $50/h fully loaded). **ROI < 2 meses.**

El MVP frontend-only que el jurado ve hoy **no es un mockup**: es la capa de presentación pre-construida del sistema descrito en este documento. Las heurísticas en `lib/` no se descartan al migrar a LLM — se mantienen como **pre-filtro determinístico y auditable** antes de cualquier inferencia, garantizando que las decisiones algorítmicas siempre sean explicables a un regulador.
