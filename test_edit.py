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
    
    # Click edit on first unit
    print("=== Testing Edit Unit ===")
    edit_btn = page.locator("button[title='Edit']").first
    if edit_btn.count() > 0:
        edit_btn.click()
        time.sleep(2)
        
        # Check if edit form opened
        content = page.content()
        has_form = "Unit Number" in content or "unit_number" in content
        print(f"Edit form opened: {has_form}")
        
        # Check if form has existing data
        unit_number = page.locator("input[name='unit_number']")
        if unit_number.count() > 0:
            value = unit_number.input_value()
            print(f"Unit number in form: {value}")
        
        # Close the form
        close_btn = page.locator("button[aria-label='Close']")
        if close_btn.count() > 0:
            close_btn.click()
            time.sleep(1)
            print("Edit form closed")
    
    browser.close()
