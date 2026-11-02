'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Crown,
  PlusCircle,
  LayoutGrid,
  RotateCcw,
  Sparkles,
  Check,
  TrendingUp,
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

// Les 3 photos authentiques de Gamba animées en arrière-plan de la bannière de recherche
const HERO_SLIDES = [
  {
    src: '/images/gamba-hero-1.jpg',
    label: 'Bars, Maquis & Terrasses Régab à Gamba',
  },
  {
    src: '/images/gamba-hero-2.jpg',
    label: 'Commerces, Sandwichs & Saveurs des Quartiers',
  },
  {
    src: '/images/gamba-hero-3.jpg',
    label: 'Poisson Frais & Fumé de la Lagune Ndougou',
  },
];

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
  const { listings, openPaymentModal, openAuthModal } = useGamba();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<QuartierGamba | 'Tous'>('Tous');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'Toutes'>('Toutes');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [activeHeroSlide, setActiveHeroSlide] = useState<number>(0);

  // Rotation automatique des 3 photos en fond du Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeListings = useMemo(() => {
    return listings.filter((item) => getDaysRemaining(item.expiresAt) > 0);
  }, [listings]);

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

      const matchesMinPrice = item.price >= minPrice;
      const matchesMaxPrice = maxPrice >= 300000 ? true : item.price <= maxPrice;

      return (
        matchesQuery &&
        matchesQuartier &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [activeListings, searchQuery, selectedQuartier, selectedCategory, minPrice, maxPrice]);

  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      const rank = { business: 3, pro: 2, decouverte: 1, free: 0 };
      if (rank[b.planTier] !== rank[a.planTier]) {
        return rank[b.planTier] - rank[a.planTier];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredListings]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedQuartier('Tous');
    setSelectedCategory('Toutes');
    setMinPrice(0);
    setMaxPrice(300000);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ===================================================================
            1. BANNIÈRE DE RECHERCHE HORIZONTALE STYLE ADFOCUS + 3 PHOTOS ANIMÉES
            =================================================================== */}
        <section className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-[#0D213F] p-6 sm:p-8">
          {/* Les 3 photos authentiques de Gamba animées en arrière-plan */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === activeHeroSlide;
              return (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.label}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1500ms] ease-out ${
                    isActive
                      ? 'opacity-60 scale-105'
                      : 'opacity-0 scale-100 pointer-events-none'
                  }`}
                />
              );
            })}
          </div>

          {/* Formes géométriques bleues/cyan style AdFocus + voile de lisibilité */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(90deg, rgba(10, 22, 40, 0.85) 0%, rgba(13, 33, 63, 0.65) 55%, rgba(6, 182, 212, 0.45) 100%)',
            }}
          />
          <div className="absolute -left-10 -top-10 h-44 w-44 rounded-3xl bg-blue-600/35 rotate-12 blur-sm z-[1] pointer-events-none" />
          <div className="absolute -right-8 -bottom-12 h-56 w-56 rounded-3xl bg-cyan-400/30 -rotate-12 blur-sm z-[1] pointer-events-none" />

          {/* Contenu de la bannière de recherche */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow">
                  Recherche de commerces &amp; services à Gamba
                </h1>
                <p className="text-xs sm:text-sm text-cyan-200 font-medium mt-0.5">
                  Motels, Restaurants de poisson braisé, Bars, Boutiques, Salons &amp; Artisans •{' '}
                  <span className="text-white font-bold">{HERO_SLIDES[activeHeroSlide].label}</span>
                </p>
              </div>

              {/* Petits points indicateurs des 3 photos animées */}
              <div className="flex items-center gap-1.5 bg-[#0A1628]/70 border border-white/15 rounded-full px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setActiveHeroSlide(idx)}
                    aria-label={s.label}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeHeroSlide ? 'w-6 bg-cyan-400' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Barre des 4 blocs blancs alignés comme sur le modèle AdFocus */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              {/* 1. Recherche de mots-clés */}
              <div className="md:col-span-4 relative flex items-center bg-white rounded-xl shadow-md">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherche de mots-clés (Motel, poisson, clim...)"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none"
                />
              </div>

              {/* 2. Catégorie */}
              <div className="md:col-span-3 relative flex items-center bg-white rounded-xl shadow-md">
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as CategoryId | 'Toutes')
                  }
                  className="w-full px-4 py-3.5 rounded-xl bg-transparent text-slate-800 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Toutes">Catégorie (Toutes)</option>
                  {CATEGORIES_GAMBA.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Budget / Type */}
              <div className="md:col-span-2 relative flex items-center bg-white rounded-xl shadow-md">
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-3.5 rounded-xl bg-transparent text-slate-800 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                >
                  <option value={300000}>Budget / Type</option>
                  <option value={5000}>Max 5 000 FCFA</option>
                  <option value={15000}>Max 15 000 FCFA</option>
                  <option value={30000}>Max 30 000 FCFA</option>
                  <option value={50000}>Max 50 000 FCFA</option>
                  <option value={100000}>Max 100 000 FCFA</option>
                </select>
              </div>

              {/* 4. Géolocalisation (Quartier Gamba) + Bouton Bleu "Recherche" intégré */}
              <div className="md:col-span-3 flex items-center bg-white rounded-xl p-1 shadow-md">
                <select
                  value={selectedQuartier}
                  onChange={(e) =>
                    setSelectedQuartier(e.target.value as QuartierGamba | 'Tous')
                  }
                  className="w-full pl-3 pr-1 py-2.5 bg-transparent text-slate-800 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer truncate"
                >
                  <option value="Tous">Géolocalisation (Gamba)</option>
                  {QUARTIERS_GAMBA.map((q) => (
                    <option key={q} value={q}>
                      📍 {q}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {}}
                  className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 shadow transition"
                >
                  Recherche
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            2. ARCHITECTURE 3 COLONNES COMME SUR LE MODÈLE PHOTO ADFOCUS :
               - GAUCHE : Panneau Blanc "Filtres" (Sliders Prix + Checkboxes Catégories)
               - CENTRE : Grille "Annonces" (3 cartes par ligne)
               - DROITE : Panneau Blanc "Annonces à la Une & Insights Publicitaires"
            =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ==================== COLONNE GAUCHE : FILTRES (3 cols) ==================== */}
          <aside className="lg:col-span-3 bg-white text-slate-900 rounded-2xl p-5 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">Filtres</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Réinitialiser
              </button>
            </div>

            {/* Curseur Prix 1 : Budget Maximum FCFA */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">Prix Maximum</span>
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                <span>1 000 F</span>
                <span>-</span>
                <span className="text-blue-600">
                  {maxPrice >= 300000 ? '300 000 FCFA' : formatXAF(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={300000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Curseur Prix 2 : Budget Minimum FCFA */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">Prix Minimum</span>
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                <span>{formatXAF(minPrice)}</span>
                <span>-</span>
                <span>50 000 FCFA</span>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Liste de Catégories avec cases à cocher bleues et icônes (Style AdFocus) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Catégories
              </h3>

              <div className="space-y-2.5">
                {/* Toutes les catégories */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Toutes')}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-4 w-4 rounded flex items-center justify-center border transition ${
                        selectedCategory === 'Toutes'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white group-hover:border-blue-400'
                      }`}
                    >
                      {selectedCategory === 'Toutes' && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <LayoutGrid className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                      Tout Gamba
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {activeListings.length}
                  </span>
                </button>

                {CATEGORIES_GAMBA.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id];
                  const isChecked = selectedCategory === cat.id;
                  const count = activeListings.filter((l) => l.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(isChecked ? 'Toutes' : cat.id)
                      }
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-4 w-4 rounded flex items-center justify-center border transition ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-blue-400'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <Icon className="h-4 w-4 text-slate-600" />
                        <span
                          className={`text-xs font-bold transition ${
                            isChecked
                              ? 'text-blue-600'
                              : 'text-slate-700 group-hover:text-blue-600'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtre rapide par Quartier de Gamba dans la barre latérale */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Quartiers de Gamba
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(['Tous', 'Plaine 1', 'Plaine 2', 'Plaine 3', 'Le Couloir', 'Centre-ville', 'Mayonami'] as const).map(
                  (q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuartier(q)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        selectedQuartier === q
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>

          {/* ==================== COLONNE CENTRALE : GRILLE DES ANNONCES (6 cols) ==================== */}
          <div className="lg:col-span-6 space-y-4">
            {/* En-tête "Annonces" + bouton "Filtrer" exactement comme sur la photo */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-white">Annonces</h2>
                <span className="rounded-full bg-blue-600/30 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                  {sortedListings.length} résultat(s)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <LayoutGrid className="h-4 w-4 text-cyan-400" />
                <span>
                  {selectedQuartier === 'Tous' ? 'Tout Gamba' : selectedQuartier}
                </span>
              </div>
            </div>

            {sortedListings.length === 0 ? (
              <div className="rounded-2xl bg-white text-slate-900 p-8 text-center space-y-4 shadow-xl">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PlusCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Aucune annonce publiée pour le moment
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Créez votre compte par téléphone (+241) ou par mail et publiez la première
                    annonce de votre commerce à Gamba (2 jours d&apos;essai gratuit ou publication
                    automatique à la une via SasPay Mobile Money).
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="rounded-xl bg-[#0A1628] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 transition"
                  >
                    🔐 Se connecter / S&apos;inscrire
                  </button>
                  <Link
                    href="/publier"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 shadow-md transition"
                  >
                    + Créer une annonce (2 jours gratuits)
                  </Link>
                </div>

                {/* Aperçu des 3 univers économiques de Gamba avec vos 3 photos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-left">
                  <div
                    onClick={() => setSelectedCategory('Bars')}
                    className="cursor-pointer group relative h-32 rounded-xl overflow-hidden"
                  >
                    <img
                      src="/images/gamba-hero-1.jpg"
                      alt="Bars & Motels Gamba"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] font-bold uppercase text-cyan-300">
                        Bars &amp; Motels
                      </span>
                      <p className="text-xs font-extrabold leading-tight">
                        Maquis &amp; Détente à Gamba
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('Restaurants')}
                    className="cursor-pointer group relative h-32 rounded-xl overflow-hidden"
                  >
                    <img
                      src="/images/gamba-hero-3.jpg"
                      alt="Poisson braisé Gamba"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] font-bold uppercase text-cyan-300">
                        Saveurs Lagune
                      </span>
                      <p className="text-xs font-extrabold leading-tight">
                        Poisson Braisé &amp; Fumé
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedCategory('Alimentation')}
                    className="cursor-pointer group relative h-32 rounded-xl overflow-hidden"
                  >
                    <img
                      src="/images/gamba-hero-2.jpg"
                      alt="Commerces Gamba"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <span className="text-[9px] font-bold uppercase text-cyan-300">
                        Quartiers Plaine 1-5
                      </span>
                      <p className="text-xs font-extrabold leading-tight">
                        Sandwichs &amp; Boutiques
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>

          {/* ==================== COLONNE DROITE : ANNONCES À LA UNE & INSIGHTS (3 cols) ==================== */}
          <aside className="lg:col-span-3 bg-white text-slate-900 rounded-2xl p-5 shadow-xl space-y-6">
            {/* Bloc 1 : Annonces à la Une */}
            <div className="space-y-3">
              <h2 className="text-base font-black text-slate-900">Annonces à la Une</h2>
              <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border border-blue-100 p-4 text-center space-y-3">
                <div className="mx-auto h-20 w-full rounded-xl overflow-hidden relative">
                  <img
                    src="/images/logo-gamba-horizontal.jpg"
                    alt="Gamba Business"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Propulsez votre commerce en tête des recherches à Gamba. Validation automatique
                  dès paiement Mobile Money.
                </p>
                <button
                  type="button"
                  onClick={() => openPaymentModal('pro')}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 shadow-md transition"
                >
                  🚀 Booster mon annonce (dès 2 000 F)
                </button>
              </div>
            </div>

            {/* Bloc 2 : Insights publicitaires rapides (Graphique en barres comme sur la maquette) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900">
                  Insights publicitaires rapides
                </h3>
                <TrendingUp className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-[11px] text-slate-500">
                Visibilité moyenne des commerces sponsorisés à Gamba (Plaine 1-5 &amp; Centre-ville)
              </p>

              {/* Histogramme Bleu/Cyan fidèle à la maquette */}
              <div className="pt-2 pb-1 px-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="h-24 flex items-end justify-between gap-2 pt-4 px-1">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-300 rounded-t-md h-8" />
                    <span className="text-[9px] font-bold text-slate-400">Lun</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-cyan-400 rounded-t-md h-12" />
                    <span className="text-[9px] font-bold text-slate-400">Mar</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t-md h-10" />
                    <span className="text-[9px] font-bold text-slate-400">Mer</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-cyan-400 rounded-t-md h-16" />
                    <span className="text-[9px] font-bold text-slate-400">Jeu</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-600 rounded-t-md h-14" />
                    <span className="text-[9px] font-bold text-slate-400">Ven</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md h-20" />
                    <span className="text-[9px] font-extrabold text-blue-600">Sam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 3 : Visuels d'impact d'annonces de partenaires (Carte sombre en bas à droite comme sur la photo) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-900">
                Visuels d&apos;impact d&apos;annonces de partenaires
              </h3>

              <div
                onClick={() => openPaymentModal('business')}
                className="cursor-pointer group relative rounded-2xl overflow-hidden bg-[#0A1628] text-white p-4 shadow-lg border border-blue-900/60"
              >
                <img
                  src="/images/gamba-hero-1.jpg"
                  alt="Partenaire Gamba Business"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/85 to-transparent" />
                <div className="relative z-10 space-y-2 max-w-[190px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
                    <Crown className="h-3 w-3" /> OFFRE BUSINESS
                  </span>
                  <h4 className="text-xs font-extrabold leading-snug">
                    Visuel d&apos;impact de partenaires à Gamba
                  </h4>
                  <p className="text-[11px] text-sky-200/90">
                    Bannière grand format + Badge PRO Vérifié (15 000 FCFA)
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
