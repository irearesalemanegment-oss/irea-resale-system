from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Go to register page
    page.goto("http://localhost:5173/register")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Fill registration form
    email_input = page.locator("input[name='email']")
    password_input = page.locator("input[name='password']")
    confirm_input = page.locator("input[name='confirmPassword']")
    name_input = page.locator("input[name='full_name']")
    phone_input = page.locator("input[name='phone']")
    
    email_input.fill("testuser@example.com")
    password_input.fill("password123")
    confirm_input.fill("password123")
    name_input.fill("Test User")
    phone_input.fill("+201055566677")
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    submit_btn.click()
    time.sleep(3)
    
    print(f"After registration URL: {page.url}")
    content = page.content()
    has_dashboard = "Dashboard" in content
    print(f"Redirected to dashboard: {has_dashboard}")
    
    browser.close()
