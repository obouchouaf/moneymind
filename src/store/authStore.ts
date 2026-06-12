import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile, UserSettings } from '../types';
import { DEMO_PROFILE, DEMO_SETTINGS } from '../constants/demoData';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isOnboarded: boolean;
  isDemoMode: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  fetchProfile: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  settings: null,
  isLoading: true,
  isOnboarded: false,
  isDemoMode: false,

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
    const { isDemoMode } = get();
    if (isDemoMode) {
      set({ session: null, user: null, profile: null, settings: null, isOnboarded: false, isDemoMode: false });
      return;
    }
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, settings: null, isOnboarded: false });
  },

  enterDemoMode: () => {
    set({
      isDemoMode: true,
      isOnboarded: true,
      isLoading: false,
      profile: DEMO_PROFILE,
      settings: DEMO_SETTINGS,
      session: { user: { id: 'demo-user' } } as any,
      user: { id: 'demo-user', email: 'alex@wealthpilot.app' } as any,
    });
  },

  exitDemoMode: () => {
    set({ isDemoMode: false, session: null, user: null, profile: null, settings: null, isOnboarded: false });
  },
}));
