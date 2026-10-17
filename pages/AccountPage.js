const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { getLatestSharafDGOtp } = require('../utils/gmailOtp');

class AccountPage extends BasePage {
  constructor(page) {
    super(page);
    this.signInButton = page.locator("//*[text()='Sign In']");
    this.createAccountButton = page.locator('button[data-sdg-tab="register"]');
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true, });
    this.otpInputs = page.locator('input[id^="sdg-d"][aria-label^="Digit"]');
    this.signInLink = page.locator('//a[@class="my-account-link"]');
    this.editAccountLink = page.locator('a[href="https://uae.sdgstage.com/my-account/edit-account/"]');
    this.logoutLink = page.locator('a[href="https://uae.sdgstage.com/my-account/customer-logout/"]');
  }

  async openRegistration() {
    await this.open('/');
    await this.page.waitForLoadState('domcontentloaded');

    // Click on the Sign In button
    await this.signInButton.first().waitFor({ state: 'visible', timeout: 15000, });
    await this.signInButton.first().click();

    // Open Create account
    await this.createAccountButton.first().waitFor({ state: 'visible', timeout: 15000, });
    await this.createAccountButton.first().click();

    // Enter the email address
    const email = process.env.TEST_EMAIL;
    if (!email) {
      throw new Error('Set TEST_EMAIL in your .env file.');
    }
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000, });

    // Capture the timestamp before requesting the OTP
    const otpRequestTime = Date.now();
    await this.emailInput.fill(email);
    await this.continueButton.click();

    // Retrieve OTP directly through the Gmail API
    const otp = await getLatestSharafDGOtp(otpRequestTime);

    if (!/^\d{6}$/.test(otp)) {
      throw new Error('The retrieved OTP is not a valid six-digit code.');
    }
    console.log('Sharaf DG OTP retrieved successfully.');

    // Wait for the first OTP field
    await this.otpInputs.first().waitFor({ state: 'visible', timeout: 15000, });
    const inputCount = await this.otpInputs.count();
    if (inputCount !== 6) {
      throw new Error(`Expected 6 OTP input fields, but found ${inputCount}.`);
    }

    // Fill the six OTP digits individually
    for (let i = 0; i < 6; i++) {
      await this.otpInputs.nth(i).fill(otp[i]);
    }
    console.log('All six OTP digits entered successfully.');
  }

  async expectRegistrationSucceeded() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.signInLink.waitFor({ state: 'visible', timeout: 15000, });
    await this.signInLink.hover();
    await Promise.all([
      expect(this.editAccountLink).toBeVisible({ timeout: 15000 }),
      expect(this.logoutLink).toBeVisible({ timeout: 15000 }),
    ]);
    console.log('Registration and login verification passed: Edit Account and Logout links are visible.');
  }

  async openLogin() {
    await this.open('/');
    await this.page.waitForLoadState('domcontentloaded');

    // Click on the Sign In button
    await this.signInButton.first().waitFor({ state: 'visible', timeout: 15000, });
    await this.signInButton.first().click();

    // Enter the email address
    const email = process.env.TEST_EMAIL;
    if (!email) {
      throw new Error('Set TEST_EMAIL in your .env file.');
    }
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000, });

    // Capture the timestamp before requesting the OTP
    const otpRequestTime = Date.now();
    await this.emailInput.fill(email);
    await this.continueButton.click();

    // Retrieve OTP directly through the Gmail API
    const otp = await getLatestSharafDGOtp(otpRequestTime);

    if (!/^\d{6}$/.test(otp)) {
      throw new Error('The retrieved OTP is not a valid six-digit code.');
    }
    console.log('Sharaf DG OTP retrieved successfully.');

    // Wait for the first OTP field
    await this.otpInputs.first().waitFor({ state: 'visible', timeout: 15000, });
    const inputCount = await this.otpInputs.count();
    if (inputCount !== 6) {
      throw new Error(`Expected 6 OTP input fields, but found ${inputCount}.`);
    }

    // Fill the six OTP digits individually
    for (let i = 0; i < 6; i++) {
      await this.otpInputs.nth(i).fill(otp[i]);
    }
    console.log('All six OTP digits entered successfully.');
  }
}

module.exports = { AccountPage };
