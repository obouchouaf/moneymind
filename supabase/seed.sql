-- Seed demo data (replace 'YOUR_USER_ID' with an actual Supabase auth user ID)
-- Run after schema.sql

-- Example: Insert demo profile
-- INSERT INTO users_profile (user_id, name, email, currency, monthly_income, payday, main_goal, current_savings, monthly_saving_target, spending_personality)
-- VALUES ('YOUR_USER_ID', 'Alex Johnson', 'alex@example.com', 'USD', 5000, 1, 'financial_freedom', 8000, 500, 'balanced');

-- Example: Insert demo transactions
-- INSERT INTO transactions (user_id, type, amount, category, description, date, payment_method, is_essential)
-- VALUES
--   ('YOUR_USER_ID', 'income', 5000, 'income', 'Monthly Salary', CURRENT_DATE - INTERVAL '1 day', 'bank_transfer', true),
--   ('YOUR_USER_ID', 'expense', 1200, 'rent', 'Monthly Rent', CURRENT_DATE - INTERVAL '2 days', 'bank_transfer', true),
--   ('YOUR_USER_ID', 'expense', 85.50, 'groceries', 'Weekly Groceries', CURRENT_DATE - INTERVAL '3 days', 'debit', true),
--   ('YOUR_USER_ID', 'expense', 15.99, 'subscriptions', 'Netflix', CURRENT_DATE - INTERVAL '4 days', 'credit', false),
--   ('YOUR_USER_ID', 'expense', 45.00, 'food', 'Dinner with friends', CURRENT_DATE - INTERVAL '5 days', 'credit', false),
--   ('YOUR_USER_ID', 'expense', 120, 'transport', 'Monthly transit pass', CURRENT_DATE - INTERVAL '6 days', 'debit', true),
--   ('YOUR_USER_ID', 'expense', 9.99, 'subscriptions', 'Spotify', CURRENT_DATE - INTERVAL '7 days', 'credit', false),
--   ('YOUR_USER_ID', 'expense', 250, 'shopping', 'New shoes', CURRENT_DATE - INTERVAL '8 days', 'credit', false);

-- Example: Insert demo budgets
-- INSERT INTO budgets (user_id, category, amount, month)
-- VALUES
--   ('YOUR_USER_ID', 'food', 400, to_char(CURRENT_DATE, 'YYYY-MM')),
--   ('YOUR_USER_ID', 'groceries', 300, to_char(CURRENT_DATE, 'YYYY-MM')),
--   ('YOUR_USER_ID', 'transport', 150, to_char(CURRENT_DATE, 'YYYY-MM')),
--   ('YOUR_USER_ID', 'entertainment', 200, to_char(CURRENT_DATE, 'YYYY-MM')),
--   ('YOUR_USER_ID', 'shopping', 300, to_char(CURRENT_DATE, 'YYYY-MM'));

-- Example: Insert demo subscriptions
-- INSERT INTO subscriptions (user_id, name, amount, currency, billing_cycle, next_renewal_date, category)
-- VALUES
--   ('YOUR_USER_ID', 'Netflix', 15.99, 'USD', 'monthly', CURRENT_DATE + INTERVAL '15 days', 'subscriptions'),
--   ('YOUR_USER_ID', 'Spotify', 9.99, 'USD', 'monthly', CURRENT_DATE + INTERVAL '5 days', 'subscriptions'),
--   ('YOUR_USER_ID', 'iCloud', 2.99, 'USD', 'monthly', CURRENT_DATE + INTERVAL '20 days', 'subscriptions'),
--   ('YOUR_USER_ID', 'Gym', 40.00, 'USD', 'monthly', CURRENT_DATE + INTERVAL '3 days', 'health');

-- Example: Insert demo savings goals
-- INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, monthly_contribution, icon, color)
-- VALUES
--   ('YOUR_USER_ID', 'Emergency Fund', 10000, 4500, CURRENT_DATE + INTERVAL '8 months', 700, '🛡️', '#6C63FF'),
--   ('YOUR_USER_ID', 'Dream Vacation', 3000, 800, CURRENT_DATE + INTERVAL '12 months', 200, '✈️', '#00D4AA');
