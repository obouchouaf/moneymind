# WealthPilot — AI Budget Planner

A premium, production-ready AI personal finance app built with React Native + Expo.

## Features

- **Authentication** — Email/password with secure session handling
- **Premium Onboarding** — 9-step personalized financial profile setup
- **Dashboard** — Net cash, spending charts, savings progress, AI insights
- **Transactions** — Add/edit/delete with category, payment method, notes, recurring
- **Budgets** — Category budgets with progress tracking and overspend alerts
- **Subscriptions** — Track recurring subscriptions with renewal alerts
- **Savings Goals** — Multiple goals with AI plans and progress bars
- **AI Coach** — Chat interface with full access to your financial data
- **Insights** — Monthly reports, spending trends, income vs expense charts
- **Settings** — Theme toggle, notifications, CSV export, manage subscription

## Tech Stack

- **React Native + Expo** (SDK 52)
- **TypeScript**
- **Supabase** — Auth + PostgreSQL database with RLS
- **Zustand** — State management
- **React Hook Form + Zod** — Form validation
- **OpenAI GPT-4o mini** — AI financial coaching
- **expo-secure-store** — Secure session storage
- **expo-notifications** — Push notifications
- **expo-haptics** — Haptic feedback
- **expo-file-system + expo-sharing** — CSV export

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd moneymind
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your values:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS API key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android API key |

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `supabase/schema.sql` to create all tables, RLS policies, and triggers
4. (Optional) Run `supabase/seed.sql` with your user ID to add demo data

### 4. Run the App

```bash
npx expo start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, Input, etc.)
│   └── charts/      # Chart components
├── constants/       # App constants (categories, currencies, etc.)
├── navigation/      # React Navigation setup
├── screens/
│   ├── auth/        # Login, Signup, ForgotPassword
│   ├── onboarding/  # 9-step onboarding flow
│   ├── dashboard/   # Main dashboard
│   ├── transactions/# Transaction list + add/edit
│   ├── budgets/     # Budget management
│   ├── subscriptions/ # Subscription tracker
│   ├── savings/     # Savings goals
│   ├── coach/       # AI chat interface
│   ├── insights/    # Financial insights & reports
│   └── settings/    # App settings
├── services/
│   ├── supabase.ts  # Supabase client
│   └── openai.ts    # OpenAI integration
├── store/
│   ├── authStore.ts       # Auth state
│   ├── transactionStore.ts# Transaction state
│   └── appStore.ts        # Budgets, subscriptions, savings state
├── theme/           # Colors, typography, spacing
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Pricing (Freemium)

| Feature | Free | Premium |
|---|---|---|
| Transactions/month | 50 | Unlimited |
| AI messages/month | 3 | Unlimited |
| Savings goals | 1 | Unlimited |
| Weekly AI reports | ❌ | ✅ |
| Smart alerts | ❌ | ✅ |
| CSV export | ❌ | ✅ |
| Advanced insights | ❌ | ✅ |

**Pricing:** $4.99/month or $39.99/year

## Database Schema

- `users_profile` — User financial profile
- `user_settings` — Theme, currency, onboarding status
- `transactions` — All income/expense records
- `budgets` — Monthly category budgets
- `subscriptions` — Recurring subscription tracker
- `savings_goals` — Savings goals with progress
- `ai_messages` — AI coach conversation history
- `notification_preferences` — User notification settings

All tables have Row Level Security (RLS) — users can only access their own data.

## App Store Readiness

- ✅ Privacy policy placeholder in settings
- ✅ Terms of service placeholder in settings
- ✅ No hardcoded secrets (all via env vars)
- ✅ Proper bundle identifiers in app.json
- ✅ Portrait orientation locked
- ✅ Haptic feedback throughout
- ✅ Empty states for all screens
- ✅ Loading states throughout
- ✅ Error handling

## License

MIT
