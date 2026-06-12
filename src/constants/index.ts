export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#4ECDC4' },
  { id: 'rent', label: 'Rent & Housing', icon: '🏠', color: '#45B7D1' },
  { id: 'bills', label: 'Bills & Utilities', icon: '⚡', color: '#96CEB4' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#FFEAA7' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#DDA0DD' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#98D8C8' },
  { id: 'health', label: 'Health & Fitness', icon: '💊', color: '#F7DC6F' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#BB8FCE' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧', color: '#85C1E9' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#82E0AA' },
  { id: 'education', label: 'Education', icon: '📚', color: '#F0B27A' },
  { id: 'business', label: 'Business', icon: '💼', color: '#AEB6BF' },
  { id: 'savings', label: 'Savings', icon: '🏦', color: '#76D7C4' },
  { id: 'income', label: 'Income', icon: '💰', color: '#58D68D' },
  { id: 'other', label: 'Other', icon: '📦', color: '#BDC3C7' },
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'DZD', symbol: 'دج', name: 'Algerian Dinar' },
] as const;

export const SPENDING_PERSONALITIES = [
  { id: 'saver', label: 'The Saver', description: 'I save every penny I can', icon: '🐿️' },
  { id: 'balanced', label: 'The Balanced', description: 'I balance saving and spending', icon: '⚖️' },
  { id: 'spender', label: 'The Enjoyer', description: 'I enjoy spending on experiences', icon: '🎉' },
  { id: 'impulsive', label: 'The Impulsive', description: 'I sometimes buy on impulse', icon: '⚡' },
] as const;

export const MAIN_GOALS = [
  { id: 'emergency_fund', label: 'Build Emergency Fund', icon: '🛡️' },
  { id: 'debt_free', label: 'Become Debt Free', icon: '🔓' },
  { id: 'invest', label: 'Start Investing', icon: '📈' },
  { id: 'save_home', label: 'Save for a Home', icon: '🏡' },
  { id: 'retirement', label: 'Plan for Retirement', icon: '🌴' },
  { id: 'travel', label: 'Travel the World', icon: '✈️' },
  { id: 'financial_freedom', label: 'Financial Freedom', icon: '🦋' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'debit', label: 'Debit Card', icon: '💳' },
  { id: 'credit', label: 'Credit Card', icon: '🏦' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🔄' },
  { id: 'digital_wallet', label: 'Digital Wallet', icon: '📱' },
] as const;

export const FREE_TIER_LIMITS = {
  TRANSACTIONS_PER_MONTH: 50,
  AI_MESSAGES_PER_MONTH: 3,
  SAVINGS_GOALS: 1,
};
