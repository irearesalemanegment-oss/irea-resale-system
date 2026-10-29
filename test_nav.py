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
    
    # Check all links in sidebar
    print("=== All links on dashboard ===")
    links = page.locator("a").all()
    for link in links:
        text = link.inner_text().strip()
        href = link.get_attribute("href")
        if text:
            print(f"  '{text}' -> {href}")
    
    # Check nav items directly
    print("\n=== Checking nav elements ===")
    nav = page.locator("nav a").all()
    for item in nav:
        text = item.inner_text().strip()
        print(f"  Nav: '{text}'")
    
    browser.close()
