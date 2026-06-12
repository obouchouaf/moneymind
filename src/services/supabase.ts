import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        const { getItemAsync } = await import('expo-secure-store');
        return getItemAsync(key);
      },
      setItem: async (key: string, value: string) => {
        const { setItemAsync } = await import('expo-secure-store');
        return setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        const { deleteItemAsync } = await import('expo-secure-store');
        return deleteItemAsync(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
