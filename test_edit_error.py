from playwright.sync_api import sync_playwright
import time
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture API responses
    def handle_response(response):
        if "api/units/3" in response.url and response.status == 400:
            try:
                body = response.json()
                print(f"API Error Response: {json.dumps(body, indent=2)}")
            except:
                print(f"API Error (non-JSON): {response.status}")
    
    page.on("response", handle_response)
    
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
    
    browser.close()
