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
  const [txReference, setTxReference] = useState('');

  useEffect(() => {
    if (paymentModalState.isOpen) {
      setStep('form');
    }
  }, [paymentModalState.isOpen, paymentModalState.planId]);

  if (!paymentModalState.isOpen) return null;

  const selectedPlan =
    PRICING_PLANS.find((p) => p.id === paymentModalState.planId) || PRICING_PLANS[1];

  const targetListing = paymentModalState.targetListingId
    ? listings.find((l) => l.id === paymentModalState.targetListingId)
    : undefined;

  const ussdCode = operator === 'airtel' ? '*150#' : '*555#';
  const operatorName = operator === 'airtel' ? 'Airtel Money Gabon' : 'Moov Money Africa';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* En-tête CinetPay Gabon */}
        <div className="bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white font-black text-sm shadow-md">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">CinetPay Gabon</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  🔒 SSL SÉCURISÉ
                </span>
              </div>
              <p className="text-[11px] text-sky-200">Paiement Mobile Money Instantané • Gamba</p>
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

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 rounded-2xl text-white font-extrabold py-4 px-5 shadow-lg transition text-sm ${
                operator === 'airtel'
                  ? 'bg-[#E60000] hover:opacity-95 shadow-red-600/25'
                  : 'bg-[#0055A5] hover:opacity-95 shadow-blue-600/25'
              }`}
            >
              <span>
                Payer avec {operator === 'airtel' ? 'Airtel Money (*150#)' : 'Moov Money (*555#)'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ÉTAPE 2 : POPUP USSD "Paiement Mobile Money : Composez *150# ou *555# pour payer" */}
        {step === 'ussd' && (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 animate-pulse">
              <Phone className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1">
                ATTENTE DE VALIDATION SUR VOTRE TÉLÉPHONE
              </span>
              <h3 className="text-lg font-black text-slate-900 pt-1">
                Paiement Mobile Money : Composez{' '}
                <span className="text-blue-600 underline">{ussdCode}</span> pour payer
              </h3>
              <p className="text-xs text-slate-600">
                Demande Push CinetPay de <strong>{formatXAF(selectedPlan.priceXAF)}</strong> envoyée
                sur le <strong>+241 {phoneNumber}</strong> ({operatorName}).
              </p>
            </div>

            <div className="rounded-2xl bg-[#0B192C] text-white p-4 text-left space-y-2 border border-blue-900">
              <p className="text-xs text-sky-300 font-bold">Instructions simples :</p>
              <ol className="text-xs text-slate-200 space-y-1.5 list-decimal list-inside">
                <li>
                  Composez{' '}
                  <span className="rounded bg-blue-600 px-2 py-0.5 font-mono font-bold text-white">
                    {ussdCode}
                  </span>{' '}
                  ou validez la fenêtre Push CinetPay sur votre téléphone.
                </li>
                <li>
                  Saisissez votre code PIN secret <strong>{operatorName}</strong> pour valider{' '}
                  <strong>{formatXAF(selectedPlan.priceXAF)}</strong>.
                </li>
                <li>Cliquez sur le bouton vert ci-dessous dès que c&apos;est validé !</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmUssdPayment}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-4 shadow-lg shadow-emerald-600/25 transition text-sm"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>J&apos;ai validé le paiement sur mon téléphone</span>
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
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Paiement confirmé ! Annonce boostée 🚀
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Votre paiement <strong>{operatorName}</strong> de{' '}
                <strong>{formatXAF(selectedPlan.priceXAF)}</strong> a été validé avec succès.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Référence CinetPay :</span>
                <span className="font-mono font-bold text-slate-900">{txReference}</span>
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
