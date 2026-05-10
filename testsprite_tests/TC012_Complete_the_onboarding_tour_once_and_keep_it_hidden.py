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
        
        # -> Advance the onboarding tour by clicking 'Siguiente' several times, navigate away from home, return, then verify the tour is not shown.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the onboarding tour by clicking 'Siguiente' several times, navigate away from home, return, then verify the tour is not shown.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Advance the onboarding tour by clicking 'Siguiente' several times, navigate away from home, return, then verify the tour is not shown.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the final 'Siguiente' button to complete the onboarding tour.
        # button "Siguiente →"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div[3]/button[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the final 'Siguiente' button to complete the onboarding tour.
        # button "Networking & Mentores
Conecta con refere..."
        elem = page.locator("xpath=/html/body/div[2]/div/main/div[5]/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Load the home page (http://localhost:3000), wait for the SPA to hydrate, then check whether the onboarding tour controls are present. If the tour is hidden, finish the test.
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the '← Volver' button to return to the home page, wait for hydration, then search the page for onboarding controls ('Siguiente', 'Saltar tour', 'Cerrar tour') to verify the tour is hidden.
        # button "← Volver"
        elem = page.locator("xpath=/html/body/div[2]/div/header/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # --> Test failed (AST guard fallback)
        raise AssertionError("Test failed during agent run: " + "TEST FAILURE The onboarding tour remained visible after it was completed and after returning to the home page in the same browser session. Observations: - The onboarding controls are present on the home page: a 'Siguiente \u2192' button, 'Saltar tour' text, and a button with aria-label='Cerrar tour'. - Session recorded four 'Siguiente' clicks and navigation away/return, yet the tour persisted on ret...")
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    