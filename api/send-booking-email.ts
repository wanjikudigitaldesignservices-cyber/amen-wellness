import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingRequestBody {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  cityName: string;
  programName: string;
  durationMinutes: number;
  priceFormatted: string;
  bookingRef: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    guestName,
    guestEmail,
    guestPhone,
    cityName,
    programName,
    durationMinutes,
    priceFormatted,
    bookingRef,
    date,
    timeSlot,
    notes,
  } = (req.body || {}) as Partial<BookingRequestBody>;

  if (!guestName || !guestEmail || !bookingRef || !programName) {
    return res.status(400).json({
      error: 'Missing required reservation fields (guestName, guestEmail, bookingRef, programName).',
    });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Amen Wellness <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080C0A; color: #EADFCB; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0E1612; border: 1px solid rgba(212, 168, 83, 0.25); border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 32px; background: linear-gradient(180deg, #14221A 0%, #0E1612 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center; }
    .gold-sub { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #D4A853; font-weight: 700; margin-bottom: 8px; }
    .title { font-size: 26px; color: #FFFFFF; margin: 0; font-weight: 600; letter-spacing: -0.02em; }
    .content { padding: 32px; }
    .ref-badge { display: inline-block; padding: 6px 16px; background-color: rgba(212, 168, 83, 0.12); border: 1px solid rgba(212, 168, 83, 0.3); border-radius: 9999px; color: #D4A853; font-family: monospace; font-size: 14px; font-weight: bold; margin-bottom: 24px; }
    .details-box { background-color: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #8F9A92; }
    .val { color: #FFFFFF; font-weight: 500; }
    .footer { padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #6B776E; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-sub">Amen Wellness Centre • ${cityName || 'Sanctuary'}</div>
      <h1 class="title">Reservation Confirmed</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 15px; line-height: 1.6;">
        Greetings <strong>${guestName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #A8B5AB;">
        Your reservation at the Amen Men's Wellness Sanctuary in ${cityName || 'our facility'} has been scheduled.
      </p>
      
      <div style="text-align: center; margin: 24px 0 16px;">
        <span class="ref-badge">${bookingRef}</span>
      </div>

      <div class="details-box">
        <div class="row">
          <span class="label">Protocol</span>
          <span class="val">${programName}</span>
        </div>
        <div class="row">
          <span class="label">Date & Time</span>
          <span class="val">${date} at ${timeSlot}</span>
        </div>
        <div class="row">
          <span class="label">Duration</span>
          <span class="val">${durationMinutes || 60} Minutes</span>
        </div>
        <div class="row">
          <span class="label">Total Due on Arrival</span>
          <span class="val" style="color: #D4A853;">${priceFormatted || '—'}</span>
        </div>
        <div class="row">
          <span class="label">Client Phone</span>
          <span class="val">${guestPhone || '—'}</span>
        </div>
        ${notes ? `
        <div class="row">
          <span class="label">Focus Area</span>
          <span class="val">${notes}</span>
        </div>` : ''}
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #8F9A92;">
        Please arrive 10 minutes prior to your session to begin with intake hydration. If you need to make modifications, contact our concierge directly.
      </p>
    </div>
    <div class="footer">
      Amen Wellness Centre — Confidential High-Performance Men's Health & Longevity.<br/>
      Nairobi • New York • Paris
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [guestEmail],
      subject: `Reservation Confirmed: ${programName} (${bookingRef}) — Amen Wellness`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ error: error.message || 'Failed to dispatch email via Resend' });
    }

    return res.status(200).json({
      success: true,
      message: 'Reservation confirmation dispatched via Resend',
      id: data?.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Unhandled email dispatch error:', message);
    return res.status(500).json({ error: message });
  }
}
