from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture popup/new page
    def handle_popup(popup):
        print(f"Popup URL: {popup.url}")
    
    page.on("popup", handle_popup)
    
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
    
    # Click first WhatsApp button
    print("=== Testing WhatsApp Button Click ===")
    wa_btn = page.locator("button:has-text('WhatsApp')").first
    if wa_btn.count() > 0:
        # Check if button has owner phone
        # Try clicking and see if popup opens
        try:
            with page.expect_popup(timeout=3000) as popup_info:
                wa_btn.click()
            popup = popup_info.value
            print(f"WhatsApp popup URL: {popup.url}")
            popup.close()
        except:
            print("No popup opened (maybe no owner phone)")
    
    browser.close()
