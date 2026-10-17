const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class ProductPage extends BasePage {
  async openIphone14ProSilver() {
    // Prefer a direct product URL supplied via environment after verifying the exact staging slug.
    const productUrl = process.env.IPHONE_PRODUCT_URL;
    if (productUrl) {
      await this.open(productUrl);
    } else {
      await this.open('/');
      const search = this.page.locator('input[type="search"], input[name*="search" i], input[placeholder*="search" i]').first();
      await expect(search).toBeVisible();
      await search.fill('Apple iPhone 14 Pro 256GB Silver');
      await search.press('Enter');
      await this.page.waitForLoadState('domcontentloaded');
      const product = this.page.getByText(/iphone 14 pro/i).first();
      await expect(product).toBeVisible({ timeout: 20_000 });
      await product.click();
    }
    await expect(this.page.getByText(/iphone 14 pro/i).first()).toBeVisible({ timeout: 20_000 });
  }

  async addToCart() {
    const clicked = await this.clickFirstVisible([
      this.page.getByRole('button', { name: /add to cart|add to bag/i }),
      this.page.locator('button[title*="Add to Cart" i]'),
      this.page.locator('[data-action*="add-to-cart"]')
    ]);
    if (!clicked) throw new Error('Add to cart button not found; inspect product page and update ProductPage locators.');
    await this.page.waitForTimeout(800);
  }
}
module.exports = { ProductPage };
