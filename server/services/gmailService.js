require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

async function getTokenFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

async function createGmailDraft(tokens, to, subject, body) {
  setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const emailContent = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body
  ].join('\n');

  const encoded = Buffer.from(emailContent)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw: encoded }
    }
  });

  return { draftId: res.data.id, threadId: res.data.message?.threadId };
}

async function getUserInfo(tokens) {
  setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return { email: data.email, name: data.name, picture: data.picture };
}

module.exports = { oauth2Client, getAuthUrl, getTokenFromCode, setCredentials, createGmailDraft, getUserInfo, SCOPES };
