import { create } from 'zustand';
import { Transaction } from '../types';
import { supabase } from '../services/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { DEMO_TRANSACTIONS } from '../constants/demoData';

interface TransactionFilters {
  search: string;
  category: string | null;
  type: 'all' | 'income' | 'expense';
  startDate: Date | null;
  endDate: Date | null;
  paymentMethod: string | null;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  fetchTransactions: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilters: (f: Partial<TransactionFilters>) => void;
  getMonthlyStats: (date?: Date) => { income: number; expenses: number; net: number };
  filteredTransactions: () => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  filters: {
    search: '',
    category: null,
    type: 'all',
    startDate: null,
    endDate: null,
    paymentMethod: null,
  },

  fetchTransactions: async () => {
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isDemoMode) {
      set({ transactions: [...DEMO_TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date)), isLoading: false });
      return;
    }
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) set({ transactions: data });
    set({ isLoading: false });
  },

  addTransaction: async (t) => {
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isDemoMode) {
      const newTx: Transaction = { ...t, id: `demo-${Date.now()}`, user_id: 'demo-user', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...t, user_id: user.id })
      .select()
      .single();
    if (!error && data) {
      set((state) => ({ transactions: [data, ...state.transactions] }));
    }
  },

  updateTransaction: async (id, t) => {
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isDemoMode) {
      set((state) => ({ transactions: state.transactions.map((tx) => tx.id === id ? { ...tx, ...t, updated_at: new Date().toISOString() } : tx) }));
      return;
    }
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...t, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      set((state) => ({
        transactions: state.transactions.map((tx) => (tx.id === id ? data : tx)),
      }));
    }
  },

  deleteTransaction: async (id) => {
    const { useAuthStore } = require('./authStore');
    if (useAuthStore.getState().isDemoMode) {
      set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
      return;
    }
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
    }
  },

  setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),

  getMonthlyStats: (date = new Date()) => {
    const { transactions } = get();
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const income = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses };
  },

  filteredTransactions: () => {
    const { transactions, filters } = get();
    return transactions.filter((t) => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.paymentMethod && t.payment_method !== filters.paymentMethod) return false;
      if (filters.startDate && new Date(t.date) < filters.startDate) return false;
      if (filters.endDate && new Date(t.date) > filters.endDate) return false;
      return true;
    });
  },
}));
