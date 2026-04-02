// FILE: /app/api/auth/google/callback/route.ts
//
// Google redirects here after the tutor approves access.
// Check your server/Vercel logs for the printed GOOGLE_REFRESH_TOKEN.
// Copy it into .env.local then redeploy.

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.myedumentors.com';

  if (error || !code) {
    console.error('Google OAuth cancelled or failed:', error);
    return NextResponse.redirect(`${appUrl}/tutor-dashboard?google_auth=cancelled`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error(
        'No refresh token returned.\n' +
        'Fix: Go to https://myaccount.google.com/permissions\n' +
        'Remove your app, then visit /api/auth/google again.'
      );
      return NextResponse.redirect(`${appUrl}/tutor-dashboard?google_auth=no_refresh_token`);
    }

    console.log('==========================================================');
    console.log('GOOGLE REFRESH TOKEN — copy this into .env.local then redeploy:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('==========================================================');

    return NextResponse.redirect(`${appUrl}/tutor-dashboard?google_auth=success`);

  } catch (err: any) {
    console.error('Google callback error:', err?.response?.data || err?.message);
    return NextResponse.redirect(`${appUrl}/tutor-dashboard?google_auth=error`);
  }
}