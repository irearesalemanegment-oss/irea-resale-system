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
    
    # Go to developers page
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check for edit buttons
    print("=== Checking Developer Edit ===")
    edit_btns = page.locator("button[title='Edit']").all()
    print(f"Edit buttons: {len(edit_btns)}")
    
    # Check for delete buttons
    delete_btns = page.locator("button[title='Delete']").all()
    print(f"Delete buttons: {len(delete_btns)}")
    
    # Check for toggle buttons
    toggle_btns = page.locator("button[title*='toggle'], button[title*='Toggle']").all()
    print(f"Toggle buttons: {len(toggle_btns)}")
    
    # Check developer list
    content = page.content()
    print(f"Palm Hills Development: {'Palm Hills Development' in content}")
    print(f"SODIC Development: {'SODIC Development' in content}")
    
    browser.close()
