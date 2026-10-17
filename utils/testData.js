require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function uniqueEmail() {
  return `qa.${Date.now()}@example.com`;
}

module.exports = {
  account: {
    firstName: process.env.TEST_FIRST_NAME || 'QA',
    lastName: process.env.TEST_LAST_NAME || 'Automation',
    email: process.env.TEST_EMAIL || uniqueEmail(),
    password: process.env.TEST_PASSWORD || 'ReplaceMe123!'
  },
  shipping: {
    firstName: process.env.TEST_FIRST_NAME || 'QA',
    lastName: process.env.TEST_LAST_NAME || 'Automation',
    email: process.env.TEST_EMAIL || uniqueEmail(),
    phone: process.env.CHECKOUT_PHONE || '0501234567',
    address: process.env.CHECKOUT_ADDRESS || 'Test Street 1',
    city: process.env.CHECKOUT_CITY || 'Dubai',
    postcode: process.env.CHECKOUT_POSTCODE || '00000'
  },
  required
};
