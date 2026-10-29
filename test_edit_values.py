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
    
    # Click edit on first unit
    print("=== Testing Edit Form Values ===")
    edit_btn = page.locator("button[title='Edit']").first
    edit_btn.click()
    time.sleep(2)
    
    # Check all selects values
    selects = page.locator("select").all()
    for i, s in enumerate(selects):
        val = s.input_value()
        print(f"Select {i}: value={val}")
    
    # Check unit number
    unit_num = page.locator("input[placeholder*='A-101']")
    if unit_num.count() > 0:
        print(f"Unit number: {unit_num.input_value()}")
    
    # Check status select
    status_select = page.locator("select").nth(2)
    print(f"Status: {status_select.input_value()}")
    
    # Change status to sold
    status_select.select_option("sold")
    print("Status changed to sold")
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    print(f"Submit buttons: {submit_btn.count()}")
    if submit_btn.count() > 0:
        submit_btn.click()
        time.sleep(3)
        print("Form submitted")
    
    browser.close()
