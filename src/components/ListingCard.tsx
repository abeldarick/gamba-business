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
      className={`group relative flex flex-col rounded-2xl bg-white transition duration-200 overflow-hidden ${
        listing.planTier === 'business'
          ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/10'
          : listing.isBoosted
          ? 'border-2 border-gamba-orange/80 shadow-md shadow-orange-500/10'
          : 'border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Image + Badges de mise en avant */}
      <Link href={`/annonce/${listing.id}`} className="relative h-48 w-full overflow-hidden bg-gray-900 block">
        <img
          src={listing.images[0] || '/images/boutique-pro.svg'}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Badges Haut Gauche : À la une / Business / Pro */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {listing.planTier === 'business' && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-1 text-[10px] font-black uppercase text-gray-950 shadow">
              <Crown className="h-3 w-3" /> SPONSOR VIP
            </span>
          )}
          {listing.isBoosted && listing.planTier !== 'business' && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gamba-orange px-2.5 py-1 text-[10px] font-black uppercase text-white shadow">
              <Sparkles className="h-3 w-3" /> À LA UNE
            </span>
          )}
          {listing.hasProBadge && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-amber-400/50 px-2 py-1 text-[10px] font-extrabold text-amber-300 shadow">
              <ShieldCheck className="h-3 w-3 text-amber-400" /> PRO
            </span>
          )}
        </div>

        {/* Quartier en bas à gauche de l'image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/75 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
            <MapPin className="h-3 w-3 text-gamba-orange shrink-0" />
            <span className="truncate">{listing.quartier}</span>
          </span>

          <span className="rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow">
            {listing.category}
          </span>
        </div>
      </Link>

      {/* Corps de la carte */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          {/* Prix en FCFA bien lisible */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black text-gamba-orange">
              {formatXAF(listing.price)}
              {listing.priceLabel && (
                <span className="text-xs font-semibold text-gray-500 ml-1">
                  {listing.priceLabel}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <Eye className="h-3 w-3" /> {listing.views}
            </span>
          </div>

          {/* Titre de l'annonce */}
          <Link
            href={`/annonce/${listing.id}`}
            className="block font-bold text-gray-900 hover:text-gamba-orange transition line-clamp-2 text-sm leading-snug"
          >
            {listing.title}
          </Link>

          {/* Nom du vendeur / commerce */}
          <p className="text-xs text-gray-500 flex items-center gap-1 pt-0.5">
            <span className="font-semibold text-gray-700 truncate">{listing.sellerName}</span>
            {listing.sellerVerified && (
              <ShieldCheck
                className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                title="Commerce vérifié à Gamba"
              />
            )}
          </p>
        </div>

        {/* Boutons d'action directe : WhatsApp & Appel */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
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
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-3 transition"
            title={`Appeler ${listing.phone}`}
          >
            <Phone className="h-4 w-4 text-gray-700" />
            <span className="sr-only sm:not-sr-only">Appeler</span>
          </a>
        </div>
      </div>

      {/* Bandeau si l'annonce est expirée */}
      {isExpired && (
        <div className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 text-center flex items-center justify-center gap-1">
          <Clock className="h-3 w-3" /> Annonce expirée (7 jours écoulés)
        </div>
      )}
    </div>
  );
}
