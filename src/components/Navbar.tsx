'use client';

import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';

export default function Navbar() {
  const pathname = usePathname();
  const { subscription, openPaymentModal } = useGamba();

  // Enregistrement du Service Worker PWA pour installation Android à Gamba
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const navItems = [
    { href: '/', label: 'Explorer Gamba', shortLabel: 'Accueil', icon: LayoutGrid },
    { href: '/publier', label: 'Publier une annonce', shortLabel: 'Publier', icon: Plus, highlight: true },
    { href: '/tarifs', label: 'Tarifs & Visibilité', shortLabel: 'Tarifs', icon: Award },
    { href: '/mes-annonces', label: 'Espace Vendeur', shortLabel: 'Mes Annonces', icon: Briefcase },
  ];

  return (
    <>
      {/* Barre supérieure institutionnelle Bleu Nuit & Mobile Money Gabon (2 jours gratuits) */}
      <div className="bg-[#0B192C] text-white text-xs py-2 px-4 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
              🇬🇦 GAMBA • DÉPARTEMENT DE NDOUGOU
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              1ère annonce 100% GRATUITE pendant 2 jours pour tous les commerçants !
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
          {/* Logo GAMBA BUSINESS */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/25 group-hover:scale-105 transition">
              GB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  GAMBA <span className="text-blue-600">BUSINESS</span>
                </span>
                {subscription.currentPlan !== 'free' && (
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
                    {subscription.currentPlan}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Compass className="h-3 w-3 text-blue-600" /> Le Portail Officiel des Commerces de Gamba
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 shadow-md shadow-blue-600/20 transition ml-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bouton rapide Mobile (Publier) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/publier"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 shadow-md shadow-blue-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Publier</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure Android / Mobile Responsive (Bleu & Blanc) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-2 py-1.5 flex items-center justify-around">
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
