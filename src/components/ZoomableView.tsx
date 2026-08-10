import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ZoomableViewProps {
  /** Full (unscaled) width of the content being wrapped, in px. Used to size the
   * Animated.View that the transform is applied to — the outer "viewport" View
   * stays a fixed size and clips anything that scales/pans outside it. */
  contentWidth: number;
  contentHeight: number;
  minScale?: number;
  maxScale?: number;
  children: React.ReactNode;
}

/**
 * Pinch-to-zoom + drag-to-pan for content larger than the viewport (e.g. a
 * quarter/year tracker grid). Double-tap resets to fit. Reduced-motion isn't
 * applicable here — zoom/pan are direct manipulation gestures, not passive animation.
 *
 * How it works, in short: two pairs of shared values track "current" transform
 * (scale/translateX/translateY) and "saved" transform (their value as of the end
 * of the last gesture). Every pinch/pan update recomputes "current" as
 * saved + delta-from-this-gesture; onEnd copies current back into saved so the
 * next gesture starts from where this one left off, instead of resetting to zero.
 * This is the standard Reanimated pattern for a resumable, cumulative transform.
 */
export function ZoomableView({ contentWidth, contentHeight, minScale = 0.4, maxScale = 4, children }: ZoomableViewProps) {
  // "Live" values — read every frame by the animated style below.
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // "Checkpoint" values — snapshot of scale/translate at the end of the last
  // completed gesture. Without these, releasing and re-starting a pinch or pan
  // would jump back to the previous gesture's starting point instead of
  // continuing smoothly from where the user left off.
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    // e.scale is the pinch ratio *since this gesture began* (1 = no change), not
    // an absolute value — so the new scale is always savedScale * e.scale, then
    // clamped so the user can't zoom out past minScale or in past maxScale.
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(next, minScale), maxScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    // Allow panning with one finger (simple drag) or two (pinch + pan together,
    // since Gesture.Simultaneous below lets both run at once).
    .minPointers(1)
    .maxPointers(2)
    // e.translationX/Y are cumulative deltas since this specific pan gesture
    // started, so — same pattern as the pinch above — the live position is
    // savedTranslate + delta, and onEnd bakes the result into savedTranslate.
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Animate both the live and saved values back to identity so the next
      // pinch/pan starts fresh from a reset state, not from the pre-reset saved values.
      scale.value = withTiming(1);
      savedScale.value = 1;
      translateX.value = withTiming(0);
      savedTranslateX.value = 0;
      translateY.value = withTiming(0);
      savedTranslateY.value = 0;
    });

  // Pinch and pan can run at the same time (two-finger pinch-and-drag), but a
  // double-tap should take priority and short-circuit them — Gesture.Exclusive
  // tries gestures in order and stops at the first one that activates.
  const composed = Gesture.Simultaneous(pinch, pan);
  const gesture = Gesture.Exclusive(doubleTap, composed);

  const animatedStyle = useAnimatedStyle(() => ({
    // Order matters: translate happens in the view's own (unscaled) coordinate
    // space, then scale is applied — this keeps panning distance 1:1 with finger
    // movement regardless of current zoom level, which feels correct to the user.
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      {/* Fixed-size, clipping viewport — content transforms inside it but never
          visually overflows the screen. */}
      <View style={styles.viewport}>
        <Animated.View style={[{ width: contentWidth, height: contentHeight }, animatedStyle]}>
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
});
