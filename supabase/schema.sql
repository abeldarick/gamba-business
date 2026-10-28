-- ============================================================================
-- SCHÉMA SUPABASE COMPLET - GAMBA BUSINESS (Annonces + Facturation RLS + Admin)
-- À exécuter dans le SQL Editor de votre projet Supabase
-- ============================================================================

-- 1. Table des annonces (listings) - Zéro annonce démo par défaut
CREATE TABLE IF NOT EXISTS public.listings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
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
  plan_tier TEXT NOT NULL DEFAULT 'free',
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
  user_id TEXT,
  user_name TEXT,
  operator TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  listing_id TEXT REFERENCES public.listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. MODULE FACTURATION PRO (CLIENTS & FACTURES TVA 18% FCFA AVEC AUTH RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.billing_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  quartier TEXT NOT NULL DEFAULT 'Centre-ville',
  address TEXT,
  nif_rccm TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  invoice_number TEXT NOT NULL,
  client_id UUID REFERENCES public.billing_clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_quartier TEXT NOT NULL,
  client_nif TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'EN_ATTENTE',
  payment_method TEXT DEFAULT 'Airtel Money',
  apply_tva BOOLEAN NOT NULL DEFAULT true,
  tva_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_ht BIGINT NOT NULL DEFAULT 0,
  tva_amount BIGINT NOT NULL DEFAULT 0,
  total_ttc BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS) STRICTES PAR UTILISATEUR
-- ============================================================================

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RLS_clients_select_own"
  ON public.billing_clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "RLS_clients_insert_own"
  ON public.billing_clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RLS_clients_update_own"
  ON public.billing_clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RLS_clients_delete_own"
  ON public.billing_clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "RLS_invoices_select_own"
  ON public.billing_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "RLS_invoices_insert_own"
  ON public.billing_invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RLS_invoices_update_own"
  ON public.billing_invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "RLS_invoices_delete_own"
  ON public.billing_invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE DES UTILISATEURS INSCRITS (2 MODES : PAR MAIL OU PAR TÉLÉPHONE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('email', 'phone')),
  email TEXT,
  phone TEXT NOT NULL,
  quartier TEXT NOT NULL DEFAULT 'Centre-ville',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'decouverte', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF', 'SUSPENDU')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture et inscription utilisateurs Gamba Business"
  ON public.app_users FOR SELECT
  USING (true);

CREATE POLICY "Inscription nouveau compte par mail ou telephone"
  ON public.app_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mise a jour utilisateurs par Admin"
  ON public.app_users FOR UPDATE
  USING (true);
