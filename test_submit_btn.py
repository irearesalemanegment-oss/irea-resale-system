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
    
    # Check for submit button
    submit_btns = page.locator("button[type='submit']").all()
    print(f"Submit buttons: {len(submit_btns)}")
    for b in submit_btns:
        print(f"  Button: '{b.inner_text().strip()}'")
    
    # Check for all buttons in form
    form_btns = page.locator("button").all()
    print(f"\nAll buttons: {len(form_btns)}")
    for b in form_btns:
        text = b.inner_text().strip()
        if text:
            print(f"  Button: '{text}'")
    
    browser.close()
