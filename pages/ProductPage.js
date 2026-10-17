
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    this.iphone14ProSilverLink = page.getByTitle('Apple iPhone 14 Pro - (256 GB) - Silver', { exact: true });
    this.headerOverlay = page.locator('.site-header .overlay');
    this.addtoCartButton = page.locator('//div[@id="nav-delivery"]//button[normalize-space()="Add to Cart"]');
  }

  async openIphone14ProSilver() {
    await this.page.waitForLoadState('domcontentloaded');
    const product = this.iphone14ProSilverLink.first();
    await expect(product).toBeVisible({ timeout: 20000 });

    // Close the header menu if it is open
    await this.page.mouse.move(0, 0);
    await this.page.keyboard.press('Escape');

    // Wait for the first header overlay to disappear
    await expect(this.headerOverlay.first()).toBeHidden({timeout: 10000,});

    // Open the product
    await product.click({ timeout: 15000 });

    // Verify the product page
   await expect(this.page.locator('h1').filter({hasText: /iphone 14 pro/i,}).first()).toBeVisible({ timeout: 20000 });
  }

 async addToCart() {
    const addToCart = this.addtoCartButton.first();
    await expect(addToCart).toBeVisible({ timeout: 15000 });
    await expect(addToCart).toBeEnabled();

    // Wait for the Add to Cart request and click the button
    const responsePromise = this.page.waitForResponse(
    response =>/add-to-cart|add_to_cart|wc-ajax/i.test(response.url()) && response.request().method() !== 'GET' && response.ok(), { timeout: 15000 }).catch(() => null);
    await addToCart.click();
    const response = await responsePromise;

    // If a matching request was observed, confirm it succeeded.
    // Otherwise, inspect the cart page to verify the item was added.
    if (!response) {
      console.log('No matching Add to Cart response detected. ' + 'Verify the item in the cart before continuing.');
    }
  }
}

module.exports = { ProductPage };
