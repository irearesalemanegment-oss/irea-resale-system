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
    
    # Go to compounds page
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check for edit buttons
    print("=== Checking Compound Actions ===")
    edit_btns = page.locator("button[title='Edit']").all()
    print(f"Edit buttons: {len(edit_btns)}")
    
    delete_btns = page.locator("button[title='Delete']").all()
    print(f"Delete buttons: {len(delete_btns)}")
    
    # Check compound list
    content = page.content()
    print(f"Palm Hills Compound: {'Palm Hills Compound' in content}")
    print(f"Eastown Compound: {'Eastown Compound' in content}")
    
    browser.close()
