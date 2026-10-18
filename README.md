# Sharaf DG — QA Automation

End-to-end UI automation for the Sharaf DG staging website using **Playwright, JavaScript, and the Page Object Model (POM)**.

## Automated flows

- **Account:** registration and login scenarios (`tests/account.spec.js`).
- **Checkout:** opens the iPhone 14 Pro Silver product, adds it to the cart, fills shipping details, selects a payment method, and checks the order confirmation when submission is enabled (`tests/checkout.spec.js`).

> **Checkout safety:** order submission is disabled unless `ALLOW_ORDER_SUBMISSION=true` is set. Confirm with the staging owner that test orders and the selected payment method are approved before enabling it. Never use real payment details.

## Prerequisites

- Node.js 18 or later (Node.js 20 LTS recommended)
- npm
- A locally installed **Google Chrome** or **Microsoft Edge** for the browser-channel commands below
- Approved staging Basic Auth credentials and test data

The Playwright configuration uses the installed Chrome or Edge channel, opens a visible browser, and runs with one worker. `BROWSER` selects the browser channel (`chrome` by default, or `edge`).

## Setup

1. Open a terminal in the project root.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local `.env` file in the project root. Add the staging and test values required by your environment, for example:

   ```dotenv
   BASE_URL=https://uae.sdgstage.com/
   BASIC_AUTH_USERNAME=replace_with_staging_username
   BASIC_AUTH_PASSWORD=replace_with_staging_password
   TEST_EMAIL=replace_with_staging_test_email
   CHECKOUT_FIRST_NAME=replace_with_test_first_name
   CHECKOUT_LAST_NAME=replace_with_test_last_name
   CHECKOUT_CITY=Dubai
   CHECKOUT_ADDRESS=replace_with_test_address
   # Optional:
   # CHECKOUT_PHONE=replace_with_approved_test_phone
   # ALLOW_ORDER_SUBMISSION=true
   ```

   Replace every example value with staging-approved values. Do not paste secrets into source code, README files, issue trackers, or chat messages.

4. Confirm the base URL and selectors match the current staging deployment before running tests.

### Keep credentials private

- **Never commit `.env`, staging credentials, OTPs, `credentials.json`, or `token.json` to GitHub.**
- These sensitive files should remain local and are listed in `.gitignore`. Verify with `git status --short` before committing.
- If a secret has already been committed or pushed, removing the file in a later commit is not enough: revoke/rotate the exposed credential and follow your repository's secret-remediation process.
- For CI, use the CI platform's secret store instead of committing credentials.

## Step 3 — Execute the tests

Run commands from the project root.

### Run all tests

```bash
npm test
```

### Run with a visible browser

```bash
npm run test:headed
```

### Run registration and login tests only

```bash
npx playwright test tests/account.spec.js
```

### Run checkout test

```bash
npx playwright test tests/checkout.spec.js
```

The checkout test will not submit an order unless `ALLOW_ORDER_SUBMISSION=true` is explicitly configured and the staging owner has approved it.

### Run with Google Chrome (Windows Command Prompt)

```bat
set "BROWSER=chrome" && npx playwright test --headed --workers=1
```

### Run with Microsoft Edge (Windows Command Prompt)

```bat
set "BROWSER=edge" && npx playwright test --headed --workers=1
```

These `set` commands apply the variable to that command invocation in Windows Command Prompt. They select the installed Chrome (`chrome`) or Edge (`msedge`) channel configured in `playwright.config.js`.

### Other useful commands

```bash
# Open Playwright's interactive test UI
npm run test:ui

# Open the latest HTML report
npm run report
```

The project config already sets `workers: 1` and `headless: false`, so tests run sequentially in a visible browser with the current configuration. `--workers=1` is included in the browser-specific commands for clarity.

## Project structure

```text
.
├── pages/
│   ├── BasePage.js
│   ├── AccountPage.js
│   ├── ProductPage.js
│   └── CartCheckoutPage.js
├── tests/
│   ├── account.spec.js
│   └── checkout.spec.js
├── utils/
│   ├── gmailOtp.js
│   └── testData.js
├── playwright.config.js
├── package.json
├── package-lock.json
└── README.md
```

- **`pages/`** contains page objects, selectors, and page-level actions.
- **`tests/`** contains Playwright test scenarios.
- **`utils/`** contains shared test data and Gmail OTP helper logic.
- **`playwright.config.js`** loads `.env`, configures the browser channel, staging Basic Auth, timeouts, and test artifacts.
- **`playwright-report/`** and **`test-results/`** are generated during test runs and should not be committed.

## Configuration notes

- `BROWSER`: `chrome` or `edge`; defaults to `chrome`.
- `BASE_URL`: staging base URL; defaults to `https://uae.sdgstage.com/`.
- `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`: required for staging Basic Auth.
- `TEST_EMAIL`: account email used by account flows. The current test-data helper contains a fallback; set an approved staging test email in `.env` for your environment.
- `CHECKOUT_FIRST_NAME`, `CHECKOUT_LAST_NAME`, `CHECKOUT_CITY`, `CHECKOUT_ADDRESS`: checkout shipping values. The current helper contains defaults for some fields; prefer explicit staging test values.
- `CHECKOUT_PHONE`: optional phone value. If omitted, the helper generates a Dubai-style mobile number.
- `ALLOW_ORDER_SUBMISSION`: set to `true` only after explicit approval to create a staging test order.

## Reports and troubleshooting

- **Missing Basic Auth variables:** add `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` to `.env`.
- **Chrome or Edge fails to launch:** ensure the selected browser is installed locally and the `BROWSER` value is exactly `chrome` or `edge`.
- **Element or route not found:** inspect the live staging DOM and update the relevant page object; staging routes and selectors can change.
- **Registration or login fails:** verify the staging account, route, and any required email verification/OTP process.
- **Checkout fails at shipping/payment:** confirm required fields and the staging payment setup. Keep order submission disabled until approved.
- **HTML report:** run `npm run report` after a test run to open the generated Playwright report.

## AI usage and validation

ChatGPT was used to assist with the framework structure, Page Object Model (POM) organization, locator strategy suggestions, README documentation, and the checkout order-submission safety gate. GitHub Copilot was also used to help update the automation code and locators.

AI-assisted code and locator suggestions must be reviewed. Validate selectors, test data, and end-to-end flows against the live staging site before relying on the results. Keep `.env` private and never commit staging credentials, tokens, or other secrets to GitHub. This documentation update does not claim that the tests were executed successfully against staging.
