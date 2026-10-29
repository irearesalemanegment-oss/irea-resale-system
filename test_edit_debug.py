from playwright.sync_api import sync_playwright
import time

errors = []
responses = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("response", lambda r: responses.append(f"{r.status} {r.url}") if "api" in r.url else None)
    
    # Login
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.locator("input[type='email']").fill("admin@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Go to units page
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Click edit on first unit
    edit_btn = page.locator("button[title='Edit']").first
    edit_btn.click()
    time.sleep(2)
    
    # Change status to sold
    status_select = page.locator("select").nth(2)
    status_select.select_option("sold")
    time.sleep(1)
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    submit_btn.click()
    time.sleep(3)
    
    print("=== API Responses ===")
    for r in responses:
        print(f"  {r}")
    
    print("\n=== Console Errors ===")
    if errors:
        for e in errors:
            print(f"  ERROR: {e}")
    else:
        print("  No console errors")
    
    browser.close()
