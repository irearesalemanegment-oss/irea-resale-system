from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture console
    page.on("console", lambda m: print(f"CONSOLE: {m.text}") if "role" in m.text.lower() or "user" in m.text.lower() else None)
    
    # Login
    page.goto("http://localhost:5173/login")
    page.wait_for_load_state("networkidle")
    page.locator("input[type='email']").fill("admin@example.com")
    page.locator("input[type='password']").fill("password123")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle")
    time.sleep(3)
    
    # Check user object in React context
    user_data = page.evaluate("localStorage.getItem('user')")
    print(f"localStorage user: {user_data}")
    
    # Check if role is accessible
    role_check = page.evaluate("""() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return { role: user?.role, email: user?.email };
    }""")
    print(f"Role check: {role_check}")
    
    browser.close()
