import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { useAppStore } from '../../store/appStore';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: number;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated,
  padding = 16,
  style,
  ...props
}) => {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];

  return (
    <View
      style={[
        {
          backgroundColor: elevated ? themeColors.cardElevated : themeColors.card,
          borderRadius: BorderRadius.lg,
          padding,
          borderWidth: 1,
          borderColor: themeColors.border,
          ...(theme === 'light' ? Shadows.sm : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
