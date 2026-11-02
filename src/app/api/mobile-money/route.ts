import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  formatDecimalAmount,
  formatGabonPhone,
  getSasPayApiKey,
  sasPayRequest,
} from '@/lib/saspay';

// Registre serveur des paiements deja livres pour garantir une livraison unique (idempotence metier)
const deliveredPaymentIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'softpay', // 'softpay' | 'checkout' | 'verify' | 'retry' | 'confirm-otp' | 'payout'
      operator = 'airtel', // 'airtel' -> 'airtel_ga', 'moov' -> 'moov_ga'
      phoneNumber = '',
      amount = '2000.00',
      currency = 'XAF',
      country = 'GA',
      planId = 'decouverte',
      listingId = '',
      listingTitle = 'Annonce Gamba Business',
      customerEmail = 'client@gambabusiness.ga',
      customerFirstName = 'Commercant',
      customerLastName = 'Gamba',
      paymentId = '',
      idempotencyKey: clientIdempotencyKey,
      otp = '',
      feeChargeMode = 'ADD_ON',
    } = body;

    // Montant strictement en chaine decimale ("2500.00"), jamais de flottant
    const decimalAmount = formatDecimalAmount(amount);
    const formattedPhone = formatGabonPhone(phoneNumber);
    const networkCode = operator === 'moov' ? 'moov_ga' : 'airtel_ga';

    // Generation ou reutilisation de l'Idempotency-Key obligatoire pour les routes qui deplacent de l'argent
    const idempotencyKey =
      clientIdempotencyKey || crypto.randomUUID();

    // ========================================================================
    // 1. SOFTPAY : POST /payments/softpay/ (avec Idempotency-Key)
    // ========================================================================
    if (action === 'softpay' || action === 'initiate') {
      const payload: Record<string, unknown> = {
        amount: decimalAmount,
        currency,
        country,
        network: networkCode,
        description: `Gamba Business - Forfait ${String(planId).toUpperCase()} (${listingTitle})`,
        fee_charge_mode: feeChargeMode,
        customer: {
          email: customerEmail,
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: formattedPhone,
        },
        metadata: {
          listing_id: listingId,
          plan_id: planId,
        },
      };

      if (otp) {
        payload.otp = String(otp);
      }

      const result = await sasPayRequest<Record<string, unknown>>(
        '/payments/softpay/',
        {
          method: 'POST',
          body: payload,
          idempotencyKey,
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
            retryAfterMs: result.retryAfterMs,
            idempotencyKey,
          },
          { status: result.httpStatus }
        );
      }

      const data = result.data || {};
      const checkoutUrl = String(data.checkout_url || '');

      return NextResponse.json({
        success: true,
        paymentId: String(data.id || ''),
        status: String(data.status || 'PENDING'), // Toujours PENDING tant que verify n'a pas renvoye SUCCESS
        checkout_url: checkoutUrl,
        redirectRequired: checkoutUrl.length > 0,
        charged: String(data.charged || decimalAmount),
        net_amount: String(data.net_amount || decimalAmount),
        currency: String(data.currency || currency),
        network: networkCode,
        idempotencyKey,
      });
    }

    // ========================================================================
    // 2. CHECKOUT HEBERGE : POST /checkout-sessions/
    // ========================================================================
    if (action === 'checkout') {
      const appUrl = (
        process.env.APP_URL || 'https://gamba-business.vercel.app'
      ).replace(/\/$/, '');

      const payload: Record<string, unknown> = {
        amount: decimalAmount,
        currency,
        description: `Gamba Business - Forfait ${String(planId).toUpperCase()}`,
        customer_email: customerEmail,
        customer_name: `${customerFirstName} ${customerLastName}`.trim(),
        country,
        customer_phone: formattedPhone,
        return_url: `${appUrl}/mes-annonces?payment_check=1`,
        fee_charge_mode: feeChargeMode,
        metadata: {
          listing_id: listingId,
          plan_id: planId,
        },
      };

      const result = await sasPayRequest<Record<string, unknown>>(
        '/checkout-sessions/',
        {
          method: 'POST',
          body: payload,
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
          },
          { status: result.httpStatus }
        );
      }

      const data = result.data || {};
      return NextResponse.json({
        success: true,
        sessionId: String(data.id || ''),
        slug: String(data.slug || ''),
        checkout_url: String(data.checkout_url || ''),
      });
    }

    // ========================================================================
    // 3. VERIFICATION STRICTE : GET /payments/{payment_id}/verify/
    // Ne livrer l'acces / activer la pub QUE si status === 'SUCCESS'
    // ========================================================================
    if (action === 'verify') {
      if (!paymentId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'missing_payment_id',
              message:
                'L’identifiant payment_id SasPay est requis pour verifier le paiement.',
            },
          },
          { status: 400 }
        );
      }

      const result = await sasPayRequest<Record<string, unknown>>(
        `/payments/${encodeURIComponent(paymentId)}/verify/`,
        {
          method: 'GET',
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
            retryAfterMs: result.retryAfterMs,
          },
          { status: result.httpStatus }
        );
      }

      const data = result.data || {};
      const status = String(data.status || 'PENDING') as
        | 'PENDING'
        | 'SUCCESS'
        | 'FAILED';

      // REGLE STRICTE : Seul SUCCESS autorise l'activation de l'annonce, une seule fois
      const alreadyDelivered = deliveredPaymentIds.has(paymentId);
      const canDeliverNow = status === 'SUCCESS' && !alreadyDelivered;
      if (canDeliverNow) {
        deliveredPaymentIds.add(paymentId);
      }

      return NextResponse.json({
        success: true,
        paymentId,
        status,
        verified: status === 'SUCCESS',
        deliverAccess: status === 'SUCCESS',
        alreadyDelivered,
        charged: String(data.charged || decimalAmount),
        net_amount: String(data.net_amount || decimalAmount),
        currency: String(data.currency || currency),
      });
    }

    // ========================================================================
    // 4. RETRY D'UN PAIEMENT ECHOUE : POST /payments/{payment_id}/retry/
    // ========================================================================
    if (action === 'retry') {
      if (!paymentId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'missing_payment_id',
              message: 'payment_id requis pour relancer le paiement.',
            },
          },
          { status: 400 }
        );
      }

      const result = await sasPayRequest<Record<string, unknown>>(
        `/payments/${encodeURIComponent(paymentId)}/retry/`,
        {
          method: 'POST',
          body: {},
          idempotencyKey,
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
          },
          { status: result.httpStatus }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        idempotencyKey,
      });
    }

    // ========================================================================
    // 5. CONFIRMATION OTP POST-PUSH : POST /payments/{payment_id}/confirm-otp/
    // ========================================================================
    if (action === 'confirm-otp') {
      if (!paymentId || !otp) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'missing_parameters',
              message: 'payment_id et otp sont requis.',
            },
          },
          { status: 400 }
        );
      }

      const result = await sasPayRequest<Record<string, unknown>>(
        `/payments/${encodeURIComponent(paymentId)}/confirm-otp/`,
        {
          method: 'POST',
          body: { otp: String(otp) },
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
          },
          { status: result.httpStatus }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    // ========================================================================
    // 6. RETRAIT (PAYOUT) : POST /payouts/initialize/ (avec Idempotency-Key)
    // Attention : IP serveur whitelistee requise, sinon 403 ip_not_whitelisted
    // ========================================================================
    if (action === 'payout') {
      const payoutPayload: Record<string, unknown> = {
        amount: decimalAmount,
        currency, // Pas de conversion auto en retrait : doit correspondre au pays
        country,
        method: networkCode,
        description: body.description || 'Retrait Gamba Business',
        customer: {
          email: customerEmail,
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: formattedPhone,
        },
        recipient: {
          msisdn: formattedPhone,
          first_name: customerFirstName,
          last_name: customerLastName,
        },
      };

      const result = await sasPayRequest<Record<string, unknown>>(
        '/payouts/initialize/',
        {
          method: 'POST',
          body: payoutPayload,
          idempotencyKey,
        }
      );

      if (!result.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: result.errorCode,
              message: result.errorMessage,
            },
            idempotencyKey,
          },
          { status: result.httpStatus }
        );
      }

      return NextResponse.json({
        success: true,
        payout: result.data,
        idempotencyKey,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'invalid_action',
          message: `Action non supportee: ${action}`,
        },
      },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'internal_error',
          message:
            err instanceof Error
              ? err.message
              : 'Erreur interne lors de l’appel SasPay.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mobile-money
 * Route de verification de configuration SasPay :
 * Teste GET /countries/ (public) et GET /pricing/my-rates/ (authentifie)
 * Ne renvoie JAMAIS la cle API dans la reponse ni dans les logs.
 */
