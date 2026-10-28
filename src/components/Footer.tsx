'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, PhoneCall, MessageCircle, Mail } from 'lucide-react';
import { QUARTIERS_GAMBA } from '@/lib/mockData';

export default function Footer() {
  return (
    <footer className="bg-[#0B192C] text-slate-300 pt-14 pb-24 md:pb-12 px-4 border-t border-blue-900/50 mt-14">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-blue-900/40">
        {/* Colonne 1 (4 cols) : Marque & Réseaux Sociaux Officiels */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-base shadow-lg">
              GB
            </div>
            <div>
              <span className="font-extrabold text-xl text-white">
                GAMBA <span className="text-sky-400">BUSINESS</span>
              </span>
              <p className="text-[11px] text-sky-300/80">Le Bon Coin de Gamba, Gabon 🇬🇦</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            La 1ère plateforme d&apos;annonces commerciales dédiée aux commerçants, motels, bars,
            restaurants, salons de coiffure, boutiques et services de Gamba (Département de
            Ndougou).
          </p>

          {/* Réseaux sociaux cliquables */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
              Suivez-nous sur les réseaux sociaux :
            </span>
            <div className="flex items-center gap-2.5">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Gamba Business"
                className="h-10 w-10 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 flex items-center justify-center text-white transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              {/* WhatsApp Direct */}
              <a
                href="https://wa.me/24177451289?text=Bonjour%20Support%20GAMBA%20BUSINESS"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Gamba Business"
                className="h-10 w-10 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 flex items-center justify-center text-white transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Gamba Business"
                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-pink-600 border border-white/15 flex items-center justify-center text-white transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Gamba Business"
                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-purple-600 border border-white/15 flex items-center justify-center text-white transition shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Colonne 2 (3 cols) : Vrais Quartiers de Gamba */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Quartiers de Gamba
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {QUARTIERS_GAMBA.map((q) => (
              <Link
                key={q}
                href={`/?quartier=${encodeURIComponent(q)}`}
                className="rounded-lg bg-blue-950/80 hover:bg-blue-600 border border-blue-800/60 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Colonne 3 (2 cols) : Navigation */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/" className="hover:text-sky-300 transition">
                Accueil &amp; Recherche
              </Link>
            </li>
            <li>
              <Link href="/publier" className="hover:text-sky-300 transition">
                Publier (2 jours gratuits)
              </Link>
            </li>
            <li>
              <Link href="/facturation" className="hover:text-sky-300 transition font-semibold text-sky-400">
                Facturation TVA 18% (Pro)
              </Link>
            </li>
            <li>
              <Link href="/tarifs" className="hover:text-sky-300 transition">
                Offres PRO &amp; Tarifs
              </Link>
            </li>
            <li>
              <Link href="/mes-annonces" className="hover:text-sky-300 transition">
                Tableau de bord Vendeur
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 4 (3 cols) : Contacts & Support Gamba */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Contactez-nous à Gamba
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] text-slate-400">
                  Service Client Airtel / Moov :
                </span>
                <a href="tel:+241077451289" className="font-bold text-white hover:text-sky-300">
                  +241 077 45 12 89
                </a>{' '}
                /{' '}
                <a href="tel:+241066892341" className="font-bold text-white hover:text-sky-300">
                  066 89 23 41
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] text-slate-400">
                  Assistance WhatsApp 7j/7 :
                </span>
                <a
                  href="https://wa.me/24177451289"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:underline"
                >
                  Écrire au Support Gamba Business
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] text-slate-400">Email professionnel :</span>
                <a
                  href="mailto:contact@gambabusiness.ga"
                  className="font-semibold text-white hover:text-sky-300"
                >
                  contact@gambabusiness.ga
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Centre-ville &amp; Plaine 2, Gamba (Ndougou, Gabon)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de footer copyright & logos Mobile Money */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>
          © {new Date().getFullYear()} <strong>GAMBA BUSINESS</strong> — Tous droits réservés.
          Conçu pour le développement économique de Gamba, Gabon 🇬🇦 •{' '}
          <Link
            href="/admin"
            className="text-slate-500 hover:text-slate-300 transition underline-offset-2 hover:underline"
          >
            Administration
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Airtel Money *150#
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Moov Money *555#
          </span>
        </div>
      </div>
    </footer>
  );
}
