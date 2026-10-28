'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Plus,
  Award,
  Briefcase,
  Compass,
  Zap,
  PlusCircle,
  FileSpreadsheet,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';

export default function Navbar() {
  const pathname = usePathname();
  const {
    subscription,
    openPaymentModal,
    currentUser,
    openAuthModal,
    logoutUser,
  } = useGamba();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Enregistrement du Service Worker PWA pour installation Android à Gamba
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Fermer le menu profil quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation publique réservée aux utilisateurs (Accueil, Publier, Mes Annonces, Tarifs)
  // Le Dashboard et la Gestion Clients sont strictement réservés à l'Admin
  const navItems = [
    { href: '/', label: 'Explorer Gamba', shortLabel: 'Accueil', icon: LayoutGrid },
    { href: '/publier', label: 'Publier une annonce', shortLabel: 'Publier', icon: Plus, highlight: true },
    { href: '/mes-annonces', label: 'Mes Annonces', shortLabel: 'Annonces', icon: Briefcase },
    { href: '/tarifs', label: 'Tarifs', shortLabel: 'Tarifs', icon: Award },
  ];

  const getUserInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* Barre supérieure institutionnelle Bleu Nuit & Mobile Money Gabon */}
      <div className="bg-[#0B192C] text-white text-xs py-2 px-4 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
              🇬🇦 GAMBA • DÉPARTEMENT DE NDOUGOU
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              1ère annonce 100% GRATUITE pendant 2 jours pour tous les commerçants de Gamba !
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => openPaymentModal('pro')}
              className="flex items-center gap-1.5 text-sky-300 hover:text-white font-semibold transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Booster via Airtel Money (*150#) / Moov (*555#)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header principal Bleu & Blanc (Glassmorphism Pro) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo Officiel GAMBA BUSINESS */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl overflow-hidden bg-[#1E2229] border border-teal-400/40 flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition">
              <img
                src="/images/logo-gamba-icon.jpg"
                alt="Logo Gamba Business"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900">
                  Gamba <span className="text-emerald-600">business</span>
                </span>
                {subscription.currentPlan !== 'free' && (
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
                    {subscription.currentPlan}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1 font-medium">
                <Compass className="h-3 w-3 text-blue-600" /> Le Portail Officiel des Commerces de Gamba
              </p>
            </div>
          </Link>

          {/* Navigation Desktop Centrale (Uniquement les liens publics + Admin si Admin connecté) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems
              .filter((i) => !i.highlight)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition ml-1"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Mon Dashboard Admin</span>
              </Link>
            )}
          </nav>

          {/* Zone Droite Professionnelle : Compte Utilisateur + Bouton Publier */}
          <div className="flex items-center gap-2 sm:gap-2.5" ref={dropdownRef}>
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300 pl-1.5 pr-3 py-1.5 transition shadow-sm"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-extrabold flex items-center justify-center shadow-sm">
                    {getUserInitials(currentUser.fullName)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[90px] sm:max-w-[130px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Menu Déroulant Compte Professionnel */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {currentUser.email || currentUser.phone}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          Forfait {currentUser.planTier}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          📍 {currentUser.quartier}
                        </span>
                      </div>
                    </div>

                    {/* Les utilisateurs normaux voient uniquement Publier, Mes Annonces et Tarifs */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      <Link
                        href="/publier"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                        <span>Publier une annonce</span>
                      </Link>
                      <Link
                        href="/mes-annonces"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span>Mes annonces publiées</span>
                      </Link>
                      <Link
                        href="/tarifs"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <Award className="h-4 w-4 text-blue-600" />
                        <span>Forfaits &amp; Tarifs</span>
                      </Link>

                      {/* RÉSERVÉ UNIQUEMENT À L'ADMIN : Dashboard, Facturation & Gestion Clients */}
                      {isAdmin && (
                        <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5">
                          <Link
                            href="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition"
                          >
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>Dashboard Admin (Utilisateurs &amp; Paiements)</span>
                          </Link>
                          <Link
                            href="/facturation"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-extrabold text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition"
                          >
                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            <span>Dashboard Facturation &amp; Clients</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-800 font-bold text-xs sm:text-sm px-3.5 py-2.5 shadow-sm transition"
              >
                <User className="h-4 w-4 text-blue-600" />
                <span>Se connecter</span>
              </button>
            )}

            <Link
              href="/publier"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 shadow-md shadow-blue-600/20 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Publier une annonce</span>
              <span className="sm:hidden">Publier</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure Android / Mobile Responsive (Uniquement Accueil, Publier, Annonces, Tarifs) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition ${
                item.highlight
                  ? 'text-blue-700'
                  : isActive
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl ${
                  item.highlight
                    ? 'bg-blue-600 text-white rounded-2xl p-2.5 -mt-5 shadow-lg shadow-blue-600/30 border-2 border-white'
                    : isActive
                    ? 'bg-blue-50 text-blue-600'
                    : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
