# BBVA Talent — Knowledge Graph + GenAI

> Plataforma de descubrimiento y composición de equipos para BBVA, basada en grafos de conocimiento e IA generativa.
> **Proyecto presentado a _ableChallenge 2026_.**

---

## ✦ Qué es

BBVA Talent permite a un manager o tech lead **armar equipos para un proyecto SDA en minutos**, en lugar de las 14 horas promedio que toma hacerlo manualmente vía Excel + Slack.

El core del producto es un **Project Composer**: el manager elige uno de los proyectos SDA del banco (con roles ya pre-definidos), y la app recomienda los candidatos ideales por rol, analizando:

- **Skills** — match semántico contra el dominio y los keywords del rol
- **Trust Score** — manager rating (35%) + EDI (25%) + peers (20%) + tenure (10%) + skills (10%)
- **EDI** — última evaluación de desempeño individual y peer comments
- **B-Tokens** — gamificación interna (compartir conocimiento, mentoring, certificaciones)
- **Disponibilidad real** — 7 estados: disponible, parcial, asignado, vacaciones, maternidad, licencia, descanso médico
- **Colaboraciones previas** — quién trabajó con quién y con qué peso de relación

A diferencia de un buscador tradicional 1-a-1, el flujo gira alrededor del **proyecto** (no de la persona).

---

## 🚀 Probar en 2 minutos

