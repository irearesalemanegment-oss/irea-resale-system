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
    
    # Check we're logged in
    print(f"After login URL: {page.url}")
    
    # Click Logout
    print("\n=== Testing Logout ===")
    logout_btn = page.locator("button:has-text('Logout')").first
    if logout_btn.count() > 0:
        logout_btn.click()
        time.sleep(3)
        print(f"After logout URL: {page.url}")
        
        # Check if redirected to login
        has_login = "Sign In" in page.content()
        print(f"Redirected to login: {has_login}")
    else:
        print("Logout button not found")
    
    browser.close()
