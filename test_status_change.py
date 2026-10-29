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
    print("=== Testing Status Change ===")
    edit_btn = page.locator("button[title='Edit']").first
    edit_btn.click()
    time.sleep(2)
    
    # Find status select (3rd select)
    status_select = page.locator("select").nth(2)
    current_status = status_select.input_value()
    print(f"Current status: {current_status}")
    
    # Change status to Sold
    status_select.select_option("Sold")
    print("Status changed to Sold")
    
    # Submit the form
    submit_btn = page.locator("button[type='submit']")
    if submit_btn.count() > 0:
        submit_btn.click()
        time.sleep(3)
        print("Form submitted")
        
        # Check if notification was created
        # Go to dashboard and check notification bell
        page.goto("http://localhost:5173/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        
        # Check notification bell
        content = page.content()
        has_notif = "notification" in content.lower()
        print(f"Notification section found: {has_notif}")
    
    browser.close()
