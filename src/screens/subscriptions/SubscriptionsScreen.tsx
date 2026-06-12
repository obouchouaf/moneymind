import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, addYears, addWeeks } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, getDaysUntil } from '../../utils/format';
import { Subscription } from '../../types';
import { CATEGORIES } from '../../constants';
import * as Haptics from 'expo-haptics';

const POPULAR_SUBS = [
  { name: 'Netflix', icon: '🎬', amount: 15.99, category: 'subscriptions' },
  { name: 'Spotify', icon: '🎵', amount: 9.99, category: 'subscriptions' },
  { name: 'Apple iCloud', icon: '☁️', amount: 2.99, category: 'subscriptions' },
  { name: 'Amazon Prime', icon: '📦', amount: 14.99, category: 'subscriptions' },
  { name: 'Disney+', icon: '✨', amount: 10.99, category: 'entertainment' },
  { name: 'YouTube Premium', icon: '▶️', amount: 13.99, category: 'subscriptions' },
  { name: 'Gym', icon: '💪', amount: 40, category: 'health' },
  { name: 'Office 365', icon: '💼', amount: 9.99, category: 'subscriptions' },
];

export const SubscriptionsScreen = () => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { subscriptions, addSubscription, deleteSubscription, updateSubscription } = useAppStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: 'subscriptions',
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'weekly',
    next_renewal_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    notes: '',
    is_active: true,
  });

  const monthlyTotal = subscriptions
    .filter((s) => s.is_active)
    .reduce((sum, s) => {
      if (s.billing_cycle === 'monthly') return sum + s.amount;
      if (s.billing_cycle === 'yearly') return sum + s.amount / 12;
      if (s.billing_cycle === 'weekly') return sum + s.amount * 4.33;
      return sum;
    }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const handleAdd = async () => {
    if (!form.name || !form.amount) return;
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addSubscription({
      name: form.name,
      amount: parseFloat(form.amount),
      currency,
      category: form.category,
      billing_cycle: form.billing_cycle,
      next_renewal_date: form.next_renewal_date,
      notes: form.notes,
      is_active: true,
    });
    setShowAdd(false);
    setForm({ name: '', amount: '', category: 'subscriptions', billing_cycle: 'monthly', next_renewal_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), notes: '', is_active: true });
    setLoading(false);
  };

  const handleDelete = (sub: Subscription) => {
    Alert.alert('Cancel Subscription', `Remove ${sub.name}?`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteSubscription(sub.id) },
    ]);
  };

  const quickAdd = (preset: typeof POPULAR_SUBS[0]) => {
    setForm((f) => ({ ...f, name: preset.name, amount: preset.amount.toString(), category: preset.category }));
  };

  const dueGroups = {
    overdue: subscriptions.filter((s) => getDaysUntil(s.next_renewal_date) < 0),
    soon: subscriptions.filter((s) => getDaysUntil(s.next_renewal_date) >= 0 && getDaysUntil(s.next_renewal_date) <= 7),
    upcoming: subscriptions.filter((s) => getDaysUntil(s.next_renewal_date) > 7),
  };

  return (
    <Screen noPadding noSafeArea>
      <View style={{
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h2">Subscriptions</Text>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {/* Summary */}
        {subscriptions.length > 0 && (
          <Card style={{ marginBottom: Spacing.md, backgroundColor: `${Colors.primary}15`, borderColor: `${Colors.primary}30` }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="small" secondary>Monthly</Text>
                <Text variant="h3" color={Colors.primary}>{formatCurrency(monthlyTotal, currency)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: themeColors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="small" secondary>Yearly</Text>
                <Text variant="h3" color={Colors.primary}>{formatCurrency(yearlyTotal, currency)}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: themeColors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="small" secondary>Active</Text>
                <Text variant="h3" color={Colors.primary}>{subscriptions.filter((s) => s.is_active).length}</Text>
              </View>
            </View>
          </Card>
        )}

        {subscriptions.length === 0 ? (
          <EmptyState
            icon="📱"
            title="No subscriptions"
            description="Track all your recurring subscriptions and never get surprised by a renewal."
            actionLabel="Add Subscription"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <>
            {dueGroups.soon.length > 0 && (
              <>
                <Text variant="smallMedium" color={Colors.warning} style={{ marginBottom: 8 }}>Due soon</Text>
                {dueGroups.soon.map((sub) => <SubCard key={sub.id} sub={sub} currency={currency} theme={theme} onDelete={handleDelete} />)}
              </>
            )}
            {dueGroups.upcoming.length > 0 && (
              <>
                <Text variant="smallMedium" secondary style={{ marginTop: 16, marginBottom: 8 }}>Upcoming</Text>
                {dueGroups.upcoming.map((sub) => <SubCard key={sub.id} sub={sub} currency={currency} theme={theme} onDelete={handleDelete} />)}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: Spacing.lg,
              paddingTop: 50,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.border,
            }}>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <Text variant="h4">Add Subscription</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
              {/* Quick add */}
              <Text variant="smallMedium" secondary style={{ marginBottom: 10 }}>Quick add</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {POPULAR_SUBS.map((p) => (
                    <TouchableOpacity
                      key={p.name}
                      onPress={() => quickAdd(p)}
                      style={{
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: BorderRadius.md,
                        backgroundColor: form.name === p.name ? `${Colors.primary}20` : themeColors.card,
                        borderWidth: 1,
                        borderColor: form.name === p.name ? Colors.primary : themeColors.border,
                        minWidth: 80,
                      }}
                    >
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{p.icon}</Text>
                      <Text variant="tiny" secondary>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Name */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>Name</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.card,
                  borderRadius: BorderRadius.md,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  paddingHorizontal: Spacing.md,
                  height: 52,
                }}>
                  <TextInput
                    value={form.name}
                    onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                    placeholder="e.g. Netflix"
                    placeholderTextColor={themeColors.placeholder}
                    style={{ color: themeColors.text, fontSize: 15, flex: 1 }}
                  />
                </View>
              </View>

              {/* Amount */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>Amount</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.card,
                  borderRadius: BorderRadius.md,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  paddingHorizontal: Spacing.md,
                  height: 52,
                }}>
                  <Text style={{ color: themeColors.textSecondary, fontSize: 20, marginRight: 8 }}>$</Text>
                  <TextInput
                    value={form.amount}
                    onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                    placeholder="0.00"
                    placeholderTextColor={themeColors.placeholder}
                    keyboardType="numeric"
                    style={{ color: themeColors.text, fontSize: 20, flex: 1, fontWeight: '600' }}
                  />
                </View>
              </View>

              {/* Billing cycle */}
              <View style={{ marginBottom: Spacing.md }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Billing cycle</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['weekly', 'monthly', 'yearly'] as const).map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setForm((f) => ({ ...f, billing_cycle: c }))}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: BorderRadius.md,
                        alignItems: 'center',
                        backgroundColor: form.billing_cycle === c ? Colors.primary : themeColors.card,
                        borderWidth: 1,
                        borderColor: form.billing_cycle === c ? Colors.primary : themeColors.border,
                      }}
                    >
                      <Text variant="small" color={form.billing_cycle === c ? '#FFF' : themeColors.textSecondary} style={{ fontWeight: '600' }}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Next renewal */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>Next renewal date</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.card,
                  borderRadius: BorderRadius.md,
                  borderWidth: 1,
                  borderColor: themeColors.border,
                  paddingHorizontal: Spacing.md,
                  height: 52,
                }}>
                  <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} style={{ marginRight: 8 }} />
                  <TextInput
                    value={form.next_renewal_date}
                    onChangeText={(v) => setForm((f) => ({ ...f, next_renewal_date: v }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={themeColors.placeholder}
                    style={{ color: themeColors.text, fontSize: 15, flex: 1 }}
                  />
                </View>
              </View>

              <Button title="Add Subscription" onPress={handleAdd} loading={loading} fullWidth />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  );
};

const SubCard = ({ sub, currency, theme, onDelete }: {
  sub: Subscription;
  currency: string;
  theme: 'dark' | 'light';
  onDelete: (s: Subscription) => void;
}) => {
  const themeColors = Colors[theme];
  const days = getDaysUntil(sub.next_renewal_date);
  const cat = CATEGORIES.find((c) => c.id === sub.category);

  return (
    <Card style={{ marginBottom: 10, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${Colors.primary}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 22 }}>📱</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">{sub.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Badge
              label={sub.billing_cycle}
              size="sm"
              color={Colors.info}
            />
            <Text variant="tiny" color={days <= 3 ? Colors.danger : days <= 7 ? Colors.warning : themeColors.textTertiary}>
              {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `in ${days}d`}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{formatCurrency(sub.amount, currency)}</Text>
          {sub.billing_cycle !== 'monthly' && (
            <Text variant="tiny" secondary>
              {sub.billing_cycle === 'yearly'
                ? `${formatCurrency(sub.amount / 12, currency)}/mo`
                : `${formatCurrency(sub.amount * 4.33, currency)}/mo`}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => onDelete(sub)} style={{ marginLeft: 10 }}>
          <Ionicons name="trash-outline" size={18} color={themeColors.textTertiary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};
