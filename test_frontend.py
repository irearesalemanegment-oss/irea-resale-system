from playwright.sync_api import sync_playwright
import time

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture console errors
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    
    # 1. Test login page
    print("=== Testing Login Page ===")
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    print(f"Page title: {page.title()}")
    print(f"URL: {page.url}")
    
    email_input = page.locator("input[type='email']")
    password_input = page.locator("input[type='password']")
    print(f"Email input found: {email_input.count() > 0}")
    print(f"Password input found: {password_input.count() > 0}")
    
    # 2. Login
    print("\n=== Testing Login ===")
    if email_input.count() > 0:
        email_input.fill("admin@example.com")
        password_input.fill("password123")
        page.get_by_role("button", name="Sign In").click()
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        print(f"After login URL: {page.url}")
        
        # 3. Test Dashboard
        print("\n=== Testing Dashboard ===")
        page.goto("http://localhost:5173/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        content = page.content()
        has_dashboard = "Dashboard" in content
        print(f"Dashboard heading found: {has_dashboard}")
        
        # Check for stats
        has_stats = "Total Units" in content or "Available" in content
        print(f"Stats found: {has_stats}")
        
        # 4. Test Units page
        print("\n=== Testing Units Page ===")
        page.goto("http://localhost:5173/units")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        content = page.content()
        has_units = "PH-101" in content or "PH-102" in content
        print(f"Unit data found: {has_units}")
        has_export = "Export" in content
        print(f"Export buttons found: {has_export}")
        
        # 5. Test Developers page
        print("\n=== Testing Developers Page ===")
        page.goto("http://localhost:5173/developers")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        content = page.content()
        has_dev = "Palm Hills" in content
        print(f"Developer data found: {has_dev}")
        
        # 6. Test Compounds page
        print("\n=== Testing Compounds Page ===")
        page.goto("http://localhost:5173/compounds")
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        content = page.content()
        has_comp = "Palm Hills Compound" in content
        print(f"Compound data found: {has_comp}")
        
        # 7. Test Add Unit form
        print("\n=== Testing Add Unit Form ===")
        page.goto("http://localhost:5173/units")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        # Click Add Unit button
        add_btn = page.get_by_role("button", name="Add Unit")
        if add_btn.count() > 0:
            add_btn.click()
            time.sleep(2)
            content = page.content()
            has_form = "Unit Number" in content or "unit_number" in content
            print(f"Unit form found: {has_form}")
        else:
            print("Add Unit button not found")
    
    # Take screenshot
    page.screenshot(path="C:/resale-management-system/test-screenshot.png", full_page=True)
    print("\nScreenshot saved")
    
    browser.close()

print("\n=== Console Errors ===")
if errors:
    for e in errors:
        print(f"  ERROR: {e}")
else:
    print("  No console errors found!")
