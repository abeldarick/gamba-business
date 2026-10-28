'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Crown,
  LayoutDashboard,
  MapPin,
  Sparkles,
  Smartphone,
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
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/publier', label: 'Publier +', icon: PlusCircle, highlight: true },
    { href: '/tarifs', label: 'Tarifs & Boost', icon: Crown },
    { href: '/mes-annonces', label: 'Mes Annonces', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Barre supérieure promo Mobile Money Gabon */}
      <div className="bg-gray-900 text-white text-xs py-1.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-gamba-orange px-2 py-0.5 text-[10px] font-black uppercase text-white">
              🇬🇦 GAMBA - NDOUGOU
            </span>
            <span className="text-gray-200 font-medium hidden sm:inline">
              1ère annonce GRATUITE pendant 7 jours !
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => openPaymentModal('pro')}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Booster via Airtel / Moov Money</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header principal sticky */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo GAMBA BUSINESS */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gamba-orange to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              GB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-gray-900">
                  GAMBA <span className="text-gamba-orange">BUSINESS</span>
                </span>
                {subscription.currentPlan !== 'free' && (
                  <span className="rounded-md bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                    {subscription.currentPlan}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 -mt-0.5">
                <MapPin className="h-3 w-3 text-gamba-orange" /> Le Bon Coin de Gamba, Gabon
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-bold text-sm px-4 py-2.5 shadow-md shadow-orange-500/20 transition"
                  >
                    <Icon className="h-4 w-4" />
                    <span>Publier une annonce</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-orange-50 text-gamba-orange'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bouton rapide Mobile (Publier) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/publier"
              className="flex items-center gap-1 rounded-xl bg-gamba-orange text-white font-bold text-xs px-3 py-2 shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publier</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure Android / Mobile-First (style Jumia / App native) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition ${
                item.highlight
                  ? 'text-gamba-orange'
                  : isActive
                  ? 'text-gamba-orange'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl ${
                  item.highlight
                    ? 'bg-gamba-orange text-white shadow-md shadow-orange-500/30 -mt-3 mb-0.5 p-2'
                    : isActive
                    ? 'bg-orange-50 text-gamba-orange'
                    : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
