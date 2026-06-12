import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { Colors } from '../../theme';
import { useAppStore } from '../../store/appStore';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primary,
  height = 6,
  style,
  animated = true,
}) => {
  const theme = useAppStore((s) => s.theme);
  const themeColors = Colors[theme];
  const animValue = useRef(new Animated.Value(0)).current;

  const clamped = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.spring(animValue, {
        toValue: clamped,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }).start();
    } else {
      animValue.setValue(clamped);
    }
  }, [clamped]);

  const barColor = clamped > 90 ? Colors.danger : clamped > 70 ? Colors.warning : color;

  return (
    <View
      style={[
        {
          height,
          backgroundColor: themeColors.border,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: barColor,
          width: animValue.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
};
