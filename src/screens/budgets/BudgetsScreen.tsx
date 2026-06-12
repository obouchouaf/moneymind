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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../utils/format';
import { CATEGORIES } from '../../constants';
import { Budget } from '../../types';
import * as Haptics from 'expo-haptics';

export const BudgetsScreen = () => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { budgets, addBudget, deleteBudget } = useAppStore();
  const { transactions } = useTransactionStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState('food');
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMonth = format(new Date(), 'yyyy-MM');

  const getSpentForCategory = (cat: string) => {
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === cat &&
          format(d, 'yyyy-MM') === currentMonth
        );
      })
      .reduce((s, t) => s + t.amount, 0);
  };

  const budgetsWithSpent = budgets.map((b) => ({
    ...b,
    spent: getSpentForCategory(b.category),
  }));

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgetsWithSpent.filter((b) => b.spent > b.amount).length;

  const handleAdd = async () => {
    if (!newAmount || parseFloat(newAmount) <= 0) return;
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addBudget({
      category: newCategory,
      amount: parseFloat(newAmount),
      month: currentMonth,
    });
    setNewAmount('');
    setShowAdd(false);
    setLoading(false);
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert('Delete Budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(budget.id) },
    ]);
  };

  const usedCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = CATEGORIES.filter((c) => !usedCategories.has(c.id) && c.id !== 'income');

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
          <Text variant="h2">Budgets</Text>
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
        <Text secondary style={{ marginTop: 4 }}>{format(new Date(), 'MMMM yyyy')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
      >
        {/* Overview */}
        {budgets.length > 0 && (
          <Card style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text variant="small" secondary>Total Budgeted</Text>
                <Text variant="h3">{formatCurrency(totalBudgeted, currency)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="small" secondary>Total Spent</Text>
                <Text variant="h3" color={totalSpent > totalBudgeted ? Colors.danger : Colors.success}>
                  {formatCurrency(totalSpent, currency)}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}
              color={totalSpent > totalBudgeted ? Colors.danger : Colors.success}
              height={8}
            />
            {overBudgetCount > 0 && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                backgroundColor: `${Colors.danger}15`,
                borderRadius: BorderRadius.sm,
                padding: 8,
                gap: 6,
              }}>
                <Ionicons name="warning" size={16} color={Colors.danger} />
                <Text variant="small" color={Colors.danger}>
                  {overBudgetCount} categor{overBudgetCount === 1 ? 'y' : 'ies'} over budget
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Budget List */}
        {budgetsWithSpent.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No budgets yet"
            description="Set monthly budgets to track your spending by category and stay in control."
            actionLabel="Add Budget"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          budgetsWithSpent.map((budget) => {
            const cat = CATEGORIES.find((c) => c.id === budget.category);
            const pct = (budget.spent / budget.amount) * 100;
            const over = budget.spent > budget.amount;
            const remaining = budget.amount - budget.spent;

            return (
              <Card key={budget.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: `${cat?.color || Colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>{cat?.icon || '📦'}</Text>
                    </View>
                    <View>
                      <Text variant="bodyMedium">{cat?.label || budget.category}</Text>
                      <Text variant="tiny" color={over ? Colors.danger : themeColors.textSecondary}>
                        {over
                          ? `${formatCurrency(budget.spent - budget.amount, currency)} over budget`
                          : `${formatCurrency(remaining, currency)} remaining`}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                      {formatCurrency(budget.spent, currency)}
                    </Text>
                    <Text variant="tiny" secondary>of {formatCurrency(budget.amount, currency)}</Text>
                  </View>
                </View>
                <ProgressBar progress={Math.min(pct, 100)} color={cat?.color || Colors.primary} height={6} />
                <TouchableOpacity
                  onPress={() => handleDelete(budget)}
                  style={{ position: 'absolute', top: 12, right: 12 }}
                >
                  <Ionicons name="trash-outline" size={16} color={themeColors.textTertiary} />
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add Budget Modal */}
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
              <Text variant="h4">Add Budget</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
              <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg }}>
                {availableCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setNewCategory(cat.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: BorderRadius.full,
                      backgroundColor: newCategory === cat.id ? `${cat.color}25` : themeColors.card,
                      borderWidth: 1,
                      borderColor: newCategory === cat.id ? cat.color : themeColors.border,
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                    <Text
                      variant="small"
                      color={newCategory === cat.id ? cat.color : themeColors.textSecondary}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Monthly Budget Amount</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: themeColors.card,
                borderRadius: BorderRadius.md,
                borderWidth: 2,
                borderColor: Colors.primary,
                paddingHorizontal: Spacing.md,
                height: 60,
                marginBottom: Spacing.lg,
              }}>
                <Text style={{ fontSize: 24, color: themeColors.textSecondary, marginRight: 8 }}>$</Text>
                <TextInput
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder="0.00"
                  placeholderTextColor={themeColors.placeholder}
                  keyboardType="numeric"
                  style={{ flex: 1, color: themeColors.text, fontSize: 28, fontWeight: '700' }}
                  autoFocus
                />
              </View>

              <Button title="Add Budget" onPress={handleAdd} loading={loading} fullWidth />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  );
};
