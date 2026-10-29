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
    
    # Filter by status = available
    print("=== Testing Status Filter ===")
    status_select = page.locator("select").nth(2)
    status_select.select_option("available")
    time.sleep(3)
    
    content = page.content()
    has_available = "Available" in content
    print(f"Available units shown: {has_available}")
    
    # Filter by status = sold
    status_select.select_option("sold")
    time.sleep(3)
    
    content = page.content()
    has_sold = "Sold" in content
    print(f"Sold units shown: {has_sold}")
    
    browser.close()
