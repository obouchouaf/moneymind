import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { useAppStore } from '../../store/appStore';

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

  const content = (
    <View style={[{ flex: 1, backgroundColor: bg }, style]}>
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
    return (
      <>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={bg}
        />
        {content}
      </>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      {content}
    </SafeAreaView>
  );
};
