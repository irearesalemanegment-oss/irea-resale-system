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
    
    # Go to dashboard
    page.goto("http://localhost:5173/dashboard")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check dashboard content
    content = page.content()
    print("=== Dashboard ===")
    print(f"Total Units: {'Total Units' in content}")
    print(f"Available: {'Available' in content}")
    print(f"Sold: {'Sold' in content}")
    print(f"Avg Price: {'Avg Price' in content}")
    print(f"Charts: {page.locator('canvas').count()}")
    
    # Go to units page
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    content = page.content()
    print("\n=== Units Page ===")
    print(f"Units loaded: {'PH-101' in content}")
    print(f"Add Unit button: {'Add Unit' in content}")
    print(f"Export buttons: {'Export' in content}")
    
    # Go to developers page
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    content = page.content()
    print("\n=== Developers Page ===")
    print(f"Developers loaded: {'Palm Hills' in content}")
    print(f"Add Developer: {'Add Developer' in content}")
    
    # Go to compounds page
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    content = page.content()
    print("\n=== Compounds Page ===")
    print(f"Compounds loaded: {'Palm Hills' in content}")
    print(f"Add Compound: {'Add Compound' in content}")
    
    browser.close()
