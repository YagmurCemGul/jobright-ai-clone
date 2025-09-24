from playwright.sync_api import sync_playwright, expect
import time
import random

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # --- Step 1: Register Employer ---
    random_id = random.randint(1000, 9999)
    employer_email = f"employer{random_id}@test.com"
    company_name = f"TestCorp {random_id}"
    job_title = f"Software Engineer {random_id}"

    page.goto("http://localhost:3000/employer/register")
    page.get_by_placeholder("Your Name").fill("Test Employer")
    page.get_by_placeholder("Email Address").fill(employer_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_placeholder("Company Name").fill(company_name)
    page.get_by_placeholder("Location").fill("Remote")
    page.get_by_role("button", name="Register").click()

    # --- Step 2: Verify Dashboard and Create Job ---
    expect(page.get_by_role("heading", name="Employer Dashboard")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/dashboard.png")

    page.get_by_role("link", name="Create New Job Posting").click()
    expect(page.get_by_role("heading", name="Create a New Job Posting")).to_be_visible()

    page.get_by_placeholder("Job Title").fill(job_title)
    page.get_by_placeholder("Job Description").fill("Looking for a great engineer!")
    page.get_by_placeholder("Location").fill("Remote")
    page.get_by_role("combobox").select_option("Full-time")
    page.get_by_placeholder("Salary (optional)").fill("120000")
    page.get_by_role("button", name="Create Job").click()

    expect(page.get_by_role("heading", name=job_title)).to_be_visible()
    page.screenshot(path="jules-scratch/verification/dashboard_with_job.png")

    # --- Step 3: Logout ---
    page.get_by_role("link", name="Logout").click()
    expect(page.get_by_role("heading", name="Find Your Next Job")).to_be_visible()

    # --- Step 4: Search and Filter for the new job ---
    page.get_by_placeholder("Keywords").fill(job_title)
    time.sleep(1) # wait for filter to apply

    expect(page.get_by_role("heading", name=job_title)).to_be_visible()
    expect(page.get_by_role("heading", name=company_name)).to_be_visible()
    page.screenshot(path="jules-scratch/verification/filtered_job_search.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)