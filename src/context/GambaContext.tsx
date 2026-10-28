'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppUser,
  AuthMethod,
  Listing,
  MobileMoneyOperator,
  MobileMoneyTransaction,
  PlanTier,
  QuartierGamba,
  SellerSubscription,
} from '@/lib/types';
import { INITIAL_LISTINGS, PRICING_PLANS } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface GambaContextType {
  listings: Listing[];
  transactions: MobileMoneyTransaction[];
  subscription: SellerSubscription;
  users: AppUser[];
  currentUser: AppUser | null;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  registerUser: (params: {
    fullName: string;
    authMethod: AuthMethod;
    email?: string;
    phone: string;
    password: string;
    quartier: QuartierGamba;
  }) => { success: boolean; message: string; user?: AppUser };
  loginUser: (params: {
    authMethod: AuthMethod;
    identifier: string; // Email ou Téléphone
    password: string;
  }) => { success: boolean; message: string; user?: AppUser };
  logoutUser: () => void;
  // Fonctions Super-Admin Back-End
  adminUpdateUserPlan: (userId: string, planTier: PlanTier) => void;
  adminToggleUserStatus: (userId: string) => void;
  adminDeleteUser: (userId: string) => void;
  adminUpdateTransactionStatus: (
    txId: string,
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
  ) => void;
  adminDeleteTransaction: (txId: string) => void;
  adminAddManualTransaction: (params: {
    userName: string;
    phoneNumber: string;
    operator: MobileMoneyOperator;
    planId: PlanTier;
    amount: number;
  }) => void;
  adminToggleListingBoost: (listingId: string) => void;
  // Fonctions Annonces & Paiements
  addListing: (
    newListingData: Omit<
      Listing,
      | 'id'
      | 'views'
      | 'whatsappClicks'
      | 'createdAt'
      | 'expiresAt'
      | 'isBoosted'
      | 'hasProBadge'
      | 'hasHomeBanner'
      | 'sellerVerified'
    >
  ) => Listing;
  deleteListing: (id: string) => void;
  incrementView: (id: string) => void;
  incrementWhatsAppClick: (id: string) => void;
  processMobileMoneyPayment: (params: {
    operator: MobileMoneyOperator;
    phoneNumber: string;
    planId: PlanTier;
    targetListingId?: string;
  }) => MobileMoneyTransaction;
  openPaymentModal: (planId: PlanTier, targetListingId?: string) => void;
  closePaymentModal: () => void;
  paymentModalState: {
    isOpen: boolean;
    planId: PlanTier;
    targetListingId?: string;
  };
}

const GambaContext = createContext<GambaContextType | undefined>(undefined);

// Clés v5 propres : supprime toutes les anciennes annonces démo
const STORAGE_KEYS = {
  LISTINGS: 'gamba_business_listings_v5_clean',
  TRANSACTIONS: 'gamba_business_tx_v5_clean',
  SUBSCRIPTION: 'gamba_business_sub_v5_clean',
  USERS: 'gamba_business_users_v5_clean',
  CURRENT_USER: 'gamba_business_current_user_v5_clean',
};

// Compte Administrateur Propriétaire par défaut
const DEFAULT_ADMIN_USER: AppUser = {
  id: 'admin-gamba-01',
  fullName: 'Abel Darick (Administrateur)',
  authMethod: 'email',
  email: 'admin@gambabusiness.ga',
  phone: '+241 077 45 12 89',
  password: 'admin',
  quartier: 'Centre-ville',
  role: 'admin',
  planTier: 'business',
  status: 'ACTIF',
  createdAt: new Date().toISOString(),
};

