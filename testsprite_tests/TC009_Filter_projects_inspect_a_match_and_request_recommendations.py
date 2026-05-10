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
        
        # -> Dismiss the onboarding tour overlay, then open the Project Composer UI.
        # button "Saltar tour ✕" aria-label="Cerrar tour"
        elem = page.locator("xpath=/html/body/div[2]/div[2]/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Dismiss the onboarding tour overlay, then open the Project Composer UI.
        # button "✦
Project Composer
PRINCIPAL
Selecciona ..."
        elem = page.locator("xpath=/html/body/div[2]/div/main/div[3]/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Select the 'SDA-53021 FX Tracker' project from the project list to load its details.
        # button "SDA-53021
FX Tracker
Pagos Digitales
○
E..."
        elem = page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[3]/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Click the 'VER EQUIPO RECOMENDADO →' button to request team recommendations for SDA-53021 FX Tracker, then verify the results view displays coverage, gaps, and role assignments.
        # button "Ver equipo recomendado →"
        elem = page.locator("xpath=/html/body/div[2]/div/div[2]/div[2]/div/div/div[2]/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Return to the Projects list so the project filter input becomes visible (click the '← Proyectos' button).
        # button "← Proyectos"
        elem = page.locator("xpath=/html/body/div[2]/div/header/div/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()
        
        # -> Type 'SDA-53021' into the project filter input to narrow the list, then select the matching project from the filtered results.
        # text input placeholder="SDA-53021 · FX Tracker · Pagos"
        elem = page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[2]/input").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("SDA-53021")
        
        # -> Type 'SDA-53021' into the project filter input to narrow the list, then select the matching project from the filtered results.
        # button "SDA-53021
FX Tracker
Pagos Digitales
○
E..."
        elem = page.locator("xpath=/html/body/div[2]/div/div[2]/div/div[3]/div/button").nth(0)
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
    