from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login as agent
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.locator("input[type='email']").fill("agent@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check nav links
    content = page.content()
    print("=== Agent Nav ===")
    print(f"Dashboard: {'Dashboard' in content}")
    print(f"Units: {'Units' in content}")
    print(f"Developers: {'Developers' in content}")
    print(f"Compounds: {'Compounds' in content}")
    
    # Try to access developers page directly
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"\nDevelopers URL: {page.url}")
    
    browser.close()
