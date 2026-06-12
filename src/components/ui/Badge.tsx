import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../theme';
import { Text } from './Text';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = Colors.primary, style, size = 'md' }) => {
  const padding = size === 'sm' ? { paddingVertical: 2, paddingHorizontal: 8 } : { paddingVertical: 4, paddingHorizontal: 12 };
  return (
    <View
      style={[
        {
          ...padding,
          borderRadius: BorderRadius.full,
          backgroundColor: color + '20',
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        variant={size === 'sm' ? 'tiny' : 'smallMedium'}
        color={color}
      >
        {label}
      </Text>
    </View>
  );
};
