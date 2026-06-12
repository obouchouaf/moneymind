import { Animated, View } from 'react-native';

export default { Value: Animated.Value, View: Animated.View };
export const useSharedValue = (v) => ({ value: v });
export const useAnimatedStyle = (fn) => fn();
export const withTiming = (v) => v;
export const withSpring = (v) => v;
export const withRepeat = (v) => v;
export const withSequence = (...args) => args[0];
export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;
export const interpolate = (v, i, o) => v;
export const Extrapolation = { CLAMP: 'clamp' };
export const useAnimatedGestureHandler = () => ({});
export { Animated };
