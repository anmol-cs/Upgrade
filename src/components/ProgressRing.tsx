import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  reduceMotion?: boolean;
}

/**
 * docs/03-Design/03-Component-Library.md — Progress Ring: smooth animated progress,
 * thin stroke, center label showing percentage. Never jumps between values.
 *
 * Implementation note: SVG has no native "percentage of a circle" primitive, so
 * this uses the standard trick of a full circle with a dashed stroke where the
 * dash length equals the full circumference (strokeDasharray) and the *offset*
 * of that dash is animated (strokeDashoffset) to reveal more or less of it —
 * offset = 0 shows the full ring, offset = circumference shows nothing.
 * `rotation={-90}` starts the visible arc at the top (12 o'clock) instead of
 * the default 3 o'clock, matching how progress rings are normally read.
 */
export function ProgressRing({ completed, total, size = 120, reduceMotion = false }: ProgressRingProps) {
  const theme = useTheme();
  const strokeWidth = theme.semantic.progressRingWidth;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total === 0 ? 0 : completed / total;

  // 0..1, animated toward `percentage` below rather than set directly — this is
  // what makes the ring sweep smoothly instead of jumping when completed/total change.
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reduceMotion
      ? percentage
      : withTiming(percentage, { duration: theme.duration.normal, easing: Easing.out(Easing.quad) });
  }, [percentage]);

  // Runs on the UI thread every frame the animation is in flight, translating
  // the 0..1 progress value into the dash-offset math described above.
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={`${completed} of ${total} completed today`}
      accessibilityValue={{ min: 0, max: total, now: completed }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.border.default}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.accent.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.section.fontSize,
            fontFamily: theme.typography.section.fontFamily,
          }}
        >
          {Math.round(percentage * 100)}%
        </Text>
        <Text
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.caption.fontSize,
          }}
        >
          {completed}/{total}
        </Text>
      </View>
    </View>
  );
}
