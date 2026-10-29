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
    
    # Check for WhatsApp buttons
    print("=== Checking WhatsApp Buttons ===")
    whatsapp_btns = page.locator("button").all()
    for btn in whatsapp_btns:
        text = btn.inner_text().strip()
        if "WhatsApp" in text or "wa.me" in text:
            print(f"  WhatsApp button: '{text}'")
    
    # Check for unit cards with WhatsApp
    content = page.content()
    has_wa = "wa.me" in content
    print(f"wa.me links found: {has_wa}")
    
    browser.close()
