'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { PRICING_PLANS, formatXAF } from '@/lib/mockData';
import { MobileMoneyOperator } from '@/lib/types';

export default function MobileMoneyModal() {
  const {
    paymentModalState,
    closePaymentModal,
    processMobileMoneyPayment,
    listings,
  } = useGamba();

  const [operator, setOperator] = useState<MobileMoneyOperator>('airtel');
  const [phoneNumber, setPhoneNumber] = useState('077 45 12 89');
  const [step, setStep] = useState<'form' | 'ussd' | 'success'>('form');
  const [paymentId, setPaymentId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [chargedAmount, setChargedAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiProcessing, setApiProcessing] = useState(false);

  useEffect(() => {
    if (paymentModalState.isOpen) {
      setStep('form');
      setApiProcessing(false);
      setApiError('');
      setPaymentId('');
      setIdempotencyKey(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      );
    }
  }, [paymentModalState.isOpen, paymentModalState.planId]);

  if (!paymentModalState.isOpen) return null;

  const selectedPlan =
    PRICING_PLANS.find((p) => p.id === paymentModalState.planId) || PRICING_PLANS[1];

  const targetListing = paymentModalState.targetListingId
    ? listings.find((l) => l.id === paymentModalState.targetListingId)
    : undefined;

  const ussdCode = operator === 'airtel' ? '*150#' : '*555#';
  const operatorName = operator === 'airtel' ? 'Airtel Gabon' : 'Moov Money Gabon';

  // 1. Initiation SasPay : POST /payments/softpay/ (montant en chaine decimale + Idempotency-Key)
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || apiProcessing) return;
    setApiProcessing(true);
    setApiError('');

    const decimalAmount = selectedPlan.priceXAF.toFixed(2); // Chaine decimale ex: "5000.00"

    try {
      const res = await fetch('/api/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'softpay',
          operator,
          phoneNumber,
          amount: decimalAmount,
          currency: 'XAF',
          country: 'GA',
          planId: selectedPlan.id,
          listingId: paymentModalState.targetListingId || '',
          listingTitle: targetListing?.title || 'Annonce Gamba Business',
          idempotencyKey,
        }),
      });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        setApiError(
          data?.error?.message ||
            'Impossible d’initialiser le paiement SasPay. Vérifiez le numéro.'
        );
        setApiProcessing(false);
        return;
      }

      if (data?.paymentId) {
        setPaymentId(data.paymentId);
      }
      if (data?.charged) setChargedAmount(String(data.charged));
      if (data?.net_amount) setNetAmount(String(data.net_amount));

      // Regle SasPay : Si checkout_url est non vide apres un softpay, rediriger le client vers cette URL
      if (data?.checkout_url && String(data.checkout_url).trim().length > 0) {
        window.location.href = String(data.checkout_url);
        return;
      }

      setStep('ussd');
    } catch {
      setApiError('Erreur réseau lors de la connexion au serveur de paiement.');
    } finally {
      setApiProcessing(false);
    }
  };

  // 2. Verification stricte SasPay : GET /payments/{payment_id}/verify/
  // Ne livrer l'acces / activer la pub QUE lorsque verify renvoie SUCCESS
  const handleConfirmUssdPayment = async () => {
    if (apiProcessing) return;
    setApiProcessing(true);
    setApiError('');

    try {
      const res = await fetch('/api/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          paymentId,
          amount: selectedPlan.priceXAF.toFixed(2),
          currency: 'XAF',
        }),
      });
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        setApiError(
          data?.error?.message ||
            'Impossible de vérifier le paiement auprès de SasPay.'
        );
        setApiProcessing(false);
        return;
      }

      if (data.status === 'PENDING') {
        setApiError(
          'Paiement toujours en attente (PENDING). Veuillez valider le Push sur votre téléphone puis réessayer.'
        );
        setApiProcessing(false);
        return;
      }

      if (data.status === 'FAILED') {
        setApiError(
          'Le paiement a échoué (FAILED). Vous pouvez relancer sans recréer de transaction.'
        );
        setApiProcessing(false);
        return;
      }

      if (data.status === 'SUCCESS') {
        processMobileMoneyPayment({
          operator,
          phoneNumber,
          planId: selectedPlan.id,
          targetListingId: paymentModalState.targetListingId,
          reference: data.paymentId || paymentId,
          charged: data.charged || chargedAmount || selectedPlan.priceXAF.toFixed(2),
          net_amount: data.net_amount || netAmount || selectedPlan.priceXAF.toFixed(2),
        });
        setChargedAmount(String(data.charged || selectedPlan.priceXAF.toFixed(2)));
        setNetAmount(String(data.net_amount || selectedPlan.priceXAF.toFixed(2)));
        setStep('success');
      }
    } catch {
      setApiError('Erreur lors de la vérification du statut SasPay.');
    } finally {
      setApiProcessing(false);
    }
  };

  // Relancer un paiement echoue via POST /payments/{payment_id}/retry/ avec Idempotency-Key
  const handleRetryPayment = async () => {
    if (!paymentId || apiProcessing) return;
    setApiProcessing(true);
    setApiError('');
    try {
      const retryKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `retry-${Date.now()}`;
      const res = await fetch('/api/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry',
          paymentId,
          idempotencyKey: retryKey,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setApiError(data?.error?.message || 'Échec de la relance du paiement.');
      } else {
        setApiError('');
      }
    } catch {
      setApiError('Erreur réseau lors de la relance.');
    } finally {
      setApiProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* En-tête API Live Mobile Money Gabon */}
        <div className="bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-black text-xs shadow-md">
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">Mobile Money Gabon</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  🔒 API LIVE CONNECTÉE
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                Validation &amp; Publication Automatique • Gamba
              </p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bandeau Récapitulatif de la Commande */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 block">
              {selectedPlan.name} ({selectedPlan.durationDays} JOURS)
            </span>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              {targetListing
                ? `Boost : ${targetListing.title}`
                : 'Activation immédiate sur votre compte'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Total à payer
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatXAF(selectedPlan.priceXAF)}
            </span>
          </div>
        </div>

        {/* ÉTAPE 1 : FORMULAIRE DESIGN AVEC VRAIS LOGOS AIRTEL MONEY & MOOV MONEY */}
        {step === 'form' && (
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                1. Sélectionnez votre opérateur Mobile Money :
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Carte Opérateur AIRTEL MONEY GABON avec Logo Officiel SVG */}
                <button
                  type="button"
                  onClick={() => {
                    setOperator('airtel');
                    if (phoneNumber.startsWith('06')) setPhoneNumber('077 45 12 89');
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-2xl p-4 border-2 transition ${
                    operator === 'airtel'
                      ? 'border-[#E60000] bg-red-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-red-300'
                  }`}
                >
                  {operator === 'airtel' && (
                    <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#E60000] text-white flex items-center justify-center text-[11px] font-black shadow">
                      ✓
                    </div>
                  )}
                  <div className="h-12 w-28 rounded-xl bg-[#E60000] flex flex-col items-center justify-center px-3 py-1.5 shadow-sm mb-2">
                    <svg viewBox="0 0 140 42" className="w-full h-full">
                      <path
                        d="M18 8 C10 8, 6 15, 10 22 C14 28, 24 26, 26 18 C28 12, 24 8, 18 8 Z"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <text
                        x="76"
                        y="21"
                        fontFamily="Arial, sans-serif"
                        fontSize="17"
                        fontWeight="900"
                        fill="#FFFFFF"
                        textAnchor="middle"
                        letterSpacing="0.5"
                      >
                        airtel
                      </text>
                      <text
                        x="76"
                        y="34"
                        fontFamily="Arial, sans-serif"
                        fontSize="10"
                        fontWeight="800"
                        fill="#FFE4E6"
                        textAnchor="middle"
                        letterSpacing="1.5"
                      >
                        MONEY
                      </text>
                    </svg>
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Airtel Money</span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    074 • 077 • 076 (*150#)
                  </span>
                </button>

                {/* Carte Opérateur MOOV MONEY GABON avec Logo Officiel SVG */}
                <button
                  type="button"
                  onClick={() => {
                    setOperator('moov');
                    if (phoneNumber.startsWith('07')) setPhoneNumber('066 89 23 41');
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-2xl p-4 border-2 transition ${
                    operator === 'moov'
                      ? 'border-[#0055A5] bg-blue-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-400'
                  }`}
                >
                  {operator === 'moov' && (
                    <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#0055A5] text-white flex items-center justify-center text-[11px] font-black shadow">
                      ✓
                    </div>
                  )}
                  <div className="h-12 w-28 rounded-xl bg-gradient-to-r from-[#0055A5] to-[#003B73] flex flex-col items-center justify-center px-3 py-1.5 shadow-sm mb-2 relative overflow-hidden">
                    <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-[#FF6B00]" />
                    <svg viewBox="0 0 140 42" className="w-full h-full relative z-10">
                      <text
                        x="68"
                        y="20"
                        fontFamily="Arial, sans-serif"
                        fontSize="16"
                        fontWeight="900"
                        fill="#FFFFFF"
                        textAnchor="middle"
                      >
                        Moov
                      </text>
                      <text
                        x="68"
                        y="34"
                        fontFamily="Arial, sans-serif"
                        fontSize="10"
                        fontWeight="800"
                        fill="#FF9E44"
                        textAnchor="middle"
                        letterSpacing="1.2"
                      >
                        MONEY
                      </text>
                    </svg>
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Moov Money</span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    062 • 066 • 065 (*555#)
                  </span>
                </button>
              </div>
            </div>

            {/* Champ Numéro de téléphone avec indicateur d'opérateur dynamique */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  2. Numéro de téléphone à débiter :
                </label>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    operator === 'airtel'
                      ? 'bg-red-100 text-[#E60000]'
                      : 'bg-blue-100 text-[#0055A5]'
                  }`}
                >
                  {operatorName}
                </span>
              </div>
              <div className="flex rounded-2xl shadow-sm">
                <span className="inline-flex items-center gap-1.5 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-100 px-3.5 py-3.5 text-sm font-extrabold text-slate-700">
                  🇬🇦 +241
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={operator === 'airtel' ? '077 00 00 00' : '066 00 00 00'}
                  className="w-full rounded-r-2xl border border-slate-300 px-4 py-3.5 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Aucun frais supplémentaire. Activation automatique après confirmation.</span>
              </p>
            </div>

            {apiError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={apiProcessing}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl text-white font-extrabold py-4 px-5 shadow-lg transition text-sm ${
                operator === 'airtel'
                  ? 'bg-[#E60000] hover:opacity-95 shadow-red-600/25'
                  : 'bg-[#0055A5] hover:opacity-95 shadow-blue-600/25'
              }`}
            >
              <span>
                {apiProcessing
                  ? 'Connexion à SasPay...'
                  : `Payer avec ${
                      operator === 'airtel' ? 'Airtel Money (*150#)' : 'Moov Money (*555#)'
                    }`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ÉTAPE 2 : PUSH SASPAY USSD + VÉRIFICATION STRICTE GET /payments/{payment_id}/verify/ */}
        {step === 'ussd' && (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 animate-pulse">
              <Phone className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1">
                ATTENTE DE VALIDATION SASPAY (STATUT: PENDING)
              </span>
              <h3 className="text-lg font-black text-slate-900 pt-1">
                Paiement Mobile Money : Composez{' '}
                <span className="text-blue-600 underline">{ussdCode}</span> pour payer
              </h3>
              <p className="text-xs text-slate-600">
                Demande Softpay SasPay de{' '}
                <strong>{selectedPlan.priceXAF.toFixed(2)} XAF</strong> envoyée sur le{' '}
                <strong>+241 {phoneNumber}</strong> ({operatorName}).
              </p>
            </div>

            {apiError && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-800 text-left space-y-2">
                <p>{apiError}</p>
                {paymentId && (
                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    className="rounded-lg bg-amber-600 text-white px-3 py-1.5 text-[11px] font-extrabold"
                  >
                    Relancer le Push SasPay (Retry Idempotent)
                  </button>
                )}
              </div>
            )}

            <div className="rounded-2xl bg-[#0B192C] text-white p-4 text-left space-y-2 border border-blue-900">
              <p className="text-xs text-sky-300 font-bold">Instructions SasPay :</p>
              <ol className="text-xs text-slate-200 space-y-1.5 list-decimal list-inside">
                <li>
                  Composez{' '}
                  <span className="rounded bg-blue-600 px-2 py-0.5 font-mono font-bold text-white">
                    {ussdCode}
                  </span>{' '}
                  ou validez la fenêtre Push Mobile Money sur votre téléphone.
                </li>
                <li>
                  Saisissez votre code PIN secret <strong>{operatorName}</strong>.
                </li>
                <li>
                  Cliquez ci-dessous : le serveur vérifie{' '}
                  <code>GET /payments/&#123;id&#125;/verify/</code> et active votre annonce
                  uniquement sur statut <strong>SUCCESS</strong>.
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={apiProcessing}
                onClick={handleConfirmUssdPayment}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-4 shadow-lg shadow-emerald-600/25 transition text-sm"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {apiProcessing
                    ? 'Vérification SasPay en cours...'
                    : 'Vérifier le paiement SasPay & Activer ma pub'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
              >
                ← Changer d&apos;opérateur ou de numéro
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : CONFIRMATION SASPAY (STATUT: SUCCESS) & BOOST AUTOMATIQUE */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" /> STATUT SASPAY : SUCCESS • PUB ACTIVÉE
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Paiement vérifié ! Votre pub est en ligne 🚀
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                La vérification officielle SasPay a confirmé le statut <strong>SUCCESS</strong>.
                Votre annonce est automatiquement approuvée et mise à la une.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">ID Transaction SasPay :</span>
                <span className="font-mono font-bold text-slate-900">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant débité (charged) :</span>
                <span className="font-mono font-bold text-slate-900">
                  {chargedAmount || selectedPlan.priceXAF.toFixed(2)} XAF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant net marchand (net_amount) :</span>
                <span className="font-mono font-bold text-emerald-700">
                  {netAmount || selectedPlan.priceXAF.toFixed(2)} XAF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Offre activée :</span>
                <span className="font-bold text-blue-600">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durée de visibilité :</span>
                <span className="font-bold text-slate-900">{selectedPlan.durationDays} jours</span>
              </div>
            </div>

            <button
              type="button"
              onClick={closePaymentModal}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 text-sm transition shadow-md"
            >
              Voir mes annonces boostées
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
