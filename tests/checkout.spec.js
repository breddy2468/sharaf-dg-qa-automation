const { test } = require('@playwright/test');
const { AccountPage } = require('../pages/AccountPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartCheckoutPage } = require('../pages/CartCheckoutPage');
const { shipping } = require('../utils/testData');

test('add iPhone 14 Pro Silver to cart and complete checkout', async ({ page }) => {
  const accountPage = new AccountPage(page);
  const productPage = new ProductPage(page);
  const checkoutPage = new CartCheckoutPage(page);
  await accountPage.openLogin();
  await accountPage.expectRegistrationSucceeded();
  await productPage.openIphone14ProSilver();
  await productPage.addToCart();
  await checkoutPage.proceedToCheckout();
  await checkoutPage.fillShipping(shipping);
  await checkoutPage.choosePaymentMethod();
  // Submit the order only when explicitly enabled.
  if (process.env.ALLOW_ORDER_SUBMISSION === 'true') {
    await checkoutPage.submitOrder();
    await checkoutPage.expectOrderConfirmation();
  } else {
    console.log('Order submission skipped. Set ALLOW_ORDER_SUBMISSION=true only when approved.');
  }
});
