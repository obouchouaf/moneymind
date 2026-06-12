import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../utils/format';
import { CATEGORIES } from '../../constants';
import { Transaction } from '../../types';
import { generateFinancialInsight } from '../../services/openai';

const { width } = Dimensions.get('window');

export const InsightsScreen = () => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { transactions, getMonthlyStats } = useTransactionStore();
  const { subscriptions } = useAppStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const currentStats = getMonthlyStats();
  const lastMonthStats = getMonthlyStats(subMonths(new Date(), 1));

  useEffect(() => {
    loadAiSummary();
  }, []);

  const loadAiSummary = async () => {
    setAiLoading(true);
    try {
      const ctx = `Income: ${formatCurrency(currentStats.income, currency)}, Expenses: ${formatCurrency(currentStats.expenses, currency)}, last month expenses: ${formatCurrency(lastMonthStats.expenses, currency)}`;
      const s = await generateFinancialInsight(ctx);
      setAiSummary(s);
    } catch {
      setAiSummary('Keep monitoring your spending patterns for better financial health!');
    } finally {
      setAiLoading(false);
    }
  };

  // Category breakdown this month
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());
  const currentExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d >= currentMonthStart && d <= currentMonthEnd;
  });

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d >= lastMonthStart && d <= lastMonthEnd;
  });

  const categoryMap: Record<string, { current: number; last: number }> = {};
  currentExpenses.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { current: 0, last: 0 };
    categoryMap[t.category].current += t.amount;
  });
  lastExpenses.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { current: 0, last: 0 };
    categoryMap[t.category].last += t.amount;
  });

  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b.current - a.current)
    .slice(0, 5);

  const biggestCategory = topCategories[0];
  const biggestCategoryInfo = biggestCategory ? CATEGORIES.find((c) => c.id === biggestCategory[0]) : null;

  // Essential vs optional
  const essentialTotal = currentExpenses.filter((t) => t.is_essential !== false).reduce((s, t) => s + t.amount, 0);
  const optionalTotal = currentExpenses.filter((t) => t.is_essential === false).reduce((s, t) => s + t.amount, 0);

  // Subscription leakage
  const monthlySubTotal = subscriptions.reduce((s, sub) => {
    if (sub.billing_cycle === 'monthly') return s + sub.amount;
    if (sub.billing_cycle === 'yearly') return s + sub.amount / 12;
    return s;
  }, 0);

  // Savings rate
  const income = currentStats.income || profile?.monthly_income || 1;
  const savingsRate = Math.max(0, ((income - currentStats.expenses) / income) * 100);

  // 30-day chart
  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const dailyData = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const total = transactions
      .filter((t) => t.date.startsWith(dayStr) && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { day: format(day, 'MM/dd'), total };
  });

  const maxDay = Math.max(...dailyData.map((d) => d.total), 1);
  const chartH = 80;

  // MoM comparison
  const momChange = lastMonthStats.expenses > 0
    ? ((currentStats.expenses - lastMonthStats.expenses) / lastMonthStats.expenses) * 100
    : 0;

  return (
    <Screen noPadding noSafeArea>
      <View style={{
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}>
        <Text variant="h2">Insights</Text>
        <Text secondary style={{ marginTop: 4 }}>{format(new Date(), 'MMMM yyyy')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {/* AI Summary */}
        <Card style={{ marginBottom: Spacing.md, backgroundColor: `${Colors.primary}10`, borderColor: `${Colors.primary}20` }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>✨</Text>
            <Text variant="bodyMedium" color={Colors.primary}>AI Monthly Summary</Text>
          </View>
          {aiLoading ? <ActivityIndicator color={Colors.primary} /> : (
            <Text secondary style={{ lineHeight: 20 }}>{aiSummary}</Text>
          )}
        </Card>

        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: Spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Text variant="tiny" secondary>Savings Rate</Text>
            <Text variant="h3" color={savingsRate >= 20 ? Colors.success : savingsRate >= 10 ? Colors.warning : Colors.danger}>
              {Math.round(savingsRate)}%
            </Text>
            <Text variant="tiny" secondary>{savingsRate >= 20 ? 'Excellent!' : savingsRate >= 10 ? 'Good' : 'Improve'}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="tiny" secondary>vs Last Month</Text>
            <Text variant="h3" color={momChange <= 0 ? Colors.success : Colors.danger}>
              {momChange > 0 ? '+' : ''}{Math.round(momChange)}%
            </Text>
            <Text variant="tiny" secondary>{momChange <= 0 ? 'Spending less' : 'Spending more'}</Text>
          </Card>
        </View>

        {/* 30-day chart */}
        <Card style={{ marginBottom: Spacing.md }}>
          <Text variant="h4" style={{ marginBottom: 16 }}>30-Day Spending Trend</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH + 20, gap: 2 }}>
            {dailyData.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: chartH }}>
                <View style={{
                  width: '100%',
                  height: Math.max(2, (d.total / maxDay) * chartH),
                  backgroundColor: i === dailyData.length - 1 ? Colors.primary : `${Colors.primary}40`,
                  borderRadius: 2,
                }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text variant="tiny" secondary>30 days ago</Text>
            <Text variant="tiny" secondary>Today</Text>
          </View>
        </Card>

        {/* Income vs Expense */}
        <Card style={{ marginBottom: Spacing.md }}>
          <Text variant="h4" style={{ marginBottom: 12 }}>Income vs Expenses</Text>
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success }} />
                <Text variant="small">Income</Text>
              </View>
              <Text variant="small" color={Colors.success}>{formatCurrency(currentStats.income, currency)}</Text>
            </View>
            <ProgressBar
              progress={income > 0 ? Math.min((currentStats.income / income) * 100, 100) : 0}
              color={Colors.success}
              height={6}
            />
          </View>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger }} />
                <Text variant="small">Expenses</Text>
              </View>
              <Text variant="small" color={Colors.danger}>{formatCurrency(currentStats.expenses, currency)}</Text>
            </View>
            <ProgressBar
              progress={income > 0 ? Math.min((currentStats.expenses / income) * 100, 100) : 0}
              color={Colors.danger}
              height={6}
            />
          </View>
        </Card>

        {/* Essential vs Optional */}
        <Card style={{ marginBottom: Spacing.md }}>
          <Text variant="h4" style={{ marginBottom: 12 }}>Needs vs Wants</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: `${Colors.info}15`, borderRadius: BorderRadius.md }}>
              <Text variant="small" secondary>Essential</Text>
              <Text variant="h3" color={Colors.info}>{formatCurrency(essentialTotal, currency)}</Text>
              <Text variant="tiny" secondary>
                {currentStats.expenses > 0 ? Math.round((essentialTotal / currentStats.expenses) * 100) : 0}%
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', padding: 12, backgroundColor: `${Colors.warning}15`, borderRadius: BorderRadius.md }}>
              <Text variant="small" secondary>Optional</Text>
              <Text variant="h3" color={Colors.warning}>{formatCurrency(optionalTotal, currency)}</Text>
              <Text variant="tiny" secondary>
                {currentStats.expenses > 0 ? Math.round((optionalTotal / currentStats.expenses) * 100) : 0}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Subscription Leakage */}
        <Card style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="h4">Subscription Leakage</Text>
              <Text variant="tiny" secondary>{subscriptions.length} active subscriptions</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="h3" color={Colors.warning}>{formatCurrency(monthlySubTotal, currency)}</Text>
              <Text variant="tiny" secondary>per month</Text>
            </View>
          </View>
          {subscriptions.length === 0 && (
            <Text secondary style={{ marginTop: 8 }}>No subscriptions tracked yet.</Text>
          )}
        </Card>

        {/* Top spending categories */}
        {topCategories.length > 0 && (
          <Card style={{ marginBottom: Spacing.md }}>
            <Text variant="h4" style={{ marginBottom: 16 }}>Category Breakdown</Text>
            {topCategories.map(([catId, amounts]) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              const pct = currentStats.expenses > 0 ? (amounts.current / currentStats.expenses) * 100 : 0;
              const change = amounts.last > 0 ? ((amounts.current - amounts.last) / amounts.last) * 100 : 100;

              return (
                <View key={catId} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 18 }}>{cat?.icon || '📦'}</Text>
                      <Text variant="bodyMedium">{cat?.label || catId}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodyMedium">{formatCurrency(amounts.current, currency)}</Text>
                      {amounts.last > 0 && (
                        <Text variant="tiny" color={change > 0 ? Colors.danger : Colors.success}>
                          {change > 0 ? '↑' : '↓'} {Math.abs(Math.round(change))}%
                        </Text>
                      )}
                    </View>
                  </View>
                  <ProgressBar progress={pct} color={cat?.color || Colors.primary} height={4} />
                </View>
              );
            })}
          </Card>
        )}

        {/* Biggest spending */}
        {biggestCategory && biggestCategoryInfo && (
          <Card style={{ marginBottom: Spacing.md, backgroundColor: `${Colors.danger}10`, borderColor: `${Colors.danger}20` }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 40 }}>{biggestCategoryInfo.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="small" color={Colors.danger}>Top spending category</Text>
                <Text variant="h4">{biggestCategoryInfo.label}</Text>
                <Text secondary>{formatCurrency(biggestCategory[1].current, currency)} this month</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
};
