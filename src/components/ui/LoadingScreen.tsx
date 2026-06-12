import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { Text } from './Text';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const theme = useAppStore((s) => s.theme);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors[theme].background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text secondary style={{ marginTop: 16 }}>{message}</Text>}
    </View>
  );
};
