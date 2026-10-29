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
    content = page.content()
    has_bell = "notification" in content.lower() or "bell" in content.lower()
    print(f"Notification bell found: {has_bell}")
    
    # Check for unread count
    unread = page.locator("[class*='badge'], [class*='count']").all()
    for u in unread:
        text = u.inner_text().strip()
        if text.isdigit():
            print(f"Unread count badge: {text}")
    
    # Click notification bell
    bell_btn = page.locator("button[aria-label*='notification'], button[aria-label*='Notification']").first
    if bell_btn.count() > 0:
        bell_btn.click()
        time.sleep(2)
        print("Notification bell clicked")
        
        # Check dropdown content
        content = page.content()
        has_notif_text = "status changed" in content.lower()
        print(f"Notification message found: {has_notif_text}")
    
    browser.close()
