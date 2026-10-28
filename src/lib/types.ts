// ============================================================================
// TYPES & INTERFACES - GAMBA BUSINESS (Gabon)
// ============================================================================

export type CategoryId =
  | 'Motels'
  | 'Bars'
  | 'Restaurants'
  | 'Boutiques'
  | 'Services'
  | 'Alimentation'
  | 'Vêtements';

export type QuartierGamba =
  | 'Plaine 1'
  | 'Plaine 2'
  | 'Plaine 3'
  | 'Plaine 4'
  | 'Plaine 5'
  | 'Le Couloir'
  | 'Centre-ville'
  | 'Camp Yenzi'
  | 'Mayonami'
  | 'Pont Dick'
  | 'Voungou'
  | 'Terminal / Aéroport';

export type PlanTier = 'free' | 'decouverte' | 'pro' | 'business';

export type MobileMoneyOperator = 'airtel' | 'moov';

export type AuthMethod = 'email' | 'phone';

export interface AppUser {
  id: string;
  fullName: string; // Nom complet ou Nom du commerce
  authMethod: AuthMethod; // 'email' (Inscription par Mail) ou 'phone' (Inscription par Téléphone)
  email?: string;
  phone: string; // Numéro Gabon +241
  password?: string; // Mot de passe ou code PIN
  quartier: QuartierGamba;
  role: 'user' | 'admin';
  planTier: PlanTier;
  status: 'ACTIF' | 'SUSPENDU';
  createdAt: string;
}

export interface Listing {
  id: string;
  userId?: string;
  title: string;
  description: string;
  price: number; // En FCFA (XAF)
  priceLabel?: string; // ex: "/ nuit", "/ plat", "À partir de"
  category: CategoryId;
  quartier: QuartierGamba;
  whatsapp: string; // Format 24177XXXXXX ou 077XXXXXX
  phone: string;
  mapsUrl: string; // Lien Google Maps ou coordonnées GPS
  addressHint: string; // Repère local typique au Gabon (ex: "Face carrefour...")
  images: string[]; // Max 4 photos (URL ou Base64)
  sellerName: string;
  sellerVerified: boolean;
  planTier: PlanTier;
  isBoosted: boolean; // Affiché dans "Annonces à la une"
  hasProBadge: boolean; // Badge "PRO VÉRIFIÉ"
  hasHomeBanner: boolean; // Bannière publicitaire sur l'accueil (Offre Business)
  views: number;
  whatsappClicks: number;
  createdAt: string; // ISO date
  expiresAt: string; // ISO date (2 jours gratuit, 7j Découverte, 30j Pro/Business)
  isOwner?: boolean; // Indique si l'annonce appartient au vendeur actuel
}

export interface PricingPlan {
  id: PlanTier;
  name: string;
  priceXAF: number;
  durationDays: number;
  subtitle: string;
  badgeText?: string;
  popular?: boolean;
  maxListings: number | 'Illimité';
  features: string[];
  buttonLabel: string;
}

export interface MobileMoneyTransaction {
  id: string;
  reference: string;
  userId?: string;
  userName?: string;
  operator: MobileMoneyOperator;
  phoneNumber: string;
  amount: number;
  planId: PlanTier;
  listingId?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface SellerSubscription {
  currentPlan: PlanTier;
  expiresAt: string | null;
  remainingListings: number | 'Illimité';
  bannerActive: boolean;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerLinkId?: string;
}
