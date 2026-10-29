from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Try to access protected pages without login
    print("=== Testing Route Protection ===")
    
    page.goto("http://localhost:5173/dashboard")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"Dashboard without login: {page.url}")
    
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"Units without login: {page.url}")
    
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"Developers without login: {page.url}")
    
    browser.close()
