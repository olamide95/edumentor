// FILE: /app/api/auth/google/route.ts
//
// Redirects the tutor to Google consent screen.
// Visit once: https://www.myedumentors.com/api/auth/google
// After sign-in, Google calls your callback which logs the refresh token.

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

  return NextResponse.redirect(authUrl);
}