```bash
npm install && npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Si es tu primera visita, automáticamente arranca un **tour guiado de 3 pasos**.

**Camino más rápido para ver todo el valor**: click en `▶ Probá un caso real · SDA-53021 FX Tracker` desde el home → la app pre-carga el caso completo y te lleva directo al equipo recomendado con Gap Analysis y Team Balance ya calculados.

---

## ✨ Features principales

### 🎯 Recomendación por proyecto (flujo primario)
- 30 proyectos SDA pre-mapeados con roles y cantidades requeridas
- 18 empleados sintéticos con perfiles ricos (skills + categorías + scores, proyectos pasados, colaboradores con weights)
- Coverage score y total de skills calculados en tiempo real

### 🤖 Refinamiento conversacional (mock LLM)
Asistente conversacional simulado que entiende español rioplatense con voseo:

| Comando del usuario | Lo que hace |
|---|---|
| `que tengan Kafka` | Filtra por skill requerida |
| `sin nadie de vacaciones` | Excluye disponibilidad |
| `solo Senior y Staff` | Restringe nivel |
| `quitá los de Pagos` | Excluye squad |
| `volvé al equipo original` | Limpia todos los filtros |

El parser corre localmente sobre diccionarios de aliases — sin LLM real, pero indistinguible para el usuario en demo.

### 🔍 Auditoría / explicabilidad (GDPR Art. 22)
Cualquier candidato tiene un botón **"¿Por qué?"** que abre un modal con desglose en 6 factores ponderados:

- Skills relevantes al rol/dominio (max 30 pts)
- Trust Score (max 25 pts)
- Disponibilidad (max ±12 pts — puede ser negativa)
- Experiencia previa en el dominio (max 15 pts)
- Colaboraciones con miembros del equipo (max 10 pts)
- EDI rating (max 8 pts)

Cada factor con barra animada y warnings explícitos ("⚠ Está en vacaciones — start date debe contemplarlo"). Cumple con principios de transparencia algorítmica.

### 📊 Gap Analysis automático
6 reglas heurísticas sobre el equipo recomendado:

1. **Cobertura insuficiente** — `1 de 2 ML Engineers cubiertos`
2. **Riesgo de disponibilidad** — `2 de 4 con disponibilidad limitada`
3. **Distribución de seniority** — `Equipo sin referente Senior/Staff`
4. **Colaboración previa** — `Sin colaboraciones previas entre miembros`
5. **Trust Score promedio** — `Trust Score promedio bajo (53/100)`
6. **Skills implícitas** — `Sin cobertura aparente en "Fraud Detection"`

Cada gap viene con severidad (critical/high/medium/low) + recomendación accionable.

### 🌐 Constelación de equipo
Grafo interactivo (force-directed) que muestra:
- Personas como nodos con avatar + score
- Skills compartidas como nodos centrales (highlighted)
- Colaboraciones cruzadas entre miembros como edges
- Click en cualquier nodo para inspeccionar

### 👤 Perfil individual standalone (`/candidate/[id]`)
Ruta deep-linkable con:
- Trust Score breakdown completo (manager, EDI, peers, tenure, skills)
- EDI Panel con peer comments y manager feedback
- B-Tokens wallet con historial de transacciones
- Red de colaboradores clickeable (navega a otro perfil)
- Skills con barras de score animadas

### 📈 Storytelling en home
- **ImpactMetrics** con count-up: 47 equipos / 92% match aceptado / 134 talentos descubiertos
- **SuccessStories** con 3 casos reales (Fraud Detection AI, Real-time Notifications, AML Monitor)
- **RoiCalculator** interactivo: slider 50-1000 equipos/año → ahorro USD/horas/FTE en vivo

### 📤 Export + share
- **Imprimir / PDF** vía `window.print()` con CSS `@media print` custom
- **Copiar resumen** al clipboard (texto plano formateado)
- **Deep-link** `?demo=SDA-XXXXX` que pre-carga el proyecto en otro browser

### ♿ Accesibilidad
- Skip-to-content link
- Focus-visible rings (solo navegación por teclado)
- `role="dialog"` + `aria-modal` + Escape handler en todos los modales
- `prefers-reduced-motion` respetado
- Aria-labels en botones de íconos

### 📱 Mobile-first
Layout responsive en home, results, comparison, perfil individual, /about, project-results.

---

## 🛠 Stack

| Capa | Tech |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev) + TypeScript 5 |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com) (theme `Neural Cosmos`) |
| **Animaciones** | [Framer Motion 12](https://www.framer.com/motion/) |
| **Grafo** | [react-force-graph-2d](https://github.com/vasturiano/react-force-graph) |
| **Tipografía** | Syne (display) + Space Mono (mono) — vía `next/font` |
| **Testing** | Jest 30 + Testing Library 16 |

**Sin backend en demo**: toda la lógica corre frontend-only con mocks. La capa de fetch (`lib/api.ts`) está preparada para conectarse a un backend real cuando esté disponible.

---

## 📂 Estructura del repo

```
bbva-talent/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # ErrorBoundary + skip-to-content
│   ├── globals.css                   # Theme Neural Cosmos + a11y + print
│   ├── page.tsx                      # State machine principal (7 vistas)
│   ├── about/page.tsx                # Whitepaper de arquitectura
│   └── candidate/[id]/page.tsx       # Perfil individual deep-linkable
│
├── components/                       # 25+ componentes
│   ├── # Vistas principales
│   ├── ResultsView.tsx               # Resultados de búsqueda libre
│   ├── ProjectResultsView.tsx        # Equipo recomendado (vista primaria)
│   ├── TeamComposerView.tsx          # Selector de proyectos SDA
│   ├── ConstellationView.tsx         # Grafo individual (50/50 layout)
│   ├── NetworkingView.tsx            # Red de mentores
│   │
│   ├── # Cards y badges
│   ├── CandidateCard.tsx             # Card de candidato (resultados)
│   ├── TrustScoreBadge.tsx           # Badge compact + full
│   ├── BTokenBadge.tsx               # Wallet de B-Tokens
│   ├── EDIPanel.tsx                  # Evaluación de desempeño
│   │
│   ├── # Features avanzadas
│   ├── OnboardingTour.tsx            # Tour guiado de 3 pasos
│   ├── CandidateComparison.tsx       # Modal de comparación lado a lado
│   ├── TeamConstellation.tsx         # Grafo del equipo completo
│   ├── RefinementChat.tsx            # Chat conversacional simulado
│   ├── GapAnalysisPanel.tsx          # Análisis de gaps automático
│   ├── TeamBalancePanel.tsx          # Stats agregados del equipo
│   ├── WhyCandidateModal.tsx         # Auditoría del match score
│   ├── ExportTeamMenu.tsx            # Print + copy + share-link
│   │
│   ├── # Storytelling (home)
│   ├── ImpactMetrics.tsx             # Contadores animados
│   ├── SuccessStories.tsx            # Casos reales narrativos
│   ├── RoiCalculator.tsx             # Calculadora interactiva
│   │
│   ├── # Soporte
│   ├── TalentGraph.tsx               # Wrapper de react-force-graph-2d
│   ├── TeamBuilderPanel.tsx          # Panel flotante con selección
│   ├── ParticleBackground.tsx        # Canvas animado de fondo
│   ├── SearchingAnimation.tsx        # Animación de loading
│   ├── ErrorBoundary.tsx             # Captura errores de React
│   └── Skeleton.tsx                  # Primitives de loading
│
├── lib/                              # Lógica de negocio
│   ├── api.ts                        # Capa de fetch (mock por defecto)
│   ├── types.ts                      # TypeScript types compartidos
│   ├── bbva-colors.ts                # Paleta de marca BBVA
│   ├── trust-score.ts                # Cálculo de Trust Score + tiers
│   ├── mock-data.ts                  # 18 empleados + 30 proyectos SDA
│   ├── scoreExplain.ts               # Heurística de explicabilidad (6 factores)
│   ├── gapAnalysis.ts                # 6 reglas de gap detection
│   └── mockChatRefinement.ts         # Parser conversacional español
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── jest.config.ts
```

---

## ⚙️ Cómo correrlo

### Requisitos

- **Node.js 20+** (recomendado 22+)
- **npm 10+**

### Instalación

```bash
git clone <este-repo>
cd bbva-talent
npm install
```

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta dev server en `http://localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Corre ESLint |
| `npm run test` | Corre tests Jest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con cobertura |

