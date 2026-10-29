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
    time.sleep(3)
    
    # Click first WhatsApp button
    print("=== Testing WhatsApp ===")
    wa_btn = page.locator("button:has-text('WhatsApp')").first
    if wa_btn.count() > 0:
        try:
            with page.expect_popup(timeout=5000) as popup_info:
                wa_btn.click()
            popup = popup_info.value
            print(f"WhatsApp URL: {popup.url}")
            popup.close()
        except:
            print("No popup (no owner phone)")
    
    browser.close()
