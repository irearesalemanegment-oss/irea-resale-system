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
    
    # Go to compounds page
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(5)
    
    # Get page content
    content = page.content()
    print(f"Content length: {len(content)}")
    
    # Check for compound data
    print(f"Contains 'Palm Hills': {'Palm Hills' in content}")
    print(f"Contains 'Compound': {'Compound' in content}")
    
    # Get all text on page
    text = page.inner_text("body")
    print(f"\nPage text (first 500 chars):\n{text[:500]}")
    
    # Check for any table or list
    tables = page.locator("table").count()
    print(f"\nTables found: {tables}")
    
    # Check for loading state
    loading = page.locator("text=Loading").count()
    print(f"Loading indicators: {loading}")
    
    # Take screenshot
    page.screenshot(path="C:/resale-management-system/compounds-page.png", full_page=True)
    print("Screenshot saved")
    
    browser.close()
