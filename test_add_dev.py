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
    
    # Click Add Developer button
    print("=== Testing Add Developer ===")
    add_btn = page.locator("button:has-text('Add Developer')").first
    add_btn.click()
    time.sleep(2)
    print("Add Developer clicked")
    
    # Fill developer name using placeholder
    name_input = page.locator("input[placeholder*='Emaar']")
    if name_input.count() > 0:
        name_input.fill("SODIC Development")
        print("Developer name filled")
        
        # Submit
        submit_btn = page.locator("button[type='submit']")
        if submit_btn.count() > 0:
            submit_btn.click()
            time.sleep(3)
            print("Developer submitted")
            
            # Check if developer was created
            content = page.content()
            has_dev = "SODIC Development" in content
            print(f"Developer created: {has_dev}")
    else:
        print("Name input not found")
    
    browser.close()
