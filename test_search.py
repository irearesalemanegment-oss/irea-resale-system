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
    
    # Open filters
    show_btn = page.get_by_role("button", name="Show")
    if show_btn.count() > 0:
        show_btn.click()
        time.sleep(2)
    
    # Search for PH-104
    print("=== Testing Search ===")
    search_input = page.locator("input[placeholder*='Unit #']")
    search_input.fill("PH-104")
    time.sleep(3)
    
    content = page.content()
    has_104 = "PH-104" in content
    has_101 = "PH-101" in content
    print(f"PH-104 found: {has_104}")
    print(f"PH-101 hidden: {not has_101}")
    
    # Clear search
    search_input.fill("")
    time.sleep(2)
    
    # Search by owner name
    print("\n=== Testing Owner Search ===")
    search_input.fill("Mohamed")
    time.sleep(3)
    
    content = page.content()
    has_mohamed = "Mohamed" in content
    print(f"Owner search result: {has_mohamed}")
    
    browser.close()
