import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[{ alignItems: 'center', justifyContent: 'center', padding: 40 }, style]}>
    <Text style={{ fontSize: 64, marginBottom: 16 }}>{icon}</Text>
    <Text variant="h3" center style={{ marginBottom: 8 }}>{title}</Text>
    <Text variant="body" secondary center style={{ marginBottom: 24, lineHeight: 22 }}>{description}</Text>
    {actionLabel && onAction && (
      <Button title={actionLabel} onPress={onAction} />
    )}
  </View>
);
