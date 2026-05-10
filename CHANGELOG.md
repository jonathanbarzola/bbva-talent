# Changelog

Todos los cambios significativos de BBVA Talent se documentan acá.

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · proyecto sigue [SemVer](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] — Sprint 5: Career view + Workforce Intelligence + Theme (2026-05)

### Agregado

#### Vista "Mi carrera" (`/me`)
- `app/me/page.tsx` — vista personal de progresión hacia el siguiente nivel BBVA.
- `lib/careerProgress.ts` — heurística auditable `analyzeCareerProgress(employee, pool)`:
  - 6 factores ponderados sumando 100 pts (skills 30 + Trust 25 + EDI 15 + tenure 10 + mentoring 10 + soft 10).
  - Comparación contra el **percentil 75** del cohorte del nivel siguiente.
  - 5 buckets de soft skills (`communication`, `ownership`, `mentoring`, `systems-design`, `stakeholder-mgmt`) detectados via regex sobre peer_comments + manager_comment del EDI.
  - Mapeo automático de gaps técnicos a cursos + certs ponderado por cobertura.
  - Modo `isTopTier` para Experts (sin nivel siguiente) con métrica "salud del perfil".
- `components/CareerProgressHero.tsx` — hero con avatar + transición Analyst→Associate + barra grande animada.
- `components/SkillGapTable.tsx` — tabla con barras duales (current vs target p75), icono ⊘ para skills ausentes, % de cobertura del cohorte.
- `components/EDIInsights.tsx` — fortalezas confirmadas con quotes + gaps con acción concreta.
- `components/LearningPlanCards.tsx` — 3 secciones por plataforma con "Por qué este curso/cert" en cada item.

#### 3 catálogos de aprendizaje
- `lib/campus-bbva-mock.ts` — 20 cursos en alianza con **Coursera + LinkedIn Learning** (Python, Java, Go, React, ML, Spark, Kafka, AWS, GCP, K8s, OAuth2, OWASP, soft skills).
- `lib/techu-mock.ts` — 8 cursos **propios BBVA** sobre tecnologías propietarias (APX, Cells, NACAR, ASO, HOST + COBOL, PSD2 / Open Banking, Plataforma Ether).
- `lib/ninja-project-mock.ts` — 15 certificaciones de mercado con costo en **B-Tokens** (AWS SAA/SAP/MLS, Azure AZ-104/305, GCP PCA/PDE, CKA/CKAD, Terraform Associate, CCDAK Confluent, Databricks, CISSP, CSM, Hyperledger). Cada cert suma `trust_score_boost` al pasarse.

#### Workforce Intelligence Dashboard (`/dashboard`)
- `app/dashboard/page.tsx` — vista panorámica para staffers/managers.
- `lib/siloAnalysis.ts` — heurística con 6 reglas de detección de silos: bus-factor, succession, tenure-concentration, no-pipeline, demand-supply, low-mentorship.
- `lib/workforce-stats.ts` — datos sintéticos de 1,800 colaboradores en 14 áreas tecnológicas.
- `components/WorkforceCharts.tsx` — `TechDistributionBarChart`, `SeniorityPyramid`, `AvailabilityDonut`, `DemandSupplyChart`, `TechCard`.
- `components/SiloRiskCard.tsx` — card expandible por tech con factores detectados + sugerencias de IA.
- `components/StaffingRecommendationPanel.tsx` + `lib/staffingRecommendation.ts` — recomendación de FTE basado en historial + nivel + feedback externo.

#### Selector de "current user"
- `lib/current-user.ts` — hook `useCurrentUser()` + storage en localStorage (`bbva-talent:current-user-id`) + broadcast via CustomEvent para sync entre instancias.
- `components/CurrentUserSelector.tsx` — dropdown agrupado por nivel con anti-FOUC placeholder.
- Inyectado en home nav y dashboard nav.

#### Theme light / dark
- `components/ThemeToggle.tsx` — toggle con persistencia en localStorage (`bbva-talent:theme`).
- Inline anti-FOUC script aplica `data-theme` en `<html>` antes de hidratación para evitar flash.
- Migración completa de colores hardcoded a CSS variables `--theme-*` en `app/globals.css`.

#### Networking · mentor capacity model
- `NetworkingProfile` extendido con `cupo_maximo`, `mentees_actuales`, `proxima_disponibilidad`.
- `FullCapacityPanel` cuando un mentor está en 2/2 — muestra fecha tentativa + botón "Notificarme cuando se libere".
- Botón circular "Ver perfil" en cada `ProfileCard` (navega a `/candidate/[id]`).

#### Persistencia de vista entre rutas
- `sessionStorage` key `bbva-talent:last-view` — restaura `home` o `networking` al volver desde `/candidate/[id]`.

#### Datos staffing extendidos
- `staffing_historico` por empleado — últimos 4 quarters con FTE asignado por proyecto.
- `feedback_externo` para empleados externos (XP-registro) — ratings 1-5 de jefes anteriores.
- `tipo_contrato` (interno / externo) y `consultora` (Indra, Neoris, Bluetab, Capgemini, etc.).
- `lib/graphBuilder.ts` — grafo enriquecido distinguiendo `proyecto-actual` vs `proyecto`, `teammate` vs `colaborador`.

