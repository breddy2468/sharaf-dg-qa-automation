const { test, expect } = require('@playwright/test');
const { AccountPage } = require('../pages/AccountPage');
const { account } = require('../utils/testData');

test.describe('Account flows', () => {
  test('register a new user', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await accountPage.openRegistration();
    await accountPage.expectRegistrationSucceeded();
  });

  test('login with a valid test account', async ({ page }) => {
    const accountPage = new AccountPage(page);
    await accountPage.openLogin();
    await accountPage.expectRegistrationSucceeded();
  });
});
