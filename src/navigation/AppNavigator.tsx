import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, Text as RNText } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useTransactionStore } from '../store/transactionStore';
import { Colors } from '../theme';
import { LoadingScreen } from '../components/ui/LoadingScreen';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// Onboarding
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

// Main screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { BudgetsScreen } from '../screens/budgets/BudgetsScreen';
import { SubscriptionsScreen } from '../screens/subscriptions/SubscriptionsScreen';
import { SavingsScreen } from '../screens/savings/SavingsScreen';
import { CoachScreen } from '../screens/coach/CoachScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Use pure-JS stack (works on web), not native-stack
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Transactions: { focused: 'receipt', unfocused: 'receipt-outline' },
  Insights: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

function MainTabs() {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: themeColors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={(focused ? icons.focused : icons.unfocused) as any}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen
        name="Coach"
        component={CoachScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -20,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <RNText style={{ fontSize: 22 }}>🤖</RNText>
            </View>
          ),
          tabBarLabel: 'AI Coach',
        }}
      />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const screenOptions = {
  headerShown: false,
  cardStyle: { flex: 1 },
  // Disable native animations on web for reliability
  animationEnabled: Platform.OS !== 'web',
};

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="EditTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="Budgets" component={BudgetsScreen} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <Stack.Screen name="Savings" component={SavingsScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Extend DarkTheme so NavigationContainer background is dark, not white
const WealthPilotDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.primary,
  },
};

const WealthPilotLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.primary,
  },
};

export const AppNavigator = () => {
  const { session, isLoading, isOnboarded, setSession, fetchProfile, fetchSettings } = useAuthStore();
  const { fetchTransactions } = useTransactionStore();
  const { fetchAll } = useAppStore();
  const theme = useAppStore((s) => s.theme);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((err) => {
        console.error('getSession failed:', err);
      })
      .finally(() => {
        setAppReady(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          await Promise.all([fetchProfile(), fetchSettings()]);
          fetchTransactions();
          fetchAll();
        } catch (err) {
          console.error('Post-auth fetch failed:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!appReady || isLoading) {
    return <LoadingScreen message="Starting WealthPilot..." />;
  }

  const navTheme = theme === 'dark' ? WealthPilotDarkTheme : WealthPilotLightTheme;

  return (
    <NavigationContainer theme={navTheme}>
      {!session ? (
        <AuthStack />
      ) : !isOnboarded ? (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        </Stack.Navigator>
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
};
