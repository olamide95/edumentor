// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: /app/api/google-meet/auth/route.ts
//
// Redirects the tutor to Google's consent screen.
// Only needed ONCE — after the first sign-in, the refresh token is saved
// and all future Meet creations are silent.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI  // https://www.myedumentors.com/api/google-meet/callback
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',   // MUST be offline to get a refresh token
    prompt: 'consent',        // MUST force consent so Google always returns refresh_token
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  return NextResponse.redirect(authUrl);
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: /app/api/google-meet/callback/route.ts
//
// Google redirects here after the tutor approves access.
// This exchanges the one-time `code` for tokens and saves the refresh token.
//
// After this runs successfully, copy the refresh token printed in your
// server logs and add it to .env.local:
//   GOOGLE_REFRESH_TOKEN=1//0g...
//
// You only need to do this once per Google account.
// ─────────────────────────────────────────────────────────────────────────────

// import { NextRequest, NextResponse } from 'next/server';
// import { google } from 'googleapis';
//
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const code  = searchParams.get('code');
//   const error = searchParams.get('error');
//
//   if (error || !code) {
//     return NextResponse.redirect(
//       `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=cancelled`
//     );
//   }
//
//   const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.GOOGLE_REDIRECT_URI
//   );
//
//   const { tokens } = await oauth2Client.getToken(code);
//
//   // Log the refresh token — copy it into your .env.local as GOOGLE_REFRESH_TOKEN
//   // In production, save this to your database instead (per-user if multi-tutor)
//   console.log('=== GOOGLE REFRESH TOKEN (save this to .env.local) ===');
//   console.log(tokens.refresh_token);
//   console.log('=======================================================');
//
//   // Optionally save to Firestore here:
//   // await db.collection('settings').doc('google').set({ refreshToken: tokens.refresh_token });
//
//   return NextResponse.redirect(
//     `${process.env.NEXT_PUBLIC_APP_URL}/tutor-dashboard?google_auth=success`
//   );
// }