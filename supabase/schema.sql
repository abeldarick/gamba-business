-- ============================================================================
-- SCHÉMA SUPABASE - GAMBA BUSINESS (Le Bon Coin de Gamba, Gabon)
-- À exécuter dans le SQL Editor de votre projet Supabase
-- ============================================================================

-- 1. Table des annonces (listings)
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  price_label TEXT,
  category TEXT NOT NULL,
  quartier TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  phone TEXT NOT NULL,
  maps_url TEXT,
  address_hint TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  seller_name TEXT NOT NULL,
  seller_verified BOOLEAN NOT NULL DEFAULT false,
  plan_tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'decouverte' | 'pro' | 'business'
  is_boosted BOOLEAN NOT NULL DEFAULT false,
  has_pro_badge BOOLEAN NOT NULL DEFAULT false,
  has_home_banner BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_owner BOOLEAN NOT NULL DEFAULT false
);

-- 2. Table des transactions Mobile Money (Airtel Money / Moov Money via CinetPay)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  operator TEXT NOT NULL, -- 'airtel' | 'moov'
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  listing_id TEXT REFERENCES public.listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Activer Row Level Security (RLS) pour lecture publique et insertion MVP
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des annonces"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Insertion publique des annonces MVP"
  ON public.listings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mise à jour publique des annonces MVP"
  ON public.listings FOR UPDATE
  USING (true);

CREATE POLICY "Suppression publique des annonces MVP"
  ON public.listings FOR DELETE
  USING (true);

CREATE POLICY "Lecture et insertion transactions Mobile Money"
  ON public.transactions FOR ALL
  USING (true);
