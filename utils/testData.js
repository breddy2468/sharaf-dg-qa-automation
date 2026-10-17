
require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function generateDubaiMobileNumber() {
  const prefixes = ['50', '52', '54', '55', '56', '58'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remainingDigits = Math.floor(
    1000000 + Math.random() * 9000000
  );

  return `${prefix}${remainingDigits}`;
}

const checkoutPhone = process.env.CHECKOUT_PHONE?.trim() || generateDubaiMobileNumber();

module.exports = {
  account: {
    email: required('TEST_EMAIL', 'breddy4466@gmail.com'),
  },

  shipping: {
    firstName: required('CHECKOUT_FIRST_NAME', 'Bharath'),
    lastName: required('CHECKOUT_LAST_NAME', 'Reddy'),
    city: required('CHECKOUT_CITY', 'Dubai'),
    address: required('CHECKOUT_ADDRESS', 'Test Street 1'),
    phone: checkoutPhone,
  },

  order: {
    allowSubmission:
      process.env.ALLOW_ORDER_SUBMISSION === 'true',
  },

  required,
  generateDubaiMobileNumber,
};
