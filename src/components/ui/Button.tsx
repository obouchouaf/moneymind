import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { Text } from './Text';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  fullWidth = false,
  style,
}) => {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, borderRadius: BorderRadius.md },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16, borderRadius: BorderRadius.lg },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, borderRadius: BorderRadius.xl },
  };

  const variants = {
    primary: {
      backgroundColor: Colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: themeColors.card,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    danger: {
      backgroundColor: Colors.danger,
      borderWidth: 0,
    },
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: themeColors.text,
    ghost: Colors.primary,
    danger: '#FFFFFF',
  };

  const s = sizes[size];
  const v = variants[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          opacity: disabled ? 0.5 : 1,
          ...v,
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={{
              fontSize: s.fontSize,
              fontWeight: '600',
              color: textColors[variant],
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
