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
    
    # Click Add Compound
    add_btn = page.locator("button:has-text('Add Compound')").first
    add_btn.click()
    time.sleep(2)
    
    # Fill compound name
    name_input = page.locator("input[placeholder*='compound']").first
    name_input.fill("Eastown Compound")
    
    # Select developer
    dev_select = page.locator("select").first
    if dev_select.count() > 0:
        dev_select.select_option(label="Palm Hills Development")
        print("Developer selected")
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    submit_btn.click()
    time.sleep(3)
    
    # Check if created
    content = page.content()
    has_comp = "Eastown Compound" in content
    print(f"Compound created: {has_comp}")
    
    browser.close()
