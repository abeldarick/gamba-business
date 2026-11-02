import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'L’adresse e-mail et le code à 6 chiffres sont requis.' },
        { status: 400 }
      );
    }

    const check = verifyOtp(email, String(code));

    if (!check.valid) {
      return NextResponse.json(
        { success: false, error: check.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Code vérifié avec succès. Vous êtes connecté !',
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
