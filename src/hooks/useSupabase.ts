import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export const useSupabase = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    
    if (configured) {
      const client = getSupabase();
      setSupabase(client);
    }
  }, []);

  return { supabase, isConfigured };
};
