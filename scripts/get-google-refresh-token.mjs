import { createInterface } from 'readline';
import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:3000/api/auth/google/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local\n');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt:      'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

console.log('\nOpen this URL in your browser:');
console.log(authUrl);
console.log('\nAfter approving, paste the full redirect URL below.\n');

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the full URL here:\n> ', async (input) => {
  rl.close();
  try {
    let code = input.trim();
    if (code.startsWith('http')) {
      const url = new URL(code);
      code = url.searchParams.get('code') || '';
    }
    if (!code) {
      console.error('\nCould not extract code. Paste the full redirect URL.\n');
      process.exit(1);
    }
    code = decodeURIComponent(code);
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      console.error('\nNo refresh token. Go to https://myaccount.google.com/permissions, remove your app, then run again.\n');
      process.exit(1);
    }
    console.log('\nAdd this to .env.local AND Vercel environment variables:');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
  } catch (err) {
    console.error('\nError:', err.message, '\nCode expired? Run the script again.\n');
    process.exit(1);
  }
});
