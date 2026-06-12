export type TransactionType = 'income' | 'expense';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  currency: string;
  monthly_income: number;
  payday: number;
  main_goal: string;
  current_savings: number;
  monthly_saving_target: number;
  spending_personality: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  payment_method?: string;
  notes?: string;
  is_essential?: boolean;
  is_recurring?: boolean;
  recurring_interval?: RecurringInterval;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
  spent?: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: RecurringInterval;
  next_renewal_date: string;
  category: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  monthly_contribution?: number;
  icon?: string;
  color?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  weekly_summary: boolean;
  budget_alerts: boolean;
  subscription_reminders: boolean;
  payday_reminder: boolean;
  savings_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light' | 'system';
  currency: string;
  language: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  netCash: number;
  incomeThisMonth: number;
  expensesThisMonth: number;
  remainingBalance: number;
  safeToSpendToday: number;
  budgetHealthScore: number;
  recentTransactions: Transaction[];
  upcomingBills: Subscription[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  spendingChart: { date: string; amount: number }[];
}
