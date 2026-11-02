import { NextRequest, NextResponse } from 'next/server';
import { generateOtpCode, storeOtp, sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Une adresse e-mail valide est requise.' },
        { status: 400 }
      );
    }

    // 1. Génération du code à 6 chiffres
    const code = generateOtpCode();

    // 2. Stockage en mémoire avec expiration à 10 minutes
    storeOtp(email, code);

    // 3. Envoi via l'API Resend
    const result = await sendVerificationEmail(email, code, fullName);

    if (!result.success) {
      // Si Resend est en mode sandbox (domaine non vérifié), avertir avec clarté
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          sandboxHint: result.sandboxHint,
          // En mode sandbox de développement, on fournit le code pour ne jamais bloquer le développeur/propriétaire
          devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Code envoyé avec succès à ${email}. Vérifiez votre boîte de réception (et vos spams).`,
      emailId: result.id,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Erreur interne du serveur.',
      },
      { status: 500 }
    );
  }
}
