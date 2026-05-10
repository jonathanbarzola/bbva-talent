# BBVA Talent — Product Requirements Document

> Documento de especificación de producto consolidado para QA automatizado.
> Versión: **0.4.0+** (post-Sprint 4 + Workforce Intelligence Dashboard + Theme + Networking Capacity).
> Proyecto presentado a **ableChallenge 2026** (BBVA).
> Audiencia: TestSprite y otros agentes de testing automatizado.

---

## 1. Visión y propósito

### 1.1 Qué es

**BBVA Talent** es una plataforma frontend de descubrimiento y composición de equipos para BBVA. Permite a managers, tech leads y staffers armar el equipo ideal para un proyecto SDA en minutos en lugar de las ~14 horas promedio que toma manualmente vía Excel + Google Chat.

El núcleo del producto es un **Project Composer**: el manager elige un proyecto SDA del banco (con roles ya pre-definidos), y la app recomienda candidatos por rol analizando skills, Trust Score, EDI, B-Tokens, disponibilidad y colaboraciones previas.

### 1.2 Estado de la implementación

- **Frontend-only** con datos sintéticos (mocks). Sin backend en demo.
- **Mock por defecto**: `NEXT_PUBLIC_MOCK !== "false"`. La app NUNCA debe fallar por ausencia de backend.
- **Sin LLM real** en el demo: refinamiento conversacional y búsqueda semántica corren con heurísticas locales.
- **Sin librería de PDF**: el export usa `window.print()` con CSS `@media print` custom.

### 1.3 Stack

| Capa | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 (strict) |
| Estilos | Tailwind CSS 4 + tema CSS variables |
| Animaciones | Framer Motion 12 |
| Grafo | react-force-graph-2d |
| Tipografía | Syne (display) + Space Mono (mono) — `next/font` |
| Testing | Jest 30 + Testing Library 16 |

### 1.4 Idioma de la UI

**Español latinoamericano neutro (tuteo)**: "busca", "quita", "agrega", "selecciona", "conecta", "ver perfil", "volver". **NO** se usa voseo argentino en la UI ("buscá", "quitá", "vos", "tenés", "dale", "hermano"). El parser conversacional **sí acepta voseo en el input del usuario** por compatibilidad.

---

## 2. Personas y casos de uso

### 2.1 Manager / Tech Lead
- Necesita armar el equipo para un proyecto SDA recién aprobado.
- Quiere entender por qué la IA recomienda a cada persona (auditabilidad).
- Necesita refinar la recomendación cuando el equipo sugerido no encaja por contexto que la IA no conoce.
- Requiere exportar / compartir el equipo con stakeholders.

### 2.2 Staffer / People Ops
- Vista panorámica de la fuerza laboral por tecnología.
- Detección temprana de silos de conocimiento, riesgos de bus factor y desajustes demanda/supply.
- Recomendaciones accionables generadas por IA para cada riesgo.

### 2.3 Empleado individual
- Buscar mentores o pares con quienes hacer networking.
- Visitar su propio perfil y entender su Trust Score / B-Tokens / EDI.
- Explorar su red de colaboradores en formato grafo.

### 2.4 Jurado del concurso (caso especial)
- **Restricción crítica**: interactúa SOLO con la app, sin demo guiada.
- Onboarding y self-explanation son vitales.
- En primera visita debe activarse un tour guiado de 3 pasos.

---

## 3. Mapa de rutas y vistas

### 3.1 Rutas Next.js

| Ruta | Tipo | Componente | Estado |
|---|---|---|---|
| `/` | App Router page | `app/page.tsx` (state machine de 7 vistas) | Live |
| `/about` | App Router page | `app/about/page.tsx` | Live |
| `/candidate/[id]` | Dynamic route | `app/candidate/[id]/page.tsx` | Live · deep-linkable |
| `/dashboard` | App Router page | `app/dashboard/page.tsx` (Workforce Intelligence) | Live |

### 3.2 Vistas internas en `/` (state machine)

`AppView = "home" | "searching" | "results" | "constellation" | "project-composer" | "project-results" | "networking"`

Una sola fuente de verdad con un reducer-style `go({...patch})`. El estado se mantiene en memoria. Vistas restorables entre rutas (vía `sessionStorage` con key `bbva-talent:last-view`): solo `"home"` y `"networking"`.

### 3.3 Deep-links críticos

- `/?demo=SDA-XXXXX` → autocarga el proyecto y va directo a `project-results`. Acepta solo el patrón `^SDA-\d+$`. Si el código no existe, muestra error toast "Proyecto SDA-XXXXX no encontrado". Después de cargar, el query param se limpia de la URL vía `history.replaceState`.
- `/?demo=SDA-53021` → FX Tracker (Pagos Digitales · 2 ML + 1 Backend + 1 DevOps). **Caso canónico de demo.**
- `/?demo=SDA-53024` → Fraud Detection AI.
- `/?demo=SDA-53038` → AML Monitor.
- `/candidate/emp_001` → Valentina Ríos (Senior Backend, Pagos Digitales). **Empleado canónico.**

---

## 4. Especificación funcional por feature

### 4.1 Home (`/` view = `home`)

**Componentes**: `HomeView`, `ImpactMetrics`, `SuccessStories`, `RoiCalculator`, `OnboardingTour`, `ParticleBackground`, `ThemeToggle`.

