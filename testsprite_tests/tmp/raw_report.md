
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** bbva-talent
- **Date:** 2026-05-09
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Launch the demo project from home
- **Test Code:** [TC001_Launch_the_demo_project_from_home.py](./TC001_Launch_the_demo_project_from_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/bff5a9b3-0370-44e5-ad4d-bd0483984019
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Open a demo project from a valid deep link
- **Test Code:** [TC002_Open_a_demo_project_from_a_valid_deep_link.py](./TC002_Open_a_demo_project_from_a_valid_deep_link.py)
- **Test Error:** TEST FAILURE

Opening the deep link /?demo=SDA-00001 did not show the project results experience as expected.

Observations:
- The page displayed the message 'Proyecto SDA-00001 no encontrado'.
- An onboarding tour overlay (Saltar tour) is present and may be covering the main content.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/71259af7-40e2-4e74-8f02-797d9cd9fef9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Load the demo project from home
- **Test Code:** [TC003_Load_the_demo_project_from_home.py](./TC003_Load_the_demo_project_from_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/a6368d06-58ca-4780-af82-10eb6a55cf67
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Open a demo project directly from its deep link
- **Test Code:** [TC004_Open_a_demo_project_directly_from_its_deep_link.py](./TC004_Open_a_demo_project_directly_from_its_deep_link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/80ed782e-8df0-4d09-ba55-a0eccee26e8a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Complete onboarding tour and keep it dismissed
- **Test Code:** [TC005_Complete_onboarding_tour_and_keep_it_dismissed.py](./TC005_Complete_onboarding_tour_and_keep_it_dismissed.py)
- **Test Error:** TEST FAILURE

The onboarding tour could not be dismissed — the overlay remained visible after repeated attempts to advance and close it.

Observations:
- The onboarding backdrop and controls (Saltar tour ✕, ← Anterior, Siguiente →) remained visible on the page.
- The 'Siguiente →' and 'Saltar tour ✕' buttons were clicked multiple times and the Escape key was sent, but the overlay did not close.
- Refreshing the page kept the onboarding overlay visible; the home entry screen could not be reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/61af0fff-7c54-4b9f-9739-8fe288723edd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Review the recommended team coverage and gaps
- **Test Code:** [TC006_Review_the_recommended_team_coverage_and_gaps.py](./TC006_Review_the_recommended_team_coverage_and_gaps.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/82123c51-4e80-46e4-b358-c32826a2aace
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Block invalid candidate search until enough characters are entered
- **Test Code:** [TC007_Block_invalid_candidate_search_until_enough_characters_are_entered.py](./TC007_Block_invalid_candidate_search_until_enough_characters_are_entered.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/c0cfaaf2-90e7-4bb3-ae19-068d03f87ad7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Persist theme across dashboard refresh
- **Test Code:** [TC008_Persist_theme_across_dashboard_refresh.py](./TC008_Persist_theme_across_dashboard_refresh.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/9c8cc596-981f-408b-a2c1-1d31014533fc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Filter projects, inspect a match, and request recommendations
- **Test Code:** [TC009_Filter_projects_inspect_a_match_and_request_recommendations.py](./TC009_Filter_projects_inspect_a_match_and_request_recommendations.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/3f9c9ad0-abf3-4c1a-aefa-34e2947b0bc3
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Search for a candidate from the home page
- **Test Code:** [TC010_Search_for_a_candidate_from_the_home_page.py](./TC010_Search_for_a_candidate_from_the_home_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/5c64a15c-d568-4db3-a382-df931a61d060
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Persist the selected theme on the dashboard
- **Test Code:** [TC011_Persist_the_selected_theme_on_the_dashboard.py](./TC011_Persist_the_selected_theme_on_the_dashboard.py)
- **Test Error:** TEST BLOCKED

The test could not be completed — the UI does not expose the theme control's current state (aria-label/role/text) after the refresh, preventing verification of theme persistence.

Observations:
- The onboarding tour was dismissed and the Dashboard view is visible ('Arma el equipo' present).
- The theme toggle was clicked and the page was refreshed, but the theme control's aria-label/state could not be read despite multiple DOM queries.
- Repeated attempts to locate/read the theme control produced a loop/failed lookup; no alternative UI affordance was available to confirm the active theme.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/761e7557-0750-45b8-9b04-d070d202ad4d
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Complete the onboarding tour once and keep it hidden
- **Test Code:** [TC012_Complete_the_onboarding_tour_once_and_keep_it_hidden.py](./TC012_Complete_the_onboarding_tour_once_and_keep_it_hidden.py)
- **Test Error:** TEST FAILURE

The onboarding tour remained visible after it was completed and after returning to the home page in the same browser session.

Observations:
- The onboarding controls are present on the home page: a 'Siguiente →' button, 'Saltar tour' text, and a button with aria-label='Cerrar tour'.
- Session recorded four 'Siguiente' clicks and navigation away/return, yet the tour persisted on return.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/d66a4ffb-44f9-472b-85d0-b96a4a3bb9c6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Open a candidate profile from a deep link
- **Test Code:** [TC013_Open_a_candidate_profile_from_a_deep_link.py](./TC013_Open_a_candidate_profile_from_a_deep_link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/3acf14a7-9388-4a5b-a827-131b3cf4391e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Request mentoring from an available mentor
- **Test Code:** [TC014_Request_mentoring_from_an_available_mentor.py](./TC014_Request_mentoring_from_an_available_mentor.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/b915d167-f99a-4400-931f-96f268808c71
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Ignore an invalid demo code and stay on home
- **Test Code:** [TC015_Ignore_an_invalid_demo_code_and_stay_on_home.py](./TC015_Ignore_an_invalid_demo_code_and_stay_on_home.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/8aade991-2bcd-4c2d-97e9-5b4deb84c894/365ee255-aa87-40d3-83cd-5771aa23a6e1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **73.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---