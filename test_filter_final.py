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
    
    # Test search
    print("=== Filters ===")
    search_input = page.locator("input[placeholder*='Unit #']")
    search_input.fill("PH-101")
    time.sleep(3)
    
    content = page.content()
    has_101 = "PH-101" in content
    has_102 = "PH-102" in content
    print(f"Search PH-101: found={has_101}, PH-102 hidden={not has_102}")
    
    # Clear search
    search_input.fill("")
    time.sleep(2)
    
    # Filter by developer
    dev_select = page.locator("select").first
    dev_select.select_option("1")
    time.sleep(3)
    
    content = page.content()
    has_palm = "Palm Hills" in content
    print(f"Filter by developer: {has_palm}")
    
    browser.close()
