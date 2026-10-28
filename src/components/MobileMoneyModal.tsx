'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
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
  const [ussdTimer, setUssdTimer] = useState(3);
  const [txReference, setTxReference] = useState('');

  // Réinitialiser l'état à chaque ouverture du popup
  useEffect(() => {
    if (paymentModalState.isOpen) {
      setStep('form');
      setUssdTimer(3);
    }
  }, [paymentModalState.isOpen, paymentModalState.planId]);

  if (!paymentModalState.isOpen) return null;

  const selectedPlan =
    PRICING_PLANS.find((p) => p.id === paymentModalState.planId) || PRICING_PLANS[1];

  const targetListing = paymentModalState.targetListingId
    ? listings.find((l) => l.id === paymentModalState.targetListingId)
    : undefined;

  // Code USSD officiel Gabon selon l'opérateur
  const ussdCode = operator === 'airtel' ? '*150#' : '*555#';
  const operatorName = operator === 'airtel' ? 'Airtel Money Gabon' : 'Moov Money (Moov Africa)';

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setStep('ussd');
  };

  const handleConfirmUssdPayment = () => {
    const tx = processMobileMoneyPayment({
      operator,
      phoneNumber,
      planId: selectedPlan.id,
      targetListingId: paymentModalState.targetListingId,
    });
    setTxReference(tx.reference);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête CinetPay / Mobile Money Gabon */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gamba-orange text-white font-black text-sm shadow">
              CP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide">CinetPay Gabon</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                  SÉCURISÉ
                </span>
              </div>
              <p className="text-xs text-gray-300">Guichet Airtel Money &amp; Moov Money</p>
            </div>
          </div>
          <button
            onClick={closePaymentModal}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Résumé de la commande */}
        <div className="bg-orange-50/80 border-b border-orange-100 px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block">
              {selectedPlan.name} ({selectedPlan.durationDays} jours)
            </span>
            <p className="text-xs text-gray-600 line-clamp-1">
              {targetListing
                ? `Boost : ${targetListing.title}`
                : 'Activation immédiate sur votre compte vendeur'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-gray-900">
              {formatXAF(selectedPlan.priceXAF)}
            </span>
          </div>
        </div>

        {/* ÉTAPE 1 : CHOIX OPÉRATEUR ET NUMÉRO GABON */}
        {step === 'form' && (
          <form onSubmit={handleInitiatePayment} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                1. Choisissez votre opérateur Mobile Money :
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Bouton Airtel Money */}
                <button
                  type="button"
                  onClick={() => {
                    setOperator('airtel');
                    if (phoneNumber.startsWith('06')) setPhoneNumber('077 45 12 89');
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border-2 transition ${
                    operator === 'airtel'
                      ? 'border-red-600 bg-red-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-600 inline-block" />
                    <span className="font-black text-sm text-red-600">Airtel Money</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">Numéros 074 / 077 / 076</span>
                </button>

                {/* Bouton Moov Money */}
                <button
                  type="button"
                  onClick={() => {
                    setOperator('moov');
                    if (phoneNumber.startsWith('07')) setPhoneNumber('066 89 23 41');
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border-2 transition ${
                    operator === 'moov'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                    <span className="font-black text-sm text-blue-700">Moov Money</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">Numéros 062 / 066 / 065</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                2. Numéro de téléphone {operator === 'airtel' ? 'Airtel' : 'Moov'} (Gabon) :
              </label>
              <div className="relative flex items-center">
                <span className="inline-flex items-center gap-1 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-3 py-3 text-sm font-bold text-gray-700">
                  🇬🇦 +241
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={operator === 'airtel' ? '077 00 00 00' : '066 00 00 00'}
                  className="w-full rounded-r-xl border border-gray-300 px-3.5 py-3 text-sm font-semibold text-gray-900 focus:border-gamba-orange focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500 flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600" />
                Aucun frais caché. Montant exact débité :{' '}
                <strong>{formatXAF(selectedPlan.priceXAF)}</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-black py-3.5 px-4 shadow-lg shadow-orange-500/25 transition text-sm"
            >
              <Smartphone className="h-4 w-4" />
              Continuer vers le paiement ({formatXAF(selectedPlan.priceXAF)})
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ÉTAPE 2 : POPUP USSD "Paiement Mobile Money : Composez *150# ou *555# pour payer" */}
        {step === 'ussd' && (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-gamba-orange animate-pulse">
              <Phone className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1">
                VALIDATION MOBILE MONEY EN COURS
              </span>
              <h3 className="text-lg font-black text-gray-900 pt-1">
                Paiement Mobile Money : Composez{' '}
                <span className="text-gamba-orange underline">{ussdCode}</span> pour payer
              </h3>
              <p className="text-xs text-gray-600">
                Une demande Push CinetPay de <strong>{formatXAF(selectedPlan.priceXAF)}</strong> a été
                envoyée sur votre numéro <strong>+241 {phoneNumber}</strong> ({operatorName}).
              </p>
            </div>

            {/* Boîte d'instruction USSD claire pour Gamba */}
            <div className="rounded-xl bg-gray-900 text-white p-4 text-left space-y-2 border border-gray-800">
              <p className="text-xs text-gray-300 font-medium">
                📱 <strong>Instructions sur votre téléphone :</strong>
              </p>
              <ol className="text-xs text-gray-200 space-y-1.5 list-decimal list-inside">
                <li>
                  Validez le message automatique affiché sur votre écran ou composez{' '}
                  <span className="rounded bg-gamba-orange px-1.5 py-0.5 font-mono font-bold text-white">
                    {ussdCode}
                  </span>
                </li>
                <li>
                  Entrez votre code secret <strong>{operatorName}</strong> pour confirmer{' '}
                  <strong>{formatXAF(selectedPlan.priceXAF)}</strong>.
                </li>
                <li>Cliquez sur le bouton vert ci-dessous dès que c&apos;est fait.</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmUssdPayment}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 shadow-lg shadow-emerald-600/25 transition text-sm"
              >
                <CheckCircle2 className="h-5 w-5" />
                J&apos;ai validé le paiement sur mon téléphone
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 py-1.5"
              >
                ← Changer de numéro ou d&apos;opérateur
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : CONFIRMATION & BOOST AUTOMATIQUE */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" /> PAIEMENT CONFIRMÉ
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">
                Félicitations ! Votre annonce est boostée 🚀
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Votre paiement <strong>{operatorName}</strong> de{' '}
                <strong>{formatXAF(selectedPlan.priceXAF)}</strong> a été validé avec succès.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Référence CinetPay :</span>
                <span className="font-mono font-bold text-gray-900">{txReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offre activée :</span>
                <span className="font-bold text-gamba-orange">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Durée de visibilité :</span>
                <span className="font-bold text-gray-900">{selectedPlan.durationDays} jours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut :</span>
                <span className="font-bold text-emerald-600">En haut des résultats ✓</span>
              </div>
            </div>

            <button
              type="button"
              onClick={closePaymentModal}
              className="w-full rounded-xl bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 text-sm transition"
            >
              Parfait, voir mes annonces boostées
            </button>
          </div>
        )}

        {/* Pied de popup rassurant */}
        <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Support Gamba 7j/7
          </span>
          <span>Airtel Money • Moov Money</span>
        </div>
      </div>
    </div>
  );
}
