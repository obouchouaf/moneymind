import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency, formatShortDate } from '../../utils/format';
import { Transaction } from '../../types';
import { CATEGORIES } from '../../constants';
import * as Haptics from 'expo-haptics';

export const TransactionsScreen = ({ navigation }: any) => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { fetchTransactions, deleteTransaction, filters, setFilters, filteredTransactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';

  const transactions = filteredTransactions();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, []);

  const handleDelete = (tx: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${tx.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteTransaction(tx.id);
          },
        },
      ]
    );
  };

  const groupedTransactions = () => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      const date = tx.date.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const groups = groupedTransactions();
  const flatData = groups.flatMap(([date, txs]) => [
    { type: 'header', date, key: `header-${date}` },
    ...txs.map((tx) => ({ type: 'item', tx, key: tx.id })),
  ]);

  return (
    <Screen noPadding noSafeArea>
      {/* Header */}
      <View style={{
        backgroundColor: themeColors.surface,
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text variant="h2">Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTransaction')}
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

        {/* Search */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.card,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: themeColors.border,
          paddingHorizontal: 12,
          height: 44,
          marginBottom: 10,
        }}>
          <Ionicons name="search" size={18} color={themeColors.textSecondary} />
          <TextInput
            value={filters.search}
            onChangeText={(v) => setFilters({ search: v })}
            placeholder="Search transactions..."
            placeholderTextColor={themeColors.placeholder}
            style={{ flex: 1, color: themeColors.text, marginLeft: 8, fontSize: 15 }}
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => setFilters({ search: '' })}>
              <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Type filter chips */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setFilters({ type: t })}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: BorderRadius.full,
                backgroundColor: filters.type === t ? Colors.primary : themeColors.card,
                borderWidth: 1,
                borderColor: filters.type === t ? Colors.primary : themeColors.border,
              }}
            >
              <Text
                variant="small"
                color={filters.type === t ? '#FFF' : themeColors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: BorderRadius.full,
              backgroundColor: showFilters ? `${Colors.primary}20` : themeColors.card,
              borderWidth: 1,
              borderColor: showFilters ? Colors.primary : themeColors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="filter" size={14} color={showFilters ? Colors.primary : themeColors.textSecondary} />
            <Text variant="small" color={showFilters ? Colors.primary : themeColors.textSecondary} style={{ fontWeight: '600' }}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        {showFilters && (
          <View style={{ marginTop: 10 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: null, label: 'All', icon: '🔍' }, ...CATEGORIES]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setFilters({ category: item.id })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: BorderRadius.full,
                    backgroundColor: filters.category === item.id ? Colors.primary : themeColors.card,
                    borderWidth: 1,
                    borderColor: filters.category === item.id ? Colors.primary : themeColors.border,
                    marginRight: 8,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                  <Text
                    variant="tiny"
                    color={filters.category === item.id ? '#FFF' : themeColors.textSecondary}
                    style={{ fontWeight: '600' }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* List */}
      {transactions.length === 0 ? (
        <EmptyState
          icon="💸"
          title="No transactions"
          description={filters.search || filters.category ? "No transactions match your filters." : "Start tracking your money by adding your first transaction."}
          actionLabel="Add Transaction"
          onAction={() => navigation.navigate('AddTransaction')}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              const headerItem = item as { type: string; date: string; key: string };
              return (
                <Text variant="smallMedium" secondary style={{ marginTop: 16, marginBottom: 8 }}>
                  {formatShortDate(headerItem.date)}
                </Text>
              );
            }
            const tx = (item as { type: string; tx: Transaction; key: string }).tx;
            const cat = CATEGORIES.find((c) => c.id === tx.category);
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('EditTransaction', { transaction: tx })}
                onLongPress={() => handleDelete(tx)}
                activeOpacity={0.7}
              >
                <Card style={{ marginBottom: 8, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      backgroundColor: `${cat?.color || Colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 22 }}>{cat?.icon || '📦'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{tx.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Text variant="tiny" secondary>{cat?.label || tx.category}</Text>
                        {tx.is_essential === false && (
                          <Badge label="Optional" size="sm" color={Colors.warning} />
                        )}
                        {tx.is_recurring && (
                          <Badge label="Recurring" size="sm" color={Colors.info} />
                        )}
                      </View>
                    </View>
                    <Text
                      variant="bodyMedium"
                      color={tx.type === 'income' ? Colors.success : Colors.danger}
                      style={{ fontWeight: '700' }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </Text>
                  </View>
                  {tx.notes && (
                    <Text variant="tiny" secondary style={{ marginTop: 8, marginLeft: 58 }}>
                      📝 {tx.notes}
                    </Text>
                  )}
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </Screen>
  );
};
