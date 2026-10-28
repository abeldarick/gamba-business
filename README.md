# 🇬🇦 GAMBA BUSINESS — Le Bon Coin de Gamba, Gabon

Plateforme web & PWA (Progressive Web App) d'annonces commerciales ultra-rapide conçue pour les commerçants, motels, bars, restaurants, salons de coiffure, boutiques et services de **Gamba (Département de Ndougou, Gabon)**.

## 💰 Business Model & Monétisation (Mobile Money Gabon)

1. **Modèle Freemium d'acquisition** :
   - **1 annonce gratuite pendant 7 jours** pour permettre à tous les commerçants de Gamba de tester la plateforme sans frein.
2. **3 Offres Payantes en Franc CFA (XAF) via Airtel Money (`*150#`) & Moov Money (`*555#`)** :
   - **OFFRE DÉCOUVERTE (2 000 XAF / 7 jours)** : 1 annonce mise en avant dans la section *"Annonces à la une"*.
   - **OFFRE PRO (5 000 XAF / 30 jours — La plus populaire)** : 5 annonces + Badge officiel **"PRO VÉRIFIÉ"** + Priorité en haut des résultats de recherche.
   - **OFFRE BUSINESS (15 000 XAF / 30 jours)** : Annonces illimitées + **Grande bannière publicitaire sur la page d'accueil** + Encadré Or VIP.

## 🚀 Démarrage rapide en local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite **http://localhost:3000** dans votre navigateur.

## 🗄️ Base de données (Hybride : Stockage Local + Supabase)

- **Par défaut (MVP immédiat)** : L'application fonctionne immédiatement à 100% avec des annonces réalistes de Gamba et sauvegarde toutes vos nouvelles annonces, vos photos (jusqu'à 4) et vos paiements Mobile Money en local (`localStorage`).
- **Passage en production Supabase** :
  1. Créez un projet gratuit sur [Supabase](https://supabase.com).
  2. Exécutez le script SQL fourni dans `supabase/schema.sql`.
  3. Copiez `.env.example` vers `.env.local` et renseignez vos clés `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
