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
  Award,
  Crown,
  SlidersHorizontal,
  ArrowRight,
  PlusCircle,
  LayoutGrid,
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
  const { listings, openPaymentModal, openAuthModal, currentUser } = useGamba();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<QuartierGamba | 'Tous'>('Tous');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'Toutes'>('Toutes');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const activeListings = useMemo(() => {
    return listings.filter((item) => getDaysRemaining(item.expiresAt) > 0);
  }, [listings]);

  const bannerListing = useMemo(() => {
    return (
      activeListings.find((item) => item.hasHomeBanner || item.planTier === 'business') ||
      activeListings[0]
    );
  }, [activeListings]);

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

  const featuredListings = useMemo(() => {
    return filteredListings
      .filter((item) => item.isBoosted || item.planTier !== 'free')
      .sort((a, b) => {
        const rank = { business: 3, pro: 2, decouverte: 1, free: 0 };
        return rank[b.planTier] - rank[a.planTier];
      });
  }, [filteredListings]);

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
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* =====================================================================
          1. HERO IMMERSIF BLEU & BLANC AVEC VRAIE PHOTO DE LAGUNE TROPICALE
          ===================================================================== */}
      <section className="relative overflow-hidden bg-[#0B192C] text-white pt-10 pb-16 sm:pt-16 sm:pb-24 px-4">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
          alt="Lagune Ndougou et Plages de Gamba, Gabon"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35 scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11, 25, 44, 0.72) 0%, rgba(11, 25, 44, 0.88) 65%, #0B192C 100%)',
          }}
        />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge de confiance local avec les vrais quartiers de Gamba */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-sky-400/30 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-sky-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span>PLAINE 1 À 5 • LE COULOIR • CENTRE-VILLE • CAMP YENZI • MAYONAMI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12]">
            Tout{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-white">
              Gamba
            </span>{' '}
            dans votre poche.
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            La plateforme de référence pour trouver les meilleurs{' '}
            <strong className="text-white font-semibold">
              Motels, Restaurants de poisson braisé, Bars, Boutiques, Salons et Techniciens
            </strong>{' '}
            à Gamba. Contact direct par WhatsApp.
          </p>

          {/* MOTEUR DE RECHERCHE BLANC & BLEU */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/50 max-w-4xl mx-auto border border-slate-100 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              {/* Champ mot-clé */}
              <div className="md:col-span-5 relative flex items-center">
                <Search className="h-5 w-5 text-blue-600 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Motel, carpe braisée, clim, tresses..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                />
              </div>

              {/* Sélecteur des vrais Quartiers de Gamba */}
              <div className="md:col-span-4 relative flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 absolute left-4 pointer-events-none" />
                <select
                  value={selectedQuartier}
                  onChange={(e) =>
                    setSelectedQuartier(e.target.value as QuartierGamba | 'Tous')
                  }
                  className="w-full pl-11 pr-8 py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 text-slate-900 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer transition"
                >
                  <option value="Tous">📍 Tous les quartiers de Gamba</option>
                  {QUARTIERS_GAMBA.map((quartier) => (
                    <option key={quartier} value={quartier}>
                      Quartier : {quartier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton Filtrer Prix */}
              <div className="md:col-span-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-4 transition shadow-lg shadow-blue-600/25"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filtrer Prix</span>
                </button>
              </div>
            </div>

            {/* Tiroir de filtre par budget en FCFA */}
            {showPriceFilter && (
              <div className="mt-3 pt-3 border-t border-slate-100 px-3 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-slate-500">Budget maximum :</span>
                  <span className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-extrabold">
                    {maxPrice >= 100000 ? 'Tous les tarifs (Illimité)' : formatXAF(maxPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-80">
                  <span className="text-[11px] font-semibold text-slate-400">1 000 F</span>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-400">100 000 F+</span>
                </div>
              </div>
            )}
          </div>

          {/* Raccourcis des Vrais Quartiers de Gamba */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pt-2 text-xs">
            <span className="text-sky-200/80 font-medium shrink-0">Quartiers :</span>
            {(
              [
                'Plaine 1',
                'Plaine 2',
                'Plaine 3',
                'Plaine 4',
                'Plaine 5',
                'Le Couloir',
                'Centre-ville',
              ] as QuartierGamba[]
            ).map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuartier(selectedQuartier === q ? 'Tous' : q)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 font-semibold transition ${
                  selectedQuartier === q
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-white/10 hover:bg-blue-600 border-white/15 text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chiffres clés rassurants (2 Jours gratuits) */}
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto pt-4 border-t border-white/10 text-center">
            <div>
              <p className="text-lg sm:text-2xl font-black text-white">100%</p>
              <p className="text-[11px] text-sky-200/80">Commerces de Gamba</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-sky-300">WhatsApp</p>
              <p className="text-[11px] text-sky-200/80">Contact direct sans intermédiaire</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-white">2 Jours</p>
              <p className="text-[11px] text-sky-200/80">1ère annonce offerte</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BARRE DES 7 CATÉGORIES (STYLE MODERNE BLEU & BLANC)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 -mt-14 relative z-20">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Explorer par secteur d&apos;activité
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Tout afficher
              </button>
            )}
          </div>

          <div className="flex md:grid md:grid-cols-8 gap-2.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('Toutes')}
              className={`shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition min-w-[98px] ${
                selectedCategory === 'Toutes'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-slate-50/70 text-slate-700 border-slate-200/80 hover:border-blue-400'
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 ${
                  selectedCategory === 'Toutes'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100/80 text-blue-700'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </div>
              <span className="text-xs font-extrabold">Tout Gamba</span>
              <span className="text-[10px] opacity-80">{activeListings.length} offres</span>
            </button>

            {CATEGORIES_GAMBA.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;
              const count = activeListings.filter((l) => l.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'Toutes' : cat.id)}
                  className={`shrink-0 flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition min-w-[106px] ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-white text-slate-800 border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center mb-1.5 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold truncate w-full">{cat.id}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {count} {count > 1 ? 'offres' : 'offre'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. VITRINE PHOTO RÉELLE : LA VIE ÉCONOMIQUE À GAMBA (NDOUGOU)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              DÉCOUVRIR GAMBA
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              L&apos;économie locale de Gamba en un clin d&apos;œil
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Cliquez sur un univers pour filtrer les annonces correspondantes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setSelectedCategory('Motels')}
            className="group cursor-pointer relative h-52 rounded-3xl overflow-hidden shadow-md border border-slate-200"
          >
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
              alt="Motels et Résidences à Gamba"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                Séjour &amp; Missions
              </span>
              <h3 className="text-lg font-bold mt-1">Motels &amp; Résidences Climatisées</h3>
              <p className="text-xs text-slate-200">
                Centre-ville, Plaine 1 à 5 &amp; Le Couloir
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('Restaurants')}
            className="group cursor-pointer relative h-52 rounded-3xl overflow-hidden shadow-md border border-slate-200"
          >
            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
              alt="Poisson braisé et Grillades à Gamba"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                Saveurs Locales
              </span>
              <h3 className="text-lg font-bold mt-1">
                Poisson Braisé, Coupé-Coupé &amp; Restos
              </h3>
              <p className="text-xs text-slate-200">
                Carpe fraîche de la lagune, plantain &amp; livraison
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedCategory('Services')}
            className="group cursor-pointer relative h-52 rounded-3xl overflow-hidden shadow-md border border-slate-200"
          >
            <img
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80"
              alt="Salons de coiffure et Services techniques à Gamba"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                Beauté &amp; Artisans
              </span>
              <h3 className="text-lg font-bold mt-1">
                Salons VIP, Froid/Clim &amp; Boutiques
              </h3>
              <p className="text-xs text-slate-200">
                Coiffure, dépannage 24h/7 et commerce général
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. BANNIÈRE PUB ACCUEIL (INCLUSE DANS L'OFFRE BUSINESS 15 000 XAF)
          ===================================================================== */}
      {bannerListing && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-blue-200 bg-[#0B192C] text-white">
            <img
              src={bannerListing.images[0]}
              alt={bannerListing.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C] via-[#0B192C]/90 to-blue-900/60" />
            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2 text-center md:text-left max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/30 border border-sky-400/40 px-3 py-1 text-[10px] font-extrabold uppercase text-sky-200">
                  <Crown className="h-3.5 w-3.5 text-sky-300" /> BANNIÈRE À LA UNE • OFFRE BUSINESS
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {bannerListing.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  📍 {bannerListing.quartier} ({bannerListing.addressHint}) — Tarif :{' '}
                  <strong className="text-sky-300 font-black">
                    {formatXAF(bannerListing.price)} {bannerListing.priceLabel || ''}
                  </strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link
                  href={`/annonce/${bannerListing.id}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 shadow-lg transition"
                >
                  <span>Découvrir l&apos;établissement</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => openPaymentModal('business')}
                  className="inline-flex items-center gap-1 rounded-2xl bg-white/10 hover:bg-white/20 text-sky-200 font-bold text-xs px-4 py-3.5 border border-white/15 backdrop-blur-sm transition"
                >
                  <span>Afficher ma bannière ici (15 000 F)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          5. SECTION "ANNONCES À LA UNE" (BOOSTÉES / PARTENAIRES PRO)
          ===================================================================== */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-sky-50 to-white border border-blue-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Annonces à la une à Gamba
                  </h2>
                  <span className="rounded-full bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 uppercase">
                    PARTENAIRES PRO
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Établissements vérifiés et annonces mises en avant via Airtel Money &amp; Moov
                  Money
                </p>
              </div>
            </div>

            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-4 py-2.5 shadow-sm transition shrink-0"
            >
              <span>Mettre mon commerce à la une (dès 2 000 F)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================================
          6. SECTION "DERNIÈRES ANNONCES" (TOUT GAMBA)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Toutes les annonces récentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {filteredListings.length} commerce(s) et service(s) disponibles
              {selectedQuartier !== 'Tous' ? ` au quartier ${selectedQuartier}` : ' à Gamba'}
            </p>
          </div>

          <Link
            href="/publier"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 transition"
          >
            <PlusCircle className="h-4 w-4 text-sky-400" />
            <span>Publier une annonce (2 jours gratuits)</span>
          </Link>
        </div>

        {latestListings.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center space-y-4 shadow-sm">
            <p className="text-lg font-black text-slate-900">
              Aucune annonce publiée pour le moment
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Toutes les annonces de démonstration ont été retirées. Connectez-vous par
              numéro de téléphone (+241) ou par adresse mail et publiez votre première vraie
              annonce commerciale à Gamba !
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={openAuthModal}
                className="rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-5 py-3 transition"
              >
                🔐 S&apos;inscrire (Mail ou Téléphone)
              </button>
              <Link
                href="/publier"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 shadow-md transition"
              >
                + Publier la 1ère annonce (2 jours gratuits)
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          7. BANDEAU D'ACQUISITION COMMERÇANTS (2 JOURS GRATUITS - BLEU ROYAL)
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-[#0B192C] text-white p-6 sm:p-10 shadow-xl border border-blue-700/50 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/20 border border-sky-300/30 px-3 py-1 text-xs font-bold text-sky-200">
              🚀 DÉVELOPPEZ VOTRE CHIFFRE D&apos;AFFAIRES À GAMBA
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Vous gérez un Motel, un Restaurant, une Boutique ou un Service à Gamba ?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
              Profitez de <strong>2 jours d&apos;essai 100% gratuit</strong> pour votre première
              annonce. Ensuite, restez en tête des recherches dès <strong>2 000 FCFA</strong>{' '}
              payables directement par Airtel Money (<strong>*150#</strong>) ou Moov Money (
              <strong>*555#</strong>).
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/publier"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-sky-50 text-blue-900 font-extrabold text-sm py-4 px-5 shadow-lg transition"
            >
              <PlusCircle className="h-5 w-5 text-blue-600" />
              <span>Publier gratuitement (2 jours)</span>
            </Link>
            <Link
              href="/tarifs"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3.5 px-5 border border-blue-400/30 transition"
            >
              <span>Découvrir les forfaits PRO (2 000 F - 15 000 F)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
