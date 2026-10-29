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
    
    # Check page content
    content = page.content()
    print(f"Page contains 'Add Developer': {'Add Developer' in content}")
    
    # Find all buttons
    buttons = page.locator("button").all()
    print(f"Total buttons: {len(buttons)}")
    for b in buttons:
        text = b.inner_text().strip()
        if text:
            print(f"  Button: '{text}'")
    
    browser.close()
