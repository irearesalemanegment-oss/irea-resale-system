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
    
    # Check filter section
    print("=== Checking Filters ===")
    filter_btn = page.get_by_role("button", name="Filter")
    if filter_btn.count() > 0:
        filter_btn.click()
        time.sleep(2)
        print("Filter section opened")
        
        # Check for filter inputs
        selects = page.locator("select").all()
        print(f"Select dropdowns found: {len(selects)}")
        for s in selects:
            name = s.get_attribute("name")
            print(f"  Select: {name}")
        
        # Check for price inputs
        price_inputs = page.locator("input[type='number']").all()
        print(f"Number inputs found: {len(price_inputs)}")
        
        # Check for search input
        search_input = page.locator("input[placeholder*='Search']")
        print(f"Search input found: {search_input.count() > 0}")
    else:
        print("Filter button not found")
    
    browser.close()
