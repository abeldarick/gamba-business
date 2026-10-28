import { CategoryId, Listing, PricingPlan, QuartierGamba } from './types';

// ============================================================================
// DONNÉES DE BASE - GAMBA (Département de Ndougou, Ogooué-Maritime, Gabon)
// ============================================================================

export const QUARTIERS_GAMBA: QuartierGamba[] = [
  'Plaine 1',
  'Plaine 2',
  'Plaine 3',
  'Plaine 4',
  'Plaine 5',
  'Le Couloir',
  'Centre-ville',
  'Camp Yenzi',
  'Mayonami',
  'Pont Dick',
  'Voungou',
  'Terminal / Aéroport',
];

export const CATEGORIES_GAMBA: {
  id: CategoryId;
  label: string;
  description: string;
  iconName: string;
  color: string;
}[] = [
  {
    id: 'Motels',
    label: 'Motels & Logements',
    description: 'Chambres climatisées, résidences, auberges',
    iconName: 'BedDouble',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'Bars',
    label: 'Bars & Snacks',
    description: 'Bars climatisés, caves, terrasses, billard',
    iconName: 'Beer',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'Restaurants',
    label: 'Restaurants & Grillades',
    description: 'Poisson braisé, coupé-coupé, plats gabonais',
    iconName: 'UtensilsCrossed',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'Boutiques',
    label: 'Boutiques & Divers',
    description: 'Électronique, téléphones, quincaillerie, cosmétiques',
    iconName: 'Store',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'Services',
    label: 'Salons & Services',
    description: 'Coiffure, tresses, froid/clim, transport, mécanique',
    iconName: 'Scissors',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'Alimentation',
    label: 'Alimentation & Frais',
    description: 'Épiceries, poisson frais lagune, vivres frais, demi-gros',
    iconName: 'ShoppingBag',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'Vêtements',
    label: 'Vêtements & Mode',
    description: 'Prêt-à-porter, pagnes, ensembles Bazin, chaussures',
    iconName: 'Shirt',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
];

// ============================================================================
// LES 3 OFFRES PAYANTES + L'ESSAI GRATUIT (MODÈLE FREEMIUM MOBILE MONEY)
// ============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'decouverte',
    name: 'OFFRE DÉCOUVERTE',
    priceXAF: 2000,
    durationDays: 7,
    subtitle: 'Idéal pour booster rapidement une annonce ou une promo du week-end à Gamba.',
    badgeText: 'RAPIDE & ACCESSIBLE',
    maxListings: 1,
    features: [
      '1 annonce mise en avant (Section "À la une")',
      'Durée de visibilité boostée : 7 jours',
      'Bouton direct WhatsApp & Appel téléphonique',
      'Localisation par quartier & Google Maps',
      'Jusqu\'à 4 photos HD optimisées',
      'Activation immédiate via Airtel Money ou Moov Money',
    ],
    buttonLabel: 'Choisir Découverte (2 000 FCFA)',
  },
  {
    id: 'pro',
    name: 'OFFRE PRO',
    priceXAF: 5000,
    durationDays: 30,
    subtitle: 'La préférée des commerçants, motels, salons de coiffure et restaurants de Gamba.',
    badgeText: 'LA PLUS POPULAIRE 🔥',
    popular: true,
    maxListings: 5,
    features: [
      'Jusqu\'à 5 annonces actives pendant 30 jours',
      'Badge officiel "PRO VÉRIFIÉ" rassurant les clients',
      'Toujours en haut des résultats de recherche',
      'Affichage prioritaire dans "Annonces à la une"',
      'Statistiques de vues et clics WhatsApp',
      'Support client prioritaire sur WhatsApp',
    ],
    buttonLabel: 'Passer en PRO (5 000 FCFA)',
  },
  {
    id: 'business',
    name: 'OFFRE BUSINESS',
    priceXAF: 15000,
    durationDays: 30,
    subtitle: 'Dominez tout le marché de Gamba : supermarchés, grands complexes, hôtels et agences.',
    badgeText: 'VISIBILITÉ MAXIMALE VIP 👑',
    maxListings: 'Illimité',
    features: [
      'Annonces ILLIMITÉES pendant 30 jours',
      'GRANDE BANNIÈRE PUBLICITAIRE sur la page d\'accueil',
      'Badge "PRO VÉRIFIÉ" + Encadré Bleu VIP',
      'Position N°1 garantie dans votre catégorie',
      'Mise en avant automatique de toutes vos nouveautés',
      'Accompagnement personnalisé pour vos visuels pub',
    ],
    buttonLabel: 'Activer Offre Business (15 000 FCFA)',
  },
];

// ============================================================================
// AUCUNE ANNONCE DÉMO : PLATEFORME 100% PRÊTE POUR LES VRAIS UTILISATEURS
// ============================================================================

export const INITIAL_LISTINGS: Listing[] = [];

// Utilitaire de formatage en Franc CFA (XAF)
export function formatXAF(amount: number): string {
  if (!amount || amount <= 0) return 'Prix sur demande';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// Utilitaire pour calculer les jours restants avant expiration
export function getDaysRemaining(expiresAt: string): number {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Génère un lien WhatsApp pré-rempli aux normes du Gabon (+241)
export function buildWhatsAppUrl(phoneRaw: string, listingTitle: string, listingPrice: number): string {
  let clean = phoneRaw.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '241' + clean.substring(1);
  } else if (!clean.startsWith('241')) {
    clean = '241' + clean;
  }
  const message = `Bonjour ! J'ai vu votre annonce "${listingTitle}" (${formatXAF(
    listingPrice
  )}) sur GAMBA BUSINESS. Est-ce toujours disponible ?`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
