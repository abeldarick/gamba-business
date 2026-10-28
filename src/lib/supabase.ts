import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec fallback automatique vers le stockage local (localStorage)
// si les clés d'environnement ne sont pas encore configurées pour le MVP.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
