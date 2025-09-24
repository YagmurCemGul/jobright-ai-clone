from playwright.sync_api import sync_playwright, expect
import time
import random

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    random_id = random.randint(1000, 9999)
    employer_email = f"employer{random_id}@test.com"
    job_seeker_email = f"seeker{random_id}@test.com"
    company_name = f"NotifyCorp {random_id}"
    job_title = f"Notification Tester {random_id}"

    # --- Step 1: Register Employer and Job Seeker ---
    page.goto("http://localhost:3000/employer/register")
    page.get_by_placeholder("Your Name").fill("Notify Employer")
    page.get_by_placeholder("Email Address").fill(employer_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_placeholder("Company Name").fill(company_name)
    page.get_by_role("button", name="Register").click()
    expect(page.get_by_role("heading", name="Employer Dashboard")).to_be_visible()
    page.get_by_role("link", name="Logout").click()

    page.goto("http://localhost:3000/register")
    page.get_by_placeholder("Name").fill("Notify Seeker")
    page.get_by_placeholder("Email Address").fill(job_seeker_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Register").click()
    expect(page.get_by_role("heading", name="Find Your Next Job")).to_be_visible()
    page.get_by_role("link", name="Logout").click()

    # --- Step 2: Employer creates a job ---
    page.goto("http://localhost:3000/login")
    page.get_by_placeholder("Email Address").fill(employer_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()
    page.get_by_role("link", name="Create New Job Posting").click()
    page.get_by_placeholder("Job Title").fill(job_title)
    page.get_by_placeholder("Job Description").fill("Testing notifications.")
    page.get_by_placeholder("Location").fill("Test Location")
    page.get_by_role("button", name="Create Job").click()
    expect(page.get_by_role("heading", name=job_title)).to_be_visible()
    page.get_by_role("link", name="Logout").click()

    # --- Step 3: Job Seeker applies for the job ---
    page.goto("http://localhost:3000/login")
    page.get_by_placeholder("Email Address").fill(job_seeker_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()

    page.get_by_placeholder("Keywords").fill(job_title)
    time.sleep(1) # wait for filter

    page.get_by_role("button", name="Apply Now").click()
    # Accept the alert
    page.on("dialog", lambda dialog: dialog.accept())

    page.get_by_role("link", name="Logout").click()

    # --- Step 4: Employer checks for notification ---
    page.goto("http://localhost:3000/login")
    page.get_by_placeholder("Email Address").fill(employer_email)
    page.get_by_placeholder("Password").fill("password123")
    page.get_by_role("button", name="Login").click()

    notification_button = page.get_by_role("button", name="Notifications (1)")
    expect(notification_button).to_be_visible()
    page.screenshot(path="jules-scratch/verification/with_notification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)