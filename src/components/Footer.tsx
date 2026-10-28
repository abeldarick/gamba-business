'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { QUARTIERS_GAMBA, CATEGORIES_GAMBA } from '@/lib/mockData';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 md:pb-12 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Colonne 1 : Présentation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gamba-orange flex items-center justify-center text-white font-black text-base">
              GB
            </div>
            <span className="font-black text-lg text-white">
              GAMBA <span className="text-gamba-orange">BUSINESS</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            La 1ère plateforme d&apos;annonces commerciales de Gamba (Département de Ndougou,
            Gabon). Trouvez Motels, Restaurants, Bars, Boutiques, Salons et Services en 1 clic.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="rounded-lg bg-red-600/20 border border-red-500/30 px-2.5 py-1 text-[11px] font-bold text-red-300">
              Airtel Money *150#
            </span>
            <span className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 text-[11px] font-bold text-blue-300">
              Moov Money *555#
            </span>
          </div>
        </div>

        {/* Colonne 2 : Catégories */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Catégories à Gamba
          </h4>
          <ul className="space-y-1.5 text-xs">
            {CATEGORIES_GAMBA.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/?categorie=${encodeURIComponent(cat.id)}`}
                  className="hover:text-gamba-orange transition"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 3 : Quartiers couverts */}
        <div>
          <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Quartiers de Gamba
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {QUARTIERS_GAMBA.map((q) => (
              <Link
                key={q}
                href={`/?quartier=${encodeURIComponent(q)}`}
                className="rounded-lg bg-gray-800 hover:bg-gamba-orange hover:text-white px-2.5 py-1 text-xs transition"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Colonne 4 : Espace Vendeurs & Tarifs */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">
            Commerçants &amp; Vendeurs
          </h4>
          <p className="text-xs text-gray-400">
            Publiez votre 1ère annonce gratuitement pendant 7 jours ou passez en PRO dès 2 000 FCFA.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/publier"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gamba-orange hover:bg-gamba-darkOrange text-white font-bold text-xs py-2.5 px-4 transition"
            >
              <Sparkles className="h-4 w-4" /> Publier une annonce gratuite
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs py-2.5 px-4 transition"
            >
              <Smartphone className="h-4 w-4 text-amber-400" /> Voir les tarifs Mobile Money
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
        <p>© {new Date().getFullYear()} GAMBA BUSINESS — Fait avec fierté pour Gamba, Gabon 🇬🇦</p>
        <p className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Paiements sécurisés CinetPay •
          Application PWA Android rapide
        </p>
      </div>
    </footer>
  );
}
