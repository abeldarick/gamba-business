// ============================================================================
// SERVICE D'ENVOI D'EMAILS OFFICIEL - GAMBA BUSINESS (VIA RESEND API)
// ============================================================================

interface OtpEntry {
  code: string;
  expiresAt: number;
}

// Magasin en mémoire des codes OTP générés (validité 10 minutes)
const otpStore = new Map<string, OtpEntry>();

export function getResendApiKey(): string {
  return (process.env.RESEND_API_KEY || '').trim();
}

/**
 * Génère un code OTP aléatoire à 6 chiffres
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Enregistre le code OTP pour une adresse e-mail donnée (valide 10 minutes)
 */
export function storeOtp(email: string, code: string): void {
  const normalized = email.trim().toLowerCase();
  otpStore.set(normalized, {
    code: code.trim(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Vérifie si le code OTP fourni pour une adresse e-mail est valide
 */
export function verifyOtp(email: string, code: string): { valid: boolean; message: string } {
  const normalized = email.trim().toLowerCase();
  const entry = otpStore.get(normalized);

  if (!entry) {
    return {
      valid: false,
      message: 'Aucun code trouvé pour cet e-mail ou code expiré. Demandez un nouveau code.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return {
      valid: false,
      message: 'Le code a expiré (durée de validité : 10 minutes). Demandez-en un nouveau.',
    };
  }

  if (entry.code !== code.trim()) {
    return {
      valid: false,
      message: 'Code incorrect. Veuillez vérifier les 6 chiffres reçus dans votre e-mail.',
    };
  }

  // Code valide : on le consomme (usage unique)
  otpStore.delete(normalized);
  return {
    valid: true,
    message: 'Code validé avec succès !',
  };
}

/**
 * Envoie un e-mail avec le code de vérification via l'API Resend
 */
export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  userName?: string
): Promise<{ success: boolean; id?: string; error?: string; sandboxHint?: string }> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'Clé API Resend non configurée sur le serveur (RESEND_API_KEY).',
    };
  }

  const normalizedTo = toEmail.trim().toLowerCase();
  const displayName = userName?.trim() || 'Commerçant de Gamba';

  // Template HTML aux couleurs de GAMBA BUSINESS
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Votre code de connexion Gamba Business</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A1628; margin: 0; padding: 20px; color: #0F172A; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(135deg, #0A1628 0%, #155CE6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo-text { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
        .logo-accent { color: #22D3EE; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: bold; color: #1E293B; margin-bottom: 8px; }
        .desc { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .code-box { background: #F0F9FF; border: 2px dashed #0284C7; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1D4ED8; font-family: monospace; }
        .expiry { font-size: 12px; color: #0369A1; font-weight: bold; margin-top: 8px; }
        .security-note { font-size: 12px; color: #64748B; background: #F8FAFC; border-radius: 12px; padding: 14px; line-height: 1.5; margin-top: 24px; }
        .footer { background: #F1F5F9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-text">Gamba <span class="logo-accent">Business</span> 🇬🇦</div>
          <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.85;">Le Portail Officiel des Commerces de Gamba, Gabon</p>
        </div>
        <div class="body">
          <div class="greeting">Bonjour ${displayName},</div>
          <div class="desc">
            Voici votre code de sécurité confidentiel pour valider votre compte ou vous connecter sur <strong>GAMBA BUSINESS</strong> :
          </div>

          <div class="code-box">
            <div class="code">${code}</div>
            <div class="expiry">⏱️ Ce code expire dans 10 minutes</div>
          </div>

          <div class="security-note">
            🔒 <strong>Conseil de sécurité :</strong> Ne partagez jamais ce code avec quiconque. L'équipe de Gamba Business ne vous demandera jamais votre code par WhatsApp ou appel.
          </div>
        </div>
        <div class="footer">
          GAMBA BUSINESS • Département de Ndougou • Province de la Nyanga, Gabon 🇬🇦<br>
          Paiements Mobile Money Airtel Money (*150#) &amp; Moov Money (*555#)
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GAMBA BUSINESS <onboarding@resend.dev>',
        to: [normalizedTo],
        subject: `🇬🇦 ${code} est votre code de connexion Gamba Business`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.message || data?.error || 'Erreur lors de l’envoi de l’e-mail via Resend.';
      return {
        success: false,
        error: errMsg,
        sandboxHint: data?.message?.includes('testing emails to your own email')
          ? 'Mode sandbox Resend actif : seul l’email associé à votre compte Resend peut recevoir des emails tant qu’un nom de domaine n’est pas rattaché.'
          : undefined,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur réseau lors de la connexion à Resend.',
    };
  }
}
