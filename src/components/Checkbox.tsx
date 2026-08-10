import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  reduceMotion?: boolean;
  accessibilityLabel: string;
}

/**
 * docs/03-Design/04-Motion-System.md — Checkbox: scale 0.96 -> 1.00, 150ms, ease out.
 * docs/03-Design/03-Component-Library.md — 44dp minimum touch target.
 *
 * This is a fully controlled component: it has no local "checked" state of its
 * own. Pressing it calls onToggle() and waits for the parent to flip the
 * `checked` prop (routineStore does this optimistically, so the visual update
 * is effectively instant even though the DB write happens after). Because the
 * effect below watches the `checked` prop rather than the press handler, the
 * scale "pop" animation plays any time the box becomes checked — including if
 * that happens for a reason other than this exact press (e.g. a data reload).
 */
export function Checkbox({
  checked,
  onToggle,
  disabled = false,
  reduceMotion = false,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    // Animation only plays on check, not uncheck — per the motion system doc,
    // completion is the moment worth celebrating with a little motion; removing
    // a completion is a quieter, "undo"-style action and stays static.
    if (checked && !reduceMotion) {
      scale.value = 0.96;
      scale.value = withTiming(1, { duration: theme.duration.fast, easing: Easing.out(Easing.quad) });
    }
  }, [checked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: reduceMotion ? [] : [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={{
        width: theme.semantic.touchMinimum,
        height: theme.semantic.touchMinimum,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: theme.radius.sm,
            borderWidth: 2,
            borderColor: checked ? theme.colors.accent.primary : theme.colors.border.default,
            backgroundColor: checked ? theme.colors.accent.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          },
          animatedStyle,
        ]}
      >
        {checked && <Check size={16} color={theme.colors.text.primary} strokeWidth={3} />}
      </Animated.View>
    </Pressable>
  );
}
