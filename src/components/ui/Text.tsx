import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { Colors, Typography } from '../../theme';

interface WPTextProps extends TextProps {
  variant?: keyof typeof Typography;
  color?: string;
  secondary?: boolean;
  tertiary?: boolean;
  center?: boolean;
}

export const Text: React.FC<WPTextProps> = ({
  variant = 'body',
  color,
  secondary,
  tertiary,
  center,
  style,
  children,
  ...props
}) => {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];

  const textColor = color
    ? color
    : tertiary
    ? themeColors.textTertiary
    : secondary
    ? themeColors.textSecondary
    : themeColors.text;

  return (
    <RNText
      style={[
        Typography[variant],
        { color: textColor },
        center && { textAlign: 'center' },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
