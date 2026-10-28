'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Trash2,
  TrendingUp,
  Smartphone,
  ExternalLink,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { formatXAF, getDaysRemaining } from '@/lib/mockData';

export default function MesAnnoncesPage() {
  const {
    listings,
    transactions,
    subscription,
    deleteListing,
    openPaymentModal,
  } = useGamba();

  const [tab, setTab] = useState<'all' | 'active' | 'expired'>('all');

  // Annonces appartenant au vendeur connecté
  const myListings = listings.filter((item) => item.isOwner);
  const activeListings = myListings.filter((item) => getDaysRemaining(item.expiresAt) > 0);
  const expiredListings = myListings.filter((item) => getDaysRemaining(item.expiresAt) <= 0);

  const displayedListings =
    tab === 'active'
      ? activeListings
      : tab === 'expired'
      ? expiredListings
      : myListings;

  const totalViews = myListings.reduce((acc, item) => acc + item.views, 0);
  const totalWhatsApp = myListings.reduce((acc, item) => acc + item.whatsappClicks, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* En-tête Tableau de bord Vendeur (Design Bleu & Blanc) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-extrabold uppercase">
              TABLEAU DE BORD VENDEUR
            </span>
            <span className="rounded-lg bg-[#0B192C] text-sky-300 px-2.5 py-0.5 text-xs font-extrabold uppercase">
              FORFAIT : {subscription.currentPlan.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mes annonces &amp; activité à Gamba
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gérez vos annonces actives (2 jours d&apos;essai gratuit), suivez vos contacts WhatsApp et
            renouvelez vos annonces via Airtel Money ou Moov Money.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => openPaymentModal('pro')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-3 transition"
          >
            <Crown className="h-4 w-4 text-amber-400" />
            <span>Passer en PRO (5 000 F)</span>
          </button>

          <Link
            href="/publier"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-4 py-3 shadow-md shadow-blue-600/20 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nouvelle annonce</span>
          </Link>
        </div>
      </div>

      {/* Statistiques rapides du vendeur */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Annonces Actives</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {activeListings.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            En ligne sur Gamba Business
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Annonces Expirées</span>
            <Clock className="h-4 w-4 text-red-500" />
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-2">
            {expiredListings.length}
          </p>
          <span className="text-[11px] text-slate-500">
            Réactivables via Mobile Money
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Vues Totales</span>
            <Eye className="h-4 w-4 text-blue-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {totalViews}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold">
            Clients intéressés à Gamba
          </span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Clics WhatsApp</span>
            <MessageCircle className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {totalWhatsApp}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Messages &amp; appels directs
          </span>
        </div>
      </div>

      {/* Onglets de filtrage Actives / Expirées */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setTab('all')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              tab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toutes ({myListings.length})
          </button>
          <button
            onClick={() => setTab('active')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              tab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Actives ({activeListings.length})
          </button>
          <button
            onClick={() => setTab('expired')}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              tab === 'expired'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Expirées ({expiredListings.length})
          </button>
        </div>

        {/* Liste des annonces du vendeur */}
        <div className="space-y-3">
          {displayedListings.map((item) => {
            const daysLeft = getDaysRemaining(item.expiresAt);
            const isExpired = daysLeft <= 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white p-4 sm:p-5 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isExpired
                    ? 'border-red-300 bg-red-50/20'
                    : item.isBoosted
                    ? 'border-2 border-blue-600/80 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0] || '/images/boutique-pro.svg'}
                    alt={item.title}
                    className="h-20 w-24 rounded-xl object-cover bg-slate-900 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          <AlertTriangle className="h-3 w-3" /> EXPIRÉE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          ACTIVE • {daysLeft} JOURS RESTANTS
                        </span>
                      )}

                      {item.isBoosted && !isExpired && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          <Sparkles className="h-3 w-3" /> À LA UNE ({item.planTier.toUpperCase()})
                        </span>
                      )}

                      <span className="text-xs text-slate-500">
                        📍 {item.quartier} • {item.category}
                      </span>
                    </div>

                    <Link
                      href={`/annonce/${item.id}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-sm sm:text-base block"
                    >
                      {item.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="font-extrabold text-blue-700">
                        {formatXAF(item.price)}
                      </span>
                      <span>👁️ {item.views} vues</span>
                      <span>💬 {item.whatsappClicks} clics WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'actions Vendeur (Booster / Prolonger / Voir / Supprimer) */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {isExpired ? (
                    <button
                      onClick={() => openPaymentModal('decouverte', item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-sm transition"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>Réactiver (2 000 FCFA)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openPaymentModal('pro', item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2.5 transition"
                    >
                      <TrendingUp className="h-4 w-4 text-sky-400" />
                      <span>Booster en PRO (5 000 F)</span>
                    </button>
                  )}

                  <Link
                    href={`/annonce/${item.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Voir</span>
                  </Link>

                  <button
                    onClick={() => deleteListing(item.id)}
                    className="inline-flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 p-2.5 transition"
                    title="Supprimer cette annonce"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique des paiements Mobile Money (Airtel Money / Moov Money) */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span>Historique de vos paiements Mobile Money (CinetPay Gabon)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Reçus de vos transactions Airtel Money (*150#) et Moov Money (*555#)
            </p>
          </div>
          <Link
            href="/tarifs"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Voir les forfaits →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Aucune transaction Mobile Money enregistrée dans cette session. Cliquez sur{' '}
            <strong>&quot;Booster en PRO&quot;</strong> ou <strong>&quot;Réactiver&quot;</strong> pour tester le
            paiement CinetPay !
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Référence</th>
                  <th className="py-2.5 px-3">Opérateur</th>
                  <th className="py-2.5 px-3">Numéro Gabon</th>
                  <th className="py-2.5 px-3">Offre</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {tx.reference}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {tx.operator === 'airtel' ? (
                        <span className="text-red-600">🔴 Airtel Money</span>
                      ) : (
                        <span className="text-blue-600">🔵 Moov Money</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">+241 {tx.phoneNumber}</td>
                    <td className="py-3 px-3 font-bold uppercase text-blue-600">
                      {tx.planId}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {formatXAF(tx.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                        VALIDÉ ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
