import { createClient } from '@supabase/supabase-js';

// Default to empty strings if not provided so the app doesn't crash on load, 
// but it will fail on query. The user should provide these via .env or Vercel.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
