import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// Use localStorage on web, expo-secure-store on native
const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : {
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
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
