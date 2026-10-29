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
    
    # Check export buttons
    print("=== Checking Export Buttons ===")
    export_btns = page.locator("button").all()
    for btn in export_btns:
        text = btn.inner_text().strip()
        if "Export" in text:
            print(f"  Export button: '{text}'")
    
    # Check WhatsApp button
    print("\n=== Checking WhatsApp Button ===")
    content = page.content()
    has_whatsapp = "WhatsApp" in content or "wa.me" in content
    print(f"WhatsApp button found: {has_whatsapp}")
    
    # Check filter section
    print("\n=== Checking Filters ===")
    has_filter = "Filter" in content
    print(f"Filter section found: {has_filter}")
    
    # Check search
    search_input = page.locator("input[type='search'], input[placeholder*='Search']")
    print(f"Search input found: {search_input.count() > 0}")
    
    browser.close()
