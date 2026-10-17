# Sharaf DG — QA Automation Engineer Take-Home

End-to-end UI automation using **Playwright + JavaScript**, with a Page Object Model (POM) structure. The project targets the Sharaf DG staging website and Chromium (Chrome-compatible).

## Included flows

- Registration: open registration page, fill account details, submit, and check for an account/welcome state.
- Login: sign in with a dedicated test account and check for a signed-in state.
- Product purchase: find the iPhone 14 Pro 256GB Silver, add to cart, proceed through shipping and payment, submit an order, and verify confirmation.

> **Important:** The checkout test is disabled by default because submitting it creates a test order. Enable it only after confirming the staging environment, payment method, and test data are safe. Use a staging-approved account and never use real payment details.

## Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm
- Latest stable Google Chrome is not required; Playwright installs its own Chromium build. You can also configure a locally installed browser if required by your team.

## Setup

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install
   npx playwright install chromium
   ```

3. Copy `.env.example` to `.env`.
4. Fill in the staging Basic Auth password and your dedicated test account details. Do not commit `.env`.
5. Verify the exact iPhone product URL in staging. If known, set `IPHONE_PRODUCT_URL` in `.env` to avoid relying on site search.

The staging Basic Auth password should be stored locally in `.env` or in CI secrets, never hard-coded in source control.

## Run tests

```bash
# All tests (checkout safely skipped unless explicitly enabled)
npm test

# Visible browser
npm run test:headed

# Playwright interactive runner
npm run test:ui

# HTML report
npm run report
```

Run a single suite:

```bash
npx playwright test tests/account.spec.js
npx playwright test tests/checkout.spec.js
```

To run checkout end-to-end, first confirm with the assignment contact that test orders are allowed and that the selected payment method is configured for staging. Then set:

```env
ALLOW_ORDER_SUBMISSION=true
```

Run only the checkout test:

```bash
npx playwright test tests/checkout.spec.js --headed
```

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
│   └── testData.js
├── .env.example
├── playwright.config.js
└── package.json
```

- **Page objects** encapsulate selectors and actions.
- **Tests** express business flows and assertions.
- **BasePage** provides shared locator helpers.
- Playwright auto-waits for most actions; explicit assertions are used for page readiness and outcomes. No fixed sleeps are used for general synchronization.

## Assumptions and limitations

1. The staging website is available and the supplied Basic Auth credentials remain valid.
2. Magento-style account routes (`/customer/account/login/` and `/customer/account/create/`) are used by the staging deployment. Update routes if the site uses different paths.
3. The exact product URL, selectors, shipping fields, and payment methods can vary by staging build. The locators intentionally use accessible roles and common field attributes first; inspect the current DOM and refine selectors if the UI differs.
4. Registration uses a unique email address for repeatability. The domain `example.com` is reserved for examples; replace it with a staging-approved test email domain if registration email verification is required.
5. Login uses a pre-created test account from `.env`; it is separate from the account created by the registration test.
6. Shipping field formats, required region/state fields, OTP, CAPTCHA, and email verification may require test-environment configuration or approved test hooks. Do not bypass production security controls.
7. The checkout test is gated and does not submit an order unless `ALLOW_ORDER_SUBMISSION=true`.
8. The test uses the first available payment method if COD is not available. Confirm that this is a non-charging staging payment option before enabling order submission.

## AI Usage

AI assistance was used transparently to accelerate framework design and initial implementation. The final code must be reviewed against the live staging DOM before submission.

### Tool used

- **ChatGPT (OpenAI):** used to structure the Playwright project, draft POM classes, suggest test coverage, propose robust locator strategies, scaffold the README, and add a safety gate around order submission.

### Key prompts used

- “Create an end-to-end Playwright JavaScript test framework using Page Object Model for registration, login, and an iPhone product checkout flow.”
- “Separate page objects from test specs and centralize reusable navigation and locator helpers.”
- “Use role-based locators and resilient field selectors; add explicit assertions for registration, login, cart, and order confirmation.”
- “Add setup instructions, assumptions, execution commands, and a detailed AI Usage section to README.”
- “Make checkout order submission opt-in so the test cannot accidentally create orders by default.”

### Accepted, modified, and rejected output

- **Accepted:** Playwright Test, JavaScript, POM separation, trace/screenshots on failure, environment-based configuration, and test-specific assertions.
- **Modified:** Credentials and test data are read from `.env`; the product URL can be configured; checkout submission is guarded by `ALLOW_ORDER_SUBMISSION=true`.
- **Not treated as verified:** exact selectors, routes, product search results, and checkout behavior. These must be confirmed on the actual staging site, because AI-generated selectors cannot establish that a live UI is unchanged.
- **Rejected:** hard-coding credentials, using real card data, and automatically submitting an order during every test run.

### Review and validation performed

- Reviewed the generated project for separation of concerns, configuration hygiene, and an explicit checkout safety gate.
- The test suite has **not** been represented as successfully executed against staging in this generated deliverable. Before submission, run it against the live staging website, inspect failures/traces, update selectors based on the actual DOM, and document the real results.
- Review all code yourself and be ready to explain each page object, locator, assertion, and safety assumption in the follow-up discussion.

## Troubleshooting

- **Login/registration route not found:** verify the staging site's current routes and update `AccountPage.js`.
- **Field/button not found:** inspect with `npx playwright test --headed` or `npm run test:ui`, then update the relevant page object.
- **Basic Auth fails:** confirm the credentials in `.env`; do not put them in Git.
- **Registration email verification/OTP appears:** request a staging-approved test account or a test-mode mechanism from the assignment contact.
- **Checkout fails at address/payment:** update required fields and payment selectors based on the staging checkout UI. Do not enable order submission until the staging team approves it.
