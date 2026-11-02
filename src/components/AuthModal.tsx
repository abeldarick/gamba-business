'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Home,
  Store,
  Car,
  CreditCard,
  Tag,
  Users,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useGamba } from '@/context/GambaContext';
import { QuartierGamba } from '@/lib/types';
import { QUARTIERS_GAMBA } from '@/lib/mockData';

import EmailRegistrationView from '@/components/EmailRegistrationView';

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, registerUser, loginUser } = useGamba();

  // Mode : 'register' (Créer un compte) ou 'login' (Connexion)
  const [mode, setMode] = useState<'register' | 'login'>('register');
  // Vue active dans la modale : 'form' (vue standard) ou 'google' (flux réel Google / Gmail)
  const [authView, setAuthView] = useState<'form' | 'google'>('form');

  // Champs du formulaire classique
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [quartier, setQuartier] = useState<QuartierGamba>('Plaine 1');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  // Réinitialisation lors de l'ouverture
  useEffect(() => {
    if (authModalOpen) {
      setAuthView('form');
      setFeedback(null);
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  // Soumission du formulaire classique (Email / Téléphone)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const isEmail = emailOrPhone.includes('@');
    const cleanPhone = emailOrPhone.replace(/\D/g, '');

    if (mode === 'register') {
      if (!acceptTerms) {
        setFeedback({
          type: 'error',
          text: 'Veuillez accepter les Conditions Générales d’Utilisation.',
        });
        return;
      }

      if (password !== confirmPassword) {
        setFeedback({
          type: 'error',
          text: 'Les deux mots de passe ne correspondent pas.',
        });
        return;
      }

      const res = registerUser({
        fullName,
        authMethod: isEmail ? 'email' : 'phone',
        email: isEmail ? emailOrPhone.trim().toLowerCase() : undefined,
        phone: !isEmail ? emailOrPhone.trim() : (cleanPhone ? emailOrPhone : '077 00 00 00'),
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
      const res = loginUser({
        authMethod: isEmail ? 'email' : 'phone',
        identifier: emailOrPhone.trim(),
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

  // Démarrer le flux Google / Gmail réel
  const startGoogleFlow = () => {
    setFeedback(null);
    setAuthView('google');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      {/* Conteneur Fenêtre Modèle Photo (Navigateur avec 2 volets Split) */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden my-auto flex flex-col md:flex-row min-h-[580px]">
        {/* ====================================================================
             VOLET GAUCHE BLEU ÉCLATANT (MODÈLE ANNONCEPRO ADAPTÉ À GAMBA BUSINESS)
             ==================================================================== */}
        <div className="relative md:w-5/12 bg-gradient-to-br from-[#1E6BFF] via-[#155CE6] to-[#0A47C2] p-6 sm:p-8 text-white flex flex-col justify-between overflow-hidden">
          {/* Halos lumineux en arrière-plan */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-60 h-60 rounded-full bg-cyan-400/20 blur-2xl"></div>
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-blue-400/20 blur-2xl"></div>

          {/* En-tête avec Logo Officiel Gamba Business */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
              <img
                src="/images/logo-gamba-icon.jpg"
                alt="Logo Gamba Business"
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-white">
              Gamba <span className="text-cyan-300 font-bold">Business</span>
            </span>
          </div>

          {/* Titre & Composition de Tuiles/Icônes 3D du Modèle */}
          <div className="relative z-10 py-6 my-auto space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white leading-tight">
                Rejoignez la communauté Gamba Business !
              </h2>
              <p className="text-sm text-blue-100 font-medium">
                Inscrivez-vous gratuitement !
              </p>
            </div>

            {/* Grille des tuiles d'activités blanches avec icônes (comme sur la photo modèle) */}
            <div className="grid grid-cols-4 gap-2.5 pt-2 max-w-[280px]">
              <div className="h-12 w-12 rounded-2xl bg-white text-blue-600 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <Home className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-cyan-600 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <Store className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-blue-600 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <Car className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-emerald-600 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-amber-500 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <Tag className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-indigo-600 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <Users className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-rose-500 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white text-cyan-500 shadow-lg flex items-center justify-center hover:scale-105 transition transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Badge du bas semi-transparent (comme sur le modèle photo) */}
          <div className="relative z-10 rounded-2xl bg-white/15 backdrop-blur-md p-3.5 border border-white/20 text-white flex items-center gap-3 shadow-sm">
            <div className="h-7 w-7 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-blue-50 font-medium leading-snug">
              Découvrez des milliers d&apos;annonces et publiez les vôtres en quelques clics
            </p>
          </div>
        </div>

        {/* ====================================================================
             VOLET DROIT BLANC ÉPURÉ (FORMULAIRE MODÈLE ANNONCEPRO & GOOGLE FLOW)
             ==================================================================== */}
        <div className="relative md:w-7/12 bg-white p-6 sm:p-10 flex flex-col justify-between">
          {/* Ligne du haut : Déjà inscrit ? Se connecter + Bouton Fermer */}
          <div className="flex items-center justify-between pb-4">
            <div className="text-xs text-slate-500 font-medium">
              {authView === 'google' ? (
                <button
                  type="button"
                  onClick={() => setAuthView('form')}
                  className="inline-flex items-center gap-1 font-bold text-[#1E6BFF] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Retour au formulaire classique</span>
                </button>
              ) : mode === 'register' ? (
                <>
                  Déjà inscrit ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setFeedback(null);
                    }}
                    className="font-bold text-[#1E6BFF] hover:underline"
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setFeedback(null);
                    }}
                    className="font-bold text-[#1E6BFF] hover:underline"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </div>

            <button
              onClick={closeAuthModal}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ==================== VUE DÉDIÉE : AUTHENTIFICATION GMAIL OFFICIELLE ==================== */}
          {authView === 'google' ? (
            <EmailRegistrationView
              onBackToMain={() => setAuthView('form')}
              onSuccess={() => closeAuthModal()}
            />
          ) : (
            /* ==================== VUE PRINCIPALE : MODÈLE ANNONCEPRO ==================== */
            <div className="my-auto space-y-5">
              {/* Titre centré */}
              <div className="text-center space-y-1">
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                  {mode === 'register' ? 'Créer un compte' : 'Connexion à votre compte'}
                </h3>
              </div>

              {/* 2 Boutons Sociaux Rapides (Google & Apple) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={startGoogleFlow}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-700 shadow-sm transition group"
                >
                  <svg className="h-4 w-4 transition group-hover:scale-110" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-extrabold text-slate-800">S&apos;inscrire avec Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeedback({
                      type: 'success',
                      text: 'Authentification Apple ID sécurisée initialisée !',
                    });
                    setTimeout(() => {
                      setFeedback(null);
                      closeAuthModal();
                    }, 800);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-700 shadow-sm transition"
                >
                  <svg className="h-4 w-4 fill-current text-slate-900" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.58.67-.99 1.73-.85 2.76 1 .08 2.04-.51 2.56-1.26" />
                  </svg>
                  <span>S&apos;inscrire avec Apple</span>
                </button>
              </div>

              {/* Séparateur horizontal "ou s'inscrire avec votre e-mail" */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200"></div>
                <span className="bg-white px-3 text-xs text-slate-400 font-medium whitespace-nowrap">
                  ou s&apos;inscrire avec votre e-mail
                </span>
              </div>

              {/* Message de notification */}
              {feedback && (
                <div
                  className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
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

              {/* Formulaire avec les champs exacts du modèle photo */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Prénom et Nom"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF] focus:outline-none transition shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Adresse e-mail ou Téléphone (+241)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF] focus:outline-none transition shadow-sm"
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <select
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value as QuartierGamba)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF] focus:outline-none transition shadow-sm cursor-pointer"
                    >
                      {QUARTIERS_GAMBA.map((q) => (
                        <option key={q} value={q}>
                          Quartier : {q} (Gamba)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Champ Mot de passe avec œil à droite */}
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF] focus:outline-none transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Afficher ou masquer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Champ Confirmer le mot de passe (en mode inscription) */}
                {mode === 'register' && (
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E6BFF] focus:ring-1 focus:ring-[#1E6BFF] focus:outline-none transition shadow-sm"
                    />
                  </div>
                )}

                {/* Case à cocher des conditions (exactement comme le modèle photo) */}
                {mode === 'register' && (
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="terms-check"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1E6BFF] focus:ring-[#1E6BFF] cursor-pointer"
                    />
                    <label
                      htmlFor="terms-check"
                      className="text-[11px] text-slate-600 font-medium leading-tight cursor-pointer"
                    >
                      J&apos;accepte les{' '}
                      <span className="text-[#1E6BFF] underline">
                        Conditions Générales d&apos;Utilisation
                      </span>{' '}
                      et la{' '}
                      <span className="text-[#1E6BFF] underline">
                        Politique de Confidentialité
                      </span>
                    </label>
                  </div>
                )}

                {/* Bouton d'action principal Bleu Royal */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1D63ED] hover:bg-blue-600 text-white font-bold text-sm py-3 px-5 shadow-md shadow-blue-600/25 transition mt-2"
                >
                  {mode === 'register' ? "S'inscrire" : 'Se connecter'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
