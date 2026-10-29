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
    
    # Check all nav links
    print("=== Nav links ===")
    nav = page.locator("nav a").all()
    for item in nav:
        text = item.inner_text().strip()
        print(f"  Nav: '{text}'")
    
    # Go to compounds
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    print(f"\nCompounds URL: {page.url}")
    content = page.content()
    print(f"Contains 'Palm Hills Compound': {'Palm Hills Compound' in content}")
    
    # Go to developers
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    print(f"\nDevelopers URL: {page.url}")
    content = page.content()
    print(f"Contains 'Palm Hills Development': {'Palm Hills Development' in content}")
    
    browser.close()
