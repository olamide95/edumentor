// FILE: /app/api/google-meet/route.ts
// All credentials come from environment variables — nothing hardcoded here.

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, startTime, endTime, timeZone, recurrence } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startTime, endTime' },
        { status: 400 }
      );
    }

    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Google Meet not configured. GOOGLE_REFRESH_TOKEN missing.' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Force a fresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    if (credentials.refresh_token) {
      console.warn('=== NEW GOOGLE REFRESH TOKEN — update .env.local + Vercel ===');
      console.warn(credentials.refresh_token);
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const requestId = `edumentor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const eventBody: any = {
      summary:     title,
      description: description || '',
      start: { dateTime: startTime, timeZone: timeZone || 'Africa/Lagos' },
      end:   { dateTime: endTime,   timeZone: timeZone || 'Africa/Lagos' },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    if (recurrence) {
      eventBody.recurrence = [recurrence];
    }

    const event = await calendar.events.insert({
      calendarId:            'primary',
      conferenceDataVersion: 1,
      sendUpdates:           'none',
      requestBody:           eventBody,
    });

    const conferenceData = event.data.conferenceData;

    if (!conferenceData) {
      return NextResponse.json(
        { error: 'Google Meet link was not generated. Ensure Google Meet is enabled on your account.' },
        { status: 500 }
      );
    }

    const meetLink = conferenceData.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    if (!meetLink) {
      return NextResponse.json(
        { error: 'Meet link not found. Ensure Google Meet is enabled on your Google account.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      meet_link: meetLink,
      event_id:  event.data.id,
      html_link: event.data.htmlLink,
    });

  } catch (err: any) {
    const googleErr = err?.response?.data;
    console.error('Google Meet route error:', googleErr || err?.message);

    if (googleErr?.error === 'invalid_grant') {
      return NextResponse.json(
        { error: 'invalid_grant', message: 'Google refresh token expired. Run: node scripts/get-google-refresh-token.mjs' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: googleErr?.error_description || err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }