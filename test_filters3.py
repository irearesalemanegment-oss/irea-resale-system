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
    
    # Click Show button to open filters
    print("=== Opening Filters ===")
    show_btn = page.get_by_role("button", name="Show")
    if show_btn.count() > 0:
        show_btn.click()
        time.sleep(2)
        print("Filters opened")
    else:
        print("Show button not found")
    
    # Check for filter inputs
    content = page.content()
    has_filters = "Filters" in content
    print(f"Filters section found: {has_filters}")
    
    search_input = page.locator("input[placeholder*='Unit #']")
    print(f"Search input found: {search_input.count() > 0}")
    
    selects = page.locator("select").all()
    print(f"Select dropdowns found: {len(selects)}")
    
    # Test search
    if search_input.count() > 0:
        search_input.fill("PH-101")
        time.sleep(2)
        content = page.content()
        has_result = "PH-101" in content
        print(f"Search result found: {has_result}")
    
    browser.close()
