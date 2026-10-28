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
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'Bars',
    label: 'Bars & Snacks',
    description: 'Bars climatisés, caves, terrasses, billard',
    iconName: 'Beer',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'Restaurants',
    label: 'Restaurants & Grillades',
    description: 'Poisson braisé, coupé-coupé, plats gabonais',
    iconName: 'UtensilsCrossed',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: 'Boutiques',
    label: 'Boutiques & Divers',
    description: 'Électronique, téléphones, quincaillerie, cosmétiques',
    iconName: 'Store',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'Services',
    label: 'Salons & Services',
    description: 'Coiffure, tresses, froid/clim, transport, mécanique',
    iconName: 'Scissors',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'Alimentation',
    label: 'Alimentation & Frais',
    description: 'Épiceries, poisson frais lagune, vivres frais, demi-gros',
    iconName: 'ShoppingBag',
    color: 'bg-lime-100 text-lime-800 border-lime-200',
  },
  {
    id: 'Vêtements',
    label: 'Vêtements & Mode',
    description: 'Prêt-à-porter, pagnes, ensembles Bazin, chaussures',
    iconName: 'Shirt',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
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
      'Badge "PRO VÉRIFIÉ" + Encadré Or Premium',
      'Position N°1 garantie dans votre catégorie',
      'Mise en avant automatique de toutes vos nouveautés',
      'Accompagnement personnalisé pour vos visuels pub',
    ],
    buttonLabel: 'Activer Offre Business (15 000 FCFA)',
  },
];

// ============================================================================
// ANNONCES INITIALES RÉALISTES DE GAMBA (POUR DÉMO IMMÉDIATE)
// ============================================================================

