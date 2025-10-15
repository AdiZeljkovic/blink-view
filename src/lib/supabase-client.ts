import { createClient } from '@supabase/supabase-js';

// Create custom Supabase client based on admin settings
export const getSupabaseClient = () => {
  const customUrl = localStorage.getItem("custom_supabase_url");
  const customKey = localStorage.getItem("custom_supabase_key");

  if (customUrl && customKey) {
    console.log('[Supabase] Using custom self-hosted instance:', customUrl);
    return createClient(customUrl, customKey);
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
