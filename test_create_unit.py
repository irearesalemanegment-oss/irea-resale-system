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
    
    # Click Add Unit button
    print("=== Clicking Add Unit ===")
    add_btn = page.get_by_role("button", name="Add Unit")
    if add_btn.count() > 0:
        add_btn.click()
        time.sleep(2)
        print("Add Unit form opened")
        
        # Fill the form
        print("\n=== Filling Unit Form ===")
        
        # Unit Number
        unit_number = page.locator("input[name='unit_number']")
        if unit_number.count() > 0:
            unit_number.fill("PH-103")
            print("Unit number filled")
        
        # Developer select
        dev_select = page.locator("select[name='developer_id']")
        if dev_select.count() > 0:
            dev_select.select_option("1")
            print("Developer selected")
        
        # Compound select
        comp_select = page.locator("select[name='compound_id']")
        if comp_select.count() > 0:
            comp_select.select_option("1")
            print("Compound selected")
        
        # Unit type
        unit_type = page.locator("input[name='unit_type']")
        if unit_type.count() > 0:
            unit_type.fill("Townhouse")
            print("Unit type filled")
        
        # Price
        price = page.locator("input[name='price']")
        if price.count() > 0:
            price.fill("3500000")
            print("Price filled")
        
        # Owner name
        owner_name = page.locator("input[name='owner_name']")
        if owner_name.count() > 0:
            owner_name.fill("Test Owner")
            print("Owner name filled")
        
        # Owner phone
        owner_phone = page.locator("input[name='owner_phone']")
        if owner_phone.count() > 0:
            owner_phone.fill("+201055566677")
            print("Owner phone filled")
        
        # Submit form
        print("\n=== Submitting Form ===")
        submit_btn = page.locator("button[type='submit']")
        if submit_btn.count() > 0:
            submit_btn.click()
            time.sleep(3)
            print("Form submitted")
            
            # Check if unit was created
            content = page.content()
            print(f"Contains 'PH-103': {'PH-103' in content}")
        else:
            print("Submit button not found")
    else:
        print("Add Unit button not found")
    
    browser.close()
