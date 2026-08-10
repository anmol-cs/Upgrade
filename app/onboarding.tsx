import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRoutineStore } from '@/stores/routineStore';
import { routineService } from '@/services/routineService';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';

/**
 * docs/02-Product/03-User-Flows.md — Flow 1: First Launch.
 * Welcome -> create first habit -> land on Routine. Under two minutes.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    if (title.trim()) {
      await routineService.createHabit(title);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary, padding: theme.spacing[6], justifyContent: 'center', gap: theme.spacing[6] }}>
      <View style={{ gap: theme.spacing[3] }}>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.display.fontSize,
            fontFamily: theme.typography.display.fontFamily,
          }}
        >
          Upgrade
        </Text>
        <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.body.fontSize }}>
          Reduce friction, not discipline. Let's start with one habit you want to build.
        </Text>
      </View>

      <InputField label="First habit" value={title} onChangeText={setTitle} placeholder="e.g. Drink water" autoFocus />

      <Button label="Start" onPress={handleStart} loading={saving} />
    </SafeAreaView>
  );
}
