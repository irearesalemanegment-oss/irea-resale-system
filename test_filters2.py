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
    
    # Check for filter section
    print("=== Checking Filters ===")
    content = page.content()
    has_filters = "Filters" in content
    print(f"Filters section found: {has_filters}")
    
    # Check for search input
    search_input = page.locator("input[placeholder*='Unit #']")
    print(f"Search input found: {search_input.count() > 0}")
    
    # Check for developer select
    dev_select = page.locator("select").first
    print(f"Developer select found: {dev_select.count() > 0}")
    
    # Check for status select
    status_select = page.locator("select").nth(1)
    print(f"Status select found: {status_select.count() > 0}")
    
    # Check for price inputs
    price_inputs = page.locator("input[type='number']").all()
    print(f"Number inputs found: {len(price_inputs)}")
    
    # Test search filter
    print("\n=== Testing Search Filter ===")
    if search_input.count() > 0:
        search_input.fill("PH-101")
        time.sleep(2)
        content = page.content()
        has_result = "PH-101" in content
        print(f"Search result found: {has_result}")
    
    browser.close()
