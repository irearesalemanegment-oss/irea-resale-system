from playwright.sync_api import sync_playwright
import time
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()
    
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
    
    # Test Excel export
    print("=== Testing Excel Export ===")
    excel_btn = page.locator("button:has-text('Excel')").first
    if excel_btn.count() > 0:
        with page.expect_download() as dl_info:
            excel_btn.click()
        download = dl_info.value
        print(f"Excel: {download.suggested_filename}")
        download.save_as("C:/resale-management-system/final-export.xlsx")
        print(f"Saved: {os.path.exists('C:/resale-management-system/final-export.xlsx')}")
    
    # Test PDF export
    print("\n=== Testing PDF Export ===")
    pdf_btn = page.locator("button:has-text('PDF')").first
    if pdf_btn.count() > 0:
        with page.expect_download() as dl_info:
            pdf_btn.click()
        download = dl_info.value
        print(f"PDF: {download.suggested_filename}")
        download.save_as("C:/resale-management-system/final-export.pdf")
        print(f"Saved: {os.path.exists('C:/resale-management-system/final-export.pdf')}")
    
    browser.close()
