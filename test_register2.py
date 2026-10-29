from playwright.sync_api import sync_playwright
import time

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    
    # Go to register page
    page.goto("http://localhost:5173/register")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    
    # Fill registration form
    email_input = page.locator("input[name='email']")
    password_input = page.locator("input[name='password']")
    confirm_input = page.locator("input[name='confirmPassword']")
    name_input = page.locator("input[name='full_name']")
    phone_input = page.locator("input[name='phone']")
    
    email_input.fill("newagent3@example.com")
    password_input.fill("password123")
    confirm_input.fill("password123")
    name_input.fill("New Agent 3")
    phone_input.fill("+201055566600")
    
    # Submit
    submit_btn = page.locator("button[type='submit']")
    submit_btn.click()
    time.sleep(3)
    
    print(f"After registration URL: {page.url}")
    
    # Check for error messages
    content = page.content()
    has_error = "error" in content.lower() or "failed" in content.lower()
    print(f"Error messages found: {has_error}")
    
    # Get body text
    text = page.inner_text("body")
    print(f"Body text (first 500 chars):\n{text[:500]}")
    
    browser.close()

print("\n=== Console Errors ===")
if errors:
    for e in errors:
        print(f"  ERROR: {e}")
else:
    print("  No console errors")
