import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ViewStyle,
  Platform,
  Text as RNText,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
  noSafeArea?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  onRefresh,
  refreshing = false,
  style,
  contentStyle,
  noPadding,
  noSafeArea,
}) => {
  const theme = useAppStore((s) => s.theme);
  const bg = Colors[theme].background;
  const { isDemoMode, exitDemoMode } = useAuthStore();

  const content = (
    <View style={[{ flex: 1, backgroundColor: bg }, style]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {isDemoMode && (
        <TouchableOpacity
          onPress={exitDemoMode}
          style={{ backgroundColor: '#FFD700', paddingVertical: 6, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        >
          <RNText style={{ color: '#000', fontWeight: '700', fontSize: 12 }}>✨ DEMO MODE — Tap to exit</RNText>
        </TouchableOpacity>
      )}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            !noPadding && { paddingHorizontal: 16 },
            { paddingBottom: 100 },
            contentStyle,
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            { flex: 1 },
            !noPadding && { paddingHorizontal: 16 },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );

  if (noSafeArea) {
    return content;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {content}
    </SafeAreaView>
  );
};
