import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, subDays, eachDayOfInterval } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency, formatShortDate, getDaysUntil } from '../../utils/format';
import { generateFinancialInsight } from '../../services/openai';
import { CATEGORIES } from '../../constants';
import { Transaction } from '../../types';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { transactions, fetchTransactions, getMonthlyStats } = useTransactionStore();
  const { subscriptions, budgets, savingsGoals, fetchAll } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';

  const stats = getMonthlyStats();
  const remaining = (profile?.monthly_income || 0) - stats.expenses;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const safeToSpend = Math.max(0, remaining / (daysInMonth - dayOfMonth + 1));

  const recentTransactions = transactions.slice(0, 5);

  const categoryBreakdown = () => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d >= startOfMonth(new Date()) && d <= endOfMonth(new Date());
      })
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amt]) => ({ category: cat, amount: amt, pct: stats.expenses > 0 ? (amt / stats.expenses) * 100 : 0 }));
  };

  const budgetHealth = () => {
    if (budgets.length === 0) return 85;
    const total = budgets.reduce((s, b) => s + b.amount, 0);
    const spent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
    return Math.max(0, Math.round((1 - spent / total) * 100));
  };

  const upcomingBills = subscriptions
    .filter((s) => getDaysUntil(s.next_renewal_date) <= 7)
    .slice(0, 3);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTransactions(), fetchAll()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchAll();
    loadInsight();
  }, []);

  const loadInsight = async () => {
    setInsightLoading(true);
    try {
      const ctx = `Income: ${formatCurrency(profile?.monthly_income || 0, currency)}, Expenses this month: ${formatCurrency(stats.expenses, currency)}, Savings goal: ${formatCurrency(profile?.monthly_saving_target || 0, currency)}`;
      const insight = await generateFinancialInsight(ctx);
      setAiInsight(insight);
    } catch {
      setAiInsight('Track your expenses consistently to build better financial habits!');
    } finally {
      setInsightLoading(false);
    }
  };

  const breakdown = categoryBreakdown();
  const health = budgetHealth();

  return (
    <Screen noPadding noSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient
          colors={theme === 'dark' ? ['#12122A', '#1A1A35', '#12122A'] : ['#6C63FF', '#8B84FF']}
          style={{ paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: 40 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Good {getGreeting()},</Text>
              <Text variant="h2" color="#FFFFFF">{profile?.name?.split(' ')[0] || 'there'} 👋</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="settings-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Net Cash Card */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 }}>Net Cash Position</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 38, fontWeight: '700', letterSpacing: -1 }}>
              {formatCurrency(stats.net, currency)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
              {format(new Date(), 'MMMM yyyy')}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: -20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              label="Income"
              value={formatCurrency(stats.income, currency)}
              icon="trending-up"
              color={Colors.success}
              theme={theme}
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(stats.expenses, currency)}
              icon="trending-down"
              color={Colors.danger}
              theme={theme}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <StatCard
              label="Remaining"
              value={formatCurrency(remaining, currency)}
              icon="wallet-outline"
              color={Colors.accent}
              theme={theme}
            />
            <StatCard
              label="Safe/day"
              value={formatCurrency(safeToSpend, currency)}
              icon="shield-checkmark-outline"
              color={Colors.info}
              theme={theme}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 20 }}>
          {/* AI Insight */}
          <Card style={{ marginBottom: 16, backgroundColor: `${Colors.primary}15`, borderColor: `${Colors.primary}30` }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 18 }}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="smallMedium" color={Colors.primary} style={{ marginBottom: 4 }}>AI Insight of the day</Text>
                {insightLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text variant="small" secondary style={{ lineHeight: 18 }}>{aiInsight}</Text>
                )}
              </View>
            </View>
          </Card>

          {/* Budget Health */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="h4">Budget Health</Text>
              <Badge
                label={`${health}%`}
                color={health > 70 ? Colors.success : health > 40 ? Colors.warning : Colors.danger}
              />
            </View>
            <ProgressBar progress={health} color={health > 70 ? Colors.success : health > 40 ? Colors.warning : Colors.danger} height={8} />
            <Text variant="tiny" secondary style={{ marginTop: 8 }}>
              {health > 70 ? 'Great job staying within budget!' : health > 40 ? 'Watch your spending this month.' : 'You\'re over budget in some categories.'}
            </Text>
          </Card>

          {/* Savings Progress */}
          {savingsGoals.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="h4">Savings Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Savings')}>
                  <Text variant="small" color={Colors.primary}>View all</Text>
                </TouchableOpacity>
              </View>
              {savingsGoals.slice(0, 2).map((goal) => {
                const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                return (
                  <View key={goal.id} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text variant="bodyMedium">{goal.name}</Text>
                      <Text variant="small" secondary>
                        {formatCurrency(goal.current_amount, currency)} / {formatCurrency(goal.target_amount, currency)}
                      </Text>
                    </View>
                    <ProgressBar progress={pct} color={Colors.accent} />
                  </View>
                );
              })}
            </Card>
          )}

          {/* Spending Chart */}
          <SpendingChart transactions={transactions} theme={theme} currency={currency} />

          {/* Category Breakdown */}
          {breakdown.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <Text variant="h4" style={{ marginBottom: 16 }}>Top Spending Categories</Text>
              {breakdown.map(({ category, amount, pct }) => {
                const cat = CATEGORIES.find((c) => c.id === category);
                return (
                  <View key={category} style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>{cat?.icon || '📦'}</Text>
                        <Text variant="bodyMedium">{cat?.label || category}</Text>
                      </View>
                      <Text variant="bodyMedium">{formatCurrency(amount, currency)}</Text>
                    </View>
                    <ProgressBar
                      progress={pct}
                      color={cat?.color || Colors.primary}
                      height={4}
                    />
                  </View>
                );
              })}
            </Card>
          )}

          {/* Upcoming Bills */}
          {upcomingBills.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text variant="h4">Upcoming Bills</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
                  <Text variant="small" color={Colors.primary}>View all</Text>
                </TouchableOpacity>
              </View>
              {upcomingBills.map((bill) => {
                const days = getDaysUntil(bill.next_renewal_date);
                return (
                  <View key={bill.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${Colors.warning}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 18 }}>📱</Text>
                      </View>
                      <View>
                        <Text variant="bodyMedium">{bill.name}</Text>
                        <Text variant="tiny" color={days <= 2 ? Colors.danger : Colors.warning}>
                          Due in {days} day{days !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <Text variant="bodyMedium">{formatCurrency(bill.amount, currency)}</Text>
                  </View>
                );
              })}
            </Card>
          )}

          {/* Recent Transactions */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text variant="h4">Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text variant="small" color={Colors.primary}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>💸</Text>
                <Text secondary center>No transactions yet. Add your first one!</Text>
              </View>
            ) : (
              recentTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} currency={currency} />
              ))
            )}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
};

