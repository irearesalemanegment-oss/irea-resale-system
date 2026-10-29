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
    
    # Navigate to compounds via sidebar link
    print("=== Clicking Compounds link in sidebar ===")
    # Find the sidebar link
    links = page.locator("a").all()
    for link in links:
        text = link.inner_text()
        if "Compounds" in text:
            print(f"Found link: '{text}' with href: {link.get_attribute('href')}")
            link.click()
            break
    
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    print(f"URL after clicking: {page.url}")
    
    # Get page content
    content = page.content()
    print(f"Content length: {len(content)}")
    print(f"Contains 'Palm Hills Compound': {'Palm Hills Compound' in content}")
    
    # Get body text
    text = page.inner_text("body")
    print(f"\nBody text (first 800 chars):\n{text[:800]}")
    
    browser.close()