### Variables de entorno (opcionales)

| Variable | Default | Descripción |
|---|---|---|
| `NEXT_PUBLIC_MOCK` | `"true"` (default) | Si es `"false"`, intenta hacer fetch a un backend real |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | URL del backend (solo si `NEXT_PUBLIC_MOCK="false"`) |

> **Importante**: por defecto la app corre 100% mock, sin necesidad de archivo `.env`. Esto la hace bulletproof para demos.

---

## 🧭 Tour rápido por la app

### 1. Home (`/`)
- Tour guiado automático en primera visita (persiste en `localStorage`)
- 3 cards de métricas con count-up animado
- CTA principal "Project Composer" + atajo "Probá un caso real"
- Búsqueda libre 1-a-1 (flujo secundario)
- Networking & Mentores
- Casos de éxito narrativos
- Calculadora ROI interactiva
- Botón `?` para re-abrir el tour
- Botón "Arquitectura" → `/about`

### 2. Project Composer (`/` → click en CTA)
- Lista de 30 proyectos SDA con búsqueda
- Sticky panel con detalle del proyecto seleccionado
- Empty states y skeletons mientras carga

### 3. Project Results (después de seleccionar proyecto)
- Header con CoverageRing + Total skills + botón "Refinar con IA" + Export menu
- **GapAnalysisPanel** con cards expandibles por severidad
- **TeamBalancePanel** con Trust avg, EDI Balance, B-Tokens avg, distribución de seniority
- Roles con candidatos asignados + reservas
- Cada candidato: checkbox + rank + avatar + Trust + B-Token + match% + botón `?` (auditoría) + `360°`
- Barra flotante de comparación cuando hay seleccionados
- Botón flotante "✦ Refinar con IA" abre el chat lateral

### 4. Comparison Modal
- Grid 2-4 columnas con candidatos lado a lado
- Skills compartidas entre todos highlighted con check verde
- Stats top: match avg, total skills únicas, skills compartidas, disponibles ahora
- Botón "✦ Constelación" para ver el grafo del equipo

### 5. Team Constellation
- Modal full-screen con grafo force-directed
- Personas + skills (top 4 por persona + compartidas) + edges de colaboración
- Sidebar con miembros clickeables
- Stats strip con 4 métricas

### 6. Refinement Chat (drawer lateral)
- Mensajes con avatares
- Filter chips activos arriba (con X individual)
- Suggestion chips abajo
- Cada filtro recomputa coverage en VIVO

### 7. Why Candidate Modal
- Hero con avatar + score grande
- Summary humano + warnings
- 6 factores con barras animadas + recomendación
- Footer con "Ver perfil completo →" + nota GDPR Art. 22

### 8. Candidate Profile (`/candidate/[id]`)
- Hero card grande
- Bio + Skills (con barras) + Proyectos + Colaboradores clickeables
- Aside con TrustScoreBadge + BTokenBadge + EDIPanel **en modo full**
- Networking tags
- Deep-linkable

### 9. Constellation View (de un candidato individual)
- **Layout 50/50**: sidebar con info completa + grafo
- En mobile: sidebar arriba con scroll + grafo abajo
- Click en colaborador del grafo → carga su grafo

### 10. About (`/about`)
- Whitepaper técnico con 3 capas (Presentación / Inteligencia / Datos)
- Componentes con status (live / mock / planned)
- Data flow de 6 pasos
- Sección de compliance (GDPR, encryption, audit log)

---

## 🎨 Theme — Neural Cosmos

El proyecto usa una paleta dark con acentos de la marca BBVA. Tokens definidos en `app/globals.css` y `lib/bbva-colors.ts`:

