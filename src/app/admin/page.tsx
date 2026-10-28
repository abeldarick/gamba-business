'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Wallet,
  Megaphone,
  Crown,
  ShieldCheck,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Sparkles,
  UserPlus,
  Smartphone,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import {
  AuthMethod,
  MobileMoneyOperator,
  PlanTier,
  QuartierGamba,
} from '@/lib/types';
import { formatXAF, QUARTIERS_GAMBA } from '@/lib/mockData';

export default function AdminBackendPage() {
  const {
    users,
    transactions,
    listings,
    registerUser,
    adminUpdateUserPlan,
    adminToggleUserStatus,
    adminDeleteUser,
    adminUpdateTransactionStatus,
    adminDeleteTransaction,
    adminAddManualTransaction,
    adminToggleListingBoost,
    deleteListing,
  } = useGamba();

  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'listings'>('users');
  const [searchUser, setSearchUser] = useState('');
  const [filterAuthMethod, setFilterAuthMethod] = useState<'ALL' | 'phone' | 'email'>('ALL');

  // Formulaire d'ajout manuel d'utilisateur par l'admin
  const [newFullName, setNewFullName] = useState('');
  const [newMethod, setNewMethod] = useState<AuthMethod>('phone');
  const [newPhone, setNewPhone] = useState('077 ');
  const [newEmail, setNewEmail] = useState('');
  const [newQuartier, setNewQuartier] = useState<QuartierGamba>('Plaine 1');

  // Formulaire d'ajout manuel de paiement Mobile Money
  const [payUserName, setPayUserName] = useState('');
  const [payPhone, setPayPhone] = useState('077 ');
  const [payOperator, setPayOperator] = useState<MobileMoneyOperator>('airtel');
  const [payPlan, setPayPlan] = useState<PlanTier>('pro');
  const [payAmount, setPayAmount] = useState<number>(5000);

  // ==========================================================================
  // STATISTIQUES GLOBALES DU BACK-END ADMIN
  // ==========================================================================
  const totalUsers = users.length;
  const phoneUsersCount = users.filter((u) => u.authMethod === 'phone').length;
  const emailUsersCount = users.filter((u) => u.authMethod === 'email').length;

  const validTransactions = transactions.filter((t) => t.status === 'SUCCESS');
  const totalRevenueXAF = validTransactions.reduce((acc, t) => acc + t.amount, 0);
  const airtelRevenue = validTransactions
    .filter((t) => t.operator === 'airtel')
    .reduce((acc, t) => acc + t.amount, 0);
  const moovRevenue = validTransactions
    .filter((t) => t.operator === 'moov')
    .reduce((acc, t) => acc + t.amount, 0);

  const paidSubscribersCount = users.filter((u) => u.planTier !== 'free').length;
  const boostedListingsCount = listings.filter((l) => l.isBoosted).length;

  const filteredUsers = users.filter((u) => {
    const q = searchUser.trim().toLowerCase();
    const matchQuery =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));
    const matchMethod = filterAuthMethod === 'ALL' || u.authMethod === filterAuthMethod;
    return matchQuery && matchMethod;
  });

  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    registerUser({
      fullName: newFullName,
      authMethod: newMethod,
      email: newMethod === 'email' ? newEmail : undefined,
      phone: newPhone,
      password: '1234',
      quartier: newQuartier,
    });
    setNewFullName('');
    setNewPhone('077 ');
    setNewEmail('');
  };

  const handleAdminCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    adminAddManualTransaction({
      userName: payUserName || 'Client Gamba',
      phoneNumber: payPhone,
      operator: payOperator,
      planId: payPlan,
      amount: Number(payAmount) || 5000,
    });
    setPayUserName('');
    setPayPhone('077 ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* =====================================================================
          EN-TÊTE DU BACK-END SUPER-ADMIN GAMBA BUSINESS
          ===================================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-extrabold text-emerald-300 uppercase">
              <ShieldCheck className="h-3.5 w-3.5" /> BACK-END SUPER-ADMIN • CONTRÔLE TOTAL
            </span>
            <span className="rounded-full bg-blue-500/20 border border-sky-400/30 px-3 py-1 text-[11px] font-bold text-sky-200">
              GAMBA BUSINESS GABON 🇬🇦
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tableau de Bord Administrateur — Gestion Globale
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/90">
            Supervisez en temps réel le nombre d&apos;utilisateurs inscrits (par Téléphone ou par
            Mail), tous les paiements Mobile Money (Airtel &amp; Moov) et les annonces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/facturation"
            className="rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-3 border border-white/15 transition"
          >
            📊 Facturation TVA 18%
          </Link>
          <Link
            href="/publier"
            className="rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs sm:text-sm px-5 py-3 shadow-lg transition"
          >
            + Publier une Annonce
          </Link>
        </div>
      </div>

      {/* =====================================================================
          4 CARTES DE STATISTIQUES DU BACK-END ADMIN
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Nombre d'utilisateurs inscrits */}
        <div className="rounded-3xl bg-white p-5 border-2 border-blue-500/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              1. Utilisateurs Inscrits
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalUsers} Utilisateur(s)
          </p>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="text-blue-700">📱 {phoneUsersCount} par Tél</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-700">✉️ {emailUsersCount} par Mail</span>
          </div>
        </div>

        {/* 2. Total Paiements Mobile Money */}
        <div className="rounded-3xl bg-white p-5 border-2 border-emerald-500/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              2. Paiements Encaissés
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {formatXAF(totalRevenueXAF)}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-red-600">🔴 Airtel: {formatXAF(airtelRevenue)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600">🔵 Moov: {formatXAF(moovRevenue)}</span>
          </div>
        </div>

        {/* 3. Annonces Publiées (0 démo) */}
        <div className="rounded-3xl bg-white p-5 border-2 border-sky-500/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              3. Annonces en Ligne
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {listings.length} Annonce(s)
          </p>
          <span className="text-[11px] font-bold text-sky-700 block">
            dont {boostedListingsCount} annonce(s) boostée(s)
          </span>
        </div>

        {/* 4. Abonnements Payants Actifs */}
        <div className="rounded-3xl bg-white p-5 border-2 border-amber-500/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">
              4. Comptes PRO / VIP
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {paidSubscribersCount} Abonné(s)
          </p>
          <span className="text-[11px] font-bold text-amber-700 block">
            {transactions.length} transaction(s) enregistrée(s)
          </span>
        </div>
      </div>

      {/* =====================================================================
          ONGLETS DE GESTION BACK-END : UTILISATEURS / PAIEMENTS / ANNONCES
          ===================================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>1. Gérer les Utilisateurs ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>2. Gérer les Paiements Mobile Money ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === 'listings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>3. Gérer les Annonces ({listings.length})</span>
        </button>
      </div>

      {/* =====================================================================
          ONGLET 1 : GESTION DES UTILISATEURS (INSCRITS PAR MAIL OU TÉLÉPHONE)
          ===================================================================== */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Ajouter un utilisateur manuellement */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleAdminCreateUser}
              className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-black text-slate-900">
                  Inscrire un Utilisateur
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewMethod('phone')}
                  className={`rounded-xl py-2 text-xs font-extrabold border ${
                    newMethod === 'phone'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  📱 Par Téléphone
                </button>
                <button
                  type="button"
                  onClick={() => setNewMethod('email')}
                  className={`rounded-xl py-2 text-xs font-extrabold border ${
                    newMethod === 'email'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ✉️ Par Mail
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Nom / Commerce *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ex: Boutique Plaine 2"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              {newMethod === 'email' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@gamba.ga"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Téléphone Gabon (+241) *
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="077 45 12 89"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Quartier à Gamba
                </label>
                <select
                  value={newQuartier}
                  onChange={(e) => setNewQuartier(e.target.value as QuartierGamba)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold"
                >
                  {QUARTIERS_GAMBA.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-md transition"
              >
                + Ajouter cet utilisateur
              </button>
            </form>
          </div>

          {/* Colonne droite : Tableau de tous les utilisateurs inscrits */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl bg-white p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex items-center w-full sm:w-72">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Rechercher nom, mail ou +241..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-3.5 py-2 text-xs sm:text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFilterAuthMethod('ALL')}
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                    filterAuthMethod === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tous ({users.length})
                </button>
                <button
                  onClick={() => setFilterAuthMethod('phone')}
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                    filterAuthMethod === 'phone'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  📱 Téléphone ({phoneUsersCount})
                </button>
                <button
                  onClick={() => setFilterAuthMethod('email')}
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                    filterAuthMethod === 'email'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ✉️ Mail ({emailUsersCount})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {u.authMethod === 'phone' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                          <Phone className="h-3 w-3" /> INSCRIT PAR TÉLÉPHONE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                          <Mail className="h-3 w-3" /> INSCRIT PAR MAIL
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          u.status === 'ACTIF'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>

                      <span className="text-xs text-slate-400">📍 {u.quartier}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {u.fullName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      📞 <strong>{u.phone}</strong>
                      {u.email ? ` • ✉️ ${u.email}` : ''}
                    </p>
                  </div>

                  {/* Contrôles Admin sur l'utilisateur */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={u.planTier}
                      onChange={(e) =>
                        adminUpdateUserPlan(u.id, e.target.value as PlanTier)
                      }
                      className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-blue-700"
                    >
                      <option value="free">Forfait : GRATUIT (2j)</option>
                      <option value="decouverte">Forfait : DÉCOUVERTE (2 000 F)</option>
                      <option value="pro">Forfait : PRO (5 000 F)</option>
                      <option value="business">Forfait : BUSINESS (15 000 F)</option>
                    </select>

                    <button
                      onClick={() => adminToggleUserStatus(u.id)}
                      className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 transition"
                    >
                      {u.status === 'ACTIF' ? 'Suspendre' : 'Activer'}
                    </button>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => adminDeleteUser(u.id)}
                        className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 transition"
                        title="Supprimer cet utilisateur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : GESTION DES PAIEMENTS MOBILE MONEY (AIRTEL & MOOV)
          ===================================================================== */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Enregistrer un paiement manuel */}
          <div className="lg:col-span-4">
            <form
              onSubmit={handleAdminCreatePayment}
              className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">
                  Enregistrer un Paiement Reçu
                </h2>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Nom du Client / Vendeur *
                </label>
                <input
                  type="text"
                  required
                  value={payUserName}
                  onChange={(e) => setPayUserName(e.target.value)}
                  placeholder="Ex: Motel La Lagune"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Opérateur
                  </label>
                  <select
                    value={payOperator}
                    onChange={(e) =>
                      setPayOperator(e.target.value as MobileMoneyOperator)
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-extrabold"
                  >
                    <option value="airtel">🔴 Airtel Money</option>
                    <option value="moov">🔵 Moov Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Numéro +241 *
                  </label>
                  <input
                    type="text"
                    required
                    value={payPhone}
                    onChange={(e) => setPayPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Offre choisie
                  </label>
                  <select
                    value={payPlan}
                    onChange={(e) => {
                      const p = e.target.value as PlanTier;
                      setPayPlan(p);
                      setPayAmount(
                        p === 'decouverte' ? 2000 : p === 'pro' ? 5000 : 15000
                      );
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-extrabold"
                  >
                    <option value="decouverte">Découverte (2 000 F)</option>
                    <option value="pro">PRO (5 000 F)</option>
                    <option value="business">BUSINESS (15 000 F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-black text-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 shadow-md transition"
              >
                + Valider ce Paiement Mobile Money
              </button>
            </form>
          </div>

          {/* Liste des paiements Mobile Money */}
          <div className="lg:col-span-8 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center border border-slate-200 space-y-2">
                <p className="text-base font-black text-slate-900">
                  Aucun paiement Mobile Money enregistré pour le moment
                </p>
                <p className="text-xs text-slate-500">
                  Dès qu&apos;un utilisateur paie son abonnement via Airtel Money (*150#) ou Moov
                  Money (*555#), la transaction s&apos;affiche automatiquement ici.
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-900 text-white px-2.5 py-0.5 text-xs font-mono font-bold">
                        {tx.reference}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          tx.operator === 'airtel'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {tx.operator === 'airtel' ? '🔴 AIRTEL MONEY' : '🔵 MOOV MONEY'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.status === 'SUCCESS'
                          ? '✓ VALIDÉ'
                          : tx.status === 'FAILED'
                          ? '✕ REJETÉ'
                          : '⏳ EN ATTENTE'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {tx.userName || 'Utilisateur Gamba'} — Offre{' '}
                      <span className="text-blue-600 uppercase">{tx.planId}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Numéro : <strong>+241 {tx.phoneNumber}</strong> •{' '}
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-emerald-700">
                      {formatXAF(tx.amount)}
                    </span>

                    <button
                      onClick={() =>
                        adminUpdateTransactionStatus(
                          tx.id,
                          tx.status === 'SUCCESS' ? 'FAILED' : 'SUCCESS'
                        )
                      }
                      className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2"
                    >
                      {tx.status === 'SUCCESS' ? 'Annuler' : 'Valider'}
                    </button>

                    <button
                      onClick={() => adminDeleteTransaction(tx.id)}
                      className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 p-2"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 3 : GESTION DE TOUTES LES ANNONCES PUBLIÉES (0 DÉMO)
          ===================================================================== */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 space-y-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Megaphone className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Aucune annonce démo — Plateforme 100% propre
                </h3>
                <p className="text-xs text-slate-500">
                  Toutes les annonces de démonstration ont été retirées. Seules les vraies
                  annonces publiées par vos utilisateurs apparaîtront ici.
                </p>
              </div>
              <Link
                href="/publier"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 shadow-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Publier une première vraie annonce</span>
              </Link>
            </div>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-16 w-20 rounded-2xl object-cover bg-slate-900 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-blue-600">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">📍 {item.quartier}</span>
                      {item.isBoosted && (
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-extrabold">
                          ★ BOOSTÉE
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500">
                      Vendeur : <strong>{item.sellerName}</strong> • {formatXAF(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adminToggleListingBoost(item.id)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                      item.isBoosted
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{item.isBoosted ? 'Retirer Boost' : 'Booster à la une'}</span>
                  </button>

                  <button
                    onClick={() => deleteListing(item.id)}
                    className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 p-2"
                    title="Supprimer cette annonce"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
