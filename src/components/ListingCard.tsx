'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Eye,
  Clock,
  Crown,
} from 'lucide-react';
import { Listing } from '@/lib/types';
import { buildWhatsAppUrl, formatXAF, getDaysRemaining } from '@/lib/mockData';
import { useGamba } from '@/context/GambaContext';

export default function ListingCard({ listing }: { listing: Listing }) {
  const { incrementWhatsAppClick } = useGamba();
  const daysLeft = getDaysRemaining(listing.expiresAt);
  const isExpired = daysLeft <= 0;

  const whatsappUrl = buildWhatsAppUrl(listing.whatsapp, listing.title, listing.price);

  return (
    <div
      className={`group relative flex flex-col rounded-3xl bg-white transition duration-300 overflow-hidden ${
        listing.planTier === 'business'
          ? 'border-2 border-blue-600 shadow-xl shadow-blue-900/10'
          : listing.isBoosted
          ? 'border-2 border-sky-500/80 shadow-md shadow-sky-900/5'
          : 'border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Image + Badges de mise en avant */}
      <Link href={`/annonce/${listing.id}`} className="relative h-52 w-full overflow-hidden bg-slate-900 block">
        <img
          src={
            listing.images[0] ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
          }
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20" />

        {/* Badges Haut Gauche : À la une / Business / Pro */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {listing.planTier === 'business' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-extrabold uppercase text-white shadow-md">
              <Crown className="h-3 w-3" /> SPONSOR VIP
            </span>
          )}
          {listing.isBoosted && listing.planTier !== 'business' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1 text-[10px] font-extrabold uppercase text-white shadow-md">
              <Sparkles className="h-3 w-3" /> À LA UNE
            </span>
          )}
          {listing.hasProBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-blue-800 shadow">
              <ShieldCheck className="h-3 w-3 text-blue-600" /> PRO VÉRIFIÉ
            </span>
          )}
        </div>

        {/* Quartier en bas à gauche de l'image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white">
            <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
            <span className="truncate">{listing.quartier}</span>
          </span>

          <span className="rounded-full bg-blue-50/95 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 shadow">
            {listing.category}
          </span>
        </div>
      </Link>

      {/* Corps de la carte */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-1.5">
          {/* Prix en FCFA bien lisible */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black text-blue-700">
              {formatXAF(listing.price)}
              {listing.priceLabel && (
                <span className="text-xs font-medium text-slate-400 ml-1">
                  {listing.priceLabel}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Eye className="h-3 w-3" /> {listing.views}
            </span>
          </div>

          {/* Titre de l'annonce */}
          <Link
            href={`/annonce/${listing.id}`}
            className="block font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 text-sm sm:text-base leading-snug"
          >
            {listing.title}
          </Link>

          {/* Nom du vendeur / commerce */}
          <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
            <span className="font-medium text-slate-600 truncate">{listing.sellerName}</span>
            {listing.sellerVerified && (
              <ShieldCheck
                className="h-3.5 w-3.5 text-blue-600 shrink-0"
                aria-label="Commerce vérifié à Gamba"
              />
            )}
          </p>
        </div>

        {/* Boutons d'action directe : WhatsApp & Appel */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => incrementWhatsAppClick(listing.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 shadow-sm transition"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${listing.phone}`}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 px-3.5 transition"
            title={`Appeler ${listing.phone}`}
          >
            <Phone className="h-4 w-4 text-blue-700" />
            <span className="sr-only sm:not-sr-only">Appeler</span>
          </a>
        </div>
      </div>

      {/* Bandeau si l'annonce est expirée */}
      {isExpired && (
        <div className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1 text-center flex items-center justify-center gap-1">
          <Clock className="h-3 w-3" /> Annonce expirée (2 jours gratuits écoulés)
        </div>
      )}
    </div>
  );
}
