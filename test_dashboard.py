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
    print(f"Total Units stat: {'Total Units' in content}")
    print(f"Available stat: {'Available' in content}")
    print(f"Sold stat: {'Sold' in content}")
    print(f"Avg Price stat: {'Avg Price' in content}")
    print(f"Units by Developer chart: {'Units by Developer' in content}")
    print(f"Units by Status chart: {'Units by Status' in content}")
    print(f"Units by Compound chart: {'Units by Compound' in content}")
    print(f"Developer Performance: {'Developer Performance' in content}")
    print(f"Quick Actions: {'Quick Actions' in content}")
    
    # Check for canvas elements (charts)
    canvases = page.locator("canvas").count()
    print(f"\nCanvas elements (charts): {canvases}")
    
    # Take screenshot
    page.screenshot(path="C:/resale-management-system/dashboard-screenshot.png", full_page=True)
    print("Dashboard screenshot saved")
    
    browser.close()
