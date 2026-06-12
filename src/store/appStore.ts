import { create } from 'zustand';
import { Budget, Subscription, SavingsGoal, NotificationPreferences } from '../types';
import { supabase } from '../services/supabase';
import { format } from 'date-fns';

interface AppState {
  budgets: Budget[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  notificationPrefs: NotificationPreferences | null;
  theme: 'dark' | 'light';
  isLoading: boolean;

  fetchBudgets: () => Promise<void>;
  addBudget: (b: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  fetchSubscriptions: () => Promise<void>;
  addSubscription: (s: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: string, s: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  fetchSavingsGoals: () => Promise<void>;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  fetchNotificationPrefs: () => Promise<void>;
  updateNotificationPrefs: (p: Partial<NotificationPreferences>) => Promise<void>;

  setTheme: (t: 'dark' | 'light') => void;
  fetchAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  budgets: [],
  subscriptions: [],
  savingsGoals: [],
  notificationPrefs: null,
  theme: 'dark',
  isLoading: false,

  fetchBudgets: async () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', currentMonth);
    if (data) set({ budgets: data });
  },

  addBudget: async (b) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...b, user_id: user.id })
      .select()
      .single();
    if (!error && data) set((state) => ({ budgets: [...state.budgets, data] }));
  },

  updateBudget: async (id, b) => {
    const { data, error } = await supabase.from('budgets').update(b).eq('id', id).select().single();
    if (!error && data) set((state) => ({ budgets: state.budgets.map((x) => x.id === id ? data : x) }));
  },

  deleteBudget: async (id) => {
    await supabase.from('budgets').delete().eq('id', id);
    set((state) => ({ budgets: state.budgets.filter((x) => x.id !== id) }));
  },

  fetchSubscriptions: async () => {
    const { data } = await supabase.from('subscriptions').select('*').eq('is_active', true);
    if (data) set({ subscriptions: data });
  },

  addSubscription: async (s) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ ...s, user_id: user.id })
      .select()
      .single();
    if (!error && data) set((state) => ({ subscriptions: [...state.subscriptions, data] }));
  },

  updateSubscription: async (id, s) => {
    const { data, error } = await supabase.from('subscriptions').update(s).eq('id', id).select().single();
    if (!error && data) set((state) => ({ subscriptions: state.subscriptions.map((x) => x.id === id ? data : x) }));
  },

  deleteSubscription: async (id) => {
    await supabase.from('subscriptions').delete().eq('id', id);
    set((state) => ({ subscriptions: state.subscriptions.filter((x) => x.id !== id) }));
  },

  fetchSavingsGoals: async () => {
    const { data } = await supabase.from('savings_goals').select('*');
    if (data) set({ savingsGoals: data });
  },

  addSavingsGoal: async (g) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...g, user_id: user.id })
      .select()
      .single();
    if (!error && data) set((state) => ({ savingsGoals: [...state.savingsGoals, data] }));
  },

  updateSavingsGoal: async (id, g) => {
    const { data, error } = await supabase.from('savings_goals').update(g).eq('id', id).select().single();
    if (!error && data) set((state) => ({ savingsGoals: state.savingsGoals.map((x) => x.id === id ? data : x) }));
  },

  deleteSavingsGoal: async (id) => {
    await supabase.from('savings_goals').delete().eq('id', id);
    set((state) => ({ savingsGoals: state.savingsGoals.filter((x) => x.id !== id) }));
  },

  fetchNotificationPrefs: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).single();
    if (data) set({ notificationPrefs: data });
  },

  updateNotificationPrefs: async (p) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('notification_preferences')
      .upsert({ ...p, user_id: user.id })
      .select()
      .single();
    if (data) set({ notificationPrefs: data });
  },

  setTheme: (t) => set({ theme: t }),

  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchBudgets(),
      get().fetchSubscriptions(),
      get().fetchSavingsGoals(),
      get().fetchNotificationPrefs(),
    ]);
    set({ isLoading: false });
  },
}));
