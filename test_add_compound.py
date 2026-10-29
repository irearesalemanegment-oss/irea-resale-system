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
    
    # Click Add Compound button
    print("=== Testing Add Compound ===")
    add_btn = page.locator("button:has-text('Add Compound')").first
    if add_btn.count() > 0:
        add_btn.click()
        time.sleep(2)
        print("Add Compound clicked")
        
        # Check for form fields
        inputs = page.locator("input").all()
        print(f"Inputs found: {len(inputs)}")
        for i in inputs:
            ph = i.get_attribute("placeholder")
            print(f"  Input: placeholder={ph}")
        
        # Fill compound name
        name_input = page.locator("input[placeholder*='compound']").first
        if name_input.count() > 0:
            name_input.fill("Eastown Compound")
            print("Compound name filled")
            
            # Submit
            submit_btn = page.locator("button[type='submit']")
            if submit_btn.count() > 0:
                submit_btn.click()
                time.sleep(3)
                print("Compound submitted")
                
                content = page.content()
                has_comp = "Eastown Compound" in content
                print(f"Compound created: {has_comp}")
        else:
            print("Name input not found")
    else:
        print("Add Compound button not found")
    
    browser.close()
