'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Crown,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { PRICING_PLANS, formatXAF, getDaysRemaining } from '@/lib/mockData';
import { PlanTier } from '@/lib/types';

export default function TarifsPage() {
  const { listings, openPaymentModal, subscription } = useGamba();

  // Permet au vendeur de sélectionner quelle annonce existante il souhaite booster
  const ownerListings = listings.filter((l) => l.isOwner);
  const [selectedListingId, setSelectedListingId] = useState<string>(
    ownerListings[0]?.id || ''
  );

  const handlePayClick = (planId: PlanTier) => {
    openPaymentModal(planId, selectedListingId || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* En-tête de la page Tarifs & Mobile Money Gabon */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-4 py-1 text-xs font-black text-gamba-orange uppercase">
          <Smartphone className="h-4 w-4" /> PAIEMENT INSTANTANÉ AIRTEL MONEY &amp; MOOV MONEY
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Des tarifs simples en <span className="text-gamba-orange">FCFA</span> pour vendre plus à
          Gamba
        </h1>

        <p className="text-sm sm:text-base text-gray-600">
          Commencez avec <strong>1 annonce gratuite pendant 7 jours</strong>. Pour publier plus
          d&apos;annonces, obtenir le badge <strong>PRO</strong> ou rester tout en haut des résultats,
          choisissez votre offre et payez en 10 secondes via Mobile Money !
        </p>

        {/* Sélecteur d'annonce à booster */}
        {ownerListings.length > 0 && (
          <div className="max-w-md mx-auto pt-2">
            <div className="rounded-2xl bg-white p-3.5 border border-gray-200 shadow-sm text-left">
              <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                Choisir l&apos;annonce à booster (ou tout votre compte) :
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900 focus:border-gamba-orange focus:outline-none"
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

      {/* Bandeau Modèle Freemium (Annonce Gratuite 7 jours) */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-black uppercase">
              OFFRE FREEMIUM DE BIENVENUE
            </span>
            <span className="text-sm font-black text-gray-900">0 FCFA / 7 jours</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
            1 annonce standard GRATUITE pendant 7 jours pour tester la plateforme
          </h3>
          <p className="text-xs text-gray-500">
            Idéal pour découvrir GAMBA BUSINESS. Au bout de 7 jours, ou pour apparaître en tête de
            liste dès aujourd&apos;hui, passez sur l&apos;une des 3 offres ci-dessous.
          </p>
        </div>

        <Link
          href="/publier"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-5 py-3 transition"
        >
          <PlusCircle className="h-4 w-4 text-gamba-orange" />
          <span>Publier mon annonce gratuite</span>
        </Link>
      </div>

      {/* LES 3 OFFRES OBLIGATOIRES EN FCFA (DÉCOUVERTE, PRO, BUSINESS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.popular;
          const isBusiness = plan.id === 'business';
          const isCurrentPlan = subscription.currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition ${
                isPopular
                  ? 'bg-gray-900 text-white border-4 border-gamba-orange shadow-2xl shadow-orange-500/20 lg:-translate-y-2'
                  : isBusiness
                  ? 'bg-white text-gray-900 border-2 border-amber-400 shadow-lg'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              {/* Badge Supérieur */}
              {plan.badgeText && (
                <div className=" -mt-10 mb-4 flex justify-center">
                  <span
                    className={`rounded-full px-4 py-1 text-xs font-black uppercase tracking-wide shadow ${
                      isPopular
                        ? 'bg-gamba-orange text-white'
                        : isBusiness
                        ? 'bg-amber-400 text-gray-950'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {plan.badgeText}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                {/* Nom & Sous-titre */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">{plan.name}</h2>
                    {isCurrentPlan && (
                      <span className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black uppercase">
                        ACTIF
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isPopular ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {/* Prix en FCFA (XAF) */}
                <div className="pt-2 border-t border-gray-200/20 flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl sm:text-4xl font-black ${
                      isPopular
                        ? 'text-gamba-orange'
                        : isBusiness
                        ? 'text-amber-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {new Intl.NumberFormat('fr-FR').format(plan.priceXAF)} XAF
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isPopular ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    / {plan.durationDays} jours
                  </span>
                </div>

                {/* Liste des avantages inclus */}
                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isPopular
                            ? 'text-gamba-orange'
                            : isBusiness
                            ? 'text-amber-500'
                            : 'text-emerald-600'
                        }`}
                      />
                      <span className={isPopular ? 'text-gray-100' : 'text-gray-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bouton de paiement CinetPay Airtel Money / Moov Money */}
              <div className="pt-6 mt-6 border-t border-gray-200/20 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handlePayClick(plan.id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl font-black text-xs sm:text-sm py-4 px-4 shadow-lg transition ${
                    isPopular
                      ? 'bg-gamba-orange hover:bg-gamba-darkOrange text-white shadow-orange-500/30'
                      : isBusiness
                      ? 'bg-gradient-to-r from-amber-500 to-gamba-orange hover:opacity-95 text-gray-950'
                      : 'bg-gray-900 hover:bg-black text-white'
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

      {/* Explication du fonctionnement CinetPay Mobile Money Gabon */}
      <div className="rounded-3xl bg-gray-900 text-white p-6 sm:p-8 border border-gray-800 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-2xl font-black">
            Comment fonctionne le paiement Mobile Money à Gamba ?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300">
            Pas besoin de carte bancaire ! Tout se passe directement depuis votre téléphone Android
            avec Airtel Money ou Moov Money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gamba-orange text-white font-black text-sm">
              1
            </span>
            <h4 className="font-bold text-sm">Choisissez votre offre</h4>
            <p className="text-xs text-gray-300">
              Cliquez sur <strong>&quot;Payer avec Airtel Money / Moov Money&quot;</strong> sur l&apos;offre
              Découverte (2 000 F), Pro (5 000 F) ou Business (15 000 F).
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gamba-orange text-white font-black text-sm">
              2
            </span>
            <h4 className="font-bold text-sm">Composez *150# ou *555#</h4>
            <p className="text-xs text-gray-300">
              Entrez votre numéro Gabon (+241 077... ou 066...) et validez le paiement Mobile Money
              sur votre téléphone.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-sm">
              3
            </span>
            <h4 className="font-bold text-sm">Annonce boostée immédiatement !</h4>
            <p className="text-xs text-gray-300">
              Dès confirmation, votre annonce passe automatiquement dans <strong>&quot;Annonces à la
              une&quot;</strong> avec le badge PRO !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
