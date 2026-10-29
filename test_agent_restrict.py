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
    print("=== Agent Nav Links ===")
    content = page.content()
    print(f"Dashboard link: {'Dashboard' in content}")
    print(f"Units link: {'Units' in content}")
    print(f"Developers link: {'Developers' in content}")
    print(f"Compounds link: {'Compounds' in content}")
    
    # Try to access developers page
    page.goto("http://localhost:5173/developers")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Check if agent can see Add Developer button
    content = page.content()
    has_add = "Add Developer" in content
    print(f"\nAgent can see Add Developer: {has_add}")
    
    # Check if agent can see delete buttons
    delete_btns = page.locator("button[title='Delete']")
    print(f"Agent sees Delete buttons: {delete_btns.count()}")
    
    browser.close()