**Elementos visibles**:
- Top nav con logo "BBVA Talent", botones: `Buscar perfil`, `Networking`, `Dashboard`, `Arquitectura` (link a `/about`), botón `?` (re-abrir tour), `ThemeToggle`.
- Tag superior con punto pulsante: "AI-powered · Knowledge Graph · BBVA Talent".
- Headline: "Arma el equipo ideal para cada proyecto SDA".
- Subheadline descriptivo.
- `ImpactMetrics` con 3 contadores animados (count-up via `requestAnimationFrame`):
  - 47 equipos formados
  - 92% match aceptado
  - 134 talentos descubiertos
- **CTA primario** "Project Composer" (id `onboarding-step-1`) — botón grande con feature pills: Trust Score · EDI 2025 · B-Tokens · Disponibilidad · Colaboraciones previas.
- **CTA demo mode** (id `onboarding-step-2`): "▶ Prueba un caso real · SDA-53021 FX Tracker".
- Divider "o si buscas algo puntual".
- 2 CTAs secundarios:
  - `Buscar perfil` → expande input inline con sugerencias clickeables (mentor data science, AWS, ciberseguridad, microservicios).
  - `Networking & Mentores` → va a `view = "networking"`.
- `SuccessStories` con 3 cards narrativas:
  - SDA-53024 Fraud Detection AI (2 hs vs 18 días)
  - SDA-53033 Real-time Notifications (35 min para Senior Kafka oculto)
  - SDA-53038 AML Monitor ($2.4M ahorro anual)
- `RoiCalculator` con slider 50-1000 equipos/año, 3 stats animadas, 3 presets (Squad chico 50 / Vertical 200 / Toda la unidad 600), comparación 14h manual vs 22 min con BBVA Talent (-97%).
- Stats bar inferior (id `onboarding-step-3`): 18+ Empleados / 10 Proyectos / 100+ Skills / AI Semántico.

**Criterios de aceptación**:
- AC-HOME-01: La vista renderiza sin errores con cualquier estado inicial.
- AC-HOME-02: El submit de búsqueda libre solo se habilita cuando el input tiene `>= 3` caracteres.
- AC-HOME-03: Click en "Project Composer" navega a `view = "project-composer"`.
- AC-HOME-04: Click en "▶ Prueba un caso real" carga FX Tracker y navega a `project-results` con coverage y gaps calculados.
- AC-HOME-05: Click en `Networking` navega a `view = "networking"`.
- AC-HOME-06: Click en `Dashboard` navega a `/dashboard`.
- AC-HOME-07: Click en `Arquitectura` navega a `/about`.
- AC-HOME-08: Click en `?` re-abre el tour incluso si ya fue visto antes.
- AC-HOME-09: Click en `ThemeToggle` alterna entre tema dark y light persistiendo la preferencia en `localStorage`.
- AC-HOME-10: En primera visita (sin `bbva-talent:onboarding-seen-v1` en `localStorage`) el tour se abre automáticamente con un delay de ~700 ms.
- AC-HOME-11: Las suggestion pills del input de búsqueda rellenan el input al hacer click.

### 4.2 Onboarding Tour

**Componente**: `OnboardingTour.tsx`.

3 pasos con backdrop oscuro + spotlight ring animado en target:
1. Step 1 (target `onboarding-step-1`): "Empieza por tu proyecto" — placement bottom.
2. Step 2 (target `onboarding-step-2`): "¿Sin tiempo? Prueba una demo en vivo" — placement top.
3. Step 3 (target `onboarding-step-3`): "Recomendaciones explicables" — placement top.

**Persistencia**: key `bbva-talent:onboarding-seen-v1` en `localStorage` con valor `"1"` después de finalizar.

**Criterios**:
- AC-TOUR-01: Tooltip se posiciona automáticamente vía `getBoundingClientRect()` del target.
- AC-TOUR-02: Navegación con flechas: izquierda para previo, derecha para siguiente.
- AC-TOUR-03: Tecla `Escape` cierra el tour.
- AC-TOUR-04: Al finalizar, persiste `"1"` en localStorage; el próximo refresh NO debe abrir el tour.
- AC-TOUR-05: Después de borrar la key con `localStorage.removeItem('bbva-talent:onboarding-seen-v1')` y refrescar, el tour vuelve a abrir automáticamente.

### 4.3 Búsqueda libre 1-a-1 (`view = searching` → `results`)

**Flujo**: input en home (>= 3 chars) → `handleSearch(query)` → llama `searchTalent(query)` → animación `SearchingAnimation` → `ResultsView`.

**Componentes**: `SearchingAnimation`, `ResultsView`, `CandidateCard`.

**Criterios**:
- AC-SEARCH-01: La animación de búsqueda se muestra como mínimo durante el tiempo necesario para que parezca creíble (no flash).
- AC-SEARCH-02: Cuando `dataReady = true`, `onComplete` se dispara y se navega a `results`.
- AC-SEARCH-03: Si la búsqueda falla, se navega a `home` con un `ErrorToast` visible.
- AC-SEARCH-04: La lista de candidatos se renderiza ordenada por score desc.
- AC-SEARCH-05: Click en `360°` de un candidato navega a `view = "constellation"` con su grafo.

### 4.4 Project Composer (`view = "project-composer"`)

**Componente**: `TeamComposerView.tsx`.

