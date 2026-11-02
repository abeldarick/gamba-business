// ============================================================================
// CLIENT SERVEUR SASPAY OFFICIEL (https://api.saspay.me/api/v1)
// Conforme a la specification OpenAPI SasPay :
// - Cle API lue exclusivement depuis process.env.SASPAY_API_KEY (jamais en dur)
// - Montants formates en chaines decimales ("2000.00"), jamais de flottants
// - Idempotency-Key envoye sur POST /payments/softpay/, /payouts/initialize/,
//   /wallet-transfers/ et /payments/{payment_id}/retry/
// - Livraison uniquement lorsque GET /payments/{payment_id}/verify/ renvoie SUCCESS
// - Gestion explicite des erreurs HTTP 400, 401, 403, 404, 409, 410, 422, 429
// ============================================================================

export const SASPAY_BASE_URL = 'https://api.saspay.me/api/v1';

export type SasPayStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface SasPayCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface SasPaySoftpayPayload {
  amount: string; // Chaine decimale obligatoire ex: "2000.00"
  currency: string; // Ex: "XAF" pour le Gabon
  country: string; // Ex: "GA"
  network: 'airtel_ga' | 'moov_ga' | string;
  description?: string;
  customer: SasPayCustomer;
  fee_charge_mode?: 'ADD_ON' | 'DEDUCTED';
  metadata?: Record<string, unknown>;
  otp?: string;
}

export interface SasPayCheckoutSessionPayload {
  amount: string; // Chaine decimale ex: "5000.00"
  currency: string; // Ex: "XAF"
  customer_email: string;
  customer_name: string;
  description?: string;
  country?: string;
  customer_phone?: string;
  return_url?: string;
  fee_charge_mode?: 'ADD_ON' | 'DEDUCTED';
  metadata?: Record<string, unknown>;
}

export interface SasPayPayoutPayload {
  amount: string; // Chaine decimale ex: "10000.00"
  currency: string; // Doit correspondre au pays (ex: "XAF" pour "GA")
  country: string; // Ex: "GA"
  customer: SasPayCustomer;
  method: string; // Ex: "airtel_ga" | "moov_ga"
  recipient: {
    msisdn: string;
    first_name?: string;
    last_name?: string;
  };
  description?: string;
  fee_charge_mode?: 'ADD_ON' | 'DEDUCTED';
  metadata?: Record<string, unknown>;
}

export function getSasPayApiKey(): string {
  const key = process.env.SASPAY_API_KEY || '';
  return key.trim();
}

/**
 * Formate un montant numerique ou chaine en chaine decimale stricte ("2500.00")
 * Ne renvoie jamais de flottant.
 */
export function formatDecimalAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Montant invalide : doit etre un nombre positif.');
  }
  return num.toFixed(2);
}

/**
 * Normalise un numero de telephone gabonais au format international +241XXXXXXXX
 */
export function formatGabonPhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '+241077000000';
  if (digits.startsWith('241')) return `+${digits}`;
  if (digits.startsWith('0')) return `+241${digits.slice(1)}`;
  return `+241${digits}`;
}

export interface SasPayResult<T = Record<string, unknown>> {
  ok: boolean;
  httpStatus: number;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
  retryAfterMs?: number;
}

/**
 * Traduit les codes HTTP SasPay (400, 401, 403, 404, 409, 410, 422, 429)
 * selon les regles officielles de la specification OpenAPI.
 */
export function mapSasPayHttpError(
  status: number,
  body: Record<string, unknown> | null
): { code: string; message: string; retryAfterMs?: number } {
  const errObj = (body?.error as Record<string, unknown>) || {};
  const apiCode = String(errObj.code || body?.code || `http_${status}`);
  const apiMsg = String(errObj.message || '');

  switch (status) {
    case 400:
      return {
        code: apiCode,
        message: apiMsg || 'Requete invalide (champ manquant ou mal forme).',
      };
    case 401:
      return {
        code: 'unauthorized',
        message:
          'Cle API SasPay absente, invalide ou expiree (SASPAY_API_KEY). Ne pas reessayer.',
      };
    case 403:
      if (apiCode === 'ip_not_whitelisted') {
        return {
          code: 'ip_not_whitelisted',
          message:
            "L'adresse IP du serveur n'est pas whitelistee dans le tableau de bord SasPay pour les retraits.",
        };
      }
      return {
        code: apiCode,
        message:
          apiMsg ||
          'Acces refuse (compte suspendu, ressource non rattachee ou IP non whitelistee).',
      };
    case 404:
      return {
        code: 'not_found',
        message: apiMsg || 'Transaction ou ressource SasPay introuvable.',
      };
    case 409:
      return {
        code: 'idempotency_conflict',
        message:
          apiMsg ||
          "Conflit d'idempotence ou appel en cours : verifiez le statut avant toute nouvelle tentative.",
      };
    case 410:
      return {
        code: 'expired',
        message: apiMsg || 'Session ou lien de paiement expire.',
      };
    case 422:
      return {
        code: apiCode,
        message:
          apiMsg ||
          `Operation impossible en l'etat (${apiCode} : ex. insufficient_balance, currency_country_mismatch, prepayment_otp_missing).`,
      };
    case 429:
      return {
        code: 'rate_limit_exceeded',
        message:
          'Limite de debit SasPay atteinte (300 req/min). Veuillez patienter avant de reessayer.',
        retryAfterMs: 5000,
      };
    default:
      return {
        code: apiCode,
        message: apiMsg || `Erreur SasPay HTTP ${status}.`,
      };
  }
}

/**
 * Appel generique authentifie vers https://api.saspay.me/api/v1
 */
export async function sasPayRequest<T = Record<string, unknown>>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    idempotencyKey?: string;
    authenticated?: boolean;
  } = {}
): Promise<SasPayResult<T>> {
  const {
    method = 'GET',
    body,
    idempotencyKey,
    authenticated = true,
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (authenticated) {
    const apiKey = getSasPayApiKey();
    if (!apiKey) {
      return {
        ok: false,
        httpStatus: 401,
        errorCode: 'missing_api_key',
        errorMessage:
          'Variable SASPAY_API_KEY non configuree sur le serveur.',
      };
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const url = `${SASPAY_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = (await response.json()) as Record<string, unknown>;
  } catch {
    parsed = null;
  }

  if (!response.ok || parsed?.success === false) {
    const mapped = mapSasPayHttpError(response.status, parsed);
    return {
      ok: false,
      httpStatus: response.status,
      errorCode: mapped.code,
      errorMessage: mapped.message,
      retryAfterMs: mapped.retryAfterMs,
    };
  }

  return {
    ok: true,
    httpStatus: response.status,
    data: ((parsed?.data !== undefined ? parsed.data : parsed) as T),
  };
}
