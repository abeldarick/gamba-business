'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  BedDouble,
  Beer,
  UtensilsCrossed,
  Store,
  Scissors,
  ShoppingBag,
  Shirt,
  Sparkles,
  Crown,
  SlidersHorizontal,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import {
  CATEGORIES_GAMBA,
  QUARTIERS_GAMBA,
  formatXAF,
  getDaysRemaining,
} from '@/lib/mockData';
import { CategoryId, QuartierGamba } from '@/lib/types';
import ListingCard from '@/components/ListingCard';

// Mapping des icônes de catégories
const CATEGORY_ICONS: Record<CategoryId, React.ElementType> = {
  Motels: BedDouble,
  Bars: Beer,
  Restaurants: UtensilsCrossed,
  Boutiques: Store,
  Services: Scissors,
  Alimentation: ShoppingBag,
  Vêtements: Shirt,
};

export default function HomePage() {
  const { listings, openPaymentModal } = useGamba();

  // États des filtres de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<QuartierGamba | 'Tous'>('Tous');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'Toutes'>('Toutes');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Filtrer uniquement les annonces actives (non expirées) sur la page d'accueil publique
  const activeListings = useMemo(() => {
    return listings.filter((item) => getDaysRemaining(item.expiresAt) > 0);
  }, [listings]);

  // Annonce sponsorisée pour la grande bannière d'accueil (Offre BUSINESS 15 000 XAF)
  const bannerListing = useMemo(() => {
    return (
      activeListings.find((item) => item.hasHomeBanner || item.planTier === 'business') ||
      activeListings[0]
    );
  }, [activeListings]);

  // Application des filtres (mot-clé, quartier, catégorie, prix max)
  const filteredListings = useMemo(() => {
    return activeListings.filter((item) => {
      const matchesQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesQuartier =
        selectedQuartier === 'Tous' || item.quartier === selectedQuartier;

      const matchesCategory =
        selectedCategory === 'Toutes' || item.category === selectedCategory;

      const matchesPrice = maxPrice >= 100000 ? true : item.price <= maxPrice;

      return matchesQuery && matchesQuartier && matchesCategory && matchesPrice;
    });
  }, [activeListings, searchQuery, selectedQuartier, selectedCategory, maxPrice]);

  // Section "Annonces à la une" (annonces boostées / Pro / Business)
  const featuredListings = useMemo(() => {
    return filteredListings
      .filter((item) => item.isBoosted || item.planTier !== 'free')
      .sort((a, b) => {
        const rank = { business: 3, pro: 2, decouverte: 1, free: 0 };
        return rank[b.planTier] - rank[a.planTier];
      });
  }, [filteredListings]);

  // Section "Dernières annonces" (triées par date, Pro en priorité)
  const latestListings = useMemo(() => {
    return [...filteredListings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredListings]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedQuartier('Tous');
    setSelectedCategory('Toutes');
    setMaxPrice(100000);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedQuartier !== 'Tous' ||
    selectedCategory !== 'Toutes' ||
    maxPrice < 100000;

  return (
    <div className="space-y-8 pb-8">
      {/* =====================================================================
          1. HERO SECTION - "Tout Gamba dans votre poche" + Recherche Quartier
          ===================================================================== */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white pt-8 pb-12 px-4 overflow-hidden border-b-4 border-gamba-orange">
        {/* Cercles décoratifs chaleureux */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gamba-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-xs font-bold text-amber-300">
            <span>🇬🇦 LE BON COIN DE GAMBA (NDOUGOU)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Tout <span className="text-gamba-orange">Gamba</span> dans votre poche
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            Trouvez en quelques secondes les meilleurs{' '}
            <strong className="text-white">
              Motels, Restaurants, Bars, Boutiques, Salons de coiffure et Services
            </strong>{' '}
            à Gamba. Contactez directement les vendeurs sur WhatsApp !
          </p>

          {/* BARRE DE RECHERCHE PAR MOT-CLÉ ET PAR QUARTIER */}
          <div className="bg-white p-2.5 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* Champ mot-clé */}
              <div className="md:col-span-6 relative flex items-center">
                <Search className="h-5 w-5 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Que cherchez-vous à Gamba ? (ex: Motel, Poisson braisé, Clim...)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-gamba-orange focus:outline-none"
                />
              </div>

              {/* Sélecteur de Quartier de Gamba */}
              <div className="md:col-span-4 relative flex items-center">
                <MapPin className="h-5 w-5 text-gamba-orange absolute left-3.5 pointer-events-none" />
                <select
                  value={selectedQuartier}
                  onChange={(e) =>
                    setSelectedQuartier(e.target.value as QuartierGamba | 'Tous')
                  }
                  className="w-full pl-11 pr-8 py-3 rounded-xl bg-gray-50 text-gray-900 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-gamba-orange focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Tous">📍 Tous les quartiers de Gamba</option>
                  {QUARTIERS_GAMBA.map((quartier) => (
                    <option key={quartier} value={quartier}>
                      Quartier : {quartier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton Filtrer / Prix */}
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl font-black text-sm py-3 px-4 transition ${
                    showPriceFilter || maxPrice < 100000
                      ? 'bg-gray-900 text-white'
                      : 'bg-gamba-orange hover:bg-gamba-darkOrange text-white shadow-md shadow-orange-500/20'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Budget</span>
                </button>
              </div>
            </div>

            {/* Tiroir de filtre par budget en FCFA */}
            {showPriceFilter && (
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 px-3 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span>Budget maximum :</span>
                  <span className="rounded-lg bg-orange-100 text-gamba-orange px-2.5 py-1 font-black">
                    {maxPrice >= 100000 ? 'Tous les prix (Illimité)' : formatXAF(maxPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-72">
                  <span className="text-[11px] text-gray-500">1 000 F</span>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-gamba-orange cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-500">100k+</span>
                </div>
              </div>
            )}
          </div>

          {/* Raccourcis de quartiers rapides */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1 text-xs">
            <span className="text-gray-400 font-medium mr-1">Quartiers populaires :</span>
            {(['Centre-ville', 'Plaine', 'Camp Yenzi', 'Quartier Fougamou', 'Mayonami'] as QuartierGamba[]).map(
              (q) => (
                <button
                  key={q}
                  onClick={() =>
                    setSelectedQuartier(selectedQuartier === q ? 'Tous' : q)
                  }
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    selectedQuartier === q
                      ? 'bg-gamba-orange text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-200'
                  }`}
                >
                  {q}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CATÉGORIES AVEC ICÔNES (Mobile-First Scrollable + Grille)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span>Explorer par catégorie</span>
            {selectedCategory !== 'Toutes' && (
              <span className="text-xs font-bold text-gamba-orange bg-orange-50 px-2.5 py-0.5 rounded-full">
                {selectedCategory}
              </span>
            )}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser les filtres
            </button>
          )}
        </div>

        <div className="flex md:grid md:grid-cols-8 gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {/* Bouton "Toutes" */}
          <button
            onClick={() => setSelectedCategory('Toutes')}
            className={`shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition min-w-[96px] ${
              selectedCategory === 'Toutes'
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gamba-orange'
            }`}
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 ${
                selectedCategory === 'Toutes'
                  ? 'bg-gamba-orange text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold">Tout Gamba</span>
            <span className="text-[10px] opacity-75">{activeListings.length} annonces</span>
          </button>

          {/* Les 7 catégories obligatoires */}
          {CATEGORIES_GAMBA.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = selectedCategory === cat.id;
            const count = activeListings.filter((l) => l.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(isSelected ? 'Toutes' : cat.id)
                }
                className={`shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition min-w-[105px] ${
                  isSelected
                    ? 'bg-gamba-orange text-white border-gamba-orange shadow-md shadow-orange-500/20'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gamba-orange'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 ${
                    isSelected ? 'bg-white/20 text-white' : cat.color
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-extrabold truncate w-full">{cat.id}</span>
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-orange-100' : 'text-gray-400'
                  }`}
                >
                  {count} {count > 1 ? 'offres' : 'offre'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          3. BANNIÈRE PUB ACCUEIL (INCLUSE DANS L'OFFRE BUSINESS 15 000 XAF)
          ===================================================================== */}
      {bannerListing && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-2xl bg-gradient-to-r from-amber-500 via-gamba-orange to-gray-900 p-0.5 shadow-lg">
            <div className="rounded-[14px] bg-gray-900 text-white p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                  <Crown className="h-3.5 w-3.5 text-amber-400" /> BANNIÈRE SPONSORISÉE • OFFRE BUSINESS
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {bannerListing.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 max-w-2xl">
                  📍 {bannerListing.quartier} ({bannerListing.addressHint}) — Dès{' '}
                  <strong className="text-amber-400">{formatXAF(bannerListing.price)}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                <Link
                  href={`/annonce/${bannerListing.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-black text-xs sm:text-sm px-4 py-2.5 shadow transition"
                >
                  <span>Voir l&apos;offre VIP</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => openPaymentModal('business')}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs px-3 py-2.5 border border-white/15 transition"
                >
                  <span>Mettre ma pub ici (15 000 F)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          4. SECTION "ANNONCES À LA UNE" (ANNONCES BOOSTÉES / PAYANTES)
          ===================================================================== */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gamba-orange text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900">
                    Annonces à la une à Gamba
                  </h2>
                  <span className="rounded-full bg-gamba-orange text-white text-[10px] font-black px-2 py-0.5 uppercase">
                    TOP VISIBILITÉ
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Commerces vérifiés et annonces boostées via Airtel Money &amp; Moov Money
                </p>
              </div>
            </div>

            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-gamba-orange hover:text-gamba-darkOrange shrink-0"
            >
              <span>Afficher mon commerce ici (dès 2 000 FCFA)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          5. SECTION "DERNIÈRES ANNONCES" (TOUT GAMBA)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Dernières annonces publiées
            </h2>
            <p className="text-xs text-gray-500">
              {filteredListings.length} annonce(s) trouvée(s)
              {selectedQuartier !== 'Tous' ? ` dans le quartier ${selectedQuartier}` : ' à Gamba'}
              {selectedCategory !== 'Toutes' ? ` • Catégorie ${selectedCategory}` : ''}
            </p>
          </div>

          <Link
            href="/publier"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2.5 transition"
          >
            <PlusCircle className="h-4 w-4 text-gamba-orange" />
            <span>Publier (1ère Gratuite)</span>
          </Link>
        </div>

        {latestListings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center space-y-3">
            <p className="text-base font-bold text-gray-800">
              Aucune annonce ne correspond à votre recherche pour le moment.
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Essayez de choisir &quot;Tous les quartiers&quot; ou soyez le premier commerçant de Gamba à
              publier dans cette catégorie !
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5"
              >
                Afficher toutes les annonces
              </button>
              <Link
                href="/publier"
                className="rounded-xl bg-gamba-orange text-white font-bold text-xs px-4 py-2.5"
              >
                Publier une annonce gratuite
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          6. BANDEAU VENDEURS : MODÈLE FREEMIUM & MOBILE MONEY GABON
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-6 sm:p-8 border border-gray-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gamba-orange/20 border border-gamba-orange/40 px-3 py-1 text-xs font-extrabold text-gamba-orange">
              💼 VOUS AVEZ UN COMMERCE OU UN SERVICE À GAMBA ?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Attirez plus de clients chaque jour sur WhatsApp !
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Testez gratuitement : <strong>votre 1ère annonce est 100% GRATUITE pendant 7 jours</strong>.
              Ensuite, boostez votre visibilité en haut de page dès <strong>2 000 FCFA</strong> par
              Airtel Money ou Moov Money.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-gray-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Contact direct sur votre WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Activation instantanée *150# / *555#
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/publier"
              className="flex items-center justify-center gap-2 rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-black text-sm py-3.5 px-5 shadow-lg shadow-orange-500/25 transition"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Publier gratuitement (7 jours)</span>
            </Link>
            <Link
              href="/tarifs"
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm py-3 px-5 border border-white/15 transition"
            >
              <Smartphone className="h-4 w-4 text-amber-400" />
              <span>Voir les offres PRO (2 000 F - 15 000 F)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