**Datos**: `getSDAProjects()` retorna 30 proyectos SDA. Cada proyecto tiene `codigo`, `nombre`, `dominio`, `estado`, `roles: [{ role, quantity }]`.

**UI**:
- Lista filtrable por búsqueda libre.
- Sticky panel con detalle del proyecto seleccionado.
- Empty states pulidos (icono + microcopy + CTA "Limpiar búsqueda").
- Skeletons mientras carga.

**Criterios**:
- AC-COMPOSER-01: Filtrar la lista vía input no rompe la selección actual.
- AC-COMPOSER-02: Click en un proyecto despliega su detalle en el sticky panel.
- AC-COMPOSER-03: Click en CTA "Buscar equipo" / equivalente dispara `handleProjectSearch(project)` → navega a `project-results`.
- AC-COMPOSER-04: Empty state aparece cuando el filtro no matchea ningún proyecto.

### 4.5 Project Results (`view = "project-results"`)

**Componente**: `ProjectResultsView.tsx` con `GapAnalysisPanel`, `TeamBalancePanel`, `RefinementChat`, `ExportTeamMenu`, `WhyCandidateModal`, `CandidateComparison`, `TeamConstellation`.

**Header**:
- Botón "← Volver".
- Nombre del proyecto + dominio + estado.
- `CoverageRing` con porcentaje calculado en vivo.
- Total skills.
- Botón "✦ Refinar con IA" (abre el chat lateral).
- `ExportTeamMenu` dropdown.

**Body**:
- `GapAnalysisPanel` con cards expandibles por severidad (critical/high/medium/low) — 6 reglas heurísticas (ver sección 5.3).
- `TeamBalancePanel` con stats agregados:
  - Trust Score promedio + tier dominante.
  - B-Tokens promedio + tier.
  - EDI Balance score (ponderado 100/65/30).
  - Distribución de seniority con mini bars animadas.
  - Count de mentores + tenure promedio.
- Roles con candidatos asignados + reservas:
  - Cada candidato (`CandidateRow`): checkbox + rank + avatar + Trust Score + B-Token + match% + botón `?` (auditoría) + `360°` (grafo).
- Barra flotante de comparación cuando hay >= 2 seleccionados.
- Botón flotante "✦ Refinar con IA" (animación spring).

**Criterios**:
- AC-RESULTS-01: La página renderiza con `coverage_score`, `total_skills` y `gaps` calculados desde el inicio.
- AC-RESULTS-02: Marcar/desmarcar checkboxes actualiza la barra flotante de comparación en vivo.
- AC-RESULTS-03: La barra flotante muestra "Comparar lado a lado (N)" cuando hay seleccionados; deshabilitada con < 2.
- AC-RESULTS-04: Click en `?` abre `WhyCandidateModal` con desglose de 6 factores.
- AC-RESULTS-05: Click en `360°` carga el grafo del empleado y navega a `constellation`.
- AC-RESULTS-06: Click en "✦ Refinar con IA" abre el chat drawer lateral.
- AC-RESULTS-07: Click en `ExportTeamMenu` abre dropdown con 3 opciones: Imprimir / PDF · Copiar resumen · Copiar deep-link.
- AC-RESULTS-08: Click en "Imprimir / PDF" dispara `window.print()`.
- AC-RESULTS-09: Click en "Copiar resumen" copia texto plano al clipboard y muestra confirmación visual.
- AC-RESULTS-10: Click en "Copiar deep-link" copia `<origin>/?demo=SDA-XXXXX` al clipboard.
- AC-RESULTS-11: La pestaña de Refinement aplica filtros que recalculan coverage/total_skills/gaps en vivo (`useMemo` sobre `applyToTeam(result, filters)`).

### 4.6 Refinement Chat (drawer lateral)

**Componente**: `RefinementChat.tsx` + `lib/mockChatRefinement.ts`.

**Filtros soportados** (5 tipos): `excludeSquads`, `excludeAvailability`, `requireSkills`, `excludeLevels`, `requireLevels`.

**Diccionarios de aliases** en español neutro y voseo argentino: `SQUAD`, `SKILL`, `LEVEL`, `AVAILABILITY`.

**Comandos canónicos del usuario**:

| Comando | Acción |
|---|---|
| `que tengan Kafka` | Agrega `Kafka` a `requireSkills` |
| `sin nadie de vacaciones` | Agrega `vacaciones` a `excludeAvailability` |
| `solo Senior y Staff` | Setea `requireLevels = ["senior", "staff"]` |
| `quita los de Pagos` | Agrega `Pagos Digitales` a `excludeSquads` |
| `vuelve al equipo original` | Limpia todos los filtros (reset) |

**UI**:
- Mensajes con avatares (user / assistant).
- Typing indicator (3 dots animados).
- Filter chips activos arriba con X individual para remover cada uno.
- Suggestion chips abajo.
- Mensajes con colores por tipo: filter / reset / warning / unknown / info.

**Criterios**:
- AC-CHAT-01: Cada filtro aplicado recomputa `coverage_score`, `total_skills` y `gaps` en vivo (la vista lee de `refinedResult`).
- AC-CHAT-02: Comandos en español neutro y en voseo argentino son aceptados con la misma semántica.
- AC-CHAT-03: Comandos no reconocidos producen un mensaje tipo `unknown` en el chat.
- AC-CHAT-04: Click en el ✕ de un filter chip remueve ese filtro y revierte su efecto.
- AC-CHAT-05: "vuelve al equipo original" limpia TODOS los filtros y restaura el `result` inicial.
- AC-CHAT-06: `summarizeImpact()` produce un mensaje describiendo el delta (cuántos candidatos quedaron/salieron).

