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
    
    # Check localStorage
    user_data = page.evaluate("localStorage.getItem('user')")
    print(f"User data in localStorage: {user_data}")
    
    token = page.evaluate("localStorage.getItem('token')")
    print(f"Token present: {bool(token)}")
    
    # Check current URL
    print(f"Current URL: {page.url}")
    
    browser.close()
