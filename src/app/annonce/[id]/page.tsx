'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import {
  buildWhatsAppUrl,
  formatXAF,
  getDaysRemaining,
} from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';

export default function AnnonceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    listings,
    incrementView,
    incrementWhatsAppClick,
    openPaymentModal,
  } = useGamba();

  const listingId = typeof params?.id === 'string' ? params.id : '';
  const listing = listings.find((item) => item.id === listingId);

  const [activeImage, setActiveImage] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (listingId) {
      incrementView(listingId);
    }
  }, [listingId]);

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-gray-900">
          Annonce introuvable à Gamba
        </h1>
        <p className="text-sm text-gray-600">
          Cette annonce n&apos;existe plus ou a été retirée par le vendeur.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gamba-orange text-white font-bold text-sm px-5 py-3"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(listing.expiresAt);
  const whatsappUrl = buildWhatsAppUrl(
    listing.whatsapp,
    listing.title,
    listing.price
  );

  // Annonces similaires dans le même quartier ou la même catégorie
  const similarListings = listings
    .filter(
      (item) =>
        item.id !== listing.id &&
        (item.category === listing.category || item.quartier === listing.quartier) &&
        getDaysRemaining(item.expiresAt) > 0
    )
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: listing.title,
          text: `${listing.title} (${formatXAF(listing.price)}) à Gamba sur GAMBA BUSINESS`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {/* Barre retour + Partage */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux annonces
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition"
        >
          <Share2 className="h-4 w-4 text-gamba-orange" />
          <span>{copiedShare ? 'Lien copié ✓' : 'Partager sur WhatsApp'}</span>
        </button>
      </div>

      {/* Grille principale : Galerie photos à gauche / Infos & Contact à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche (7 cols) : Photos + Description + Carte Google Maps */}
        <div className="lg:col-span-7 space-y-6">
          {/* Galerie Photos (Jusqu'à 4 photos) */}
          <div className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-72 sm:h-96 bg-gray-900">
              <img
                src={listing.images[activeImage] || listing.images[0] || '/images/boutique-pro.svg'}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {listing.planTier === 'business' && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-amber-400 text-gray-950 px-3 py-1 text-xs font-black uppercase shadow">
                    <Crown className="h-3.5 w-3.5" /> SPONSOR BUSINESS VIP
                  </span>
                )}
                {listing.isBoosted && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-gamba-orange text-white px-3 py-1 text-xs font-black uppercase shadow">
                    <Sparkles className="h-3.5 w-3.5" /> ANNONCE À LA UNE
                  </span>
                )}
                {listing.hasProBadge && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-gray-900/90 text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-black uppercase shadow">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> VENDEUR PRO VÉRIFIÉ
                  </span>
                )}
              </div>
            </div>

            {/* Miniatures si plusieurs photos */}
            {listing.images.length > 1 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2.5 overflow-x-auto">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 w-24 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImage === idx
                        ? 'border-gamba-orange scale-105 shadow'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description complète */}
          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              Description de l&apos;annonce
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block">Catégorie</span>
                <span className="font-bold text-gray-900">{listing.category}</span>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <span className="text-gray-400 block">Quartier à Gamba</span>
                <span className="font-bold text-gray-900">{listing.quartier}</span>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 col-span-2 sm:col-span-1">
                <span className="text-gray-400 block">Statut validité</span>
                <span
                  className={`font-bold ${
                    daysLeft > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {daysLeft > 0 ? `Active (${daysLeft}j restants)` : 'Expirée'}
                </span>
              </div>
            </div>
          </div>

          {/* Localisation Google Maps à Gamba */}
          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gamba-orange" />
                  <span>Localisation &amp; Repère à Gamba</span>
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  <strong>Quartier {listing.quartier}</strong> — {listing.addressHint}
                </p>
              </div>
              <a
                href={listing.mapsUrl || 'https://www.google.com/maps?q=-2.7258,10.0172'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2.5 transition shrink-0"
              >
                <span>Ouvrir Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Aperçu visuel de la carte de Gamba */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gamba-orange flex items-center justify-center text-white shrink-0 shadow-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-amber-400">
                    POSITION GPS GAMBA (GABON)
                  </span>
                  <h4 className="font-bold text-sm">{listing.addressHint}</h4>
                  <p className="text-xs text-gray-300">
                    Quartier : {listing.quartier} • Département de Ndougou
                  </p>
                </div>
              </div>
              <a
                href={listing.mapsUrl || 'https://www.google.com/maps?q=-2.7258,10.0172'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-extrabold text-xs px-4 py-2.5 shadow transition"
              >
                Itinéraire Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* Colonne Droite (5 cols) : Prix, Boutons WhatsApp / Appeler, Infos Vendeur & Boost */}
        <div className="lg:col-span-5 space-y-5">
          {/* Carte principale Prix + Contact Direct */}
          <div className="rounded-3xl bg-white p-6 border-2 border-gray-200 shadow-md space-y-5 sticky top-20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 font-semibold text-gamba-orange bg-orange-50 px-2.5 py-1 rounded-lg">
                  {listing.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {listing.views} vues
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                {listing.title}
              </h1>

              <div className="pt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-gamba-orange">
                  {formatXAF(listing.price)}
                </span>
                {listing.priceLabel && (
                  <span className="text-sm font-bold text-gray-500">
                    {listing.priceLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Infos Vendeur */}
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-base">
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-gray-900">
                      {listing.sellerName}
                    </h3>
                    {listing.sellerVerified && (
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    📍 {listing.quartier}, Gamba
                  </p>
                </div>
              </div>
              {listing.hasProBadge && (
                <span className="rounded-lg bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 text-[10px] font-black uppercase">
                  PRO VÉRIFIÉ
                </span>
              )}
            </div>

            {/* BOUTONS OBLIGATOIRES : CONTACTER SUR WHATSAPP & APPELER */}
            <div className="space-y-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => incrementWhatsAppClick(listing.id)}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-4 px-5 shadow-lg shadow-emerald-600/25 transition"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Contacter sur WhatsApp</span>
              </a>

              <a
                href={`tel:${listing.phone}`}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-base py-3.5 px-5 shadow transition"
              >
                <Phone className="h-5 w-5 text-gamba-orange" />
                <span>Appeler ({listing.phone})</span>
              </a>
            </div>

            {/* Encadré pour booster cette annonce avec Airtel Money / Moov Money */}
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 border border-orange-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-gamba-orange" />
                  C&apos;est votre annonce ?
                </span>
                <span className="text-[11px] font-bold text-gamba-orange">
                  Dès 2 000 FCFA
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Placez cette annonce tout en haut de GAMBA BUSINESS et obtenez 5x plus d&apos;appels
                en payant par Airtel Money ou Moov Money.
              </p>
              <button
                type="button"
                onClick={() => openPaymentModal('pro', listing.id)}
                className="w-full rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-extrabold text-xs py-2.5 px-4 shadow-sm transition"
              >
                ⚡ Booster avec Airtel Money / Moov Money
              </button>
            </div>

            {/* Conseils de sécurité locaux */}
            <div className="text-[11px] text-gray-500 space-y-1 pt-1 border-t border-gray-100">
              <p className="font-bold text-gray-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Astuce GAMBA BUSINESS :
              </p>
              <p>
                Mentionnez que vous avez vu l&apos;annonce sur <strong>GAMBA BUSINESS</strong> lorsque
                vous écrivez au commerçant sur WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Annonces similaires à Gamba */}
      {similarListings.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-black text-gray-900">
            Autres annonces à découvrir à Gamba
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
