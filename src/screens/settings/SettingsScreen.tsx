import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { supabase } from '../../services/supabase';

export const SettingsScreen = ({ navigation }: any) => {
  const theme = useAppStore((s) => s.theme);
  const { setTheme, notificationPrefs, updateNotificationPrefs } = useAppStore();
  const { profile, signOut, fetchProfile } = useAuthStore();
  const { transactions } = useTransactionStore();
  const themeColors = Colors[theme];
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const headers = 'Date,Type,Description,Category,Amount,Payment Method,Notes,Essential\n';
      const rows = transactions.map((t) =>
        `${t.date},${t.type},"${t.description}",${t.category},${t.amount},${t.payment_method || ''},${t.notes ? `"${t.notes}"` : ''},${t.is_essential ?? true}`
      ).join('\n');

      const csv = headers + rows;
      const filename = `wealthpilot_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const fileUri = `${FileSystem.documentDirectory || ''}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Transactions' });
      } else {
        Alert.alert('Success', `File saved to ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to export: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('transactions').delete().eq('user_id', user.id);
                await supabase.from('budgets').delete().eq('user_id', user.id);
                await supabase.from('subscriptions').delete().eq('user_id', user.id);
                await supabase.from('savings_goals').delete().eq('user_id', user.id);
                await supabase.from('ai_messages').delete().eq('user_id', user.id);
                await supabase.from('users_profile').delete().eq('user_id', user.id);
                await supabase.from('user_settings').delete().eq('user_id', user.id);
              }
              await signOut();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onPress, rightElement, color, iconBg }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: iconBg || `${Colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={icon} size={18} color={color || Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{label}</Text>
        {value && <Text variant="tiny" secondary>{value}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={18} color={themeColors.textTertiary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <Screen noPadding noSafeArea>
      <View style={{
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}>
        <Text variant="h2">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        {/* Profile card */}
        <Card style={{ marginBottom: Spacing.lg, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28 }}>
                {profile?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h4">{profile?.name || 'User'}</Text>
              <Text secondary variant="small">{profile?.email}</Text>
            </View>
            <Badge label="Free" color={Colors.warning} />
          </View>
        </Card>

        {/* Premium */}
        <Card style={{ marginBottom: Spacing.lg, backgroundColor: `${Colors.primary}15`, borderColor: `${Colors.primary}30` }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 20 }}>✨</Text>
                <Text variant="h4" color={Colors.primary}>Upgrade to Premium</Text>
              </View>
              <Text secondary variant="small">Unlimited AI, advanced insights, CSV export & more</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.primary,
                borderRadius: BorderRadius.md,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>$4.99/mo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.accent,
                borderRadius: BorderRadius.md,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700' }}>$39.99/yr</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>ACCOUNT</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          <SettingRow
            icon="person-outline"
            label="Profile"
            value={profile?.name}
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingRow
            icon="cash-outline"
            label="Currency"
            value={profile?.currency || 'USD'}
            onPress={() => {}}
          />
          <SettingRow
            icon="star-outline"
            label="Manage Subscription"
            value="Free plan"
            onPress={() => {}}
          />
        </Card>

        {/* Appearance */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>APPEARANCE</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
          }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${Colors.primary}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={18} color={Colors.primary} />
            </View>
            <Text variant="bodyMedium" style={{ flex: 1 }}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: themeColors.border, true: Colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>

        {/* Notifications */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>NOTIFICATIONS</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          {[
            { key: 'weekly_summary', label: 'Weekly summary', icon: 'stats-chart-outline' },
            { key: 'budget_alerts', label: 'Budget alerts', icon: 'warning-outline' },
            { key: 'subscription_reminders', label: 'Subscription reminders', icon: 'refresh-outline' },
            { key: 'payday_reminder', label: 'Payday reminder', icon: 'cash-outline' },
            { key: 'savings_reminders', label: 'Savings reminders', icon: 'trophy-outline' },
          ].map(({ key, label, icon }, idx, arr) => (
            <View key={key} style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
              borderBottomColor: themeColors.border,
            }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${Colors.primary}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <Ionicons name={icon as any} size={18} color={Colors.primary} />
              </View>
              <Text variant="bodyMedium" style={{ flex: 1 }}>{label}</Text>
              <Switch
                value={notificationPrefs?.[key as keyof typeof notificationPrefs] as boolean ?? true}
                onValueChange={(v) => updateNotificationPrefs({ [key]: v })}
                trackColor={{ false: themeColors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          ))}
        </Card>

        {/* Data */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>DATA</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          <SettingRow
            icon="download-outline"
            label="Export to CSV"
            value={`${transactions.length} transactions`}
            onPress={handleExportCSV}
            color={Colors.success}
            iconBg={`${Colors.success}20`}
          />
        </Card>

        {/* Legal */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>LEGAL</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          <SettingRow icon="document-text-outline" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="shield-outline" label="Terms of Service" onPress={() => {}} />
        </Card>

        {/* Danger zone */}
        <Text variant="caption" secondary style={{ marginBottom: 8, marginLeft: 4 }}>ACCOUNT</Text>
        <Card style={{ marginBottom: Spacing.lg }}>
          <SettingRow
            icon="log-out-outline"
            label="Sign Out"
            color={Colors.warning}
            iconBg={`${Colors.warning}20`}
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', onPress: signOut },
              ]);
            }}
          />
          <SettingRow
            icon="trash-outline"
            label="Delete Account"
            color={Colors.danger}
            iconBg={`${Colors.danger}20`}
            onPress={handleDeleteAccount}
          />
        </Card>

        <Text tertiary center style={{ fontSize: 11 }}>
          WealthPilot v1.0.0 · Made with ❤️
        </Text>
      </ScrollView>
    </Screen>
  );
};
