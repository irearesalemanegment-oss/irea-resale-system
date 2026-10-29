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
    
    # Go to units page
    page.goto("http://localhost:5173/units")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check for WhatsApp buttons and their links
    print("=== Checking WhatsApp Links ===")
    # Find all anchor tags with wa.me
    wa_links = page.locator("a[href*='wa.me']")
    print(f"wa.me links found: {wa_links.count()}")
    for i in range(wa_links.count()):
        href = wa_links.nth(i).get_attribute("href")
        print(f"  Link {i}: {href}")
    
    # Also check for buttons that open WhatsApp
    whatsapp_btns = page.locator("button:has-text('WhatsApp')")
    print(f"WhatsApp buttons: {whatsapp_btns.count()}")
    
    browser.close()