export function GambaProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [users, setUsers] = useState<AppUser[]>([DEFAULT_ADMIN_USER]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [subscription, setSubscription] = useState<SellerSubscription>({
    currentPlan: 'free',
    expiresAt: null,
    remainingListings: 1,
    bannerActive: false,
  });

  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    planId: PlanTier;
    targetListingId?: string;
  }>({
    isOpen: false,
    planId: 'pro',
    targetListingId: undefined,
  });

  // Chargement initial et nettoyage des anciennes clés de démo
  useEffect(() => {
    try {
      // Suppression automatique des anciens caches contenant des annonces démo
      localStorage.removeItem('gamba_business_listings_v3');
      localStorage.removeItem('gamba_pro_blue_listings_v3');
      localStorage.removeItem('gamba_billing_clients_v1');
      localStorage.removeItem('gamba_billing_invoices_v1');

      const savedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      if (savedListings) {
        setListings(JSON.parse(savedListings));
      } else {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify([]));
        setListings([]);
      }

      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      }

      const savedSub = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (savedSub) {
        setSubscription(JSON.parse(savedSub));
      }

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_ADMIN_USER]));
      }

      const savedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedCurrent) {
        setCurrentUser(JSON.parse(savedCurrent));
      }
    } catch (e) {
      console.error('Erreur lecture stockage local Gamba Business:', e);
    }
  }, []);

  const saveListings = (updated: Listing[]) => {
    setListings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    } catch {}
  };

  const saveUsers = (updated: AppUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    } catch {}
  };

  const saveTransactions = (updated: MobileMoneyTransaction[]) => {
    setTransactions(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    } catch {}
  };

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  // ==========================================================================
  // INSCRIPTION UTILISATEUR : 2 MODES (PAR EMAIL OU PAR NUMÉRO DE TÉLÉPHONE)
  // ==========================================================================
  const registerUser = ({
    fullName,
    authMethod,
    email,
    phone,
    password,
    quartier,
  }: {
    fullName: string;
    authMethod: AuthMethod;
    email?: string;
    phone: string;
    password: string;
    quartier: QuartierGamba;
  }): { success: boolean; message: string; user?: AppUser } => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (authMethod === 'email') {
      if (!cleanEmail) {
        return { success: false, message: 'Veuillez saisir votre adresse email.' };
      }
      const exists = users.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );
      if (exists) {
        return {
          success: false,
          message: 'Cette adresse email est déjà inscrite. Connectez-vous.',
        };
      }
    } else {
      if (!cleanPhone) {
        return { success: false, message: 'Veuillez saisir votre numéro de téléphone.' };
      }
      const exists = users.find(
        (u) => u.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')
      );
      if (exists) {
        return {
          success: false,
          message: 'Ce numéro de téléphone est déjà inscrit. Connectez-vous.',
        };
      }
    }

    const newUser: AppUser = {
      id: 'usr-' + Date.now(),
      fullName: fullName.trim() || 'Utilisateur Gamba',
      authMethod,
      email: cleanEmail || undefined,
      phone: cleanPhone.startsWith('+241') ? cleanPhone : `+241 ${cleanPhone}`,
      password,
      quartier,
      role: 'user',
      planTier: 'free',
      status: 'ACTIF',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [newUser, ...users];
    saveUsers(updatedUsers);
    setCurrentUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    } catch {}

    // Enregistrement Supabase si configuré
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('app_users')
        .insert([
          {
            id: newUser.id,
            full_name: newUser.fullName,
            auth_method: newUser.authMethod,
            email: newUser.email || null,
            phone: newUser.phone,
            quartier: newUser.quartier,
            role: newUser.role,
            plan_tier: newUser.planTier,
            status: newUser.status,
          },
        ])
        .then();
    }

    return {
      success: true,
      message: 'Compte créé et connecté avec succès !',
      user: newUser,
    };
  };

  // ==========================================================================
  // CONNEXION UTILISATEUR : PAR EMAIL OU PAR NUMÉRO DE TÉLÉPHONE
  // ==========================================================================
  const loginUser = ({
    authMethod,
    identifier,
    password,
  }: {
    authMethod: AuthMethod;
    identifier: string;
    password: string;
  }): { success: boolean; message: string; user?: AppUser } => {
    const cleanId = identifier.trim().toLowerCase();

    const matched = users.find((u) => {
      if (authMethod === 'email') {
        return u.email && u.email.toLowerCase() === cleanId;
      }
      const normUserPhone = u.phone.replace(/\D/g, '').replace(/^241/, '');
      const normInputPhone = cleanId.replace(/\D/g, '').replace(/^241/, '');
      return normUserPhone === normInputPhone && normInputPhone.length >= 6;
    });

    if (!matched) {
      return {
        success: false,
        message:
          authMethod === 'email'
            ? 'Aucun compte trouvé avec cet email. Cliquez sur "Inscription" pour créer votre compte.'
            : 'Aucun compte trouvé avec ce numéro. Cliquez sur "Inscription" pour vous inscrire.',
      };
    }

    if (matched.status === 'SUSPENDU') {
      return {
        success: false,
        message: 'Ce compte a été suspendu par l’administrateur.',
      };
    }

    if (matched.password && matched.password !== password) {
      return {
        success: false,
        message: 'Mot de passe ou code PIN incorrect.',
      };
    }

    setCurrentUser(matched);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
    } catch {}

    return {
      success: true,
      message: `Bienvenue ${matched.fullName} !`,
      user: matched,
    };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
  };

  // ==========================================================================
  // FONCTIONS DE GESTION BACK-END SUPER-ADMIN
  // ==========================================================================
  const adminUpdateUserPlan = (userId: string, planTier: PlanTier) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, planTier } : u));
    saveUsers(updated);
    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, planTier };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedCurrent));
      } catch {}
    }
  };

  const adminToggleUserStatus = (userId: string) => {
    const updated = users.map((u) =>
      u.id === userId
        ? { ...u, status: (u.status === 'ACTIF' ? 'SUSPENDU' : 'ACTIF') as 'ACTIF' | 'SUSPENDU' }
        : u
    );
    saveUsers(updated);
  };

  const adminDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    saveUsers(updated);
  };

  const adminUpdateTransactionStatus = (
    txId: string,
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
  ) => {
    const updated = transactions.map((tx) =>
      tx.id === txId ? { ...tx, status } : tx
    );
    saveTransactions(updated);
  };

  const adminDeleteTransaction = (txId: string) => {
    const updated = transactions.filter((tx) => tx.id !== txId);
    saveTransactions(updated);
  };

  const adminAddManualTransaction = ({
    userName,
    phoneNumber,
    operator,
    planId,
    amount,
  }: {
    userName: string;
    phoneNumber: string;
    operator: MobileMoneyOperator;
    planId: PlanTier;
    amount: number;
  }) => {
    const tx: MobileMoneyTransaction = {
      id: 'tx-' + Date.now(),
      reference: `CP-GA-${Math.floor(100000 + Math.random() * 900000)}`,
      userName,
      operator,
      phoneNumber,
      amount,
      planId,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    saveTransactions([tx, ...transactions]);
  };

  const adminToggleListingBoost = (listingId: string) => {
    const updated = listings.map((item) =>
      item.id === listingId
        ? {
            ...item,
            isBoosted: !item.isBoosted,
            hasProBadge: !item.isBoosted,
            sellerVerified: !item.isBoosted,
          }
        : item
    );
    saveListings(updated);
  };

  // ==========================================================================
  // ANNONCES & PAIEMENTS MOBILE MONEY
  // ==========================================================================
  const addListing = (
    data: Omit<
      Listing,
      | 'id'
      | 'views'
      | 'whatsappClicks'
      | 'createdAt'
      | 'expiresAt'
      | 'isBoosted'
      | 'hasProBadge'
      | 'hasHomeBanner'
      | 'sellerVerified'
    >
  ): Listing => {
    const now = new Date();
    const planObj = PRICING_PLANS.find((p) => p.id === data.planTier);
    const durationDays = planObj ? planObj.durationDays : 2; // 2 jours gratuits par défaut
    const expiresAt = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const isPaid = data.planTier !== 'free';
    const isProOrBus = data.planTier === 'pro' || data.planTier === 'business';

    const newListing: Listing = {
      ...data,
      id: 'gamba-' + Date.now(),
      userId: currentUser?.id,
      sellerVerified: isProOrBus,
      isBoosted: isPaid,
      hasProBadge: isProOrBus,
      hasHomeBanner: data.planTier === 'business',
      views: 1,
      whatsappClicks: 0,
      createdAt: now.toISOString(),
      expiresAt,
      isOwner: true,
    };

    const updated = [newListing, ...listings];
    saveListings(updated);
    return newListing;
  };

  const deleteListing = (id: string) => {
    const updated = listings.filter((item) => item.id !== id);
    saveListings(updated);
  };

  const incrementView = (id: string) => {
    setListings((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, views: item.views + 1 } : item
      );
      try {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const incrementWhatsAppClick = (id: string) => {
    setListings((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, whatsappClicks: item.whatsappClicks + 1 } : item
      );
      try {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const processMobileMoneyPayment = ({
    operator,
    phoneNumber,
    planId,
    targetListingId,
  }: {
    operator: MobileMoneyOperator;
    phoneNumber: string;
    planId: PlanTier;
    targetListingId?: string;
  }): MobileMoneyTransaction => {
    const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
    const now = new Date();
    const newExpiresAt = new Date(
      now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const tx: MobileMoneyTransaction = {
      id: 'tx-' + Date.now(),
      reference: `CP-GA-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser?.id,
      userName: currentUser?.fullName || 'Vendeur Gamba',
      operator,
      phoneNumber,
      amount: plan.priceXAF,
      planId,
      listingId: targetListingId,
      status: 'SUCCESS',
      createdAt: now.toISOString(),
    };

    const updatedTx = [tx, ...transactions];
    saveTransactions(updatedTx);

    const updatedSub: SellerSubscription = {
      currentPlan: planId,
      expiresAt: newExpiresAt,
      remainingListings: plan.maxListings,
      bannerActive: planId === 'business',
    };
    setSubscription(updatedSub);
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(updatedSub));
    } catch {}

    if (currentUser) {
      adminUpdateUserPlan(currentUser.id, planId);
    }

    const isProOrBus = planId === 'pro' || planId === 'business';
    const updatedListings = listings.map((item) => {
      if (targetListingId && item.id === targetListingId) {
        return {
          ...item,
          planTier: planId,
          isBoosted: true,
          hasProBadge: isProOrBus || item.hasProBadge,
          hasHomeBanner: planId === 'business' || item.hasHomeBanner,
          sellerVerified: isProOrBus || item.sellerVerified,
          expiresAt: newExpiresAt,
        };
      }
      if (!targetListingId && item.isOwner) {
        return {
          ...item,
          planTier: planId,
          isBoosted: true,
          hasProBadge: isProOrBus,
          hasHomeBanner: planId === 'business',
          sellerVerified: isProOrBus,
          expiresAt: newExpiresAt,
        };
      }
      return item;
    });

    saveListings(updatedListings);
    return tx;
  };

  const openPaymentModal = (planId: PlanTier, targetListingId?: string) => {
    setPaymentModalState({
      isOpen: true,
      planId,
      targetListingId,
    });
  };

  const closePaymentModal = () => {
    setPaymentModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  return (
    <GambaContext.Provider
      value={{
        listings,
        transactions,
        subscription,
        users,
        currentUser,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        registerUser,
        loginUser,
        logoutUser,
        adminUpdateUserPlan,
        adminToggleUserStatus,
        adminDeleteUser,
        adminUpdateTransactionStatus,
        adminDeleteTransaction,
        adminAddManualTransaction,
        adminToggleListingBoost,
        addListing,
        deleteListing,
        incrementView,
        incrementWhatsAppClick,
        processMobileMoneyPayment,
        openPaymentModal,
        closePaymentModal,
        paymentModalState,
      }}
    >
      {children}
    </GambaContext.Provider>
  );
}

export function useGamba() {
  const context = useContext(GambaContext);
  if (!context) {
    throw new Error('useGamba doit être utilisé à l’intérieur de GambaProvider');
  }
  return context;
}
