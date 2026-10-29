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
    
    # Fill price
    price_input = page.locator("input[placeholder='0.00']").nth(2)
    price_input.fill("8000000")
    
    # Fill owner
    owner_input = page.locator("input[placeholder*='Owner']").first
    owner_input.fill("Sara Ahmed")
    
    # Click Create Unit button
    create_btn = page.locator("button:has-text('Create Unit')")
    create_btn.click()
    time.sleep(3)
    
    # Check if unit was created
    content = page.content()
    has_unit = "PH-107" in content
    print(f"Unit PH-107 created: {has_unit}")
    
    browser.close()
