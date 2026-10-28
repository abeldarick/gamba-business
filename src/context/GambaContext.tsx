'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Listing,
  MobileMoneyOperator,
  MobileMoneyTransaction,
  PlanTier,
  SellerSubscription,
} from '@/lib/types';
import { INITIAL_LISTINGS, PRICING_PLANS } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface GambaContextType {
  listings: Listing[];
  transactions: MobileMoneyTransaction[];
  subscription: SellerSubscription;
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

const STORAGE_KEYS = {
  LISTINGS: 'gamba_business_listings_v3',
  TRANSACTIONS: 'gamba_business_tx_v3',
  SUBSCRIPTION: 'gamba_business_sub_v3',
};

export function GambaProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
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

  // Chargement initial depuis localStorage (et synchronisation Supabase si configuré)
  useEffect(() => {
    try {
      const savedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      if (savedListings) {
        setListings(JSON.parse(savedListings));
      } else {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      }

      const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      }

      const savedSub = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (savedSub) {
        setSubscription(JSON.parse(savedSub));
      }
    } catch (e) {
      console.error('Erreur lecture stockage local Gamba Business:', e);
    }
  }, []);

  // Sauvegarde automatique dans localStorage
  const saveListings = (updated: Listing[]) => {
    setListings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Erreur sauvegarde annonces:', e);
    }
  };

  // Créer une nouvelle annonce
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
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const isPaid = data.planTier !== 'free';
    const isProOrBus = data.planTier === 'pro' || data.planTier === 'business';

    const newListing: Listing = {
      ...data,
      id: 'gamba-' + Date.now(),
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

    // Si Supabase est connecté, on enregistre aussi en base de données
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('listings')
        .insert([
          {
            id: newListing.id,
            title: newListing.title,
            description: newListing.description,
            price: newListing.price,
            price_label: newListing.priceLabel,
            category: newListing.category,
            quartier: newListing.quartier,
            whatsapp: newListing.whatsapp,
            phone: newListing.phone,
            maps_url: newListing.mapsUrl,
            address_hint: newListing.addressHint,
            images: newListing.images,
            seller_name: newListing.sellerName,
            seller_verified: newListing.sellerVerified,
            plan_tier: newListing.planTier,
            is_boosted: newListing.isBoosted,
            has_pro_badge: newListing.hasProBadge,
            has_home_banner: newListing.hasHomeBanner,
            expires_at: newListing.expiresAt,
            is_owner: true,
          },
        ])
        .then();
    }

    return newListing;
  };

  // Supprimer une annonce
  const deleteListing = (id: string) => {
    const updated = listings.filter((item) => item.id !== id);
    saveListings(updated);
  };

  // Incrémenter le compteur de vues
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

  // Incrémenter les clics WhatsApp
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

  // Traitement d'un paiement Mobile Money (Airtel Money / Moov Money via CinetPay)
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

    // 1. Créer la transaction Mobile Money avec référence CinetPay Gabon
    const tx: MobileMoneyTransaction = {
      id: 'tx-' + Date.now(),
      reference: `CP-GA-${Math.floor(100000 + Math.random() * 900000)}`,
      operator,
      phoneNumber,
      amount: plan.priceXAF,
      planId,
      listingId: targetListingId,
      status: 'SUCCESS',
      createdAt: now.toISOString(),
    };

    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTx));
    } catch {}

    // 2. Mettre à jour l'abonnement vendeur
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

    // 3. Booster automatiquement l'annonce ciblée (ou toutes les annonces du vendeur si Pro/Business)
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
      // Si l'utilisateur achète un pack Pro ou Business global depuis /tarifs, on booste ses annonces
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
