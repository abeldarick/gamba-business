'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Lock,
  User,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { AuthMethod, QuartierGamba } from '@/lib/types';
import { QUARTIERS_GAMBA } from '@/lib/mockData';

export default function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    registerUser,
    loginUser,
  } = useGamba();

  // Mode : 'register' (Inscription) ou 'login' (Connexion)
  const [mode, setMode] = useState<'register' | 'login'>('register');
  // Méthode : 'phone' (Numéro de téléphone Gabon +241) ou 'email' (Adresse Mail)
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');

  // Champs du formulaire
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('077 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [quartier, setQuartier] = useState<QuartierGamba>('Plaine 1');

  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (mode === 'register') {
      const res = registerUser({
        fullName,
        authMethod,
        email: authMethod === 'email' ? email : undefined,
        phone,
        password,
        quartier,
      });

      if (!res.success) {
        setFeedback({ type: 'error', text: res.message });
        return;
      }

      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setFeedback(null);
        closeAuthModal();
      }, 900);
    } else {
      const identifier = authMethod === 'email' ? email : phone;
      const res = loginUser({
        authMethod,
        identifier,
        password,
      });

      if (!res.success) {
        setFeedback({ type: 'error', text: res.message });
        return;
      }

      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setFeedback(null);
        closeAuthModal();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* En-tête Bleu Nuit GAMBA BUSINESS */}
        <div className="bg-gradient-to-r from-[#0B192C] via-blue-950 to-blue-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-sky-400/30 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 uppercase">
              <ShieldCheck className="h-3 w-3" /> ESPACE MEMBRE &amp; VENDEUR GAMBA
            </span>
            <h2 className="text-lg sm:text-xl font-black mt-1">
              {mode === 'register'
                ? 'Créer votre compte à Gamba'
                : 'Connexion à votre compte'}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white transition"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Bascule Inscription / Connexion */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setFeedback(null);
              }}
              className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inscription (Nouveau)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFeedback(null);
              }}
              className={`rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Se Connecter
            </button>
          </div>

          {/* CHOIX DES 2 MODES D'INSCRIPTION / CONNEXION : TÉLÉPHONE OU EMAIL */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Choisissez votre mode de {mode === 'register' ? "d'inscription" : 'connexion'} :
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl p-3 border-2 text-xs font-extrabold transition ${
                  authMethod === 'phone'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                }`}
              >
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span>1. Par Téléphone (+241)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setFeedback(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl p-3 border-2 text-xs font-extrabold transition ${
                  authMethod === 'email'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                }`}
              >
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span>2. Par Adresse Mail</span>
              </button>
            </div>
          </div>

          {/* Message d'alerte ou de succès */}
          {feedback && (
            <div
              className={`rounded-2xl p-3.5 text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Formulaire dynamique selon le mode choisi */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Votre Nom ou Nom du Commerce *
                </label>
                <div className="relative flex items-center">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Boutique Maman Clarisse / Jean Ndong"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mode EMAIL */}
            {authMethod === 'email' && (
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Adresse Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@commerce-gamba.ga"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Numéro de téléphone (obligatoire en mode Téléphone, ou contact WhatsApp en inscription Email) */}
            {(authMethod === 'phone' || mode === 'register') && (
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Numéro de Téléphone Gabon (Airtel / Moov) *
                </label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-blue-600">
                  <span className="bg-slate-100 px-3 py-2.5 text-xs font-extrabold text-slate-700 flex items-center border-r border-slate-300">
                    🇬🇦 +241
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 45 12 89 ou 066 89 23 41"
                    className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Quartier à Gamba (lors de l'inscription) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Votre Quartier à Gamba *
                </label>
                <div className="relative flex items-center">
                  <MapPin className="h-4 w-4 text-blue-600 absolute left-3.5 pointer-events-none" />
                  <select
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value as QuartierGamba)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                  >
                    {QUARTIERS_GAMBA.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Mot de passe ou Code PIN */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                {authMethod === 'phone'
                  ? 'Code PIN secret (4 chiffres ou plus) *'
                  : 'Mot de passe *'}
              </label>
              <div className="relative flex items-center">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    authMethod === 'phone' ? 'Ex: 1234' : 'Votre mot de passe'
                  }
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-5 shadow-lg shadow-blue-600/25 transition"
            >
              {mode === 'register'
                ? authMethod === 'phone'
                  ? "S'inscrire avec mon Numéro (+241) →"
                  : "S'inscrire avec mon Adresse Mail →"
                : 'Se connecter maintenant →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
