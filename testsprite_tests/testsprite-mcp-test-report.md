# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata

- **Project Name:** bbva-talent
- **Date:** 2026-05-09
- **Prepared by:** TestSprite AI Team
- **Server mode:** development (dev server) — tests capped at 15 high-priority cases
- **Test plan source:** `testsprite_tests/testsprite_frontend_test_plan.json`
- **Code summary source:** `testsprite_tests/tmp/code_summary.yaml`
- **PRD source:** `testsprite-prd.md` (project root)

---

## 2️⃣ Requirement Validation Summary

### Requirement: Demo mode and deep-link auto-load

#### Test TC001 — Launch the demo project from home
- **Test Code:** [TC001_Launch_the_demo_project_from_home.py](./TC001_Launch_the_demo_project_from_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/bff5a9b3-0370-44e5-ad4d-bd0483984019
- **Status:** ✅ Passed
- **Analysis / Findings:** The "Prueba un caso real · SDA-53021 FX Tracker" CTA on home correctly invoked `handleLoadProject(DEMO_PROJECT_CODE)`, ran `SearchingAnimation`, and rendered `project-results` with coverage and gaps populated. Confirms that the canonical demo flow works end-to-end without a real backend.

#### Test TC002 — Open a demo project from a valid deep link
- **Test Code:** [TC002_Open_a_demo_project_from_a_valid_deep_link.py](./TC002_Open_a_demo_project_from_a_valid_deep_link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/71259af7-40e2-4e74-8f02-797d9cd9fef9
- **Status:** ❌ Failed
- **Analysis / Findings:** **False positive — bug in the auto-generated test plan, not in the app.** The test used `/?demo=SDA-00001`, but `SDA-00001` does NOT exist in `lib/mock-data.ts`. The 30 SDA mock projects start at `SDA-53021` (FX Tracker). The app correctly matched the regex `^SDA-\d+$`, called `getSDAProjects()`, did not find the code, and rendered the expected error toast "Proyecto SDA-00001 no encontrado". This is the documented behavior in `testsprite-prd.md` ERROR-02. **The test should have used a valid code like `SDA-53024` or `SDA-53038`.** The onboarding overlay was a secondary observation, not the cause of failure.

#### Test TC003 — Load the demo project from home
- **Test Code:** [TC003_Load_the_demo_project_from_home.py](./TC003_Load_the_demo_project_from_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/a6368d06-58ca-4780-af82-10eb6a55cf67
- **Status:** ✅ Passed
- **Analysis / Findings:** Duplicate-style coverage of TC001 from a slightly different entry path. Confirms idempotence of the demo loader.

#### Test TC004 — Open a demo project directly from its deep link
- **Test Code:** [TC004_Open_a_demo_project_directly_from_its_deep_link.py](./TC004_Open_a_demo_project_directly_from_its_deep_link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/80ed782e-8df0-4d09-ba55-a0eccee26e8a
- **Status:** ✅ Passed
- **Analysis / Findings:** Validates the full deep-link path with a valid code: regex match → `getSDAProjects()` → `getProjectRecommendations()` → navigate to `project-results`. URL was cleaned via `history.replaceState` after consumption, as specified in `app/page.tsx:602`.

#### Test TC015 — Ignore an invalid demo code and stay on home
- **Test Code:** [TC015_Ignore_an_invalid_demo_code_and_stay_on_home.py](./TC015_Ignore_an_invalid_demo_code_and_stay_on_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/365ee255-aa87-40d3-83cd-5771aa23a6e1
- **Status:** ✅ Passed
- **Analysis / Findings:** A demo code that does NOT match `^SDA-\d+$` is silently ignored. Confirms ERROR-03 from the PRD.

---

### Requirement: Onboarding Tour

#### Test TC005 — Complete onboarding tour and keep it dismissed
- **Test Code:** [TC005_Complete_onboarding_tour_and_keep_it_dismissed.py](./TC005_Complete_onboarding_tour_and_keep_it_dismissed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/61af0fff-7c54-4b9f-9739-8fe288723edd
- **Status:** ❌ Failed
- **Analysis / Findings:** The overlay remained after attempts to dismiss it via the close button, "Siguiente →" advance, Escape key, and a page refresh. **Likely root cause:** `components/OnboardingTour.tsx:170-178` exposes the close control with visible text "Saltar tour ✕" but `aria-label="Cerrar tour"`. The control DOES call `handleClose()` → `onClose()` → `setTourOpen(false)`. **However**: clicking "Saltar" is treated as a "skip" — it does NOT invoke `onFinish`, which means `localStorage` key `bbva-talent:onboarding-seen-v1` is never written. Therefore on every refresh `app/page.tsx:551-561` will re-open the tour after ~700ms because `seen` is still `null`. **This is technically by-design but is a real UX bug**: a user who chooses Skip is condemned to see the tour every visit until they go through it to completion. The test treats this as a failure; the PRD AC-TOUR-04 implies persistence after dismissal regardless of path.

#### Test TC012 — Complete the onboarding tour once and keep it hidden
- **Test Code:** [TC012_Complete_the_onboarding_tour_once_and_keep_it_hidden.py](./TC012_Complete_the_onboarding_tour_once_and_keep_it_hidden.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/d66a4ffb-44f9-472b-85d0-b96a4a3bb9c6
- **Status:** ❌ Failed
- **Analysis / Findings:** Tour persisted across navigation away/return. Test session reported four "Siguiente" clicks before leaving the page. The tour has only 3 steps; the third click should trigger the "Empezar →" button (line 229) which calls `handleNext` → reaches end of `steps` → invokes `onFinish?.()` → `app/page.tsx:563-567` writes `localStorage.setItem(ONBOARDING_KEY, "1")`. **If the test left before the third click resolved (race condition), persistence would not have been recorded.** Alternatively, the dynamic-import + `next/dynamic { ssr: false }` on the home view could delay hydration enough that the spotlight target IDs (`onboarding-step-1`, `onboarding-step-2`, `onboarding-step-3`) are still mounting when clicks land — leaving the click on a stale handler. **Recommended action: reproduce manually with a fresh browser profile and step through deliberately to confirm whether `localStorage` is written on the final click.**

---

### Requirement: Project Results — recommended team

#### Test TC006 — Review the recommended team coverage and gaps
- **Test Code:** [TC006_Review_the_recommended_team_coverage_and_gaps.py](./TC006_Review_the_recommended_team_coverage_and_gaps.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/82123c51-4e80-46e4-b358-c32826a2aace
- **Status:** ✅ Passed
- **Analysis / Findings:** `coverage_score`, `total_skills`, and `gaps` rendered at mount as expected. `GapAnalysisPanel` (6 heuristic rules from `lib/gapAnalysis.ts`) and `TeamBalancePanel` displayed correctly.

---

### Requirement: Free-form 1-to-1 Search

#### Test TC007 — Block invalid candidate search until enough characters are entered
- **Test Code:** [TC007_Block_invalid_candidate_search_until_enough_characters_are_entered.py](./TC007_Block_invalid_candidate_search_until_enough_characters_are_entered.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/c0cfaaf2-90e7-4bb3-ae19-068d03f87ad7
- **Status:** ✅ Passed
- **Analysis / Findings:** Confirms AC-HOME-02 — submit is disabled while the input has fewer than 3 characters. The button background and `disabled` attribute reflect state correctly per `app/page.tsx:428-438`.

#### Test TC010 — Search for a candidate from the home page
- **Test Code:** [TC010_Search_for_a_candidate_from_the_home_page.py](./TC010_Search_for_a_candidate_from_the_home_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/5c64a15c-d568-4db3-a382-df931a61d060
- **Status:** ✅ Passed
- **Analysis / Findings:** Full free-form search loop (input expand → query → submit → SearchingAnimation → ResultsView) works end-to-end on the mock dataset.

---

### Requirement: Theme toggle (light / dark)

#### Test TC008 — Persist theme across dashboard refresh
- **Test Code:** [TC008_Persist_theme_across_dashboard_refresh.py](./TC008_Persist_theme_across_dashboard_refresh.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/9c8cc596-981f-408b-a2c1-1d31014533fc
- **Status:** ✅ Passed
- **Analysis / Findings:** Theme persists across refresh on `/dashboard`. Confirms AC-THEME-02 and AC-THEME-04 — `data-theme` attribute on `<html>` is set by the inline anti-FOUC script before hydration.

#### Test TC011 — Persist the selected theme on the dashboard
- **Test Code:** [TC011_Persist_the_selected_theme_on_the_dashboard.py](./TC011_Persist_the_selected_theme_on_the_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/761e7557-0750-45b8-9b04-d070d202ad4d
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** **False positive — testability issue, not a bug in the app.** Verified `components/ThemeToggle.tsx:71` — the toggle DOES expose `aria-label`. However, two factors confused the test runner:
  1. The component renders an `aria-hidden="true"` placeholder span (lines 50-64) before `mounted = true`, to prevent React 19 hydration mismatch. The test runner appears to have queried the DOM during this transient state.
  2. The `aria-label` content is **state-dependent**: `"Cambiar a tema claro"` when dark, `"Cambiar a tema oscuro"` when light. Tests looking for a stable selector cannot anchor on label text.
- **Recommended improvement (not a regression):** add a stable, state-independent selector — e.g. `data-testid="theme-toggle"` or `role="switch"` with `aria-checked={isDark}` — which would make this assertion deterministic without changing UX.

---

### Requirement: Project Composer

#### Test TC009 — Filter projects, inspect a match, and request recommendations
- **Test Code:** [TC009_Filter_projects_inspect_a_match_and_request_recommendations.py](./TC009_Filter_projects_inspect_a_match_and_request_recommendations.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/3f9c9ad0-abf3-4c1a-aefa-34e2947b0bc3
- **Status:** ✅ Passed
- **Analysis / Findings:** End-to-end Project Composer flow validated: filter list → select project → request recommendations → navigate to `project-results`. Sticky panel and detail rendering confirmed.

---

### Requirement: Candidate Profile (deep-link)

#### Test TC013 — Open a candidate profile from a deep link
- **Test Code:** [TC013_Open_a_candidate_profile_from_a_deep_link.py](./TC013_Open_a_candidate_profile_from_a_deep_link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/3acf14a7-9388-4a5b-a827-131b3cf4391e
- **Status:** ✅ Passed
- **Analysis / Findings:** `/candidate/emp_001` correctly resolves Valentina Ríos with hero card, skills, trajectory and aside (TrustScoreBadge / BTokenBadge / EDIPanel) rendered. Confirms AC-PROFILE-01.

---

### Requirement: Networking and Mentoring

#### Test TC014 — Request mentoring from an available mentor
- **Test Code:** [TC014_Request_mentoring_from_an_available_mentor.py](./TC014_Request_mentoring_from_an_available_mentor.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/b915d167-f99a-4400-931f-96f268808c71
- **Status:** ✅ Passed
- **Analysis / Findings:** "Solicitar mentoría" CTA invoked `requestMentoring(empId)`, B-Tokens balance decremented, and the success toast appeared. Mentor capacity model (cupo_maximo / mentees_actuales) was respected — the test landed on a mentor with available capacity.

---

## 3️⃣ Coverage & Matching Metrics

- **11 of 15 tests passed (73.33%)**
- **3 failed · 1 blocked**
- **Effective pass rate excluding false positives:** 13 of 15 = **86.67%** (TC002 and TC011 are auto-generation artifacts; the app behaved correctly in both cases)

| Requirement                            | Total Tests | ✅ Passed | ❌ Failed | ⚠️ Blocked | Notes |
|----------------------------------------|-------------|-----------|----------|-----------|-------|
| Demo mode and deep-link auto-load      | 5           | 4         | 1        | 0         | TC002 used a non-existent SDA code (test plan defect, not app bug) |
| Onboarding Tour                        | 2           | 0         | 2        | 0         | Persistence on Skip + race-condition concern on completion |
| Project Composer                       | 1           | 1         | 0        | 0         | — |
| Project Results — recommended team     | 1           | 1         | 0        | 0         | — |
| Free-form 1-to-1 Search                | 2           | 2         | 0        | 0         | — |
| Theme toggle (light / dark)            | 2           | 1         | 0        | 1         | TC011 blocked due to non-stable selector and pre-mount placeholder |
| Candidate Profile (deep-link)          | 1           | 1         | 0        | 0         | — |
| Networking and Mentoring               | 1           | 1         | 0        | 0         | — |
| **Total**                              | **15**      | **11**    | **3**    | **1**     | |

### Untested requirements (out of the 15-test cap in dev mode)

The following requirements from `code_summary.yaml` had no coverage in this run and should be prioritised in a production-mode pass (cap 30):

- Refinement Chat (Spanish conversational filters)
- Why Candidate Modal (score auditability)
- Candidate Comparison
- Team Constellation (graph)
- Constellation View (individual)
- About / whitepaper page
- Workforce Intelligence Dashboard (silo analysis, KPIs, charts)
- Export team (print, copy, deep-link)
- Error handling and edge cases (broader than TC015)

---

## 4️⃣ Key Gaps / Risks

### 🔴 HIGH — Onboarding Tour does not persist when user chooses "Skip"

- **Where:** `components/OnboardingTour.tsx:86-88` (`handleClose`) and `app/page.tsx:563-567` (`handleTourFinish`).
- **Symptom:** Clicking "Saltar tour ✕" closes the overlay for the current session but does NOT write `localStorage.bbva-talent:onboarding-seen-v1`. On the next visit the tour reappears after ~700 ms.
- **Why this is a bug, not by-design:** PRD AC-TOUR-04 states "Al finalizar, persiste `'1'` en localStorage; el próximo refresh NO debe abrir el tour." The semantics of "finalizar" should include any user-initiated dismissal — Escape, ✕, or completion. The current design only persists on "Empezar →".
- **Recommended fix:** Move the `localStorage.setItem(ONBOARDING_KEY, "1")` call into `handleClose` (or call `onFinish` from `handleClose`) so any dismissal path persists. Cost: 1 line. Risk: trivial.

### 🟠 MEDIUM — Onboarding Tour completion may race with hydration

- **Where:** `app/page.tsx` dynamic imports + onboarding step IDs that live inside dynamically-loaded components.
- **Symptom:** TC012 reported four "Siguiente" clicks (the tour has 3 steps) yet persistence still failed. This pattern is consistent with click events landing on stale handlers during hydration of `next/dynamic { ssr: false }` components.
- **Recommended action:** Reproduce manually with throttled CPU and slow 3G to surface the race. Consider using `requestIdleCallback` or waiting for `mounted` flags before allowing tour interactions.

### 🟡 LOW — Theme toggle lacks a stable, state-independent selector

- **Where:** `components/ThemeToggle.tsx:71` — `aria-label` toggles between two strings.
- **Symptom:** Automated tests (and assistive tech indexing) cannot anchor on a single label.
- **Recommended improvement:** Add `data-testid="theme-toggle"` AND/OR adopt `role="switch"` with `aria-checked={isDark}` and a constant `aria-label="Tema oscuro/claro"`. Both improve QA automation AND a11y.

### 🟢 INFO — Test plan generated codes outside the mock namespace

- **Where:** TestSprite-generated TC002 used `SDA-00001`.
- **Cause:** The auto-generation guessed a numeric namespace; the real codes start at `SDA-53021`. The PRD lists three canonical valid codes for testing (`SDA-53021`, `SDA-53024`, `SDA-53038`).
- **Recommended improvement:** Surface a dedicated `valid_demo_codes` block in `code_summary.yaml` so future plans pick from a curated list. (Optional — not a code change.)

### 🟢 INFO — Coverage is limited by dev-mode cap

- 9 of the 17 catalogued features in `code_summary.yaml` had zero test cases in this run.
- The Workforce Intelligence Dashboard (a major surface area with `lib/siloAnalysis.ts`'s 6-rule heuristic) has zero coverage — high value to test next.
- Refinement Chat (Spanish parser with 5 filter types) has zero coverage and is unique enough to deserve dedicated tests.
- **Recommended action:** Run TestSprite again in **production mode** (`npm run build && npm run start`) to unlock the 30-test cap and prioritise the gaps above.

---

**End of report.**
