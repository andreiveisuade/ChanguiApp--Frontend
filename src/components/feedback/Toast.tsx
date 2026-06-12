import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const BG_COLOR: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.primary,
};

export function Toast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: ToastProps): React.JSX.Element | null {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onHide());
  }, [visible, duration, opacity, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: BG_COLOR[type], opacity }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 999,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default Toast;
