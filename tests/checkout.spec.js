const { test } = require('@playwright/test');
const { ProductPage } = require('../pages/ProductPage');
const { CartCheckoutPage } = require('../pages/CartCheckoutPage');
const { shipping } = require('../utils/testData');

test('add iPhone 14 Pro Silver to cart and complete checkout', async ({ page }) => {
  test.skip(process.env.ALLOW_ORDER_SUBMISSION !== 'true',
    'Safety gate: set ALLOW_ORDER_SUBMISSION=true only when order submission is approved for this staging environment.');

  const productPage = new ProductPage(page);
  const checkoutPage = new CartCheckoutPage(page);

  await productPage.openIphone14ProSilver();
  await productPage.addToCart();
  await checkoutPage.openCart();
  await checkoutPage.proceedToCheckout();
  await checkoutPage.fillShipping(shipping);
  await checkoutPage.choosePaymentMethod();

  // This is intentionally gated because it creates an order in the staging system.
  await checkoutPage.submitOrder();
  await checkoutPage.expectOrderConfirmation();
});
