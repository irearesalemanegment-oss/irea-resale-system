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
    print("=== Testing Full Unit Creation ===")
    add_btn = page.locator("button:has-text('Add Unit')").first
    add_btn.click()
    time.sleep(2)
    
    # Fill unit number
    unit_num = page.locator("input[placeholder*='A-101']")
    unit_num.fill("PH-104")
    print("Unit number filled: PH-104")
    
    # Select developer
    dev_select = page.locator("select").first
    dev_select.select_option(label="Palm Hills Development")
    time.sleep(2)
    print("Developer selected")
    
    # Select compound
    comp_select = page.locator("select").nth(1)
    comp_select.select_option(label="Palm Hills Compound")
    print("Compound selected")
    
    # Fill price (placeholder 0.00)
    price_input = page.locator("input[placeholder='0.00']").nth(2)
    if price_input.count() > 0:
        price_input.fill("4500000")
        print("Price filled: 4500000")
    
    # Fill owner name
    owner_input = page.locator("input[placeholder*='Owner']").first
    if owner_input.count() > 0:
        owner_input.fill("Mohamed Ali")
        print("Owner name filled")
    
    # Fill owner phone
    phone_input = page.locator("input[placeholder*='+20']").first
    if phone_input.count() > 0:
        phone_input.fill("+201098765432")
        print("Owner phone filled")
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    submit_btn.click()
    time.sleep(3)
    print("Form submitted")
    
    # Check if unit was created
    content = page.content()
    has_unit = "PH-104" in content
    print(f"Unit PH-104 created: {has_unit}")
    
    browser.close()
