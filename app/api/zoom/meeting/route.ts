// FILE: /app/api/zoom/meeting/route.ts
//
// .env.local:
//   ZOOM_ACCOUNT_ID=hASBMDVaQfCg89HgoOA0mw
//   ZOOM_CLIENT_ID=5XnHOmmbSZSX0cEyghXqrA
//   ZOOM_CLIENT_SECRET=kCuKtNkQNSH4iZzeIUYdvurA4S5szyXk

import { NextRequest, NextResponse } from 'next/server';

async function getZoomToken(): Promise<string> {
  const accountId    = process.env.ZOOM_ACCOUNT_ID!;
  const clientId     = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

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
    throw new Error(`Zoom auth failed: ${err.reason || err.error || res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, meetingDate, meetingTime, duration, isRecurring, recurringPattern } = body;

    if (!title || !meetingDate || !meetingTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, meetingDate, meetingTime' },
        { status: 400 }
      );
    }

    const token = await getZoomToken();

    const startTime = new Date(`${meetingDate}T${meetingTime}:00`).toISOString();

    const recurrenceMap: Record<string, { type: number; repeat_interval: number }> = {
      daily:    { type: 1, repeat_interval: 1 },
      weekly:   { type: 2, repeat_interval: 1 },
      biweekly: { type: 2, repeat_interval: 2 },
      monthly:  { type: 3, repeat_interval: 1 },
    };

    const meetingBody: any = {
      topic:      title,
      type:       isRecurring ? 8 : 2,
      start_time: startTime,
      duration:   duration || 60,
      agenda:     description || '',
      settings: {
        host_video:        true,
        participant_video:  true,
        join_before_host:  false,
        mute_upon_entry:   true,
        waiting_room:      true,
        auto_recording:    'none',
      },
    };

    if (isRecurring && recurringPattern && recurrenceMap[recurringPattern]) {
      meetingBody.recurrence = {
        ...recurrenceMap[recurringPattern],
        end_times: 10,
      };
    }

    const zoomRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingBody),
    });

    if (!zoomRes.ok) {
      const err = await zoomRes.json();
      console.error('Zoom create meeting error:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to create Zoom meeting' },
        { status: zoomRes.status }
      );
    }

    const meeting = await zoomRes.json();

    return NextResponse.json({
      join_url:  meeting.join_url,
      id:        String(meeting.id),
      start_url: meeting.start_url,
      password:  meeting.password,
    });

  } catch (err: any) {
    console.error('Zoom meeting route error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Return 405 for every other method
export async function GET()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }