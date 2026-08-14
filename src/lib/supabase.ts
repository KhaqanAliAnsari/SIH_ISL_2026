import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('placeholder') &&
  !rawKey.includes('placeholder')
);

// Fallback to placeholder if not configured so the app can still boot without crashing
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