const now = new Date();
const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const in25Days = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString();
const in28Days = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString();
const expired2DaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'gamba-1',
    title: 'Résidence & Motel La Lagune Ndougou - Chambres Climatisées + WiFi',
    description:
      'Séjournez dans le calme et le confort à Gamba ! Chambres climatisées ultra propres avec télévision Canal+, WiFi haut débit, groupe électrogène de secours et château d\'eau. Parking sécurisé avec gardien 24h/24. Tarifs spéciaux pour missionnaires et séjours longue durée.',
    price: 20000,
    priceLabel: '/ nuitée',
    category: 'Motels',
    quartier: 'Centre-ville',
    whatsapp: '24177451289',
    phone: '+241 077 45 12 89',
    mapsUrl: 'https://www.google.com/maps?q=-2.7258,10.0172',
    addressHint: 'Centre-ville, à 150m du rond-point principal vers la lagune',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
    ],
    sellerName: 'Motel La Lagune Gamba',
    sellerVerified: true,
    planTier: 'business',
    isBoosted: true,
    hasProBadge: true,
    hasHomeBanner: true,
    views: 342,
    whatsappClicks: 68,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in28Days,
    isOwner: true,
  },
  {
    id: 'gamba-2',
    title: 'Chez Maman Clarisse - Poisson Braisé de la Lagune, Coupé-Coupé & Plats Gabonais',
    description:
      'Le meilleur goût de Gamba ! Tous les midis et soirs : carpe et bar frais de la lagune braisés au feu de bois, coupé-coupé bien assaisonné, bouillon de poisson frais, feuilles de manioc, banane plantain et bâton de manioc. Livraison rapide dans tout Gamba (Plaine, Centre-ville, Camp Yenzi).',
    price: 3500,
    priceLabel: '/ plat complet',
    category: 'Restaurants',
    quartier: 'Plaine 2',
    whatsapp: '24166892341',
    phone: '+241 066 89 23 41',
    mapsUrl: 'https://www.google.com/maps?q=-2.7310,10.0210',
    addressHint: 'Quartier Plaine, juste en face de la boulangerie',
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Restaurant Maman Clarisse',
    sellerVerified: true,
    planTier: 'pro',
    isBoosted: true,
    hasProBadge: true,
    hasHomeBanner: false,
    views: 289,
    whatsappClicks: 94,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in25Days,
    isOwner: true,
  },
  {
    id: 'gamba-3',
    title: 'Salon Glamour VIP Gamba - Tresses, Perruques, Pose Gel & Coiffure Homme/Femme',
    description:
      'Sublimez votre beauté chez Salon Glamour VIP ! Tresses africaines modernes, pose de perruques lace frontal, tissages brésiliens, pédicure/manucure gel, maquillage cérémonie et coupe homme dégradé américain. Salon climatisé, rendez-vous rapide sur WhatsApp.',
    price: 5000,
    priceLabel: 'À partir de',
    category: 'Services',
    quartier: 'Centre-ville',
    whatsapp: '24174129088',
    phone: '+241 074 12 90 88',
    mapsUrl: 'https://www.google.com/maps?q=-2.7240,10.0155',
    addressHint: 'Centre-ville, à côté de l\'agence Airtel Money',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Salon Glamour VIP',
    sellerVerified: true,
    planTier: 'pro',
    isBoosted: true,
    hasProBadge: true,
    hasHomeBanner: false,
    views: 198,
    whatsappClicks: 52,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in25Days,
    isOwner: false,
  },
  {
    id: 'gamba-4',
    title: 'Le Phare Lounge & Snack-Bar - Bières Glacées, Cocktails, Billard & Matchs en Direct',
    description:
      'Votre cadre chic et sécurisé pour décompresser à Gamba ! Régab, Castel, Beaufort bien glacées, liqueurs, grillades de brochettes le soir, table de billard neuve et écrans géants pour tous les matchs de Champions League. Ambiance DJ vendredi et samedi soir.',
    price: 1000,
    priceLabel: '/ boisson',
    category: 'Bars',
    quartier: 'Le Couloir',
    whatsapp: '24177910233',
    phone: '+241 077 91 02 33',
    mapsUrl: 'https://www.google.com/maps?q=-2.7295,10.0190',
    addressHint: 'Quartier Plaine, carrefour goudron principal',
    images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Le Phare Lounge Bar',
    sellerVerified: false,
    planTier: 'decouverte',
    isBoosted: true,
    hasProBadge: false,
    hasHomeBanner: false,
    views: 164,
    whatsappClicks: 31,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in7Days,
    isOwner: false,
  },
  {
    id: 'gamba-5',
    title: 'Établissement Nzambi Alimentation - Produits Frais, Congelés, Boissons & Gaz',
    description:
      'Alimentation générale gros et demi-gros à Gamba. Sacs de riz parfumé, huile, cartons de poulet et ailes de dinde, lait, recharges bouteilles de gaz, packs d\'eau Andza et boissons. Paiement Airtel Money et Moov Money accepté sans frais supplémentaires !',
    price: 15000,
    priceLabel: 'Sac de riz 25kg',
    category: 'Alimentation',
    quartier: 'Plaine 3',
    whatsapp: '24162334455',
    phone: '+241 062 33 44 55',
    mapsUrl: 'https://www.google.com/maps?q=-2.7350,10.0245',
    addressHint: 'Entrée Quartier Fougamou, grand bâtiment orange',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Éts Nzambi Alimentation',
    sellerVerified: true,
    planTier: 'pro',
    isBoosted: false,
    hasProBadge: true,
    hasHomeBanner: false,
    views: 120,
    whatsappClicks: 29,
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in25Days,
    isOwner: false,
  },
  {
    id: 'gamba-6',
    title: 'Gamba Froid & Élec - Installation, Entretien Climatiseurs, Frigos & Groupes Électrogènes',
    description:
      'Technicien frigoriste et électricien diplômé basé à Gamba. Recharge gaz climatiseurs split, réparation congélateurs et réfrigérateurs, maintenance groupes électrogènes et installation panneaux solaires. Déplacement rapide dans tous les quartiers.',
    price: 10000,
    priceLabel: 'Diagnostic & entretien',
    category: 'Services',
    quartier: 'Plaine 4',
    whatsapp: '24177556677',
    phone: '+241 077 55 66 77',
    mapsUrl: 'https://www.google.com/maps?q=-2.7420,10.0110',
    addressHint: 'Plaine 4, près de l\'école publique',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Gamba Froid Services',
    sellerVerified: false,
    planTier: 'free',
    isBoosted: false,
    hasProBadge: false,
    hasHomeBanner: false,
    views: 87,
    whatsappClicks: 19,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in7Days,
    isOwner: false,
  },
  {
    id: 'gamba-7',
    title: 'Boutique Chic & Wax Gamba - Arrivage Ensembles Bazin, Robes, Chemises & Baskets',
    description:
      'Nouvel arrivage de Libreville et Cotonou ! Magnifiques ensembles Bazin brodé, pagnes Wax hollandais, robes de soirée, chemises homme qualité supérieure, sacs à main et chaussures. Passez essayer en boutique ou commandez par WhatsApp.',
    price: 12000,
    priceLabel: 'À partir de',
    category: 'Vêtements',
    quartier: 'Plaine 5',
    whatsapp: '24166112299',
    phone: '+241 066 11 22 99',
    mapsUrl: 'https://www.google.com/maps?q=-2.7265,10.0180',
    addressHint: 'Entrée Plaine 5, boutique vitrée bleue',
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Chic & Wax Boutique',
    sellerVerified: false,
    planTier: 'free',
    isBoosted: false,
    hasProBadge: false,
    hasHomeBanner: false,
    views: 95,
    whatsappClicks: 24,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: in7Days,
    isOwner: false,
  },
  {
    id: 'gamba-8',
    title: 'Ancienne Promo Week-end : Panier Poisson Fumé & Crevettes de Mayonami',
    description:
      'Lots de poissons fumés traditionnels et crevettes séchées de Mayonami. Annonce gratuite de 7 jours arrivée à expiration — cliquez sur "Booster (Mobile Money)" dans votre espace vendeur pour la réactiver en 10 secondes !',
    price: 5000,
    priceLabel: '/ panier',
    category: 'Alimentation',
    quartier: 'Mayonami',
    whatsapp: '24177451289',
    phone: '+241 077 45 12 89',
    mapsUrl: 'https://www.google.com/maps?q=-2.7500,10.0300',
    addressHint: 'Débarcadère Mayonami / livraison Plaine 1 à 5',
    images: ['https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=900&q=80'],
    sellerName: 'Coopérative Pêcheurs Mayonami',
    sellerVerified: false,
    planTier: 'free',
    isBoosted: false,
    hasProBadge: false,
    hasHomeBanner: false,
    views: 63,
    whatsappClicks: 14,
    createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: expired2DaysAgo,
    isOwner: true,
  },
];

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
