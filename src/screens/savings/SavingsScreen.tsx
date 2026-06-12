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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { SavingsGoal } from '../../types';
import { generateSavingsplan } from '../../services/openai';
import * as Haptics from 'expo-haptics';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '💍', '📚', '💻', '🎓', '🏖️', '💰', '🦋', '🛡️', '🌟'];
const GOAL_COLORS = ['#6C63FF', '#00D4AA', '#FFB347', '#FF6B6B', '#4FC3F7', '#A8E6CF'];

export const SavingsScreen = () => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useAppStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<SavingsGoal | null>(null);
  const [aiPlan, setAiPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    monthly_contribution: '',
    icon: '💰',
    color: '#6C63FF',
  });

  const totalSaved = savingsGoals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.target_amount, 0);

  const handleAdd = async () => {
    if (!form.name || !form.target_amount) return;
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addSavingsGoal({
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline || null,
      monthly_contribution: parseFloat(form.monthly_contribution) || null,
      icon: form.icon,
      color: form.color,
      is_completed: false,
    } as any);
    setShowAdd(false);
    setForm({ name: '', target_amount: '', current_amount: '', deadline: '', monthly_contribution: '', icon: '💰', color: '#6C63FF' });
    setLoading(false);
  };

  const handleDelete = (goal: SavingsGoal) => {
    Alert.alert('Delete Goal', `Delete "${goal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSavingsGoal(goal.id) },
    ]);
  };

  const handleAddFunds = async (goal: SavingsGoal) => {
    Alert.prompt(
      'Add Funds',
      `How much did you save towards "${goal.name}"?`,
      async (amount) => {
        if (!amount || isNaN(parseFloat(amount))) return;
        const newAmount = goal.current_amount + parseFloat(amount);
        await updateSavingsGoal(goal.id, {
          current_amount: newAmount,
          is_completed: newAmount >= goal.target_amount,
        });
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const getAIPlan = async (goal: SavingsGoal) => {
    setAiLoading(true);
    try {
      const plan = await generateSavingsplan(
        goal.name,
        goal.target_amount,
        goal.current_amount,
        goal.monthly_contribution || 0,
        profile?.monthly_income || 0
      );
      setAiPlan(plan);
    } catch {
      setAiPlan('Stay consistent with your contributions to reach your goal faster!');
    } finally {
      setAiLoading(false);
    }
  };

  const getMonthsToGoal = (goal: SavingsGoal) => {
    const remaining = goal.target_amount - goal.current_amount;
    if (!goal.monthly_contribution || goal.monthly_contribution === 0) return null;
    return Math.ceil(remaining / goal.monthly_contribution);
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
          <Text variant="h2">Savings Goals</Text>
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
        {/* Overall progress */}
        {savingsGoals.length > 0 && (
          <Card style={{ marginBottom: Spacing.md }}>
            <Text variant="h4" style={{ marginBottom: 12 }}>Overall Progress</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text variant="small" secondary>Total saved</Text>
              <Text variant="bodyMedium" color={Colors.success}>{formatCurrency(totalSaved, currency)}</Text>
            </View>
            <ProgressBar
              progress={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
              color={Colors.accent}
              height={8}
            />
            <Text variant="tiny" secondary style={{ marginTop: 6 }}>
              {formatCurrency(totalTarget - totalSaved, currency)} more to reach all goals
            </Text>
          </Card>
        )}

        {savingsGoals.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No savings goals"
            description="Set specific savings goals to stay motivated and track your progress towards financial milestones."
            actionLabel="Create Goal"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          savingsGoals.map((goal) => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const months = getMonthsToGoal(goal);

            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => {
                  setShowDetail(goal);
                  getAIPlan(goal);
                }}
                activeOpacity={0.8}
              >
                <Card style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${goal.color || Colors.primary}25`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 24 }}>{goal.icon || '💰'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{goal.name}</Text>
                      {goal.deadline && (
                        <Text variant="tiny" secondary>Target: {formatDate(goal.deadline)}</Text>
                      )}
                      {months && (
                        <Text variant="tiny" color={Colors.accent}>~{months} months at current rate</Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                        {formatCurrency(goal.current_amount, currency)}
                      </Text>
                      <Text variant="tiny" secondary>of {formatCurrency(goal.target_amount, currency)}</Text>
                    </View>
                  </View>
                  <ProgressBar progress={pct} color={goal.color || Colors.primary} height={6} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <Text variant="tiny" secondary>{Math.round(pct)}% complete</Text>
                    <TouchableOpacity
                      onPress={() => handleAddFunds(goal)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: `${Colors.accent}20`,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: BorderRadius.full,
                      }}
                    >
                      <Ionicons name="add" size={14} color={Colors.accent} />
                      <Text variant="tiny" color={Colors.accent} style={{ fontWeight: '600' }}>Add funds</Text>
                    </TouchableOpacity>
                  </View>
                  {goal.is_completed && (
                    <View style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: `${Colors.success}20`,
                      paddingVertical: 3,
                      paddingHorizontal: 8,
                      borderRadius: BorderRadius.full,
                    }}>
                      <Text variant="tiny" color={Colors.success}>✅ Complete</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Goal Modal */}
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
              <Text variant="h4">New Savings Goal</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
              {/* Icon picker */}
              <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {GOAL_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => setForm((f) => ({ ...f, icon }))}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: form.icon === icon ? `${form.color}30` : themeColors.card,
                        borderWidth: 2,
                        borderColor: form.icon === icon ? form.color : themeColors.border,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Color picker */}
              <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Color</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.md }}>
                {GOAL_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setForm((f) => ({ ...f, color }))}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: color,
                      borderWidth: 3,
                      borderColor: form.color === color ? '#FFF' : 'transparent',
                    }}
                  />
                ))}
              </View>

              {[
                { label: 'Goal name', key: 'name', placeholder: 'e.g. Emergency fund', keyboard: 'default' },
                { label: 'Target amount', key: 'target_amount', placeholder: '0.00', keyboard: 'numeric' },
                { label: 'Already saved', key: 'current_amount', placeholder: '0.00', keyboard: 'numeric' },
                { label: 'Monthly contribution', key: 'monthly_contribution', placeholder: '0.00', keyboard: 'numeric' },
                { label: 'Deadline (optional)', key: 'deadline', placeholder: 'YYYY-MM-DD', keyboard: 'default' },
              ].map(({ label, key, placeholder, keyboard }) => (
                <View key={key} style={{ marginBottom: Spacing.md }}>
                  <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>{label}</Text>
                  <View style={{
                    backgroundColor: themeColors.card,
                    borderRadius: BorderRadius.md,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    paddingHorizontal: Spacing.md,
                    height: 52,
                    justifyContent: 'center',
                  }}>
                    <TextInput
                      value={form[key as keyof typeof form] as string}
                      onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      placeholder={placeholder}
                      placeholderTextColor={themeColors.placeholder}
                      keyboardType={keyboard as any}
                      style={{ color: themeColors.text, fontSize: 15 }}
                    />
                  </View>
                </View>
              ))}

              <Button title="Create Goal" onPress={handleAdd} loading={loading} fullWidth />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Goal detail modal */}
      <Modal visible={!!showDetail} animationType="slide" presentationStyle="pageSheet">
        {showDetail && (
          <View style={{ flex: 1, backgroundColor: themeColors.background }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: Spacing.lg,
              paddingTop: 50,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.border,
            }}>
              <TouchableOpacity onPress={() => setShowDetail(null)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <Text variant="h4">{showDetail.name}</Text>
              <TouchableOpacity onPress={() => {
                setShowDetail(null);
                handleDelete(showDetail);
              }}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 64, marginBottom: 12 }}>{showDetail.icon || '💰'}</Text>
                <Text variant="h2">{formatCurrency(showDetail.current_amount, currency)}</Text>
                <Text secondary>of {formatCurrency(showDetail.target_amount, currency)}</Text>
                <View style={{ width: '100%', marginTop: 16 }}>
                  <ProgressBar
                    progress={(showDetail.current_amount / showDetail.target_amount) * 100}
                    color={showDetail.color || Colors.primary}
                    height={10}
                  />
                </View>
              </View>

              {/* AI Plan */}
              <Card style={{ backgroundColor: `${Colors.primary}10`, borderColor: `${Colors.primary}20`, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
                  <Text variant="bodyMedium" color={Colors.primary}>AI Savings Plan</Text>
                </View>
                {aiLoading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text secondary style={{ lineHeight: 20 }}>{aiPlan}</Text>
                )}
              </Card>

              {showDetail.monthly_contribution && (
                <Card style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="small" secondary>Monthly contribution</Text>
                      <Text variant="h4" color={Colors.accent}>{formatCurrency(showDetail.monthly_contribution, currency)}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="small" secondary>Months to goal</Text>
                      <Text variant="h4">{getMonthsToGoal(showDetail) || '—'}</Text>
                    </View>
                  </View>
                </Card>
              )}

              <Button
                title="Add Funds"
                onPress={() => {
                  setShowDetail(null);
                  handleAddFunds(showDetail);
                }}
                fullWidth
              />
            </ScrollView>
          </View>
        )}
      </Modal>
    </Screen>
  );
};
