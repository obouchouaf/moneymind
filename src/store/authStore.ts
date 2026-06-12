import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile, UserSettings } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  fetchProfile: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  settings: null,
  isLoading: true,
  isOnboarded: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoading: false });
  },

  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings, isOnboarded: settings?.onboarding_completed ?? false }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('users_profile')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) set({ profile: data });
  },

  fetchSettings: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) set({ settings: data, isOnboarded: data.onboarding_completed });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, settings: null, isOnboarded: false });
  },
}));
