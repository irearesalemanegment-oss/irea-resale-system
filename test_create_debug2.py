from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture all requests
    requests = []
    def handle_request(request):
        if "api/units" in request.url:
            requests.append(f"{request.method} {request.url}")
    page.on("request", handle_request)
    
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
    
    # Click Add Unit
    add_btn = page.locator("button:has-text('Add Unit')").first
    add_btn.click()
    time.sleep(2)
    
    # Fill unit number
    unit_num = page.locator("input[placeholder*='A-101']")
    unit_num.fill("PH-107")
    
    # Select developer
    dev_select = page.locator("select").first
    dev_select.select_option("1")
    time.sleep(2)
    
    # Select compound
    comp_select = page.locator("select").nth(1)
    comp_select.select_option("1")
    
    # Click Create Unit button
    create_btn = page.locator("button:has-text('Create Unit')")
    create_btn.click()
    time.sleep(3)
    
    print("=== API Requests ===")
    for r in requests:
        print(f"  {r}")
    
    browser.close()
