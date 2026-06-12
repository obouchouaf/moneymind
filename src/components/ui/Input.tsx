import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  hint,
  style,
  ...props
}) => {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);

  const isPassword = props.secureTextEntry;

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label && (
        <Text variant="smallMedium" secondary style={{ marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.card,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: error
            ? Colors.danger
            : focused
            ? Colors.primary
            : themeColors.border,
          paddingHorizontal: Spacing.md,
          minHeight: 52,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.primary : themeColors.textSecondary}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          style={[
            {
              flex: 1,
              color: themeColors.text,
              fontSize: 15,
              paddingVertical: 14,
            },
            style,
          ]}
          placeholderTextColor={themeColors.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !secureVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setSecureVisible(!secureVisible)}>
            <Ionicons
              name={secureVisible ? 'eye-off' : 'eye'}
              size={18}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {error && (
        <Text variant="tiny" color={Colors.danger} style={{ marginTop: 4 }}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="tiny" tertiary style={{ marginTop: 4 }}>
          {hint}
        </Text>
      )}
    </View>
  );
};
