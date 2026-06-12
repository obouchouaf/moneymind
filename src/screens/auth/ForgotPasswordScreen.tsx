import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../theme';
import { supabase } from '../../services/supabase';

const schema = z.object({ email: z.string().email('Invalid email address') });
type FormData = z.infer<typeof schema>;

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <Screen noSafeArea noPadding>
      <LinearGradient colors={['#0A0A1F', '#12122A', '#0A0A1F']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 60, left: Spacing.lg }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {sent ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 64, marginBottom: 20 }}>📧</Text>
              <Text variant="h2" color="#FFFFFF" center>Check your inbox</Text>
              <Text secondary center style={{ marginTop: 12, lineHeight: 22 }}>
                We've sent a password reset link to your email. Follow the instructions to reset your password.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => navigation.navigate('Login')}
                style={{ marginTop: 32 }}
              />
            </View>
          ) : (
            <>
              <View style={{ marginBottom: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🔑</Text>
                <Text variant="h2" color="#FFFFFF">Reset password</Text>
                <Text secondary style={{ marginTop: 8, lineHeight: 22 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>
              </View>

              <View style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 24,
                padding: Spacing.lg,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}>
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
                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  fullWidth
                />
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
};
