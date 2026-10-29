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
    
    # Check nav links (agent should NOT see Developers/Compounds)
    print("=== Agent Nav Links ===")
    nav = page.locator("nav a").all()
    for item in nav:
        text = item.inner_text().strip()
        print(f"  Nav: '{text}'")
    
    # Try to access developers page directly
    print("\n=== Agent accessing /developers ===")
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"URL after accessing /developers: {page.url}")
    
    # Try to access compounds page directly
    print("\n=== Agent accessing /compounds ===")
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"URL after accessing /compounds: {page.url}")
    
    # Agent should be able to access units
    print("\n=== Agent accessing /units ===")
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"URL after accessing /units: {page.url}")
    
    browser.close()