| Token | Hex | Uso |
|---|---|---|
| Cosmos | `#050a14` | Fondo principal |
| Electric Blue | `#001391` | Primario BBVA |
| Serene Blue | `#85C8FF` | Acción secundaria |
| Purple | `#9694FF` | IA / explicabilidad / refinement |
| Lime | `#88E783` | Éxito / skills / disponible |
| Mandarin | `#FFB56B` | Proyectos / dominios / Staff |
| Canary | `#FFE761` | Alertas medias / Mid |
| Ice | `#8BE1E9` | Junior / conceptos |

Tipografía:
- **Syne** (700-900 weight) — display y headings
- **Space Mono** — datos, code-like, métricas

Animaciones:
- Cubic-bezier `(0.22, 1, 0.36, 1)` (out-quart) en transiciones
- Framer Motion spring `stiffness: 220, damping: 22` para entradas

---

## 🧠 Decisiones técnicas clave

### Mock por defecto
`NEXT_PUBLIC_MOCK !== "false"` en `lib/api.ts`. La app NUNCA rompe sin backend. Para producción, setear `NEXT_PUBLIC_MOCK="false"` y `NEXT_PUBLIC_API_URL`.

### Sin LLM real en demo
El refinamiento conversacional (`RefinementChat`) y la búsqueda semántica (`SearchingAnimation`) son simulados con heurísticas locales. En producción se conectarán a Claude API u OpenAI text-embed-3 (ver `/about`).

### Sin librería de PDF
En lugar de bundlear `jsPDF` (~50kb), el export usa `window.print()` con CSS `@media print` custom. Más simple, mantiene el stack minimal, y permite "Guardar como PDF" desde el dialog del navegador.

### State machine en `app/page.tsx`
Una sola fuente de verdad con un reducer-style `go({...patch})`. 7 vistas: `home`, `searching`, `results`, `constellation`, `project-composer`, `project-results`, `networking`.

### Componentes pesados con dynamic import
`react-force-graph-2d` se carga vía `next/dynamic` con `{ ssr: false }` porque depende de `window`/`canvas`. Mismo tratamiento para `ParticleBackground`, `SearchingAnimation`, vistas grandes.

### Trust Score calculado, no dictado
La fórmula vive en `lib/trust-score.ts` con pesos auditables:
```ts
overall = manager * 0.35 + edi * 0.25 + peers * 0.20 + tenure * 0.10 + skills * 0.10
```

### Score explainability sin backend
`lib/scoreExplain.ts` toma un candidato + contexto (rol, dominio, equipo) y devuelve un breakdown PLAUSIBLE en 6 factores. La heurística usa los mismos campos que un sistema real usaría → es honesta, no post-hoc.

### Theme por CSS variables, no Tailwind config
`app/globals.css` define `--color-*` en `@theme inline`. Permite usar `style={{ color: BBVA.purple }}` con autocomplete y theming centralizado.

### Class component solo donde React lo exige
`ErrorBoundary` es un class component porque `componentDidCatch` solo existe en class. Todo el resto son function components con hooks.

---

## 📐 Arquitectura objetivo (producción)

Tres capas (documentado en `/about`):

```
┌──────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN                                │
│  Next.js · React · Tailwind · Framer Motion          │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│  CAPA DE INTELIGENCIA                                │
│  Búsqueda semántica · Refinamiento conversacional    │
│  Gap Analysis · Score explainability                 │
│  (OpenAI text-embed-3 · Claude 4.6 · pgvector)       │
└─────────────────────┬────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│  CAPA DE DATOS (BBVA existing systems)               │
│  HR Hub · EDI System · B-Tokens API                  │
│  SDA Catalog · Knowledge Graph (Neo4j) · SSO         │
└──────────────────────────────────────────────────────┘
```

Compliance:
- Datos sensibles cifrados en reposo y tránsito
- Audit log de accesos (365 días)
- Score auditable por candidato
- Consentimiento explícito del empleado
- GDPR Art. 22 (transparencia algorítmica)

---

## 📚 Modelo de datos (mocks)

Todos los tipos están en `lib/types.ts`. Los mocks viven en `lib/mock-data.ts`.

### `EmpleadoResult`
```ts
{
  id, nombre, email, rol, squad, nivel, ubicacion, bio, score,
  habilidades: SkillNode[],          // { nombre, categoria, score 0..1 }
  proyectos: ProyectoNode[],         // { id, nombre, dominio, estado }
  colaboradores: ColaboradorRef[],   // { id, nombre, rol, weight 0..1 }
  disponibilidad?: AvailabilityStatus,
  disponibilidad_hasta?: string,
  proyecto_asignado?: string,
  años_empresa,
  edi?: { año, rating, manager_rating, manager_comment, peer_comments },
  trust_score?: { overall, tier, breakdown },
  b_tokens?: { balance, tier, historial },
  es_mentor, disponible_networking, networking_tags?
}
```

