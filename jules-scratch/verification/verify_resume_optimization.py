from playwright.sync_api import sync_playwright, expect
import time
import fpdf

# Create a dummy PDF for upload
pdf = fpdf.FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="This is a test resume with keywords like python and javascript.", ln=1, align='C')
pdf.output("test_resume.pdf")

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Register a new user
    page.goto("http://localhost:3000/register")
    page.get_by_placeholder("Name").fill("Test User")
    page.get_by_placeholder("Email").fill("test@example.com")
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Register").click()

    # Wait for registration to complete and redirect to login
    time.sleep(2)

    # Login
    page.goto("http://localhost:3000/login")
    page.get_by_placeholder("Email").fill("test@example.com")
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()

    # Wait for login to complete and redirect to resume page
    time.sleep(2)
    page.goto("http://localhost:3000/resume")

    # Upload the dummy resume
    with page.expect_file_chooser() as fc_info:
        page.locator('input[type="file"]').click()
    file_chooser = fc_info.value
    file_chooser.set_files('test_resume.pdf')
    page.get_by_role("button", name="Upload").click()

    time.sleep(2)

    # Fill in the job description
    job_description_textarea = page.get_by_placeholder("Paste job description here")
    job_description_textarea.fill("We are looking for a software engineer with experience in React and Node.js.")

    # Click the optimize button
    optimize_button = page.get_by_role("button", name="Optimize")
    optimize_button.click()

    # Wait for the suggestions to appear
    expect(page.get_by_text("Keyword Suggestions")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)