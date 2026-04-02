import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI  // https://www.myedumentors.com/api/auth/google/callback
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // Required — gets a refresh token
    prompt:      'consent',  // Required — forces Google to return refresh_token every time
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

  return NextResponse.redirect(authUrl);
}

