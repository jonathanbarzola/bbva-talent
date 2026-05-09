# CLAUDE.md — Contexto del proyecto para agentes de IA

> Este archivo se lee automáticamente al iniciar Claude Code en este repo. Da contexto crítico para no perder tiempo.

---

## ¿Qué es este proyecto?

**BBVA Talent** — plataforma de descubrimiento y composición de equipos para BBVA, presentada a **ableChallenge 2026**.

Frontend-only Next.js 16 + React 19 + Tailwind 4 + Framer Motion + react-force-graph-2d.

**Lee `README.md` para el panorama completo.**

---

## Reglas de oro al trabajar acá

1. **No instalar `jsPDF`** — el export usa `window.print()` con CSS `@media print`. Decisión deliberada para mantener stack minimal.
2. **Mock es default** — `IS_MOCK !== "false"` en `lib/api.ts`. Cuando el backend real exista, será un cambio explícito de env, no del código.
3. **Theme Neural Cosmos** — colores en `lib/bbva-colors.ts` y CSS vars en `app/globals.css`. **No introducir nuevos colores ad-hoc** — usar los existentes o agregar a la paleta primero.
4. **Spanish rioplatense con voseo** en todo el copy de UI: "buscá", "quitá", "agregá", "dale", etc. Y en respuestas al usuario también.
5. **State machine en `app/page.tsx`** — 7 vistas. No agregar router-based navigation salvo para rutas standalone como `/candidate/[id]` o `/about`.
6. **Componentes pesados con `next/dynamic`** + `{ ssr: false }` (graph, particles, animations).
7. **TypeScript strict** — `npx tsc --noEmit` debe pasar limpio (excepto el error preexistente de `jest.config.ts`).
8. **No correr `npm run build`** salvo que el usuario lo pida explícitamente — preferencia del owner.

---

## Comando para verificar que no se rompió nada

```bash
npx tsc --noEmit
```

Debería retornar limpio salvo este error preexistente que NO es nuestro:
```
jest.config.ts(14,3): error TS2561: Object literal may only specify known properties, but 'testPathPattern' does not exist...
```

---

## Estructura mental del repo

```
app/                       → Páginas Next.js (App Router)
  page.tsx                 → Home + state machine
  candidate/[id]/page.tsx  → Perfil individual deep-linkable
  about/page.tsx           → Whitepaper técnico
  layout.tsx               → ErrorBoundary + skip-to-content
  globals.css              → Theme Neural Cosmos + a11y + print

components/                → 25+ componentes (ver README)

lib/                       → Lógica de negocio
  api.ts                   → Capa de fetch (mock por defecto)
  types.ts                 → TypeScript types
  bbva-colors.ts           → Paleta de marca
  trust-score.ts           → Cálculo de Trust Score (auditable)
  mock-data.ts             → 18 empleados + 30 proyectos SDA
  scoreExplain.ts          → Heurística de explicabilidad (6 factores)
  gapAnalysis.ts           → 6 reglas de gap detection
  mockChatRefinement.ts    → Parser conversacional español
```

---

## Heurísticas de scoring (NO son magia)

### Trust Score (`lib/trust-score.ts`)
```
overall = manager * 0.35 + edi * 0.25 + peers * 0.20 + tenure * 0.10 + skills * 0.10
```
Tiers: `>=85 platinum · >=70 gold · >=50 silver · <50 bronze`.

### Match Score Explainability (`lib/scoreExplain.ts`)
6 factores ponderados sumando hasta ~100 pts:
- Skills relevantes (max 30) — keywords del rol/dominio
- Trust Score (max 25)
- Disponibilidad (max ±12, puede ser negativa)
- Experiencia previa en dominio (max 15)
- Colaboraciones con equipo (max 10)
- EDI rating (max 8)

### Gap Analysis (`lib/gapAnalysis.ts`)
6 reglas con severidad (critical/high/medium/low):
1. Cobertura insuficiente
2. Riesgo de disponibilidad
3. Distribución de seniority
4. Colaboración previa entre miembros
5. Trust Score promedio
6. Skills implícitas en el nombre del proyecto

---

## Datos mock importantes

- **18 empleados** en `CANDIDATE_POOL` (Record<id, EmpleadoResult>) — todos con EDI, Trust Score, B-Tokens, colaboradores
- **30 proyectos SDA** con roles + cantidades requeridas
- **Demo-canónico**: `SDA-53021 FX Tracker` (Pagos Digitales · 2 ML + 1 Backend + 1 DevOps)
- **Empleado-canónico**: `emp_001 Valentina Ríos` (Senior Backend, Pagos Digitales)

Deep-links útiles:
- `/?demo=SDA-53021` → auto-carga FX Tracker
- `/candidate/emp_001` → perfil de Valentina

---

## Roadmap

- **Sprints 1-4 completados** al 100% (ver `CHANGELOG.md`)
- **Roadmap futuro** en README.md (filtros multi-select, heatmap de skills, modo claro, NLP real, etc.)

---

## Cosas que SÍ pueden cambiar (sin permiso)

- Estilos / colores dentro del theme actual
- Microcopy en español (manteniendo voseo)
- Estructura interna de un componente (sin cambiar su API pública)
- Bug fixes
- Tests adicionales

## Cosas que NO se cambian sin preguntar

- Stack base (Next.js / React / Tailwind versions)
- Mock-by-default behavior en `lib/api.ts`
- State machine de vistas en `app/page.tsx`
- Decisión de no usar jsPDF
- Theme Neural Cosmos (paleta de colores)

---

## Si vas a debuggear

1. `npm run dev` — levantar dev server
2. Abrir DevTools → Network → ver que NO hay requests a `localhost:8000` (debería usar mocks)
3. Si hay errores raros: `localStorage.clear()` (puede haber estado del onboarding cacheado)
4. Para forzar el tour: `localStorage.removeItem('bbva-talent:onboarding-seen-v1')` y refrescar

---

## Contexto del concurso

- **ableChallenge 2026** (BBVA)
- **Restricción crítica**: jueces interactúan SOLOS con la app (sin demo guiada) → onboarding y self-explanation son vitales
- **Frontend-only con mocks** — no LLM real, no backend
- **Criterios del jurado**: impacto de negocio + innovación técnica + UX/diseño + viabilidad real (los 4 pesan)
- **Equipo**: Jonathan trabaja solo
- **Timeline**: ~3-4 semanas hasta presentación
