# Changelog

Todos los cambios significativos de BBVA Talent se documentan acá.

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · proyecto sigue [SemVer](https://semver.org/spec/v2.0.0.html).

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
  - 47 equipos formados (vs 21 días en Excel + Slack)
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
- `lib/mockChatRefinement.ts` — parser conversacional español rioplatense
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
- Demo-mode: botón "▶ Probá un caso real · SDA-53021 FX Tracker" en home
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
