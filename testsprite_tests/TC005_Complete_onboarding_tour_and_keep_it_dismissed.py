import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Advance the onboarding tour by clicking the 'Siguiente →' button (index 501).
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the onboarding tour by clicking the 'Siguiente →' button (index 501).
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the onboarding tour by clicking the 'Siguiente →' button (index 501).
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the 'Siguiente →' button to advance the tour (index 547), then re-evaluate the tour state before attempting to close it again.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the 'Saltar tour ✕' (Cerrar tour) button to try to close the onboarding overlay (index 542), then re-evaluate the page state.
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the 'Saltar tour ✕' (Cerrar tour) button (index 542) to attempt to close the onboarding overlay, then wait 1 second and re-evaluate the page state.
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Refresh the page (navigate to http://localhost:3000/) and wait for the UI to settle so the onboarding state can be re-evaluated.
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Advance the onboarding tour one step by clicking the 'Siguiente →' button (index 617), then observe the UI state to decide the next action.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the tour one step (click 'Siguiente →' index 1331), then close the tour (click 'Saltar tour ✕' index 1326), then refresh the page and verify the onboarding overlay is gone and the home content is visible.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the tour one step (click 'Siguiente →' index 1331), then close the tour (click 'Saltar tour ✕' index 1326), then refresh the page and verify the onboarding overlay is gone and the home content is visible.
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the tour one step (click 'Siguiente →' index 1331), then close the tour (click 'Saltar tour ✕' index 1326), then refresh the page and verify the onboarding overlay is gone and the home content is visible.
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Test failed (AST guard fallback)
        raise AssertionError("Test failed during agent run: " + "TEST FAILURE The onboarding tour could not be dismissed \u2014 the overlay remained visible after repeated attempts to advance and close it. Observations: - The onboarding backdrop and controls (Saltar tour \u2715, \u2190 Anterior, Siguiente \u2192) remained visible on the page. - The 'Siguiente \u2192' and 'Saltar tour \u2715' buttons were clicked multiple times and the Escape key was sent, but the overlay did not close. -...")
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    