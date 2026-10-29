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
    
    # Fill unit number
    unit_num = page.locator("input[placeholder*='A-101']")
    unit_num.fill("PH-107")
    
    # Select developer
    dev_select = page.locator("select").first
    dev_select.select_option("1")
    time.sleep(2)
    
    # Select compound
    comp_select = page.locator("select").nth(1)
    comp_select.select_option("1")
    
    # Check all inputs and their values
    print("=== Form Values ===")
    inputs = page.locator("input").all()
    for i, inp in enumerate(inputs):
        val = inp.input_value()
        ph = inp.get_attribute("placeholder")
        print(f"  Input {i}: placeholder='{ph}', value='{val}'")
    
    # Check selects
    selects = page.locator("select").all()
    for i, s in enumerate(selects):
        val = s.input_value()
        print(f"  Select {i}: value='{val}'")
    
    # Check for validation errors
    errors = page.locator("p.text-red-600").all()
    print(f"\nValidation errors: {len(errors)}")
    for e in errors:
        print(f"  Error: {e.inner_text()}")
    
    # Check if Create Unit button is disabled
    create_btn = page.locator("button:has-text('Create Unit')")
    is_disabled = create_btn.is_disabled()
    print(f"\nCreate Unit disabled: {is_disabled}")
    
    browser.close()
