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
    
    # Click Add Unit button
    print("=== Testing Add Unit ===")
    add_btn = page.locator("button:has-text('Add Unit')").first
    if add_btn.count() > 0:
        add_btn.click()
        time.sleep(2)
        print("Add Unit clicked")
        
        # Check for developer select
        dev_select = page.locator("select").first
        if dev_select.count() > 0:
            # Get options
            options = dev_select.locator("option").all()
            print(f"Developer options: {len(options)}")
            for o in options:
                print(f"  Option: {o.inner_text()}")
            
            # Select SODIC Development
            dev_select.select_option(label="SODIC Development")
            print("Developer selected: SODIC Development")
            time.sleep(2)
            
            # Check compound select now has options
            compound_select = page.locator("select").nth(1)
            if compound_select.count() > 0:
                options = compound_select.locator("option").all()
                print(f"Compound options: {len(options)}")
                for o in options:
                    print(f"  Option: {o.inner_text()}")
    
    browser.close()