const StatCard = ({ label, value, icon, color, theme }: any) => (
  <Card style={{ flex: 1, alignItems: 'flex-start' }}>
    <View style={{
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${color}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    }}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text variant="small" secondary>{label}</Text>
    <Text variant="h4" style={{ marginTop: 2 }}>{value}</Text>
  </Card>
);

const TransactionRow = ({ tx, currency }: { tx: Transaction; currency: string }) => {
  const cat = CATEGORIES.find((c) => c.id === tx.category);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${cat?.color || Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ fontSize: 20 }}>{cat?.icon || '📦'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{tx.description}</Text>
        <Text variant="tiny" secondary>{formatShortDate(tx.date)}</Text>
      </View>
      <Text
        variant="bodyMedium"
        color={tx.type === 'income' ? Colors.success : Colors.danger}
      >
        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
      </Text>
    </View>
  );
};

const SpendingChart = ({ transactions, theme, currency }: any) => {
  const themeColors = Colors[theme as 'dark' | 'light'];
  const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const data = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const total = transactions
      .filter((t: Transaction) => t.date.startsWith(dayStr) && t.type === 'expense')
      .reduce((s: number, t: Transaction) => s + t.amount, 0);
    return { day: format(day, 'EEE'), total };
  });

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 80;

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text variant="h4" style={{ marginBottom: 16 }}>7-Day Spending</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight + 24, gap: 8 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: chartHeight + 24 }}>
            <View style={{
              width: '100%',
              height: Math.max(4, (d.total / maxVal) * chartHeight),
              backgroundColor: i === data.length - 1 ? Colors.primary : `${Colors.primary}50`,
              borderRadius: 4,
              marginBottom: 6,
            }} />
            <Text variant="tiny" secondary>{d.day}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