export async function GET() {
  const hasApiKey = getSasPayApiKey().length > 0;
  const countriesCheck = await sasPayRequest<unknown[]>('/countries/', {
    method: 'GET',
    authenticated: false,
  });

  let gabonNetworks: unknown[] = [];
  let ratesCheckOk = false;

  if (hasApiKey) {
    const ratesRes = await sasPayRequest<Array<Record<string, unknown>>>(
      '/pricing/my-rates/',
      {
        method: 'GET',
        authenticated: true,
      }
    );
    ratesCheckOk = ratesRes.ok;
    if (ratesRes.ok && Array.isArray(ratesRes.data)) {
      gabonNetworks = ratesRes.data
        .filter((r) => r.country_code === 'GA')
        .map((r) => ({
          country_code: r.country_code,
          currency: r.currency,
          network_code: r.network_code,
          network_name: r.network_name,
          payin_available: (r.payin as Record<string, unknown>)?.available,
          otp_required: (r.payin as Record<string, unknown>)?.otp_required,
        }));
    }
  }

  return NextResponse.json({
    service: 'SasPay Official Integration - Gamba Business',
    baseUrl: 'https://api.saspay.me/api/v1',
    configured: hasApiKey,
    countriesEndpointReachable: countriesCheck.ok,
    authenticatedRatesReachable: ratesCheckOk,
    gabonNetworks,
  });
}