### `SDAProject`
```ts
{
  codigo: "SDA-53021",
  nombre: "FX Tracker",
  dominio: "Pagos Digitales",
  estado: "En planificación" | "En desarrollo" | "En producción",
  roles: [{ role: "ML Engineer", quantity: 2 }, ...]
}
```

### `TeamCompositionResponse`
```ts
{
  project_name, coverage_score, total_skills, gaps,
  roles: RoleMatch[]   // { role, quantity, candidates: EmpleadoResult[] }
}
```

---

## 🗺 Roadmap completado (4 sprints)

### Sprint 1 — Fundamentos críticos ✅
- OnboardingTour con spotlight + persist localStorage
- Demo-mode pre-cargado (FX Tracker SDA-53021)
- Empty states pulidos
- CandidateComparison modal con skills compartidas highlighted
- ErrorBoundary global + Skeleton primitives
- Bug fix: `IS_MOCK` default a `true`

### Sprint 2 — Diferenciadores wow ✅
- ImpactMetrics con count-up animado
- GapAnalysis automático con 6 reglas heurísticas
- RefinementChat conversacional en español rioplatense

### Sprint 3 — Innovación + viabilidad ✅
- WhyCandidateModal con desglose del score (GDPR Art. 22)
- `/candidate/[id]` perfil individual deep-linkable
- TeamBalancePanel con stats agregados
- TeamConstellation full-screen del equipo

### Sprint 4 — Pulido + storytelling ✅
- SuccessStories con 3 casos narrativos
- RoiCalculator interactivo
- `/about` whitepaper técnico
- ExportTeamMenu con print + clipboard + deep-link
- A11y: focus-visible rings, aria-modal, skip-to-content, prefers-reduced-motion
- Mobile responsive (incluido layout 50/50 en ConstellationView)

---

## 🚦 Roadmap futuro (post-concurso)

Backlog priorizable para la siguiente iteración:

- [ ] Filtros multi-select en ResultsView (skills, squad, disponibilidad)
- [ ] Heatmap de skills del banco vs demanda actual
- [ ] Modo claro / oscuro toggle
- [ ] Filtros con NLP real (Claude/OpenAI)
- [ ] Predicción de éxito del equipo (Health Score compuesto)
- [ ] Integraciones reales con stack BBVA (HR Hub, Workday, SSO)
- [ ] Privacy banner explícito + consentimiento
- [ ] Performance metrics footer
- [ ] Tests E2E con Playwright (3 flujos críticos)
- [ ] Backend real con FastAPI + Neo4j + embeddings

---

## 🧪 Testing

```bash
npm run test
npm run test:coverage
```

El proyecto está configurado con Jest 30 + React Testing Library 16. Setup en `jest.config.ts`.

> Nota: cobertura actual mínima — los tests E2E con Playwright están en el backlog futuro.

---

## 📦 Build de producción

```bash
npm run build
npm run start
```

Output optimizado por Next.js con tree-shaking + minification.

Para deploy en Vercel:
```bash
vercel --prod
```

---

## 🔗 Deep-links útiles

- `/` — Home con tour automático en primera visita
- `/?demo=SDA-53021` — Auto-carga FX Tracker (Pagos Digitales · 2 ML + 1 Backend + 1 DevOps)
- `/?demo=SDA-53024` — Auto-carga Fraud Detection AI
- `/?demo=SDA-53038` — Auto-carga AML Monitor
- `/candidate/emp_001` — Perfil de Valentina Ríos (Senior Backend, Pagos Digitales)
- `/about` — Whitepaper técnico

---

## 👥 Créditos

Proyecto presentado a **ableChallenge 2026** (BBVA). Construido por el equipo BBVA Talent.

Stack open-source agradecido:
- [Next.js](https://nextjs.org) por Vercel
- [Framer Motion](https://www.framer.com/motion/)
- [react-force-graph](https://github.com/vasturiano/react-force-graph) por Vasco Asturiano
- [Tailwind CSS](https://tailwindcss.com)

---

## 📄 Licencia

Proyecto interno BBVA · ableChallenge 2026.
Datos sintéticos — no representan empleados reales del banco.
