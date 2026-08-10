import React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';

/** docs/02-Product/04-Information-Architecture.md — Settings accessed outside the tab bar. */
export default function SettingsModal() {
  const theme = useTheme();
  const router = useRouter();
  const { reduceMotion, setReduceMotion } = useSettingsStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing[4] }}>
        <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.title.fontSize, fontFamily: theme.typography.title.fontFamily }}>
          Settings
        </Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close settings">
          <X color={theme.colors.text.secondary} size={theme.iconSize.lg} />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[4],
          borderTopWidth: 1,
          borderColor: theme.colors.border.default,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>Reduce Motion</Text>
          <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.caption.fontSize }}>
            Removes scale effects and shortens transitions
          </Text>
        </View>
        <Switch
          value={reduceMotion}
          onValueChange={setReduceMotion}
          trackColor={{ false: theme.colors.border.default, true: theme.colors.accent.primary }}
        />
      </View>
    </SafeAreaView>
  );
}
