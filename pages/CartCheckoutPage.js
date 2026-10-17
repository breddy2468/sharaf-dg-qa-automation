const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { generateDubaiMobileNumber } = require('../utils/testData');

class CartCheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.addtoCartButton = page.getByText('Proceed to Checkout', { exact: true });
    this.searchforyouraddressButton = page.locator('//div[@class="input-field map-search-overlay"]/input[@placeholder="Search for your address"]');
    this.firstNameInput = page.locator('//input[@name="shipping_first_name"]');
    this.lastNameInput = page.locator('//input[@name="shipping_last_name"]');
    this.shippingaddressInput = page.locator('//input[@name="shipping_address_1"]');
    this.shippingphoneInput = page.locator('//input[@name="shipping_phone"]');
    this.cashondeliveryOption = page.locator("//label[contains(text(), 'Cash on Delivery')]");
    this.placeOrderButton = page.locator('//button[@value="Place order"]');
    this.orderConfirmationMessage = page.locator('//h1[contains(text(), "Thank you. Your order has been received.")]');
  }

  async proceedToCheckout() {
    await this.addtoCartButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.addtoCartButton.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => { });
  }

  async fillShipping() {
    const addressInput = this.searchforyouraddressButton.first();
    
    // Check whether the shipping address input is available
    let isShippingVisible = false;
    try {
      await addressInput.waitFor({state: 'visible', timeout: 5000,});
      isShippingVisible = true;
    } catch {
      console.log('Shipping form is not visible. Skipping shipping details.');
    }

    // Fill shipping details only when the address input is visible
    if (isShippingVisible) {
      await addressInput.clear();
      await addressInput.fill(process.env.CHECKOUT_CITY);
      await addressInput.press('ArrowDown');
      await addressInput.press('Enter');
      await this.page.waitForLoadState('domcontentloaded');
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(process.env.CHECKOUT_FIRST_NAME);
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(process.env.CHECKOUT_LAST_NAME);
      await this.shippingaddressInput.clear();
      await this.shippingaddressInput.fill(process.env.CHECKOUT_ADDRESS);
      const mobileNumber = generateDubaiMobileNumber();
      await this.shippingphoneInput.clear();
      await this.shippingphoneInput.fill(mobileNumber, { delay: 150 });
      await this.shippingphoneInput.press('Tab');
      console.log('Shipping details filled successfully.');
    }
  }

  async choosePaymentMethod() {
    await this.cashondeliveryOption.first().waitFor({state: 'visible',timeout: 15000,});
    await this.cashondeliveryOption.first().click();
  }

  async submitOrder() {
    await this.placeOrderButton.first().waitFor({state: 'visible',timeout: 15000,});
    await this.placeOrderButton.first().click();
  }

  async expectOrderConfirmation() {
    const orderConfirmationMessage = this.orderConfirmationMessage.first();
    await expect(orderConfirmationMessage).toBeVisible({timeout: 15000,});
  }
}

module.exports = { CartCheckoutPage };
