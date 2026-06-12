import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ScrollView } from 'react-native';
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

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const SignupScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });
    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Check your email', 'We sent you a verification link. Please verify your email to continue.');
    }
    setLoading(false);
  };

  return (
    <Screen noSafeArea noPadding>
      <LinearGradient colors={['#0A0A1F', '#12122A', '#0A0A1F']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', padding: Spacing.lg, paddingTop: 60 }}
          >
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 28 }}>✈️</Text>
              </View>
              <Text variant="h2" color="#FFFFFF">Create account</Text>
              <Text secondary center style={{ marginTop: 6 }}>
                Start your journey to financial freedom
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
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    onChangeText={onChange}
                    value={value}
                    icon="person-outline"
                    error={errors.name?.message}
                  />
                )}
              />
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
                    placeholder="Min 8 characters"
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    icon="lock-closed-outline"
                    error={errors.password?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Repeat your password"
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    icon="lock-closed-outline"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                fullWidth
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg }}>
              <Text secondary>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text color={Colors.primary} style={{ fontWeight: '600' }}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <Text tertiary center style={{ marginTop: Spacing.md, fontSize: 11 }}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </KeyboardAvoidingView>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
};
