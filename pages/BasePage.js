class BasePage {
  constructor(page) {
    this.page = page;
  }

  async open(path = '/') {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }
}

module.exports = { BasePage };
