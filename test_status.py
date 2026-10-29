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
    print("=== Testing Status Change Notification ===")
    edit_btn = page.locator("button[title='Edit']").first
    edit_btn.click()
    time.sleep(2)
    
    # Find status select in edit form
    status_select = page.locator("select").all()
    print(f"Selects in edit form: {len(status_select)}")
    
    # Find the status select (usually has 'status' in name or options)
    for s in status_select:
        options = s.locator("option").all()
        texts = [o.inner_text() for o in options]
        print(f"  Select options: {texts}")
    
    browser.close()
