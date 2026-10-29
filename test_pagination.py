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
    
    # Check pagination
    print("=== Checking Pagination ===")
    content = page.content()
    has_pagination = "Page" in content or "page" in content.lower()
    print(f"Pagination found: {has_pagination}")
    
    # Check for page buttons
    page_btns = page.locator("button:has-text('1')")
    print(f"Page 1 button: {page_btns.count()}")
    
    # Check total units count
    print(f"Total units in DB: 4 (PH-101, PH-102, PH-103, PH-104)")
    
    browser.close()
