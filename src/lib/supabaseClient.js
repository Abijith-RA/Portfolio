/**
 * ==============================================================================
 * Supabase Connection Client Setup (src/lib/supabaseClient.js)
 * ==============================================================================
 * Purpose: Initializes and exports the Supabase client using environment variables.
 * Appears: Used throughout the application via the useSupabaseData hook to fetch
 *          data from PostgreSQL tables (profile, projects, skills, experience, contact).
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from .env file (Vite environment syntax)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Helper function to check if valid Supabase environment credentials are present.
 * If credentials are missing or default placeholders, the application will use
 * realistic fallback data so the portfolio works immediately out-of-the-box.
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') && 
    !supabaseAnonKey.includes('your_supabase_anon_key')
  );
};

// Initialize Supabase Client instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