### Cambiado

#### Refactor BREAKING — taxonomía de niveles BBVA
- `nivel: string` libre → `nivel: Nivel` estricto (`"Analyst" | "Associate" | "Expert"`).
- Mapeo aplicado a los 18 empleados: `Junior → Analyst`, `Mid → Associate`, `Senior → Expert`, `Staff → Expert` (los dos top-tier IC colapsan a Expert).
- Eliminado el campo `rol_bbva` y la función `getRolBBVA()` (ahora redundantes).
- `lib/mockChatRefinement.ts` — el parser conversacional acepta los nombres viejos (Senior, Junior, Staff, Mid) como aliases del usuario hacia los nuevos (compatibilidad de input).
- `lib/workforce-stats.ts` `seniority` schema cambia de `{junior, mid, senior, staff}` a `{analyst, associate, expert}`. Datos numéricos: `senior + staff` sumados → `expert`.
- 8 componentes con maps `NIVEL_COLOR` actualizados.
- 5 archivos de tests actualizados (`gapAnalysis`, `mockChatRefinement`, `scoreExplain`, `trust-score`, `siloAnalysis`, `staffingRecommendation`).

### Documentación

- `testsprite-prd.md` — Product Requirements Document consolidado (~38KB, 17 secciones, 15+ features con criterios de aceptación testeables, 6 golden paths E2E) generado para alimentar TestSprite y otros agentes de QA.
- `testsprite_tests/` — outputs del primer run de TestSprite con 15 tests automatizados (11 PASS / 3 FAIL / 1 BLOCKED). Reporte final en `testsprite_tests/testsprite-mcp-test-report.md`.

### Hallazgos de QA

- 🔴 **Bug confirmado**: `OnboardingTour.handleClose()` no escribe `localStorage` cuando el usuario hace "Skip" → el tour reaparece en cada visita. (Pendiente.)
- 🟡 `ThemeToggle` tiene `aria-label` state-dependent que dificulta selectores estables en tests automatizados. (Mejora sugerida — agregar `data-testid`.)

---

## [0.4.0] — Sprint 4: Pulido + storytelling (2026-05)

### Agregado
- `SuccessStories` — 3 cards narrativas en home con casos reales mock
  - SDA-53024 Fraud Detection AI: 2 hs vs 18 días
  - SDA-53033 Real-time Notifications: 35 min para Senior Kafka oculto
  - SDA-53038 AML Monitor: $2.4M ahorro anual
- `RoiCalculator` — widget interactivo con slider 50-1000 equipos/año
  - 3 stats animadas: ahorro USD, horas devueltas, FTE equivalente
  - 3 presets: Squad chico (50) / Vertical (200) / Toda la unidad (600)
  - Comparación visual: 14h manual vs 22 min con BBVA Talent (-97%)
- `/about` página whitepaper técnico
  - 3 capas (Presentación / Inteligencia / Datos)
  - Componentes con status: live / mock / planned
  - Data flow de 6 pasos
  - Sección de compliance (GDPR, encryption, audit log)
- `ExportTeamMenu` dropdown en header de ProjectResultsView
  - Imprimir / Guardar PDF (`window.print()` + CSS `@media print`)
  - Copiar resumen (texto plano formateado al clipboard)
  - Copiar deep-link (`?demo=SDA-XXXXX`)
- Deep-link auto-cargo: `?demo=SDA-XXXXX` en URL pre-carga el proyecto
- A11y:
  - Skip-to-content link
  - `*:focus-visible` con outline purple
  - `prefers-reduced-motion` respetado globalmente
  - `role="dialog"` + `aria-modal` + Escape handler en todos los modales
  - aria-labels en botones de íconos
- CSS `@media print` custom:
  - Fondo blanco + texto negro forzado
  - Oculta nav, aside, fixed, bg-dot-grid
  - `page-break-inside: avoid` en cards
  - Cancela animaciones

### Cambiado
- `app/page.tsx`: refactor `handleDemoMode` → `handleLoadProject(code)` reutilizable
- Header de `ProjectResultsView`: `flex-col sm:flex-row` para stack en mobile
- `CandidateRow`: oculta TrustScoreBadge en mobile, BTokenBadge en mobile/tablet
- `ConstellationView` (post-sprint): layout 50/50 en desktop, apilado en mobile

---

## [0.3.0] — Sprint 3: Innovación + viabilidad (2026-04)

### Agregado
- `WhyCandidateModal` con desglose del match score en 6 factores:
  - Skills relevantes (max 30 pts)
  - Trust Score (max 25 pts)
  - Disponibilidad (max ±12 pts, puede ser negativa)
  - Experiencia previa en dominio (max 15 pts)
  - Colaboraciones con equipo (max 10 pts)
  - EDI rating (max 8 pts)
