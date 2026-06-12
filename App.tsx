import React from 'react';
import { View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';

// Only import GestureHandlerRootView on native — the web stub can cause issues
let GestureRoot: React.FC<{ children: React.ReactNode }>;
if (Platform.OS === 'web') {
  GestureRoot = ({ children }) => (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>{children}</View>
  );
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GestureHandlerRootView } = require('react-native-gesture-handler');
  GestureRoot = ({ children }) => (
    <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureRoot>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureRoot>
    </ErrorBoundary>
  );
}
