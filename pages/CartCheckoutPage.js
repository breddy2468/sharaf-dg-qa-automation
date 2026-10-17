const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CartCheckoutPage extends BasePage {
  async openCart() {
    const clicked = await this.clickFirstVisible([
      this.page.getByRole('link', { name: /cart|bag|basket/i }),
      this.page.locator('a[href*="/checkout/cart"]'),
      this.page.locator('[data-block="minicart"] a')
    ]);
    if (!clicked) await this.open('/checkout/cart/');
    await expect(this.page.getByText(/shopping cart|your cart|cart/i).first()).toBeVisible({ timeout: 15_000 });
  }

  async proceedToCheckout() {
    const clicked = await this.clickFirstVisible([
      this.page.getByRole('button', { name: /proceed to checkout|checkout/i }),
      this.page.getByRole('link', { name: /proceed to checkout|checkout/i }),
      this.page.locator('button.checkout')
    ]);
    if (!clicked) throw new Error('Checkout button not found.');
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async fillShipping(shipping) {
    const fields = [
      { names: ['input[name*="firstname" i]', 'input[autocomplete="given-name"]'], value: shipping.firstName },
      { names: ['input[name*="lastname" i]', 'input[autocomplete="family-name"]'], value: shipping.lastName },
      { names: ['input[type="email"]', 'input[name*="email" i]'], value: shipping.email },
      { names: ['input[name*="telephone" i]', 'input[type="tel"]'], value: shipping.phone },
      { names: ['input[name*="street" i]', 'input[autocomplete="street-address"]'], value: shipping.address },
      { names: ['input[name*="city" i]', 'input[autocomplete="address-level2"]'], value: shipping.city },
      { names: ['input[name*="postcode" i]', 'input[name*="postal" i]'], value: shipping.postcode }
    ];

    for (const field of fields) {
      const locators = field.names.map(selector => this.page.locator(selector));
      // Checkout can hide account details for signed-in users; fill visible fields only.
      await this.fillFirstVisible(locators, field.value);
    }

    // Select a country/region if the form requires it and no default is selected.
    const selects = this.page.locator('select');
    for (let i = 0; i < await selects.count(); i++) {
      const select = selects.nth(i);
      if (await select.isVisible()) {
        const name = ((await select.getAttribute('name')) || '').toLowerCase();
        if (name.includes('country')) {
          try { await select.selectOption({ label: /united arab emirates|uae/i }); } catch (_) {}
        }
      }
    }

    const next = await this.clickFirstVisible([
      this.page.getByRole('button', { name: /next|continue to shipping|ship here/i }),
      this.page.getByRole('button', { name: /continue/i })
    ]);
    if (next) await this.page.waitForTimeout(500);
  }

  async choosePaymentMethod() {
    const cod = this.page.getByText(/cash on delivery|cash on delivery \(cod\)|cod/i).first();
    if (await cod.count() && await cod.isVisible().catch(() => false)) {
      await cod.click().catch(() => {});
      const radio = this.page.locator('input[type="radio"][value*="cash" i], input[type="radio"][id*="cash" i]');
      if (await radio.count()) await radio.first().check().catch(() => {});
    } else {
      const radios = this.page.locator('input[type="radio"]');
      if (await radios.count()) await radios.first().check().catch(() => {});
      else throw new Error('No visible payment method found. Configure a supported staging payment method.');
    }
  }

  async submitOrder() {
    const clicked = await this.clickFirstVisible([
      this.page.getByRole('button', { name: /place order|place your order|complete order|submit order/i }),
      this.page.locator('button[title*="Place Order" i]'),
      this.page.locator('button.checkout')
    ]);
    if (!clicked) throw new Error('Place order button not found.');
  }

  async expectOrderConfirmation() {
    await expect(this.page.getByText(/thank you for your purchase|order confirmation|order number|your order has been received/i).first())
      .toBeVisible({ timeout: 30_000 });
  }
}
module.exports = { CartCheckoutPage };