### 4.7 Why Candidate Modal (auditoría)

**Componente**: `WhyCandidateModal.tsx` + `lib/scoreExplain.ts`.

**Estructura**:
- Hero con avatar + score grande.
- Summary humano + warnings ("⚠ Está en vacaciones — start date debe contemplarlo").
- 6 factores con barras animadas + recomendación textual:
  - Skills relevantes al rol/dominio (max 30 pts)
  - Trust Score (max 25 pts)
  - Disponibilidad (max ±12 pts — puede ser negativa)
  - Experiencia previa en dominio (max 15 pts)
  - Colaboraciones con miembros del equipo (max 10 pts)
  - EDI rating (max 8 pts)
- Footer con "Ver perfil completo →" (link a `/candidate/[id]`) + nota "GDPR Art. 22 · Transparencia algorítmica".

**Criterios**:
- AC-WHY-01: La suma de los 6 factores coincide con el score mostrado en el hero (con tolerancia de redondeo).
- AC-WHY-02: Tecla `Escape` cierra el modal.
- AC-WHY-03: Click fuera del modal lo cierra.
- AC-WHY-04: El factor "Disponibilidad" puede mostrar valor negativo si el candidato está en estado restringido.
- AC-WHY-05: El link "Ver perfil completo →" navega a `/candidate/{id}` correcto.
- AC-WHY-06: Tiene `role="dialog"` y `aria-modal="true"`.

### 4.8 Candidate Comparison

**Componente**: `CandidateComparison.tsx`.

- Grid 2-4 columnas con candidatos lado a lado.
- Skills compartidas entre TODOS los seleccionados se highlightean con check verde.
- Stats top:
  - Match avg.
  - Total skills únicas.
  - Skills compartidas.
  - Disponibles ahora.
- Botón "✦ Constelación" en header → abre `TeamConstellation` modal full-screen.

**Criterios**:
- AC-COMPARE-01: La modal soporta de 2 a 4 candidatos.
- AC-COMPARE-02: Las skills compartidas se calculan como la intersección de los skill sets.
- AC-COMPARE-03: Click en "✦ Constelación" abre `TeamConstellation`.
- AC-COMPARE-04: Tecla `Escape` cierra la modal.
- AC-COMPARE-05: Tiene `role="dialog"` y `aria-modal="true"`.

### 4.9 Team Constellation (grafo del equipo)

**Componente**: `TeamConstellation.tsx`.

- Modal full-screen con grafo force-directed.
- Personas + skills (top 4 por persona + compartidas) + edges de colaboración.
- Sidebar con miembros clickeables.
- Stats strip con 4 métricas.

**Criterios**:
- AC-CONSTELLATION-01: El grafo se carga vía `next/dynamic` con `{ ssr: false }` (depende de `window`/`canvas`).
- AC-CONSTELLATION-02: Click en un miembro del sidebar lo highlightea en el grafo.
- AC-CONSTELLATION-03: Tecla `Escape` cierra el modal.

### 4.10 Constellation View individual (`view = "constellation"`)

**Componente**: `ConstellationView.tsx`.

- Layout 50/50 en desktop: sidebar con info completa del candidato + grafo a la derecha.
- En mobile: sidebar arriba con scroll + grafo abajo.
- Click en un colaborador del grafo carga su grafo (`handleExploreEmployee`).

**Criterios**:
- AC-INDCONST-01: El grafo cambia cuando se hace click en un colaborador.
- AC-INDCONST-02: El botón "← Volver" retorna a `results` o `project-results` según el origen.

### 4.11 Networking (`view = "networking"`)

**Componente**: `NetworkingView.tsx` + `ProfileCard` interno + `FullCapacityPanel`.

**Datos**: `getNetworkingProfiles(filter, query)`, `getUserBTokens()`.

**UI**:
- Header con botón "← Volver", título "Networking & Mentoría", wallet badge con balance B-Tokens y tier.
- Search input + filtros: `Todos`, `Mentores`, `Peers`, `Mentees`.
- Grid de `ProfileCard` (3 columnas en desktop).

**ProfileCard**:
- Avatar con iniciales.
- Nombre + tipo (`mentor` / `peer` / `mentee`) — colores: lime / sereneBlue / canary.
- Para mentores: badge de capacidad `N/M mentees` (orange si está full).
- Rol + squad + disponibilidad horaria.
- `TrustScoreBadge` compact si existe.
- Topics + skills preview (4 + "+N").
- Acción principal:
  - Si mentor con cupo lleno → `FullCapacityPanel` con próxima ventana de disponibilidad y botón "Notificarme cuando se libere".
  - Si no → row con botón circular "Ver perfil" (navega a `/candidate/{id}`) + CTA principal "Solicitar mentoría" / "Conectar" con costo en BT.
- CTA deshabilitado si saldo B-Tokens insuficiente; muestra "Saldo insuficiente".

