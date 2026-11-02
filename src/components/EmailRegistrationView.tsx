'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MailCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { QuartierGamba } from '@/lib/types';
import { QUARTIERS_GAMBA } from '@/lib/mockData';
import {
  sendGmailConfirmationCode,
  verifyGmailConfirmationCode,
  isGmailAddress,
} from '@/services/googleGmailAuthService';

interface EmailRegistrationViewProps {
  onBackToMain: () => void;
  onSuccess: () => void;
}

export default function EmailRegistrationView({
  onBackToMain,
  onSuccess,
}: EmailRegistrationViewProps) {
  const { registerUser } = useGamba();

  // Étape : 'input' (saisie de l'email) ou 'verify' (saisie du code reçu)
  const [step, setStep] = useState<'input' | 'verify'>('input');

  // Champs du formulaire
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('077 ');
  const [quartier, setQuartier] = useState<QuartierGamba>('Centre-ville');
  const [otpCode, setOtpCode] = useState('');

  // États de chargement et retours
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  // 1. Envoi du code de confirmation dans la boîte Gmail
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setDevCode(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const result = await sendGmailConfirmationCode(cleanEmail, fullName);

    setLoading(false);

    if (!result.success && !result.devCode) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    if (result.devCode) {
      setDevCode(result.devCode);
    }

    setFeedback({
      type: 'success',
      text: result.message || `Code de confirmation envoyé à ${cleanEmail} !`,
    });
    setStep('verify');
  };

  // 2. Validation du code à 6 chiffres reçu dans la boîte mail
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (otpCode.trim().length < 6) {
      setFeedback({
        type: 'error',
        text: 'Veuillez saisir les 6 chiffres du code reçu par e-mail.',
      });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const result = await verifyGmailConfirmationCode(cleanEmail, otpCode);

    setLoading(false);

    if (!result.success) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    // Création ou connexion de l'utilisateur avec son vrai profil Gmail
    const calculatedName =
      fullName.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    registerUser({
      fullName: calculatedName,
      authMethod: 'email',
      email: cleanEmail,
      phone: phone.trim() || '077 00 00 00',
      password: `gmail-verified-${Date.now()}`,
      quartier,
    });

    setFeedback({
      type: 'success',
      text: `Félicitations ${calculatedName} ! Votre compte est activé avec succès.`,
    });

    setTimeout(() => {
      onSuccess();
    }, 900);
  };

  return (
    <div className="space-y-5 my-auto">
      {/* Barre de retour */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={onBackToMain}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6BFF] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour au formulaire classique</span>
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
          <ShieldCheck className="h-3 w-3" /> Gmail Vérifié
        </span>
      </div>

      {/* Messages d'alerte ou de confirmation */}
      {feedback && (
        <div
          className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Code affiché en mode développement ou assistance */}
      {devCode && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
          <p className="font-bold">📩 Code de confirmation généré :</p>
          <p className="font-mono text-xl font-black text-amber-800 tracking-wider">
            {devCode}
          </p>
          <p className="text-[11px] text-amber-700">
            (Ce code a été envoyé à votre adresse et est prêt pour validation)
          </p>
        </div>
      )}

      {/* ==================== ÉTAPE 1 : SAISIE DE L'ADRESSE GMAIL ==================== */}
      {step === 'input' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm mx-auto mb-1">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Confirmation par e-mail Gmail
            </h3>
            <p className="text-xs text-slate-500">
              Recevez un code de validation officiel directement dans votre boîte de réception.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Votre adresse Gmail personnelle ou professionnelle *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-nom@gmail.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-[#4285F4] focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-sm"
            />
            {email && isGmailAddress(email) && (
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                ✓ Compte Google / Gmail détecté
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Prénom et Nom (affiché sur vos annonces à Gamba)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Jean Ndong / Commerce Gamba"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#4285F4] focus:outline-none transition shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quartier à Gamba
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value as QuartierGamba)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-[#4285F4] focus:outline-none cursor-pointer"
              >
                {QUARTIERS_GAMBA.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact WhatsApp (+241)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="077 45 12 89"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-bold text-slate-900 focus:border-[#4285F4] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 px-5 shadow-lg transition mt-3 disabled:opacity-50"
          >
            {loading ? (
              <span>⏳ Envoi du code en cours...</span>
            ) : (
              <span>📩 Recevoir mon code de confirmation par e-mail →</span>
            )}
          </button>
        </form>
      )}

      {/* ==================== ÉTAPE 2 : VALIDATION DU CODE À 6 CHIFFRES ==================== */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 text-[#1E6BFF] mx-auto mb-1">
              <MailCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Saisissez le code à 6 chiffres
            </h3>
            <p className="text-xs text-slate-500">
              Un e-mail de sécurité a été expédié à <strong>{email}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
              Code de sécurité reçu :
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[8px] font-mono font-black text-2xl rounded-xl border-2 border-blue-500 bg-blue-50/30 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D63ED] hover:bg-blue-600 text-white font-bold text-sm py-3.5 px-5 shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <span>⏳ Vérification du code...</span>
            ) : (
              <span>Valider le code &amp; Me connecter →</span>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('input');
                setOtpCode('');
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Changer d&apos;adresse e-mail ou renvoyer un code</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
