import { NextResponse } from 'next/server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = new Set(['skin', 'hair', 'body', 'everything']);

// Founding-list signup. Set SIGNUP_WEBHOOK_URL (e.g. an n8n, Zapier, Make or
// email-platform webhook) to store signups; without it, requests are only
// validated and logged so the page works end to end in development.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const signup = {
    email,
    name: typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : '',
    phone: typeof body?.phone === 'string' ? body.phone.trim().slice(0, 24) : '',
    interest: INTERESTS.has(body?.interest) ? body.interest : 'everything',
    product: typeof body?.product === 'string' ? body.product.slice(0, 80) : '',
    source: 'landing-page',
    createdAt: new Date().toISOString(),
  };

  const webhook = process.env.SIGNUP_WEBHOOK_URL;
  if (!webhook) {
    console.info('[subscribe] SIGNUP_WEBHOOK_URL not set; signup not stored:', signup.email);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signup),
    });
    // Apps Script web apps always answer HTTP 200, so the real outcome
    // lives in the body's "ok" field rather than the status code.
    const result = await res.json().catch(() => null);
    if (!res.ok || result?.ok !== true) {
      throw new Error(result?.error || `Webhook responded ${res.status}`);
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error('[subscribe] webhook failed', err);
    return NextResponse.json({ error: 'We couldn’t save your spot just now. Please try again.' }, { status: 502 });
  }
}
