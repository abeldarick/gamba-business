'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Plus,
  Award,
  Briefcase,
  PlusCircle,
  FileSpreadsheet,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Bell,
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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation style AdFocus adaptée à Gamba Business
  const navItems = [
    { href: '/', label: 'Rechercher', shortLabel: 'Rechercher', icon: LayoutGrid },
    { href: '/mes-annonces', label: 'Mes Campagnes', shortLabel: 'Campagnes', icon: Briefcase },
    { href: '/tarifs', label: 'Forfaits & Tarifs', shortLabel: 'Tarifs', icon: Award },
    { href: '/publier', label: 'Créer une annonce', shortLabel: 'Publier', icon: Plus, highlight: true },
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
      {/* Header Principal Sombre Style AdFocus (#0A1628) */}
      <header className="sticky top-0 z-40 bg-[#0A1628] text-white border-b border-blue-900/60 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          {/* Gauche : Logo Officiel Gamba Business */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-[#1E2229] border border-cyan-400/40 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <img
                src="/images/logo-gamba-icon.jpg"
                alt="Logo Gamba Business"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Gamba <span className="text-cyan-400">Business</span>
              </span>
              {subscription.currentPlan !== 'free' && (
                <span className="rounded-md bg-blue-600/30 border border-cyan-400/40 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300 uppercase">
                  {subscription.currentPlan}
                </span>
              )}
            </div>
          </Link>

          {/* Centre : Onglets Style AdFocus avec soulignement bleu actif */}
          <nav className="hidden lg:flex items-center h-full gap-7">
            <Link
              href="/"
              className={`relative h-full flex items-center text-sm font-semibold transition ${
                pathname === '/'
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Rechercher</span>
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
              )}
            </Link>

            <Link
              href="/mes-annonces"
              className={`relative h-full flex items-center text-sm font-semibold transition ${
                pathname === '/mes-annonces'
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Mes Campagnes</span>
              {pathname === '/mes-annonces' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
              )}
            </Link>

            <Link
              href="/tarifs"
              className={`relative h-full flex items-center text-sm font-semibold transition ${
                pathname === '/tarifs'
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Annonces &amp; Tarifs</span>
              {pathname === '/tarifs' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
              )}
            </Link>

            <a
              href="https://wa.me/24177451289?text=Bonjour%20Support%20Gamba%20Business"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-full flex items-center text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              <span>Messagerie WhatsApp</span>
            </a>

            {/* Onglet visible uniquement par l'Admin propriétaire */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`relative h-full flex items-center gap-1.5 text-sm font-extrabold transition ${
                  pathname === '/admin'
                    ? 'text-emerald-400'
                    : 'text-emerald-300/90 hover:text-emerald-300'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Statistiques Admin</span>
                {pathname === '/admin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-emerald-400" />
                )}
              </Link>
            )}
          </nav>

          {/* Droite : Bouton "Créer une annonce" + Avatar avec pastille verte + Cloche */}
          <div className="flex items-center gap-3" ref={dropdownRef}>
            <Link
              href="/publier"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 shadow-lg shadow-blue-600/30 transition"
            >
              <span>Créer une annonce</span>
            </Link>

            {currentUser ? (
              <div className="relative flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="relative flex items-center gap-2 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 pl-1 pr-2.5 py-1 transition"
                >
                  <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-xs font-extrabold flex items-center justify-center shadow">
                    {getUserInitials(currentUser.fullName)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A1628]" />
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-slate-100 max-w-[100px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal('pro')}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                  aria-label="Notifications Mobile Money"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl py-2 z-50">
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

                    <div className="py-1.5 px-1.5 space-y-0.5">
                      <Link
                        href="/publier"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <PlusCircle className="h-4 w-4 text-blue-600" />
                        <span>Créer une annonce</span>
                      </Link>
                      <Link
                        href="/mes-annonces"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span>Mes Campagnes &amp; Annonces</span>
                      </Link>
                      <Link
                        href="/tarifs"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                      >
                        <Award className="h-4 w-4 text-blue-600" />
                        <span>Forfaits &amp; Tarifs</span>
                      </Link>

                      {isAdmin && (
                        <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5">
                          <Link
                            href="/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 transition"
                          >
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>Mon Dashboard Admin</span>
                          </Link>
                          <Link
                            href="/facturation"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-extrabold text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition"
                          >
                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            <span>Facturation TVA 18% &amp; Clients</span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 pl-1.5 pr-3.5 py-1.5 text-xs font-bold text-white transition"
                >
                  <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A1628]" />
                  </div>
                  <span>Se connecter</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPaymentModal('pro')}
                  className="hidden sm:inline-flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure Android / Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A1628] text-white border-t border-blue-900/60 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-bold transition ${
                item.highlight
                  ? 'text-cyan-400'
                  : isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-xl ${
                  item.highlight
                    ? 'bg-blue-600 text-white rounded-2xl p-2.5 -mt-5 shadow-lg shadow-blue-600/40 border-2 border-[#0A1628]'
                    : isActive
                    ? 'bg-blue-600/20 text-cyan-400'
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
