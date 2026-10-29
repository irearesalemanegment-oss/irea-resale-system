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
    
    # Click Add Unit
    add_btn = page.locator("button:has-text('Add Unit')").first
    add_btn.click()
    time.sleep(2)
    
    # Check all selects
    selects = page.locator("select").all()
    print(f"Selects: {len(selects)}")
    for i, s in enumerate(selects):
        options = s.locator("option").all()
        texts = [o.inner_text() for o in options]
        print(f"  Select {i}: {texts}")
    
    # Fill unit number
    unit_num = page.locator("input[placeholder*='A-101']")
    unit_num.fill("PH-107")
    print(f"Unit number: {unit_num.input_value()}")
    
    # Select developer
    dev_select = page.locator("select").first
    dev_select.select_option("1")
    time.sleep(2)
    print(f"Developer: {dev_select.input_value()}")
    
    # Check compound select now
    comp_select = page.locator("select").nth(1)
    options = comp_select.locator("option").all()
    texts = [o.inner_text() for o in options]
    print(f"Compound options: {texts}")
    
    # Select compound
    comp_select.select_option("1")
    print(f"Compound: {comp_select.input_value()}")
    
    # Check status select
    status_select = page.locator("select").nth(2)
    print(f"Status: {status_select.input_value()}")
    
    # Check for validation errors
    errors = page.locator("p.text-red-600").all()
    print(f"Validation errors: {len(errors)}")
    for e in errors:
        print(f"  Error: {e.inner_text()}")
    
    browser.close()
