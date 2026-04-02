// FILE LOCATION: /app/api/zoom/token/route.ts
//
// This route exchanges your Zoom Server-to-Server OAuth credentials
// for an access token — entirely server-side. The clientSecret never
// reaches the browser.
//
// ─── .env.local ──────────────────────────────────────────────────────────────
//   ZOOM_ACCOUNT_ID=hASBMDVaQfCg89HgoOA0mw
//   ZOOM_CLIENT_ID=5XnHOmmbSZSX0cEyghXqrA
//   ZOOM_CLIENT_SECRET=kCuKtNkQNSH4iZzeIUYdvurA4S5szyXk
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const accountId   = process.env.ZOOM_ACCOUNT_ID;
    const clientId     = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      console.error('Missing Zoom environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Zoom token error:', err);
      return NextResponse.json({ error: 'Failed to get Zoom token' }, { status: res.status });
    }

    const data = await res.json();
    // Only return the access token — never forward credentials
    return NextResponse.json({ access_token: data.access_token });

  } catch (err: any) {
    console.error('Zoom token route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}