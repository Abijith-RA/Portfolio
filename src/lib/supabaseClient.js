import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = () => {
  try {
    return Boolean(
      supabaseUrl && 
      supabaseAnonKey && 
      typeof supabaseUrl === 'string' &&
      typeof supabaseAnonKey === 'string' &&
      supabaseUrl.startsWith('http') &&
      !supabaseUrl.includes('your-project') && 
      !supabaseAnonKey.includes('your_supabase_anon_key')
    );
  } catch {
    return false;
  }
};

let clientInstance = null;
if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    clientInstance = null;
  }
}

export const supabase = clientInstance;
