import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from '@/database/migrate';
import { theme } from '@/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    runMigrations()
      .then(() => {
        setReady(true);
        refreshRoutineWidget();
      })
      .catch((e) => {
        console.error('Migration failed', e);
        setError('We could not open your data. Please restart the app.');
      });
  }, []);

  if (!ready || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing[3],
        }}
      >
        {error ? (
          <Text style={{ color: theme.colors.text.secondary }}>{error}</Text>
        ) : (
          <ActivityIndicator color={theme.colors.accent.primary} />
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <StatusBar style="light" />
      <Stack
        initialRouteName={hasCompletedOnboarding ? '(tabs)' : 'onboarding'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background.primary } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" />
      </Stack>
    </GestureHandlerRootView>
  );
}
