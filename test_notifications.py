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
    
    # Check for notification bell
    print("=== Checking Notification Bell ===")
    bell = page.locator("button[aria-label='Notifications']")
    print(f"Notification bell found: {bell.count() > 0}")
    
    if bell.count() > 0:
        # Check unread count badge
        badge = bell.locator("span")
        if badge.count() > 0:
            print(f"Unread count badge: {badge.inner_text()}")
        
        # Click bell to open dropdown
        bell.click()
        time.sleep(2)
        
        # Check notifications dropdown
        dropdown = page.locator("text=Notifications")
        print(f"Notifications dropdown found: {dropdown.count() > 0}")
        
        # Check for notification items
        content = page.content()
        has_notif = "Unit Status Changed" in content
        print(f"Notification items found: {has_notif}")
    
    browser.close()
