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
    
    # Check for edit buttons
    print("=== Checking Edit Buttons ===")
    edit_btns = page.locator("button[title='Edit']").all()
    print(f"Edit buttons found: {len(edit_btns)}")
    
    # Check for delete buttons
    print("\n=== Checking Delete Buttons ===")
    delete_btns = page.locator("button[title='Delete']").all()
    print(f"Delete buttons found: {len(delete_btns)}")
    
    # Check for view buttons
    print("\n=== Checking View Buttons ===")
    view_btns = page.locator("button[title='View']").all()
    print(f"View buttons found: {len(view_btns)}")
    
    # Check for WhatsApp buttons
    print("\n=== Checking WhatsApp Buttons ===")
    whatsapp_btns = page.locator("button").all()
    wa_count = sum(1 for b in whatsapp_btns if "WhatsApp" in b.inner_text())
    print(f"WhatsApp buttons found: {wa_count}")
    
    browser.close()