**Criterios**:
- AC-NET-01: Filtros (Todos/Mentores/Peers/Mentees) acotan la lista.
- AC-NET-02: La búsqueda por texto filtra por nombre/skills/temas con debounce de ~300 ms.
- AC-NET-03: El wallet badge muestra balance y tier correctos en el header.
- AC-NET-04: Click en CTA "Solicitar mentoría" llama `requestMentoring(empId)`, descuenta B-Tokens y muestra toast de confirmación.
- AC-NET-05: Click en CTA "Conectar" (no-mentor) llama `requestNetworking(empId)`.
- AC-NET-06: Si `mentees_actuales >= cupo_maximo`, NO se muestra el CTA principal; se muestra `FullCapacityPanel` con la fecha próxima formateada en español ("14 jul 2026").
- AC-NET-07: Click en el icon-button "Ver perfil" abre `/candidate/{id}`.
- AC-NET-08: La vista Networking se persiste vía `sessionStorage` y se restaura al volver desde `/candidate/[id]`.

### 4.12 Candidate Profile (`/candidate/[id]`)

**Componente**: `app/candidate/[id]/page.tsx`.

**Estructura**:
- Hero card grande con avatar + nombre + rol + score + availability.
- Bio.
- Skills con barras animadas.
- Trayectoria de proyectos (current/past) con quarters.
- Colaboradores clickeables (navegan a otro perfil).
- Aside con `TrustScoreBadge` (full mode), `BTokenBadge` (full mode), `EDIPanel` (full mode).
- Networking tags.
- Loading skeleton al entrar.
- 404 amigable si el id no existe.

**Criterios**:
- AC-PROFILE-01: Visitar `/candidate/emp_001` muestra a Valentina Ríos.
- AC-PROFILE-02: Visitar `/candidate/no_existe` muestra estado 404 amigable.
- AC-PROFILE-03: Click en un colaborador del aside navega a `/candidate/{collaboratorId}`.
- AC-PROFILE-04: `TrustScoreBadge` full muestra el breakdown completo (manager/EDI/peers/tenure/skills).
- AC-PROFILE-05: `EDIPanel` full muestra rating + manager_comment + peer_comments.

### 4.13 About (`/about`)

**Componente**: `app/about/page.tsx`.

- Whitepaper técnico con 3 capas: Presentación / Inteligencia / Datos.
- Componentes con status: live / mock / planned.
- Data flow de 6 pasos.
- Sección de compliance: GDPR, encryption, audit log.

**Criterios**:
- AC-ABOUT-01: La página renderiza sin errores.
- AC-ABOUT-02: Las 3 capas se ven claramente.
- AC-ABOUT-03: Cada componente tiene su badge de status correctamente.

### 4.14 Workforce Intelligence Dashboard (`/dashboard`)

**Componente**: `app/dashboard/page.tsx` + `lib/siloAnalysis.ts` + `lib/workforce-stats.ts` + `components/WorkforceCharts.tsx` + `components/SiloRiskCard.tsx`.

**Header sticky**:
- Botón "← Volver".
- Badge "Workforce Intelligence".
- Texto: "BBVA Engineering · {totalWorkforce} colaboradores".
- `ThemeToggle`.

**Hero**:
- Título "Mapa del talento de Engineering".
- Subtítulo descriptivo.
- **AI Headline insight**: card con icono ✦ purple, label "Insight prioritario · IA", texto con la primera sugerencia del primer riesgo crítico (o el de mayor severidad disponible).

**KPI strip (4 cards)**:
- Headcount Engineering (`totalWorkforce`).
- Silos en riesgo (`techsAtRisk`) + count crítico.
- Cobertura demanda global (`globalCoverageRatio` × 100%) — color: lime ≥85%, canary ≥60%, naranja sino.
- Mentores activos (`totalMentors`) + ratio.

**Workforce by type strip (4 cards)**:
- Legacy (HOST + ASO).
- Propietario BBVA (NACAR · APX · Cells).
- Stack moderno (Mobile · Web · Cloud · Data).
- Emergente (AI Engineering).

**Sección "Silos de conocimiento detectados"**:
- Título dinámico con count de tecnologías en riesgo.
- Grid de `SiloRiskCard` ordenadas por severidad descendente.
- Cada card es expandible y muestra factores + recomendaciones de IA.

**Charts grid**:
- `DemandSupplyChart` — barras pareadas demanda vs supply efectivo por tech.
- `AvailabilityDonut` — dona de disponibilidad agregada.
- `SeniorityPyramid` — pirámide Junior/Mid/Senior/Staff.

**Snapshot por tecnología**:
- Grid de `TechCard` (1 / 2 / 3 / 4 columnas según viewport).

**Footer disclaimer** con texto legal sobre datos sintéticos.

**Criterios**:
- AC-DASH-01: La página renderiza con `analyzeSilos()` y `buildDashboardKPIs()` calculados al mount.
- AC-DASH-02: Click en "← Volver" retorna a la ruta anterior (o `/` si no hay history).
- AC-DASH-03: Cada `SiloRiskCard` se expande/colapsa al click.
- AC-DASH-04: Si no hay riesgos detectados, se muestra empty state "✓ Sin silos detectados".
- AC-DASH-05: La cobertura global se calcula como `totalEffectiveAvailable / totalDemandedHeadcount` y se muestra como porcentaje.
- AC-DASH-06: `ThemeToggle` en el header alterna correctamente.
- AC-DASH-07: La página es responsive: 1 col mobile / 2 cols tablet / 3-4 cols desktop en los grids.

### 4.15 Theme Toggle (light / dark)

**Componente**: `ThemeToggle.tsx`.

