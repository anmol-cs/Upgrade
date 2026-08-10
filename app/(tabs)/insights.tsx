import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Grid3x3, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useInsightsStore } from '@/stores/insightsStore';
import { Card } from '@/components/Card';
import { Heatmap } from '@/components/Heatmap';

/**
 * docs/07-Modules/04-Insights-Module.md
 * Reflective feedback: heatmap, completion trends, skill history. No streaks or gamification.
 */
export default function InsightsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { summary, load } = useInsightsStore();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing[4], gap: theme.spacing[4] }}>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.title.fontSize,
            fontFamily: theme.typography.title.fontFamily,
          }}
        >
          Insights
        </Text>

        {summary && (
          <>
            <Card>
              <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.label.fontSize, marginBottom: theme.spacing[3] }}>
                LAST 90 DAYS
              </Text>
              <Heatmap days={summary.heatmap} />
            </Card>

            <Pressable onPress={() => router.push('/tracker')} accessibilityRole="button" accessibilityLabel="Open tracker grid">
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
                <Grid3x3 color={theme.colors.accent.primary} size={theme.iconSize.lg} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>
                    Tracker Grid
                  </Text>
                  <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.caption.fontSize }}>
                    View month, quarter, or year at a glance
                  </Text>
                </View>
                <ChevronRight color={theme.colors.text.secondary} size={theme.iconSize.md} />
              </Card>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
              <StatCard label="Completions" value={String(summary.totalCompletions)} />
              <StatCard label="Active Routines" value={String(summary.currentActiveRoutines)} />
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
              <StatCard label="Tasks Completed" value={String(summary.completedTodos)} />
              <StatCard label="Practice Minutes" value={String(summary.totalPracticeMinutes)} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Card style={{ flex: 1 }}>
      <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.label.fontSize }}>{label}</Text>
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.section.fontSize,
          fontFamily: theme.typography.section.fontFamily,
          marginTop: theme.spacing[1],
        }}
      >
        {value}
      </Text>
    </Card>
  );
}
