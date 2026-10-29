from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login as admin
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.locator("input[type='email']").fill("admin@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check nav links for admin
    print("=== Admin Nav Links ===")
    content = page.content()
    print(f"Dashboard: {'Dashboard' in content}")
    print(f"Units: {'Units' in content}")
    print(f"Developers: {'Developers' in content}")
    print(f"Compounds: {'Compounds' in content}")
    print(f"Users: {'Users' in content}")
    
    # Try to access users page
    page.goto("http://localhost:5173/users")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    print(f"\nUsers page URL: {page.url}")
    content = page.content()
    print(f"Users page loaded: {'Users' in content or 'users' in content.lower()}")
    
    browser.close()
