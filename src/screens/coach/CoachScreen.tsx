import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../utils/format';
import { getAIResponse, ChatMessage } from '../../services/openai';
import { supabase } from '../../services/supabase';
import { AIMessage } from '../../types';
import { FREE_TIER_LIMITS } from '../../constants';

const SUGGESTED_PROMPTS = [
  'Can I afford a $500 purchase?',
  'What should I cut this month?',
  'How much can I save safely?',
  'Why am I overspending?',
  'Build me a 7-day saving plan',
  'Compare this month to last month',
];

export const CoachScreen = () => {
  const theme = useAppStore((s) => s.theme);
  const { profile } = useAuthStore();
  const { transactions, getMonthlyStats } = useTransactionStore();
  const { subscriptions, savingsGoals } = useAppStore();
  const themeColors = Colors[theme];
  const currency = profile?.currency || 'USD';
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const isPremium = false; // TODO: integrate RevenueCat

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);
    if (data) setMessages(data);

    // Count this month's messages
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', firstDay);
    setMessageCount(count || 0);
  };

  const buildContext = () => {
    const stats = getMonthlyStats();
    const monthlySubTotal = subscriptions.reduce((s, sub) => {
      if (sub.billing_cycle === 'monthly') return s + sub.amount;
      if (sub.billing_cycle === 'yearly') return s + sub.amount / 12;
      return s;
    }, 0);

    return `
User profile: ${profile?.name}, Currency: ${currency}
Monthly income: ${formatCurrency(profile?.monthly_income || 0, currency)}
Income this month: ${formatCurrency(stats.income, currency)}
Expenses this month: ${formatCurrency(stats.expenses, currency)}
Net cash: ${formatCurrency(stats.net, currency)}
Monthly subscriptions total: ${formatCurrency(monthlySubTotal, currency)}
Savings goals: ${savingsGoals.length} goals, total saved: ${formatCurrency(savingsGoals.reduce((s, g) => s + g.current_amount, 0), currency)}
Recent transactions: ${transactions.slice(0, 10).map((t) => `${t.description}: ${formatCurrency(t.amount, currency)}`).join(', ')}
    `.trim();
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    if (!isPremium && messageCount >= FREE_TIER_LIMITS.AI_MESSAGES_PER_MONTH) {
      Alert.alert(
        '🔒 Upgrade to Premium',
        `Free plan includes ${FREE_TIER_LIMITS.AI_MESSAGES_PER_MONTH} AI messages per month. Upgrade to get unlimited access to your AI coach!`,
        [{ text: 'OK' }]
      );
      return;
    }

    setInput('');
    setLoading(true);

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      user_id: profile?.user_id || '',
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessageCount((c) => c + 1);

    try {
      const chatHistory: ChatMessage[] = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: 'user', content: msg });

      const response = await getAIResponse(chatHistory, buildContext());

      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        user_id: profile?.user_id || '',
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_messages').insert([
          { user_id: user.id, role: 'user', content: msg },
          { user_id: user.id, role: 'assistant', content: response },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        user_id: '',
        role: 'assistant',
        content: 'I apologize, I had trouble processing that. Please check your API key or try again.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const messagesLeft = FREE_TIER_LIMITS.AI_MESSAGES_PER_MONTH - messageCount;

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
          <View>
            <Text variant="h2">AI Coach</Text>
            <Text variant="tiny" secondary>Powered by GPT-4o mini</Text>
          </View>
          {!isPremium && (
            <View style={{
              backgroundColor: `${Colors.warning}20`,
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: BorderRadius.full,
            }}>
              <Text variant="tiny" color={Colors.warning} style={{ fontWeight: '600' }}>
                {Math.max(0, messagesLeft)} left
              </Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🤖</Text>
              <Text variant="h3" center>Your AI Financial Coach</Text>
              <Text secondary center style={{ marginTop: 8, lineHeight: 22, marginBottom: 24 }}>
                Ask me anything about your finances. I have access to your real spending data.
              </Text>

              {/* Suggestions */}
              <View style={{ width: '100%' }}>
                <Text variant="smallMedium" secondary style={{ marginBottom: 10 }}>Try asking:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      onPress={() => sendMessage(prompt)}
                      style={{
                        backgroundColor: `${Colors.primary}15`,
                        borderRadius: BorderRadius.full,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderWidth: 1,
                        borderColor: `${Colors.primary}30`,
                      }}
                    >
                      <Text variant="small" color={Colors.primary}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} theme={theme} />
          ))}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
              <View style={{
                backgroundColor: themeColors.card,
                borderRadius: BorderRadius.lg,
                borderTopLeftRadius: 4,
                padding: 12,
              }}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          padding: Spacing.md,
          paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          backgroundColor: themeColors.surface,
          gap: 10,
        }}>
          <View style={{
            flex: 1,
            backgroundColor: themeColors.card,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: themeColors.border,
            paddingHorizontal: 16,
            paddingVertical: 10,
            minHeight: 44,
            maxHeight: 120,
          }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your finances..."
              placeholderTextColor={themeColors.placeholder}
              style={{ color: themeColors.text, fontSize: 15 }}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() && !loading ? Colors.primary : themeColors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() && !loading ? '#FFF' : themeColors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const MessageBubble = ({ msg, theme }: { msg: AIMessage; theme: 'dark' | 'light' }) => {
  const isUser = msg.role === 'user';
  const themeColors = Colors[theme];

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 12,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      {!isUser && (
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
        </View>
      )}
      <View style={{
        maxWidth: '78%',
        backgroundColor: isUser ? Colors.primary : themeColors.card,
        borderRadius: BorderRadius.lg,
        borderTopRightRadius: isUser ? 4 : BorderRadius.lg,
        borderTopLeftRadius: isUser ? BorderRadius.lg : 4,
        padding: 12,
        borderWidth: isUser ? 0 : 1,
        borderColor: themeColors.border,
      }}>
        <Text
          style={{
            color: isUser ? '#FFF' : themeColors.text,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {msg.content}
        </Text>
      </View>
    </View>
  );
};
