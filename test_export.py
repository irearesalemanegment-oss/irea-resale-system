from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.locator("input[type='email']").fill("admin@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Go to units page
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Click Export Excel button
    print("=== Clicking Export Excel ===")
    export_btn = page.get_by_role("button", name="Export Excel")
    if export_btn.count() > 0:
        # Listen for download
        with page.expect_download() as download_info:
            export_btn.click()
        download = download_info.value
        print(f"Download started: {download.suggested_filename}")
        print(f"Download path: {download.path()}")
    else:
        print("Export Excel button not found")
    
    browser.close()
