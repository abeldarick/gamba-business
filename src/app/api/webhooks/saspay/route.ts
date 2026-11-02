import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================================================
// WEBHOOK SASPAY OFFICIEL
// Regles strictes :
// 1. Lire le corps brut (raw body) sans le re-serialiser.
// 2. Verifier que X-Webhook-Timestamp ne s'ecarte pas de plus de 300 secondes.
// 3. Calculer HMAC SHA-256 hex (minuscules) sur "${timestamp}.${rawBody}" avec
//    SASPAY_WEBHOOK_SECRET et comparer en temps constant (timingSafeEqual).
// 4. Traiter les evenements de maniere idempotente et repondre rapidement 200.
// ============================================================================

const processedEvents = new Set<string>();

function verifySasPayWebhook(
  rawBody: Buffer,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  if (!signature || !timestamp || !secret) {
    return false;
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsNum) > 300) {
    return false;
  }

  const prefix = Buffer.from(`${timestamp}.`, 'utf8');
  const signedPayload = Buffer.concat([prefix, rawBody]);

  const expectedHex = crypto
    .createHmac('sha256', Buffer.from(secret, 'utf8'))
    .update(signedPayload)
    .digest('hex')
    .toLowerCase();

  const receivedHex = signature.trim().toLowerCase();

  const expectedBuf = Buffer.from(expectedHex, 'utf8');
  const receivedBuf = Buffer.from(receivedHex, 'utf8');

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

export async function POST(req: NextRequest) {
  const secret = (process.env.SASPAY_WEBHOOK_SECRET || '').trim();
  const signature = req.headers.get('x-webhook-signature') || '';
  const timestamp = req.headers.get('x-webhook-timestamp') || '';
  const headerEvent = req.headers.get('x-webhook-event') || '';

  // Lecture du corps brut exact avant tout parsing JSON
  const arrayBuffer = await req.arrayBuffer();
  const rawBody = Buffer.from(arrayBuffer);

  if (
    !verifySasPayWebhook(rawBody, signature, timestamp, secret)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'invalid_webhook_signature',
          message:
            'Signature X-Webhook-Signature invalide ou X-Webhook-Timestamp > 300s.',
        },
      },
      { status: 401 }
    );
  }

  let parsed: { event?: string; data?: Record<string, unknown> } = {};
  try {
    parsed = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'invalid_json', message: 'Corps JSON invalide.' },
      },
      { status: 400 }
    );
  }

  const eventName = parsed.event || headerEvent;
  const eventData = parsed.data || {};
  const entityId = String(eventData.id || '');
  const dedupKey = `${eventName}:${entityId}:${timestamp}`;

  if (processedEvents.has(dedupKey)) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }
  processedEvents.add(dedupKey);

  // Catalogue officiel des evenements SasPay
  switch (eventName) {
    case 'transaction.created':
    case 'transaction.success':
    case 'transaction.failed':
    case 'transaction.cancelled':
    case 'settlement.requested':
    case 'settlement.approved':
    case 'settlement.success':
    case 'settlement.failed':
    case 'settlement.cancelled':
    case 'wallet_transfer.requested':
    case 'wallet_transfer.completed':
    case 'wallet_transfer.rejected':
    case 'webhook.test':
      break;
    default:
      break;
  }

  return NextResponse.json(
    {
      received: true,
      event: eventName,
    },
    { status: 200 }
  );
}