- Botón visible en home, dashboard y otras vistas.
- Persiste preferencia en `localStorage`.
- Aplica clase / data-attribute al `<html>` que activa las CSS variables del tema correspondiente.

**Criterios**:
- AC-THEME-01: Click alterna entre dark y light.
- AC-THEME-02: La preferencia persiste tras refresh.
- AC-THEME-03: La paleta Neural Cosmos sigue intacta en dark; en light usa equivalentes coherentes.
- AC-THEME-04: No hay flash of unstyled content en page load.

---

## 5. Reglas de negocio (lógica auditable)

### 5.1 Trust Score (`lib/trust-score.ts`)

```
overall = manager * 0.35 + edi * 0.25 + peers * 0.20 + tenure * 0.10 + skills * 0.10
```

Tiers:
- `>= 85` → **platinum**
- `>= 70` → **gold**
- `>= 50` → **silver**
- `< 50`  → **bronze**

### 5.2 Match Score Explainability (`lib/scoreExplain.ts`)

6 factores ponderados sumando hasta ~100 pts:

| Factor | Max pts | Notas |
|---|---|---|
| Skills relevantes al rol/dominio | 30 | Match contra keywords del rol |
| Trust Score | 25 | Lectura directa del overall |
| Disponibilidad | ±12 | **Puede ser negativa** si está en estado restrictivo |
| Experiencia previa en dominio | 15 | Proyectos pasados en mismo dominio |
| Colaboraciones con miembros del equipo | 10 | Edges de colaboración con weight |
| EDI rating | 8 | Última evaluación |

### 5.3 Gap Analysis (`lib/gapAnalysis.ts`) — 6 reglas

Cada gap tiene severidad: `critical` / `high` / `medium` / `low`.

1. **Cobertura insuficiente** — "1 de 2 ML Engineers cubiertos".
2. **Riesgo de disponibilidad** — "2 de 4 con disponibilidad limitada".
3. **Distribución de seniority** — "Equipo sin referente Senior/Staff".
4. **Colaboración previa entre miembros** — "Sin colaboraciones previas entre miembros".
5. **Trust Score promedio** — "Trust Score promedio bajo (53/100)".
6. **Skills implícitas en el nombre del proyecto** — "Sin cobertura aparente en 'Fraud Detection'".

### 5.4 Silo Risk Analysis (`lib/siloAnalysis.ts`) — 6 reglas

| Kind | Trigger |
|---|---|
| `bus-factor` | <=10 colab en tech crítica → critical · <=20 críticos / <=10 no-críticos → high |
| `succession` | total >= 10 y Senior+Staff >= 85% → high · >= 70% → medium |
| `tenure-concentration` | tenure promedio >= 18 → critical · >= 12 → high |
| `no-pipeline` | total >= 8 y juniors == 0 → high · total >= 30 y juniors < 5% → medium |
| `demand-supply` | satisfaction < 30% → critical · < 60% → high · < 85% → medium |
| `low-mentorship` | crítica con mentor ratio < 5% → high · < 4% → medium |

`overallSeverity` = peor severidad de los factores. Las recomendaciones de IA son producidas por `buildAISuggestions()` con plantillas según los `kinds` activos.

### 5.5 Refinement filters (`lib/mockChatRefinement.ts`)

Soportados:
- `excludeSquads: string[]`
- `excludeAvailability: string[]` (estados: disponible, parcial, asignado, vacaciones, maternidad, licencia, descanso médico)
- `requireSkills: string[]`
- `excludeLevels: string[]`
- `requireLevels: string[]`

API:
- `applyToTeam(result, filters)` → recomputa coverage/total_skills/gaps.
- `summarizeImpact(before, after)` → string describiendo el delta.

---

## 6. Modelo de datos (mocks)

Todos los tipos en `lib/types.ts`. Mocks en `lib/mock-data.ts`.

### 6.1 EmpleadoResult

```ts
{
  id: string,
  nombre: string,
  email: string,
  rol: string,
  squad: string,
  nivel: "junior" | "mid" | "senior" | "staff",
  ubicacion: string,
  bio: string,
  score: number,
  habilidades: SkillNode[],          // { nombre, categoria, score 0..1 }
  proyectos: ProyectoNode[],         // { id, nombre, dominio, estado }
  colaboradores: ColaboradorRef[],   // { id, nombre, rol, weight 0..1 }
  disponibilidad?: AvailabilityStatus,
  disponibilidad_hasta?: string,
  proyecto_asignado?: string,
  años_empresa: number,
  edi?: { año, rating, manager_rating, manager_comment, peer_comments },
  trust_score?: { overall, tier, breakdown },
  b_tokens?: { balance, tier, historial },
  es_mentor: boolean,
  disponible_networking: boolean,
  networking_tags?: string[]
}
```

### 6.2 SDAProject

```ts
{
  codigo: "SDA-53021",
  nombre: "FX Tracker",
  dominio: "Pagos Digitales",
  estado: "En planificación" | "En desarrollo" | "En producción",
  roles: [{ role: "ML Engineer", quantity: 2 }, ...]
}
```

### 6.3 TeamCompositionResponse

```ts
{
  project_name: string,
  coverage_score: number,         // 0..1
  total_skills: number,
  gaps: GapAnalysisResult[],
  roles: RoleMatch[]              // { role, quantity, candidates: EmpleadoResult[] }
}
```

### 6.4 NetworkingProfile

