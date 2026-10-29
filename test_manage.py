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
    
    # Go to developers page
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Check for Add Developer button
    print("=== Checking Developers Page ===")
    add_btn = page.get_by_role("button", name="Add Developer")
    print(f"Add Developer button found: {add_btn.count() > 0}")
    
    # Check for existing developers
    content = page.content()
    print(f"Palm Hills Development found: {'Palm Hills Development' in content}")
    
    # Go to compounds page
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Check for Add Compound button
    print("\n=== Checking Compounds Page ===")
    add_btn = page.get_by_role("button", name="Add Compound")
    print(f"Add Compound button found: {add_btn.count() > 0}")
    
    # Check for existing compounds
    content = page.content()
    print(f"Palm Hills Compound found: {'Palm Hills Compound' in content}")
    
    browser.close()
