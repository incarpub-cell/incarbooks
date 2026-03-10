import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === 'false'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function generateAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal Auth Failed: ${text}`);
  }
  const data = await response.json();
  return data.access_token;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderID: string }> }
) {
  try {
    const { orderID } = await params;
    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
