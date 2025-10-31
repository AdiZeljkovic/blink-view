import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Get Supabase client instance
export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const customUrl = localStorage.getItem("custom_supabase_url");
  const customKey = localStorage.getItem("custom_supabase_key");

  if (customUrl && customKey) {
    console.log('[Supabase] Using custom self-hosted instance:', customUrl);
    supabaseInstance = createClient(customUrl, customKey);
    return supabaseInstance;
  }

  console.log('[Supabase] No custom instance configured');
  return null;
};

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  const customUrl = localStorage.getItem("custom_supabase_url");
  const customKey = localStorage.getItem("custom_supabase_key");
  return !!(customUrl && customKey);
};

// Reset instance (useful when credentials change)
export const resetSupabaseInstance = () => {
  supabaseInstance = null;
};