- `lib/scoreExplain.ts` con función `explainMatchScore(candidate, context)`
- Nota "GDPR Art. 22 · Transparencia algorítmica" en footer del modal
- Botón `?` (purple) en CandidateCard y CandidateRow
- `app/candidate/[id]/page.tsx` — ruta dinámica con perfil individual
  - Hero card con avatar + score + availability
  - Bio + Skills con barras + Trayectoria + Colaboradores clickeables
  - Aside con TrustScoreBadge + BTokenBadge + EDIPanel **en modo full**
  - Networking tags
  - Loading skeleton + 404 amigable
- `TeamBalancePanel` con stats agregados del equipo
  - Trust Score promedio + tier dominante
  - B-Tokens promedio + tier
  - EDI Balance score (ponderado 100/65/30)
  - Distribución de seniority con mini bars animadas
  - Count de mentores + tenure promedio
- `TeamConstellation` modal full-screen con grafo del equipo
  - Construye GraphResponse virtual desde `EmpleadoResult[]`
  - Skills compartidas como nodos centrales
  - Colaboraciones cruzadas como edges
  - Sidebar con miembros clickeables + stats strip
- `lib/api.ts`: `getEmployeeById(id)` y `listAllEmployees()`

### Cambiado
- `CandidateComparison`: nueva prop `onViewTeamConstellation` con botón en header
- `WhyCandidateModal`: footer con CTA "Ver perfil completo →"

---

## [0.2.0] — Sprint 2: Diferenciadores wow (2026-04)

### Agregado
- `ImpactMetrics` en home con count-up animado
  - 47 equipos formados (vs 21 días en Excel + Google Chat)
  - 92% matches aceptados por managers
  - 134 talentos descubiertos
  - Hook custom `useCountUp` con `requestAnimationFrame` + cubic ease
- `lib/gapAnalysis.ts` — heurística `analyzeGaps(result, project)` con 6 reglas:
  1. Cobertura insuficiente (critical/high)
  2. Riesgo de disponibilidad
  3. Distribución de seniority
  4. Colaboración previa entre miembros
  5. Trust Score promedio
  6. Skills implícitas en el nombre del proyecto
- `GapAnalysisPanel` con cards expandibles por severidad + recomendación
- `lib/mockChatRefinement.ts` — parser conversacional español latinoamericano
  - 5 tipos de filtros (excludeSquads, excludeAvailability, requireSkills, excludeLevels, requireLevels)
  - Diccionarios de aliases: SQUAD, SKILL, LEVEL, AVAILABILITY
  - `applyToTeam()` que recomputa coverage/total_skills/gaps en tiempo real
  - `summarizeImpact()` que describe el delta
- `RefinementChat` drawer lateral con:
  - Mensajes con avatares
  - Typing indicator (3 dots animados)
  - Filter chips removibles
  - Suggestion chips
  - Mensajes con colores por tipo (filter/reset/warning/unknown/info)

### Cambiado
- `ProjectResultsView`: state de `filters` + `chatOpen`. `refinedResult` se computa con `useMemo` sobre `applyToTeam(result, filters)`. Toda la vista lee de `refinedResult` (CoverageRing, total_skills, role sections, gaps)
- Botón "Refinar con IA" en header + botón flotante con animación spring

---

## [0.1.0] — Sprint 1: Fundamentos críticos (2026-04)

### Agregado
- `OnboardingTour` con tour guiado de 3 pasos
  - Backdrop oscuro + spotlight ring animado en target
  - Tooltip auto-posicionado vía `getBoundingClientRect()`
  - Navegación con flechas y Esc
  - Persiste en `localStorage` (key `bbva-talent:onboarding-seen-v1`)
- Demo-mode: botón "▶ Prueba un caso real · SDA-53021 FX Tracker" en home
- `CandidateComparison` modal full-screen
  - Grid 2-4 columnas con candidatos lado a lado
  - **Skills compartidas** highlighted (intersección de skill sets)
  - Summary stats: match avg, total skills únicas, skills compartidas, disponibles ahora
- `ErrorBoundary` global con fallback ("Volver al inicio" / "Recargar")
- `Skeleton` primitives: `SkeletonLine`, `SkeletonBlock`, `SkeletonAvatar`, `SkeletonProjectRow`, `SkeletonCandidateCard`, `SkeletonCandidateRow`
- Empty states pulidos en `TeamComposerView` (icono + microcopy + CTA "Limpiar búsqueda")
- Botón "?" en nav del home para reabrir el tour

### Cambiado
- `lib/api.ts`: invertido el default de `IS_MOCK` — ahora mock es default
  - **Bug fix crítico**: antes la app intentaba `fetch` a `localhost:8000` y rompía sin backend
  - Ahora `IS_MOCK = process.env.NEXT_PUBLIC_MOCK !== "false"`
- `TeamBuilderPanel`: botón "Analizar Equipo" → "Comparar lado a lado"
  - El anterior solo hacía un timeout cosmético sin función real
- `ProjectResultsView`: agregado state de selección + checkboxes en CandidateRow + footer flotante con avatares

### Setup
- Instalado `framer-motion@^12.38.0`

---

## [0.0.2] — Project Charter (commit `95caf17`)

Charter inicial del proyecto.

---

## [0.0.1] — Initial commit (commit `92c5dfe`)

Setup inicial: BBVA Talent Knowledge Graph + GenAI project skeleton.
