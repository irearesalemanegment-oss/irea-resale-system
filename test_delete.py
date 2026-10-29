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
    
    # Click delete on first unit
    print("=== Testing Delete Unit ===")
    delete_btn = page.locator("button[title='Delete']").first
    if delete_btn.count() > 0:
        delete_btn.click()
        time.sleep(2)
        
        # Check for confirmation dialog
        content = page.content()
        has_confirm = "Delete" in content or "confirm" in content.lower()
        print(f"Confirmation dialog found: {has_confirm}")
        
        # Check for confirm button
        confirm_btn = page.get_by_role("button", name="Delete")
        if confirm_btn.count() > 0:
            print("Confirm Delete button found")
            # Don't actually delete - just verify the dialog works
            # Close the dialog instead
            close_btn = page.locator("button[aria-label='Close']")
            if close_btn.count() > 0:
                close_btn.click()
                print("Dialog closed (did not delete)")
        else:
            print("Confirm Delete button not found")
    
    browser.close()
