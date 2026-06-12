import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { CURRENCIES, SPENDING_PERSONALITIES, MAIN_GOALS } from '../../constants';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const STEPS = 9;

export const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { user, setProfile, setSettings } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    currency: 'USD',
    monthlyIncome: '',
    payday: '1',
    mainGoal: '',
    currentSavings: '',
    monthlySavingTarget: '',
    spendingPersonality: '',
    notifications: { weekly: true, budget: true, subscriptions: true, payday: true, savings: true },
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const next = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      scrollRef.current?.scrollTo({ x: nextStep * width, animated: true });
    } else {
      await submit();
    }
  };

  const back = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      scrollRef.current?.scrollTo({ x: prevStep * width, animated: true });
    }
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        name: form.name,
        email: user.email || '',
        currency: form.currency,
        monthly_income: parseFloat(form.monthlyIncome) || 0,
        payday: parseInt(form.payday) || 1,
        main_goal: form.mainGoal,
        current_savings: parseFloat(form.currentSavings) || 0,
        monthly_saving_target: parseFloat(form.monthlySavingTarget) || 0,
        spending_personality: form.spendingPersonality,
      };

      const { data: profile, error: profileError } = await supabase
        .from('users_profile')
        .upsert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: 'dark',
          currency: form.currency,
          language: 'en',
          onboarding_completed: true,
        })
        .select()
        .single();

      if (settingsError) throw settingsError;

      await supabase.from('notification_preferences').upsert({
        user_id: user.id,
        weekly_summary: form.notifications.weekly,
        budget_alerts: form.notifications.budget,
        subscription_reminders: form.notifications.subscriptions,
        payday_reminder: form.notifications.payday,
        savings_reminders: form.notifications.savings,
      });

      if (profile) setProfile(profile);
      if (settings) setSettings(settings);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.name.trim().length >= 2;
      case 1: return !!form.currency;
      case 2: return parseFloat(form.monthlyIncome) > 0;
      case 3: return parseInt(form.payday) >= 1 && parseInt(form.payday) <= 31;
      case 4: return !!form.mainGoal;
      case 5: return true;
      case 6: return true;
      case 7: return !!form.spendingPersonality;
      case 8: return true;
      default: return true;
    }
  };

  const stepContent = [
    // Step 0: Name
    <StepContainer key={0} emoji="👋" title="What's your name?" subtitle="Let's personalize your experience">
      <TextInput
        value={form.name}
        onChangeText={(v) => update('name', v)}
        placeholder="Enter your name"
        placeholderTextColor="rgba(255,255,255,0.3)"
        style={styles.bigInput}
        autoFocus
      />
    </StepContainer>,

    // Step 1: Currency
    <StepContainer key={1} emoji="💱" title="Your currency" subtitle="What currency do you use daily?">
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c.code}
            onPress={() => update('currency', c.code)}
            style={[styles.option, form.currency === c.code && styles.optionSelected]}
          >
            <Text style={{ fontSize: 18 }}>{c.symbol}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text color="#FFF" style={{ fontWeight: '600' }}>{c.code}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{c.name}</Text>
            </View>
            {form.currency === c.code && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </StepContainer>,

    // Step 2: Monthly Income
    <StepContainer key={2} emoji="💰" title="Monthly income" subtitle="Your total take-home pay per month">
      <View style={styles.amountContainer}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 32, marginRight: 8 }}>
          {CURRENCIES.find((c) => c.code === form.currency)?.symbol || '$'}
        </Text>
        <TextInput
          value={form.monthlyIncome}
          onChangeText={(v) => update('monthlyIncome', v)}
          placeholder="0.00"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="numeric"
          style={[styles.bigInput, { flex: 1 }]}
          autoFocus
        />
      </View>
    </StepContainer>,

    // Step 3: Payday
    <StepContainer key={3} emoji="📅" title="When do you get paid?" subtitle="Day of month (1-31)">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[1, 5, 10, 15, 20, 25, 28, 30, 31].map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => update('payday', d.toString())}
            style={[styles.dayChip, form.payday === d.toString() && styles.dayChipSelected]}
          >
            <Text color={form.payday === d.toString() ? '#FFF' : 'rgba(255,255,255,0.6)'}>
              {d === 31 ? 'Last' : d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </StepContainer>,

    // Step 4: Main Goal
    <StepContainer key={4} emoji="🎯" title="Your main goal" subtitle="What are you working towards?">
      <ScrollView showsVerticalScrollIndicator={false}>
        {MAIN_GOALS.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => update('mainGoal', g.id)}
            style={[styles.option, form.mainGoal === g.id && styles.optionSelected]}
          >
            <Text style={{ fontSize: 24 }}>{g.icon}</Text>
            <Text color="#FFF" style={{ flex: 1, marginLeft: 12, fontWeight: '500' }}>{g.label}</Text>
            {form.mainGoal === g.id && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </StepContainer>,

    // Step 5: Current Savings
    <StepContainer key={5} emoji="🏦" title="Current savings" subtitle="How much do you have saved? (Optional)">
      <View style={styles.amountContainer}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 32, marginRight: 8 }}>
          {CURRENCIES.find((c) => c.code === form.currency)?.symbol || '$'}
        </Text>
        <TextInput
          value={form.currentSavings}
          onChangeText={(v) => update('currentSavings', v)}
          placeholder="0.00"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="numeric"
          style={[styles.bigInput, { flex: 1 }]}
        />
      </View>
    </StepContainer>,

    // Step 6: Monthly Saving Target
    <StepContainer key={6} emoji="📈" title="Monthly saving target" subtitle="How much do you want to save each month?">
      <View style={styles.amountContainer}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 32, marginRight: 8 }}>
          {CURRENCIES.find((c) => c.code === form.currency)?.symbol || '$'}
        </Text>
        <TextInput
          value={form.monthlySavingTarget}
          onChangeText={(v) => update('monthlySavingTarget', v)}
          placeholder="0.00"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="numeric"
          style={[styles.bigInput, { flex: 1 }]}
        />
      </View>
    </StepContainer>,

    // Step 7: Spending Personality
    <StepContainer key={7} emoji="🧠" title="Spending personality" subtitle="How would you describe yourself?">
      {SPENDING_PERSONALITIES.map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => update('spendingPersonality', p.id)}
          style={[styles.option, form.spendingPersonality === p.id && styles.optionSelected]}
        >
          <Text style={{ fontSize: 28 }}>{p.icon}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text color="#FFF" style={{ fontWeight: '600' }}>{p.label}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{p.description}</Text>
          </View>
          {form.spendingPersonality === p.id && (
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </StepContainer>,

    // Step 8: Notifications
    <StepContainer key={8} emoji="🔔" title="Notification preferences" subtitle="Stay on top of your finances">
      {[
        { key: 'weekly', label: 'Weekly spending summary', icon: '📊' },
        { key: 'budget', label: 'Budget exceeded alerts', icon: '⚠️' },
        { key: 'subscriptions', label: 'Subscription renewal reminders', icon: '📱' },
        { key: 'payday', label: 'Payday reminders', icon: '💸' },
        { key: 'savings', label: 'Savings goal reminders', icon: '🏆' },
      ].map((n) => (
        <TouchableOpacity
          key={n.key}
          onPress={() => update('notifications', { ...form.notifications, [n.key]: !form.notifications[n.key as keyof typeof form.notifications] })}
          style={[styles.option, { justifyContent: 'space-between' }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>{n.icon}</Text>
            <Text color="#FFF" style={{ marginLeft: 12 }}>{n.label}</Text>
          </View>
          <View style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            backgroundColor: form.notifications[n.key as keyof typeof form.notifications] ? Colors.primary : 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            paddingHorizontal: 2,
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#FFF',
              alignSelf: form.notifications[n.key as keyof typeof form.notifications] ? 'flex-end' : 'flex-start',
            }} />
          </View>
        </TouchableOpacity>
      ))}
    </StepContainer>,
  ];

  return (
    <Screen noSafeArea noPadding>
      <LinearGradient colors={['#0A0A1F', '#12122A', '#0A0A1F']} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {step > 0 ? (
                <TouchableOpacity onPress={back}>
                  <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
              ) : <View style={{ width: 24 }} />}
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                {step + 1} of {STEPS}
              </Text>
              <TouchableOpacity onPress={() => next()}>
                <Text color={Colors.primary} style={{ fontSize: 14 }}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 12 }}>
              <View style={{
                height: 3,
                backgroundColor: Colors.primary,
                borderRadius: 2,
                width: `${((step + 1) / STEPS) * 100}%`,
              }} />
            </View>
          </View>

          {/* Step content */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          >
            {stepContent.map((s, i) => (
              <View key={i} style={{ width }}>
                {s}
              </View>
            ))}
          </ScrollView>

          {/* Next button */}
          <View style={{ padding: Spacing.lg, paddingBottom: 40 }}>
            <TouchableOpacity
              onPress={next}
              disabled={!canProceed() || loading}
              style={{
                backgroundColor: canProceed() ? Colors.primary : 'rgba(108,99,255,0.3)',
                borderRadius: BorderRadius.xl,
                paddingVertical: 18,
                alignItems: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text color="#FFF" style={{ fontWeight: '700', fontSize: 17 }}>
                  {step === STEPS - 1 ? 'Let\'s Go! 🚀' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
};

const StepContainer: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ emoji, title, subtitle, children }) => (
  <View style={{ flex: 1, padding: Spacing.lg }}>
    <Text style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</Text>
    <Text variant="h2" color="#FFFFFF" style={{ marginBottom: 6 }}>{title}</Text>
    <Text style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontSize: 15 }}>{subtitle}</Text>
    {children}
  </View>
);

const styles = {
  bigInput: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600' as const,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 8,
    minWidth: 200,
  },
  amountContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionSelected: {
    backgroundColor: `${Colors.primary}20`,
    borderColor: Colors.primary,
  },
  dayChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
};
