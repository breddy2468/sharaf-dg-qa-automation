
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const fs = require('node:fs/promises');
const path = require('node:path');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
];

const credentialsPath = path.join(process.cwd(), 'credentials.json');
const tokenPath = path.join(process.cwd(), 'token.json');

let gmailClientPromise;

function decodeBase64Url(value = '') {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function extractText(payload = {}) {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  for (const part of payload.parts || []) {
    const text = extractText(part);
    if (text) return text;
  }

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&');
  }

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  return '';
}

async function createGmailClient() {
  let auth;

  try {
    const token = JSON.parse(
      await fs.readFile(tokenPath, 'utf8')
    );

    const credentials = JSON.parse(
      await fs.readFile(credentialsPath, 'utf8')
    );

    const oauth = credentials.installed || credentials.web;

    if (!oauth) {
      throw new Error(
        'credentials.json must contain installed or web OAuth configuration.'
      );
    }

    const client = new google.auth.OAuth2(
      oauth.client_id,
      oauth.client_secret,
      oauth.redirect_uris?.[0]
    );

    client.setCredentials(token);
    auth = client;
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
      throw error;
    }

    auth = await authenticate({
      scopes: SCOPES,
      keyfilePath: credentialsPath,
    });

    await fs.writeFile(
      tokenPath,
      JSON.stringify(auth.credentials, null, 2),
      { mode: 0o600 }
    );
  }

  return google.gmail({
    version: 'v1',
    auth,
  });
}

function getGmailClient() {
  if (!gmailClientPromise) {
    gmailClientPromise = createGmailClient().catch((error) => {
      gmailClientPromise = null;
      throw error;
    });
  }

  return gmailClientPromise;
}

async function getLatestSharafDGOtp(afterTimestamp) {
  if (!Number.isFinite(afterTimestamp)) {
    throw new Error(
      'Pass the OTP request timestamp in milliseconds using Date.now().'
    );
  }

  const gmail = await getGmailClient();
  const afterSeconds = Math.floor(afterTimestamp / 1000);

  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:shop@sharafdg.com after:${afterSeconds}`,
      maxResults: 10,
    });

    const messages = response.data.messages || [];

    for (const message of messages) {
      const result = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const payload = result.data.payload || {};
      const headers = payload.headers || [];

      const getHeader = (name) =>
        headers.find(
          (header) => header.name?.toLowerCase() === name.toLowerCase()
        )?.value || '';

      const subject = getHeader('subject');

      if (!/sharaf dg code|account verification/i.test(subject)) {
        continue;
      }

      const body = extractText(payload);

      const match = body.match(
        /Your One Time Password\s*\(OTP\)\s*is\s*:?\s*(\d{6})/i
      );

      if (match) {
        return match[1];
      }
    }

    if (attempt < 29) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error(
    'Sharaf DG OTP email was not found within 60 seconds.'
  );
}

module.exports = { getLatestSharafDGOtp };