```ts
{
  empleado: EmpleadoResult,
  tipo: "mentor" | "peer" | "mentee",
  temas: string[],
  costo_bt: number,
  disponibilidad_horaria: string,
  // Mentor capacity (solo para tipo mentor)
  cupo_maximo?: number,           // default 2
  mentees_actuales?: number,
  proxima_disponibilidad?: string // ISO date "YYYY-MM-DD"
}
```

### 6.5 Datos canónicos para tests

- **18 empleados** en `CANDIDATE_POOL` (`Record<id, EmpleadoResult>`).
- **30 proyectos SDA**.
- **Demo canónico**: `SDA-53021 FX Tracker` (Pagos Digitales · 2 ML + 1 Backend + 1 DevOps).
- **Empleado canónico**: `emp_001 Valentina Ríos` (Senior Backend, Pagos Digitales).

---

## 7. Capa de fetch (`lib/api.ts`)

Funciones públicas:
- `searchTalent(query: string): Promise<SearchResponse>`
- `getEmployeeGraph(id: string): Promise<GraphResponse>`
- `getProjectRecommendations(project: SDAProject): Promise<TeamCompositionResponse>`
- `getSDAProjects(): Promise<SDAProject[]>`
- `getEmployeeById(id: string): Promise<EmpleadoResult | null>`
- `listAllEmployees(): Promise<EmpleadoResult[]>`
- `getNetworkingProfiles(filter, query): Promise<{ perfiles: NetworkingProfile[] }>`
- `getUserBTokens(): Promise<BTokenWallet>`
- `requestNetworking(id: string): Promise<{ ok, nuevo_balance }>`
- `requestMentoring(id: string): Promise<{ ok, nuevo_balance }>`

**Invariante crítica**: `IS_MOCK = process.env.NEXT_PUBLIC_MOCK !== "false"`. Por defecto, mock activado. La app NUNCA debe romperse por falta de backend.

---

## 8. Persistencia y estado del cliente

| Storage | Key | Valor | Uso |
|---|---|---|---|
| `localStorage` | `bbva-talent:onboarding-seen-v1` | `"1"` después de finalizar tour | No re-abrir tour |
| `localStorage` | (ThemeToggle) | `"dark"` / `"light"` | Tema seleccionado |
| `sessionStorage` | `bbva-talent:last-view` | `"home"` o `"networking"` | Restaurar vista al volver de `/candidate/[id]` |

---

## 9. Accesibilidad (a11y)

Requisitos no negociables:
- A11Y-01: Skip-to-content link visible al focusear.
- A11Y-02: `*:focus-visible` con outline purple en navegación por teclado.
- A11Y-03: Todos los modales tienen `role="dialog"` + `aria-modal="true"`.
- A11Y-04: Tecla `Escape` cierra cualquier modal abierto.
- A11Y-05: Botones de íconos tienen `aria-label` descriptivo.
- A11Y-06: `prefers-reduced-motion` respetado globalmente — animaciones canceladas o reducidas.
- A11Y-07: Contraste de texto ≥ AA en ambos temas (dark + light).

---

## 10. Print / Export

CSS `@media print` custom:
- PRINT-01: Fondo blanco + texto negro forzado.
- PRINT-02: Oculta `nav`, `aside`, elementos `position: fixed`, `bg-dot-grid`.
- PRINT-03: `page-break-inside: avoid` en cards.
- PRINT-04: Cancela animaciones.
- PRINT-05: `window.print()` triggerea el print dialog del navegador con la vista actual.

`ExportTeamMenu`:
- Imprimir / PDF → `window.print()`.
- Copiar resumen → texto plano formateado al clipboard.
- Copiar deep-link → `<origin>/?demo=SDA-XXXXX` al clipboard.

---

## 11. Responsive (mobile-first)

Breakpoints Tailwind estándar (`sm`, `md`, `lg`, `xl`).

Vistas con tratamiento mobile específico:
- Home: stats bar wrapping, CTAs full width.
- Project Results: header `flex-col sm:flex-row` para stack.
- `CandidateRow`: oculta TrustScoreBadge en mobile, BTokenBadge en mobile/tablet.
- `ConstellationView`: layout 50/50 desktop, apilado mobile (sidebar arriba con scroll, grafo abajo).
- Dashboard: KPI strip 2 cols mobile / 4 cols desktop; charts apilados mobile.

---

## 12. Errores y edge cases conocidos

- ERROR-01: Search query con < 3 caracteres → submit deshabilitado.
- ERROR-02: Deep-link con código no existente → toast "Proyecto SDA-XXXXX no encontrado", quedarse en home.
- ERROR-03: Deep-link con formato inválido (no matchea `^SDA-\d+$`) → ignorado silenciosamente.
- ERROR-04: `getEmployeeGraph` falla → mantener vista actual sin romper, ignore silently.
- ERROR-05: `searchTalent` o `getProjectRecommendations` fallan → `ErrorToast` con mensaje + volver a home.
- ERROR-06: Saldo B-Tokens insuficiente para conectar → CTA deshabilitado + texto "Saldo insuficiente".
- ERROR-07: Mentor con cupo lleno → no se permite request, se muestra `FullCapacityPanel`.
- ERROR-08: `/candidate/[id]` con id inexistente → 404 amigable.

---

## 13. Flujos críticos (golden paths para tests E2E)

### 13.1 Demo mode (jurado del concurso)

