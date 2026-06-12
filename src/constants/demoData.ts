import { Transaction, Budget, Subscription, SavingsGoal, UserProfile, UserSettings } from '../types';
import { format, subDays, addDays, addMonths } from 'date-fns';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-profile',
  user_id: 'demo-user',
  name: 'Alex Johnson',
  email: 'alex@wealthpilot.app',
  currency: 'USD',
  monthly_income: 5800,
  payday: 1,
  main_goal: 'financial_freedom',
  current_savings: 12400,
  monthly_saving_target: 800,
  spending_personality: 'balanced',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_SETTINGS: UserSettings = {
  id: 'demo-settings',
  user_id: 'demo-user',
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Income
  { id: 't1', user_id: 'demo-user', type: 'income', amount: 5800, category: 'income', description: 'Monthly Salary', date: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), payment_method: 'bank_transfer', is_essential: true, is_recurring: true, notes: undefined, recurring_interval: 'monthly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't2', user_id: 'demo-user', type: 'income', amount: 320, category: 'income', description: 'Freelance Design Work', date: fmt(subDays(today, 8)), payment_method: 'bank_transfer', is_essential: true, is_recurring: false, notes: 'Logo project for client', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Housing
  { id: 't3', user_id: 'demo-user', type: 'expense', amount: 1450, category: 'rent', description: 'Monthly Rent', date: fmt(new Date(today.getFullYear(), today.getMonth(), 2)), payment_method: 'bank_transfer', is_essential: true, is_recurring: true, recurring_interval: 'monthly', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't4', user_id: 'demo-user', type: 'expense', amount: 94, category: 'bills', description: 'Electricity Bill', date: fmt(subDays(today, 5)), payment_method: 'debit', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't5', user_id: 'demo-user', type: 'expense', amount: 68, category: 'bills', description: 'Internet & Phone', date: fmt(subDays(today, 5)), payment_method: 'debit', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Food
  { id: 't6', user_id: 'demo-user', type: 'expense', amount: 92.40, category: 'groceries', description: 'Weekly Groceries', date: fmt(subDays(today, 2)), payment_method: 'debit', is_essential: true, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't7', user_id: 'demo-user', type: 'expense', amount: 44, category: 'food', description: 'Dinner with Sarah', date: fmt(subDays(today, 3)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't8', user_id: 'demo-user', type: 'expense', amount: 14.50, category: 'food', description: 'Lunch – Chipotle', date: fmt(subDays(today, 1)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't9', user_id: 'demo-user', type: 'expense', amount: 78.20, category: 'groceries', description: 'Trader Joe\'s', date: fmt(subDays(today, 9)), payment_method: 'debit', is_essential: true, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't10', user_id: 'demo-user', type: 'expense', amount: 6.50, category: 'food', description: 'Morning Coffee', date: fmt(today), payment_method: 'digital_wallet', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Transport
  { id: 't11', user_id: 'demo-user', type: 'expense', amount: 128, category: 'transport', description: 'Monthly Metro Pass', date: fmt(new Date(today.getFullYear(), today.getMonth(), 3)), payment_method: 'debit', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't12', user_id: 'demo-user', type: 'expense', amount: 34, category: 'transport', description: 'Uber – Airport', date: fmt(subDays(today, 12)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Shopping
  { id: 't13', user_id: 'demo-user', type: 'expense', amount: 189, category: 'shopping', description: 'Nike Running Shoes', date: fmt(subDays(today, 7)), payment_method: 'credit', is_essential: false, is_recurring: false, notes: 'On sale, 30% off', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't14', user_id: 'demo-user', type: 'expense', amount: 54, category: 'shopping', description: 'Amazon – Books', date: fmt(subDays(today, 14)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Health
  { id: 't15', user_id: 'demo-user', type: 'expense', amount: 45, category: 'health', description: 'Gym Membership', date: fmt(new Date(today.getFullYear(), today.getMonth(), 5)), payment_method: 'debit', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't16', user_id: 'demo-user', type: 'expense', amount: 22, category: 'health', description: 'Pharmacy', date: fmt(subDays(today, 6)), payment_method: 'debit', is_essential: true, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Subscriptions
  { id: 't17', user_id: 'demo-user', type: 'expense', amount: 15.99, category: 'subscriptions', description: 'Netflix', date: fmt(new Date(today.getFullYear(), today.getMonth(), 8)), payment_method: 'credit', is_essential: false, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't18', user_id: 'demo-user', type: 'expense', amount: 9.99, category: 'subscriptions', description: 'Spotify', date: fmt(new Date(today.getFullYear(), today.getMonth(), 8)), payment_method: 'credit', is_essential: false, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Entertainment
  { id: 't19', user_id: 'demo-user', type: 'expense', amount: 62, category: 'entertainment', description: 'Concert Tickets', date: fmt(subDays(today, 10)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Savings
  { id: 't20', user_id: 'demo-user', type: 'expense', amount: 500, category: 'savings', description: 'Emergency Fund Transfer', date: fmt(new Date(today.getFullYear(), today.getMonth(), 2)), payment_method: 'bank_transfer', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // Last month income & expenses for comparison
  { id: 't21', user_id: 'demo-user', type: 'income', amount: 5800, category: 'income', description: 'Monthly Salary', date: fmt(new Date(today.getFullYear(), today.getMonth() - 1, 1)), payment_method: 'bank_transfer', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't22', user_id: 'demo-user', type: 'expense', amount: 1450, category: 'rent', description: 'Monthly Rent', date: fmt(new Date(today.getFullYear(), today.getMonth() - 1, 2)), payment_method: 'bank_transfer', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't23', user_id: 'demo-user', type: 'expense', amount: 310, category: 'shopping', description: 'Clothes Shopping', date: fmt(subDays(today, 22)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't24', user_id: 'demo-user', type: 'expense', amount: 88, category: 'groceries', description: 'Weekly Groceries', date: fmt(subDays(today, 18)), payment_method: 'debit', is_essential: true, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't25', user_id: 'demo-user', type: 'expense', amount: 75, category: 'food', description: 'Team Lunch', date: fmt(subDays(today, 20)), payment_method: 'credit', is_essential: false, is_recurring: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 't26', user_id: 'demo-user', type: 'expense', amount: 128, category: 'transport', description: 'Monthly Metro Pass', date: fmt(subDays(today, 28)), payment_method: 'debit', is_essential: true, is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const DEMO_BUDGETS: Budget[] = [
  { id: 'b1', user_id: 'demo-user', category: 'food', amount: 400, month: format(today, 'yyyy-MM'), spent: 65, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b2', user_id: 'demo-user', category: 'groceries', amount: 350, month: format(today, 'yyyy-MM'), spent: 170.6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b3', user_id: 'demo-user', category: 'transport', amount: 150, month: format(today, 'yyyy-MM'), spent: 162, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b4', user_id: 'demo-user', category: 'entertainment', amount: 100, month: format(today, 'yyyy-MM'), spent: 62, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'b5', user_id: 'demo-user', category: 'shopping', amount: 200, month: format(today, 'yyyy-MM'), spent: 243, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', user_id: 'demo-user', name: 'Netflix', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', next_renewal_date: fmt(addDays(today, 4)), category: 'subscriptions', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's2', user_id: 'demo-user', name: 'Spotify', amount: 9.99, currency: 'USD', billing_cycle: 'monthly', next_renewal_date: fmt(addDays(today, 4)), category: 'subscriptions', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's3', user_id: 'demo-user', name: 'iCloud 200GB', amount: 2.99, currency: 'USD', billing_cycle: 'monthly', next_renewal_date: fmt(addDays(today, 12)), category: 'subscriptions', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's4', user_id: 'demo-user', name: 'Gym Membership', amount: 45, currency: 'USD', billing_cycle: 'monthly', next_renewal_date: fmt(addDays(today, 6)), category: 'health', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's5', user_id: 'demo-user', name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', billing_cycle: 'monthly', next_renewal_date: fmt(addDays(today, 18)), category: 'subscriptions', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 's6', user_id: 'demo-user', name: 'Amazon Prime', amount: 139, currency: 'USD', billing_cycle: 'yearly', next_renewal_date: fmt(addMonths(today, 3)), category: 'subscriptions', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const DEMO_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'g1', user_id: 'demo-user', name: 'Emergency Fund', target_amount: 15000, current_amount: 8400, deadline: fmt(addMonths(today, 9)), monthly_contribution: 700, icon: '🛡️', color: '#6C63FF', is_completed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'g2', user_id: 'demo-user', name: 'Japan Trip ✈️', target_amount: 4500, current_amount: 1800, deadline: fmt(addMonths(today, 6)), monthly_contribution: 450, icon: '✈️', color: '#00D4AA', is_completed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'g3', user_id: 'demo-user', name: 'New MacBook', target_amount: 2499, current_amount: 2499, deadline: undefined, monthly_contribution: 0, icon: '💻', color: '#FFB347', is_completed: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
