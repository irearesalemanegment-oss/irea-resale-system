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
    
    # Go to compounds page
    page.goto("http://localhost:5173/compounds")
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Click Add Compound
    add_btn = page.locator("button:has-text('Add Compound')").first
    add_btn.click()
    time.sleep(2)
    
    # Find selects inside the modal
    selects = page.locator(".fixed select").all()
    print(f"Selects in modal: {len(selects)}")
    for i, s in enumerate(selects):
        options = s.locator("option").all()
        texts = [o.inner_text() for o in options]
        print(f"  Select {i}: {texts}")
    
    # Fill compound name (inside modal)
    name_input = page.locator(".fixed input[placeholder*='compound']").first
    if name_input.count() > 0:
        name_input.fill("Eastown Compound")
        print("Name filled")
    
    # Select developer (inside modal)
    if len(selects) > 0:
        selects[0].select_option("1")
        print(f"Developer selected: {selects[0].input_value()}")
    
    # Submit
    submit_btn = page.locator(".fixed button[type='submit']")
    if submit_btn.count() > 0:
        submit_btn.click()
        time.sleep(3)
        print("Submitted")
    
    browser.close()
