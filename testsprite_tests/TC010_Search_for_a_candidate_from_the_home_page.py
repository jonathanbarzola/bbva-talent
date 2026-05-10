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
        
        # -> Close the onboarding tour (Saltar tour), open the 'Buscar perfil' search UI, then locate the search input so it can be filled.
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Close the onboarding tour (Saltar tour), open the 'Buscar perfil' search UI, then locate the search input so it can be filled.
        # button "Buscar perfil
Búsqueda 1 a 1 por skills ..."
        elem = page.locator("xpath=/html/body/div[2]/div/main/div[5]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Type a query of at least 3 characters into the search field and submit the search (perform search). Then verify ranked candidate results are displayed and loading has completed.
        # text input placeholder="Busca un mentor, perfil o skil"
        elem = page.locator("xpath=/html/body/div[2]/div/main/div[5]/div/div/div/input").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Valentina")
        
        # -> Type a query of at least 3 characters into the search field and submit the search (perform search). Then verify ranked candidate results are displayed and loading has completed.
        # button "Buscar"
        elem = page.locator("xpath=/html/body/div[2]/div/main/div[5]/div/div/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        await asyncio.sleep(5)
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    