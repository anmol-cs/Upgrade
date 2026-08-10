import React, { useEffect, useState } from 'react';
import { Modal, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * docs/03-Design/03-Component-Library.md — Bottom Sheet preferred over modal dialogs.
 * docs/03-Design/04-Motion-System.md — slide from bottom, fade backdrop.
 *
 * Why this needs its own `mounted` state instead of just passing `visible`
 * straight to <Modal>: RN's Modal mounts/unmounts its native view the instant
 * its `visible` prop changes — there's no opportunity for an exit animation to
 * play, because the view is already gone before the next frame renders. So
 * instead: `visible` flipping to false starts the slide-down/fade-out
 * animation *while the Modal is still mounted*, and only once that animation
 * actually finishes do we flip `mounted` to false (via runOnJS, since the
 * animation's onComplete callback runs on the UI thread, not the JS thread).
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  // Controls whether <Modal> is mounted at all — lags behind `visible` on close
  // so the exit animation has time to run before the native view is torn down.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, { duration: theme.duration.normal, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: theme.duration.normal });
    } else {
      translateY.value = withTiming(300, { duration: theme.duration.fast });
      opacity.value = withTiming(0, { duration: theme.duration.fast }, (finished) => {
        // Only unmount once the fade-out has actually completed — if a new
        // "open" interrupts it mid-animation, `finished` is false and we
        // correctly skip unmounting (the effect above already set mounted=true).
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }, backdropStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.background.surface,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            padding: theme.spacing[6],
            paddingBottom: theme.spacing[8],
          },
          sheetStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
