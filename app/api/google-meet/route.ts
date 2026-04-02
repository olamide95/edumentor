// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: /app/api/auth/google/route.ts
//
// Redirects the tutor to Google's consent screen.
// Visit: https://www.myedumentors.com/api/auth/google  to kick off the flow.
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: /app/api/auth/google/callback/route.ts
//
// Google redirects here after the tutor approves access.
// Exchanges the one-time code for tokens, logs the refresh token.
//
// After running:
//   1. Check your server logs for the refresh token
//   2. Add it to .env.local:  GOOGLE_REFRESH_TOKEN=1//0g...
//   3. Restart your server — Meet creation works silently from now on
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    console.error('Google OAuth cancelled or failed:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=cancelled`
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI  // https://www.myedumentors.com/api/auth/google/callback
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // This happens if Google already issued a refresh token for this account before
      // and prompt:'consent' was NOT set when generating the auth URL.
      // Fix: revoke access at https://myaccount.google.com/permissions then try again.
      console.error(
        'No refresh token returned. ' +
        'Revoke app access at https://myaccount.google.com/permissions and try again.'
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=no_refresh_token`
      );
    }

    // ── In production: save this to Firestore instead of logging ─────────────
    // await db.collection('settings').doc('google').set({
    //   refreshToken: tokens.refresh_token,
    //   updatedAt: new Date(),
    // });
    // ─────────────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Google refresh token — add this to .env.local:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('═══════════════════════════════════════════════════════');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=success`
    );

  } catch (err: any) {
    console.error('Google callback error:', err?.response?.data || err?.message);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=error`
    );
  }
}