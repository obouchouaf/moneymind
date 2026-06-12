import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
import * as Haptics from 'expo-haptics';

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((v) => parseFloat(v) > 0, 'Amount must be greater than 0'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const AddTransactionScreen = ({ navigation, route }: any) => {
  const editingTx = route?.params?.transaction;
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';

  const [type, setType] = useState<'income' | 'expense'>(editingTx?.type || 'expense');
  const [category, setCategory] = useState(editingTx?.category || 'food');
  const [paymentMethod, setPaymentMethod] = useState(editingTx?.payment_method || 'debit');
  const [isEssential, setIsEssential] = useState(editingTx?.is_essential !== false);
  const [isRecurring, setIsRecurring] = useState(editingTx?.is_recurring || false);
  const [date, setDate] = useState(editingTx?.date?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: editingTx?.description || '',
      amount: editingTx?.amount?.toString() || '',
      notes: editingTx?.notes || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const txData = {
        type,
        category,
        description: data.description,
        amount: parseFloat(data.amount),
        date,
        payment_method: paymentMethod,
        notes: data.notes || undefined,
        is_essential: isEssential,
        is_recurring: isRecurring,
      };

      if (editingTx) {
        await updateTransaction(editingTx.id, txData);
      } else {
        await addTransaction(txData as any);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen noPadding noSafeArea>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 60,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.border,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text variant="h4">{editingTx ? 'Edit Transaction' : 'Add Transaction'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type Toggle */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: themeColors.card,
            borderRadius: BorderRadius.lg,
            padding: 4,
            marginBottom: Spacing.lg,
            borderWidth: 1,
            borderColor: themeColors.border,
          }}>
            {(['expense', 'income'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: BorderRadius.md,
                  alignItems: 'center',
                  backgroundColor: type === t
                    ? t === 'expense' ? Colors.danger : Colors.success
                    : 'transparent',
                }}
              >
                <Text
                  variant="bodyMedium"
                  color={type === t ? '#FFF' : themeColors.textSecondary}
                  style={{ fontWeight: '600' }}
                >
                  {t === 'expense' ? '💸 Expense' : '💰 Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: Spacing.md }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>Amount</Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: themeColors.card,
                  borderRadius: BorderRadius.md,
                  borderWidth: 2,
                  borderColor: errors.amount ? Colors.danger : Colors.primary,
                  paddingHorizontal: Spacing.md,
                  height: 64,
                }}>
                  <Text style={{ fontSize: 28, color: themeColors.textSecondary, marginRight: 8 }}>
                    {profile?.currency === 'EUR' ? '€' : profile?.currency === 'GBP' ? '£' : '$'}
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="0.00"
                    placeholderTextColor={themeColors.placeholder}
                    keyboardType="numeric"
                    style={{ flex: 1, color: themeColors.text, fontSize: 32, fontWeight: '700' }}
                  />
                </View>
                {errors.amount && (
                  <Text variant="tiny" color={Colors.danger} style={{ marginTop: 4 }}>{errors.amount.message}</Text>
                )}
              </View>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                placeholder="What was this for?"
                onChangeText={onChange}
                value={value}
                icon="create-outline"
                error={errors.description?.message}
              />
            )}
          />

          {/* Category */}
          <View style={{ marginBottom: Spacing.md }}>
            <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.filter((c) => c.id !== 'income').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={{
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: BorderRadius.md,
                      backgroundColor: category === cat.id ? `${cat.color}30` : themeColors.card,
                      borderWidth: 1,
                      borderColor: category === cat.id ? cat.color : themeColors.border,
                      minWidth: 70,
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</Text>
                    <Text
                      variant="tiny"
                      color={category === cat.id ? cat.color : themeColors.textSecondary}
                      style={{ fontWeight: category === cat.id ? '600' : '400', textAlign: 'center' }}
                    >
                      {cat.label.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date */}
          <View style={{ marginBottom: Spacing.md }}>
            <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>Date</Text>
            <View style={{
              backgroundColor: themeColors.card,
              borderRadius: BorderRadius.md,
              borderWidth: 1,
              borderColor: themeColors.border,
              paddingHorizontal: Spacing.md,
              height: 52,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="calendar-outline" size={18} color={themeColors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={themeColors.placeholder}
                style={{ color: themeColors.text, fontSize: 15, flex: 1 }}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={{ marginBottom: Spacing.md }}>
            <Text variant="smallMedium" secondary style={{ marginBottom: 8 }}>Payment Method</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PAYMENT_METHODS.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethod(pm.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: BorderRadius.full,
                    backgroundColor: paymentMethod === pm.id ? `${Colors.primary}20` : themeColors.card,
                    borderWidth: 1,
                    borderColor: paymentMethod === pm.id ? Colors.primary : themeColors.border,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{pm.icon}</Text>
                  <Text
                    variant="small"
                    color={paymentMethod === pm.id ? Colors.primary : themeColors.textSecondary}
                    style={{ fontWeight: paymentMethod === pm.id ? '600' : '400' }}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes (optional)"
                placeholder="Add a note..."
                onChangeText={onChange}
                value={value}
                icon="document-text-outline"
                multiline
              />
            )}
          />

          {/* Toggles */}
          <Card style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text variant="bodyMedium">Essential expense</Text>
                <Text variant="tiny" secondary>Needs vs wants</Text>
              </View>
              <Switch
                value={isEssential}
                onValueChange={setIsEssential}
                trackColor={{ false: themeColors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text variant="bodyMedium">Recurring</Text>
                <Text variant="tiny" secondary>Repeats monthly</Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: themeColors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </Card>

          <Button
            title={editingTx ? 'Update Transaction' : 'Add Transaction'}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
