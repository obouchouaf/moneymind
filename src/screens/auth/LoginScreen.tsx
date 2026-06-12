import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../theme';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useAppStore } from '../../store/appStore';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export const LoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { enterDemoMode } = useAuthStore();
  const { fetchTransactions } = useTransactionStore();
  const { fetchAll } = useAppStore();

  const handleDemo = async () => {
    enterDemoMode();
    await Promise.all([fetchTransactions(), fetchAll()]);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <Screen noSafeArea noPadding>
      <LinearGradient
        colors={['#0A0A1F', '#12122A', '#0A0A1F']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg }}
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 36 }}>✈️</Text>
            </View>
            <Text variant="h1" color="#FFFFFF" center>WealthPilot</Text>
            <Text secondary center style={{ marginTop: 8 }}>
              Your AI-powered money co-pilot
            </Text>
          </View>

          {/* Form */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 24,
            padding: Spacing.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}>
            <Text variant="h3" color="#FFFFFF" style={{ marginBottom: Spacing.lg }}>
              Welcome back
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  icon="lock-closed-outline"
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 }}
            >
              <Text variant="small" color={Colors.primary}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
            />
          </View>

          {/* Demo mode */}
          <TouchableOpacity
            onPress={handleDemo}
            style={{
              marginTop: Spacing.md,
              padding: Spacing.md,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,200,0,0.4)',
              backgroundColor: 'rgba(255,200,0,0.08)',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFD700', fontWeight: '700', fontSize: 15 }}>✨ Try Demo — No account needed</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Explore with Alex Johnson's sample data</Text>
          </TouchableOpacity>

          {/* Sign up */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg }}>
            <Text secondary>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text color={Colors.primary} style={{ fontWeight: '600' }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
};
