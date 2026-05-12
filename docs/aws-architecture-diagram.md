# BBVA Talent — Diagrama de arquitectura AWS

Versión Mermaid del diagrama de producción descrito en [`AWS_ARCHITECTURE.md`](./AWS_ARCHITECTURE.md). GitHub, GitLab, VS Code (con extensión Markdown Mermaid) y MkDocs renderizan este bloque automáticamente.

Para abrirlo en un editor interactivo: [mermaid.live](https://mermaid.live/) → pegar el contenido de [`aws-architecture-diagram.mmd`](./aws-architecture-diagram.mmd).

---

```mermaid
---
title: BBVA Talent — AWS Production Architecture
---
flowchart TD

%% ── Style definitions ─────────────────────────────────────────────────────
classDef users     fill:#ffffff,stroke:#495057,stroke-width:2px,color:#212529
classDef edge      fill:#a5d8ff,stroke:#1c7ed6,stroke-width:2px,color:#0c2a4a
classDef frontend  fill:#d0bfff,stroke:#7048e8,stroke-width:2px,color:#3b0764
classDef auth      fill:#b2f2bb,stroke:#2f9e44,stroke-width:2px,color:#0a3618
classDef api       fill:#ffd8a8,stroke:#e8590c,stroke-width:2px,color:#3e1f00
classDef data      fill:#74c0fc,stroke:#1971c2,stroke-width:2px,color:#ffffff
classDef ai        fill:#e599f7,stroke:#9c36b5,stroke-width:2px,color:#ffffff
classDef integ     fill:#ffe066,stroke:#f08c00,stroke-width:2px,color:#3e1f00
classDef onprem    fill:#ced4da,stroke:#495057,stroke-width:2px,color:#212529
classDef cc        fill:#f8f9fa,stroke:#adb5bd,stroke-width:1px,color:#495057

%% Zone tints
classDef edgeZone     fill:#e7f5ff,stroke:#74c0fc,color:#1c7ed6
classDef frontendZone fill:#f3f0ff,stroke:#9775fa,color:#7048e8
classDef authZone     fill:#ebfbee,stroke:#51cf66,color:#2f9e44
classDef apiZone      fill:#fff4e6,stroke:#fd7e14,color:#e8590c
classDef dataZone     fill:#e7f5ff,stroke:#339af0,color:#1971c2
classDef aiZone       fill:#f8f0fc,stroke:#cc5de8,color:#9c36b5
classDef integZone    fill:#fff9db,stroke:#fcc419,color:#f08c00
classDef onpremZone   fill:#f1f3f5,stroke:#868e96,color:#495057
classDef ccZone       fill:#f8f9fa,stroke:#adb5bd,color:#495057

U["👥 1,800 colaboradores<br/>BBVA Engineering"]:::users

subgraph EDGE["🌐 EDGE LAYER"]
    direction LR
    R53["Route 53<br/>DNS latency-based"]:::edge
    CF["CloudFront + WAF + Shield<br/>CDN global"]:::edge
    R53 --> CF
end

subgraph FE["💜 FRONTEND"]
    AMP["AWS Amplify Hosting<br/>Next.js 16 · SSR + ISR"]:::frontend
end

subgraph AUTH["✅ AUTH"]
    direction LR
    COG["Cognito User Pool"]:::auth
    ENTRA["Microsoft Entra ID<br/>corporate IdP"]:::auth
    COG <-->|SAML / OIDC| ENTRA
end

subgraph API["🟠 API LAYER"]
    direction LR
    AGW["API Gateway<br/>REST + WebSocket"]:::api
    LBD["Lambda<br/>queries CRUD"]:::api
    ECS["ECS Fargate<br/>KG · ML orchestration"]:::api
    SF["Step Functions<br/>EDI cycles · workflows"]:::api
end

subgraph DATA["🔵 DATA LAYER"]
    direction LR
    AUR["Aurora Postgres<br/>Serverless v2"]:::data
    NPT["Neptune<br/>Knowledge Graph"]:::data
    OS["OpenSearch<br/>vector + full-text"]:::data
    DDB["DynamoDB<br/>B-Tokens · sessions"]:::data
    S3["S3 WORM<br/>exports · audit"]:::data
    REDIS["ElastiCache Redis<br/>query cache · RT"]:::data
end

subgraph AI["🟣 AI / ML"]
    direction LR
    BR["AWS Bedrock<br/>Claude Opus 4.7 + Titan Embeddings"]:::ai
    SM["SageMaker<br/>team-success-predictor<br/>retention-risk"]:::ai
end

subgraph INT["🟡 INTEGRATION"]
    direction LR
    EB["EventBridge<br/>event bus · async"]:::integ
    MSK["MSK Kafka<br/>streaming HR events"]:::integ
    GLUE["Glue<br/>ETL nightly"]:::integ
end

subgraph OP["⚫ BBVA ON-PREM · PrivateLink + Direct Connect"]
    direction LR
    HR["HR Hub<br/>Workday / SAP SF"]:::onprem
    SDA["SDA System<br/>catálogo proyectos"]:::onprem
    EDI["EDI System"]:::onprem
    BT["B-Tokens API"]:::onprem
end

subgraph CC["📊 CROSS-CUTTING"]
    direction LR
    OBS["Observability<br/>CloudWatch · X-Ray · Datadog"]:::cc
    SEC["Security & Compliance<br/>GuardDuty · Macie · KMS · WORM 7y"]:::cc
    CICD["CI/CD + IaC<br/>GitHub Actions · CodePipeline · CDK"]:::cc
end

%% Main user flow
U -->|HTTPS| R53
CF --> AMP
AMP -->|JWT| COG
AMP -->|HTTPS / WSS| AGW

AGW --> LBD
AGW --> ECS
AGW --> SF

%% Compute → Data
LBD --> AUR
LBD --> DDB
LBD --> REDIS
ECS --> NPT
ECS --> OS
ECS --> S3
SF --> AUR

%% Compute → AI / ML
ECS -.->|inference| BR
SF -.->|prediction| SM

%% Integration ↔ BBVA On-prem
EB <-->|PrivateLink| HR
MSK <-->|Kafka stream| HR
GLUE -->|nightly ETL| SDA
GLUE -->|nightly ETL| EDI
EB <-->|PrivateLink| BT

%% Integration → Data (events writeback)
EB -->|events| AUR
MSK -->|stream| AUR
GLUE -->|batch load| AUR

class EDGE edgeZone
class FE frontendZone
class AUTH authZone
class API apiZone
class DATA dataZone
class AI aiZone
class INT integZone
class OP onpremZone
class CC ccZone
```

---

## Cómo leer el diagrama

| Color | Capa | Responsabilidad |
|-------|------|-----------------|
| 🌐 Azul claro | **Edge** | DNS, CDN, protección DDoS/WAF |
| 💜 Morado | **Frontend** | Next.js SSR/ISR servido por Amplify |
| ✅ Verde | **Auth** | Cognito federado con el IdP corporativo |
| 🟠 Naranja | **API** | API Gateway + cómputo (Lambda / Fargate / Step Functions) |
| 🔵 Azul | **Data** | 6 bases: relacional, grafo, búsqueda, key-value, archivos, cache |
| 🟣 Púrpura | **AI / ML** | Bedrock para LLM, SageMaker para modelos propietarios |
| 🟡 Amarillo | **Integration** | Bus de eventos, streaming, ETL nightly |
| ⚫ Gris | **On-Prem** | Sistemas internos BBVA conectados vía PrivateLink |

**Tipos de flecha:**
- `─→` flujo síncrono (HTTPS, JWT, queries)
- `⇢` (punteada) llamadas a IA (asíncronas, mejor esfuerzo)
- `↔` bidireccional sobre PrivateLink (BBVA ↔ AWS)

## Mantenimiento

Si querés modificar el diagrama:

1. Editar [`aws-architecture-diagram.mmd`](./aws-architecture-diagram.mmd) (fuente única de verdad)
2. Copiar el contenido entre las líneas `flowchart TD` y la última `class … Zone` a este `.md` (dentro del bloque ` ```mermaid ` ... ` ``` `)
3. Alternativamente, usar el script `scripts/gen-arch-diagram.py` para regenerar la versión Excalidraw

## Render local

```bash
# Instalar la CLI de Mermaid una vez
npm install -g @mermaid-js/mermaid-cli

# Renderizar a PNG
mmdc -i docs/aws-architecture-diagram.mmd -o docs/aws-architecture-diagram.png -b transparent

# O a SVG
mmdc -i docs/aws-architecture-diagram.mmd -o docs/aws-architecture-diagram.svg -b transparent
```

## Equivalencias entre formatos

Este repo mantiene **tres representaciones sincronizadas** del mismo diagrama:

| Formato | Archivo | Mejor para |
|---------|---------|------------|
| **Mermaid** | `aws-architecture-diagram.mmd` + `aws-architecture-diagram.md` | Versionado git, renderiza inline en GitHub/GitLab, fácil de actualizar |
| **Excalidraw** | `aws-architecture-diagram.excalidraw` | Edición visual libre, presentaciones, ajustes a mano |
| **Markdown narrativa** | `AWS_ARCHITECTURE.md` | Documento ejecutivo con tradeoffs, costos, ADRs |

Si modificás uno, actualizar los otros para mantener consistencia (o regenerar `.excalidraw` con `python scripts/gen-arch-diagram.py`).
