'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Smartphone,
  PlusCircle,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { PRICING_PLANS, formatXAF } from '@/lib/mockData';
import { PlanTier } from '@/lib/types';

export default function TarifsPage() {
  const { listings, openPaymentModal, subscription } = useGamba();

  const ownerListings = listings.filter((l) => l.isOwner);
  const [selectedListingId, setSelectedListingId] = useState<string>(
    ownerListings[0]?.id || ''
  );

  const handlePayClick = (planId: PlanTier) => {
    openPaymentModal(planId, selectedListingId || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs font-extrabold text-blue-700 uppercase">
          <Smartphone className="h-4 w-4" /> PAIEMENT MOBILE MONEY GABON (AIRTEL MONEY &amp; MOOV
          MONEY)
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Boostez vos ventes à Gamba avec nos tarifs en{' '}
          <span className="text-blue-600">FCFA</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600">
          Commencez avec <strong>1 annonce gratuite pendant 2 jours</strong>. Pour publier
          davantage ou rester tout en haut des résultats, activez votre forfait en 10 secondes par
          Mobile Money !
        </p>

        {ownerListings.length > 0 && (
          <div className="max-w-md mx-auto pt-2">
            <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm text-left">
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Choisir l&apos;annonce à booster (ou tout votre compte) :
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">✨ Booster l&apos;ensemble de mes annonces</option>
                {ownerListings.map((item) => (
                  <option key={item.id} value={item.id}>
                    📌 {item.title} ({formatXAF(item.price)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bandeau Modèle Freemium (Annonce Gratuite 2 jours) */}
      <div className="rounded-3xl bg-white border border-blue-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-extrabold uppercase">
              OFFRE D&apos;ESSAI GRATUITE
            </span>
            <span className="text-sm font-black text-slate-900">0 FCFA / 2 jours</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Testez GAMBA BUSINESS avec 1 annonce gratuite pendant 2 jours !
          </h3>
          <p className="text-xs text-slate-500">
            Au bout des 2 jours gratuits, prolongez et boostez votre annonce dès 2 000 FCFA avec
            Airtel Money ou Moov Money.
          </p>
        </div>

        <Link
          href="/publier"
          className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3.5 shadow transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Publier gratuitement (2 jours)</span>
        </Link>
      </div>

      {/* LES 3 OFFRES OBLIGATOIRES EN FCFA (BLEU & BLANC CORPORATE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isBusiness = plan.id === 'business';
          const isCurrentPlan = subscription.currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition ${
                isPopular
                  ? 'bg-gradient-to-b from-blue-900 via-blue-950 to-[#0B192C] text-white border-4 border-blue-500 shadow-2xl shadow-blue-900/30 lg:-translate-y-2'
                  : isBusiness
                  ? 'bg-white text-slate-900 border-2 border-blue-600 shadow-lg'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3.5 py-1 text-[10px] font-extrabold uppercase ${
                      isPopular
                        ? 'bg-blue-500 text-white shadow'
                        : isBusiness
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {plan.badgeText}
                  </span>
                  {isCurrentPlan && (
                    <span className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black uppercase">
                      ACTIF
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight">{plan.name}</h2>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isPopular ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/20 flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl sm:text-4xl font-black ${
                      isPopular
                        ? 'text-sky-300'
                        : isBusiness
                        ? 'text-blue-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {new Intl.NumberFormat('fr-FR').format(plan.priceXAF)} XAF
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isPopular ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    / {plan.durationDays} jours
                  </span>
                </div>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isPopular ? 'text-sky-400' : 'text-blue-600'
                        }`}
                      />
                      <span className={isPopular ? 'text-blue-50' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/20 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handlePayClick(plan.id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl font-extrabold text-xs sm:text-sm py-4 px-4 shadow-lg transition ${
                    isPopular
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30'
                      : isBusiness
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                      : 'bg-slate-900 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <span>Payer avec Airtel Money / Moov Money</span>
                </button>

                <div className="flex items-center justify-center gap-3 text-[11px] opacity-80">
                  <span>🔴 Airtel *150#</span>
                  <span>•</span>
                  <span>🔵 Moov *555#</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