1. Visitar `/`.
2. Esperar a que se abra el tour automáticamente (~700 ms).
3. Cerrar tour (✕ o Esc).
4. Click en "▶ Prueba un caso real · SDA-53021 FX Tracker".
5. Esperar `SearchingAnimation`.
6. Verificar `project-results` con coverage, gaps, balance, roles, candidatos.
7. Click en `?` en algún candidato.
8. Verificar `WhyCandidateModal` con 6 factores.
9. Cerrar modal con Esc.
10. Click en "Ver perfil completo →" en el modal.
11. Verificar `/candidate/{id}`.

### 13.2 Refinement flow

1. Llegar a `project-results` (vía demo o composer).
2. Click en "✦ Refinar con IA".
3. Escribir "que tengan Kafka" → verificar filter chip + recompute.
4. Escribir "sin nadie de vacaciones" → verificar segundo filter chip.
5. Verificar coverage actualizado en el header.
6. Click en ✕ del primer chip → verificar revertimiento.
7. Escribir "vuelve al equipo original" → verificar reset total.

### 13.3 Comparison flow

1. En `project-results`, marcar 3 candidatos vía checkbox.
2. Verificar barra flotante "Comparar lado a lado (3)".
3. Click en la barra → modal de comparación con 3 columnas.
4. Verificar skills compartidas highlighted con check verde.
5. Click en "✦ Constelación" → modal full-screen del grafo.
6. Cerrar con Esc.

### 13.4 Networking flow

1. Visitar `/`.
2. Click en `Networking`.
3. Verificar wallet badge en header.
4. Cambiar filtro a "Mentores".
5. Identificar mentor con cupo lleno (badge naranja `2/2 mentees`).
6. Verificar `FullCapacityPanel` en lugar de CTA principal.
7. Cambiar a un mentor con cupo libre.
8. Click en "Solicitar mentoría" → toast de confirmación + decremento de B-Tokens.
9. Click en icono "Ver perfil" → navegar a `/candidate/{id}`.
10. Volver con browser back → vista Networking se restaura (sessionStorage).

### 13.5 Workforce Dashboard flow

1. Visitar `/dashboard`.
2. Verificar Hero AI insight, KPI strip (4 cards), workforce-by-type strip.
3. Verificar `TechDistributionBarChart`.
4. Scrollear a "Silos de conocimiento detectados".
5. Expandir el primer `SiloRiskCard` → ver factores + sugerencias de IA.
6. Verificar `DemandSupplyChart`, `AvailabilityDonut`, `SeniorityPyramid`.
7. Click en `ThemeToggle` → tema cambia; refrescar y verificar persistencia.

### 13.6 Theme + persistence

1. Visitar `/`.
2. Anotar tema actual.
3. Click en `ThemeToggle`.
4. Verificar cambio de paleta.
5. Refresh.
6. Verificar que el tema seleccionado persiste.
7. Borrar `localStorage` → refresh → tema vuelve al default (dark).

---

## 14. Performance / robustez

- PERF-01: Componentes pesados (`react-force-graph-2d`, `ParticleBackground`, `SearchingAnimation`, vistas `Dynamic`) cargan vía `next/dynamic` con `{ ssr: false }`.
- PERF-02: TypeScript strict — `npx tsc --noEmit` debe pasar limpio (excepto el error preexistente de `jest.config.ts`).
- PERF-03: `ErrorBoundary` global captura errores de React y muestra fallback con "Volver al inicio" / "Recargar".

---

## 15. Restricciones y decisiones técnicas

- TECH-01: NO se debe agregar `jsPDF` ni librerías similares — el export usa `window.print()`.
- TECH-02: Mock por defecto es **invariante**: `IS_MOCK !== "false"`.
- TECH-03: NO introducir colores fuera de la paleta Neural Cosmos sin agregarlos previamente.
- TECH-04: La UI usa **español neutro latinoamericano (tuteo)** exclusivamente.
- TECH-05: La state machine de `app/page.tsx` es la única fuente de verdad para vistas internas. Solo `/candidate/[id]`, `/about` y `/dashboard` viven en rutas Next.js separadas.

---

## 16. Out of scope (NO testear)

- Tests E2E con Playwright real (están en backlog futuro).
- Backend real con FastAPI / Neo4j (planeado, no implementado).
- LLM real para refinement (es un mock heurístico).
- Integraciones reales con HR Hub, Workday, SSO.
- Filtros multi-select en `ResultsView`.
- Heatmap de skills del banco vs demanda.
- Privacy banner y consentimiento explícito.

---

## 17. Apéndice — Comandos y diagnóstico

| Comando | Uso |
|---|---|
| `npm run dev` | Levanta dev server en `http://localhost:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run test` | Tests Jest |
| `npm run test:coverage` | Cobertura |
| `npx tsc --noEmit` | Type-check (debe pasar limpio salvo error preexistente en `jest.config.ts`) |

Diagnóstico rápido:
- DevTools → Network → verificar que NO hay requests a `localhost:8000` (debería usar mocks).
- `localStorage.clear()` para resetear estado de onboarding y theme.
- `localStorage.removeItem('bbva-talent:onboarding-seen-v1')` + refresh para forzar el tour.
- `sessionStorage.clear()` para resetear vista persistida.

---

**Fin del PRD.** Versión consolidada para QA automatizado contra `http://localhost:3000`.
