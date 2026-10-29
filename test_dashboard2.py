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
    print("=== Dashboard Content ===")
    print(f"Total Units: {'Total Units' in content}")
    print(f"Available: {'Available' in content}")
    print(f"Sold: {'Sold' in content}")
    print(f"Avg Price: {'Avg Price' in content}")
    print(f"Units by Developer: {'Units by Developer' in content}")
    print(f"Units by Status: {'Units by Status' in content}")
    print(f"Units by Compound: {'Units by Compound' in content}")
    print(f"Developer Performance: {'Developer Performance' in content}")
    
    # Check for charts
    canvases = page.locator("canvas").count()
    print(f"Charts (canvas): {canvases}")
    
    # Check for quick actions
    quick_actions = page.locator("a[href*='units']").count()
    print(f"Quick action links: {quick_actions}")
    
    browser.close()
