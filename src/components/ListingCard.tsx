'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Listing } from '@/lib/types';
import { buildWhatsAppUrl, formatXAF, getDaysRemaining } from '@/lib/mockData';
import { useGamba } from '@/context/GambaContext';

export default function ListingCard({ listing }: { listing: Listing }) {
  const { incrementWhatsAppClick } = useGamba();
  const daysLeft = getDaysRemaining(listing.expiresAt);
  const isExpired = daysLeft <= 0;

  const whatsappUrl = buildWhatsAppUrl(listing.whatsapp, listing.title, listing.price);

  const formattedDate = new Date(listing.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white transition duration-300 overflow-hidden ${
        listing.planTier === 'business'
          ? 'border-2 border-blue-600 shadow-lg shadow-blue-900/10'
          : listing.isBoosted
          ? 'border border-sky-400/80 shadow-md shadow-sky-900/5'
          : 'border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Image + Badge "Sponsorisé" / "Nouveau" en haut à droite (Style AdFocus) */}
      <Link
        href={`/annonce/${listing.id}`}
        className="relative h-44 w-full overflow-hidden bg-slate-900 block"
      >
        <img
          src={
            listing.images[0] ||
            '/images/gamba-hero-1.jpg'
          }
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/15" />

        {/* Badge en haut à droite exactement comme sur la maquette ("Sponsorisé" ou "Nouveau") */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {listing.isBoosted || listing.planTier !== 'free' ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              Sponsorisé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              Nouveau
            </span>
          )}
        </div>

        {/* Badge Catégorie en haut à gauche */}
        <div className="absolute top-2.5 left-2.5">
          <span className="rounded-lg bg-slate-900/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
            {listing.category}
          </span>
        </div>
      </Link>

      {/* Corps de la carte style AdFocus : Titre gras, Adresse avec épingle, Date à gauche & Prix cyan à droite */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <Link
            href={`/annonce/${listing.id}`}
            className="block font-extrabold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 text-sm leading-snug"
          >
            {listing.title}
          </Link>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {listing.quartier} — {listing.addressHint || listing.sellerName}
            </span>
            {listing.sellerVerified && (
              <ShieldCheck
                className="h-3.5 w-3.5 text-blue-600 shrink-0"
                aria-label="Commerce vérifié à Gamba"
              />
            )}
          </p>
        </div>

        {/* Ligne Date à gauche + Prix Cyan/Bleu à droite (Exactement comme la maquette) */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-slate-400">
            {formattedDate}
          </span>
          <span className="text-sm sm:text-base font-black text-cyan-500">
            {formatXAF(listing.price)}
          </span>
        </div>

        {/* Actions directes WhatsApp & Appel */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => incrementWhatsAppClick(listing.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 shadow-sm transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`tel:${listing.phone}`}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs py-2 px-3 transition"
            title={`Appeler ${listing.phone}`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {isExpired && (
        <div className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 text-center flex items-center justify-center gap-1">
          <Clock className="h-3 w-3" /> Expirée
        </div>
      )}
    </div>
  );
}
