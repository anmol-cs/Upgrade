import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { getTrackerGrid, shiftAnchor, type TrackerGrid as TrackerGridData, type TrackerPeriod } from '@/services/trackerService';
import { TrackerGrid, trackerContentSize } from '@/components/TrackerGrid';
import { ZoomableView } from '@/components/ZoomableView';
import { EmptyState } from '@/components/EmptyState';

const PERIODS: { key: TrackerPeriod; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

/**
 * Habit-tracker grid over a selectable window (month/quarter/year) — X for a
 * completed day, blank for a skipped day, pinch-to-zoom + pan for dense periods.
 * Complements the Insights heatmap with the exact row/column format requested.
 */
export default function TrackerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [period, setPeriod] = useState<TrackerPeriod>('month');
  const [anchor, setAnchor] = useState(new Date());
  const [data, setData] = useState<TrackerGridData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const grid = await getTrackerGrid(period, anchor);
    setData(grid);
    setLoading(false);
  }, [period, anchor]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const size = data ? trackerContentSize(data) : { width: 0, height: 0 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], gap: theme.spacing[3] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft color={theme.colors.text.secondary} size={theme.iconSize.lg} />
        </Pressable>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.title.fontSize,
            fontFamily: theme.typography.title.fontFamily,
          }}
        >
          Tracker
        </Text>
      </View>

      {/* Period selector */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: theme.spacing[4],
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.radius.sm,
          padding: 4,
        }}
      >
        {PERIODS.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setPeriod(p.key)}
            accessibilityRole="button"
            accessibilityLabel={`${p.label} view`}
            accessibilityState={{ selected: period === p.key }}
            style={{
              flex: 1,
              paddingVertical: theme.spacing[2],
              alignItems: 'center',
              borderRadius: theme.radius.sm,
              backgroundColor: period === p.key ? theme.colors.accent.primary : 'transparent',
            }}
          >
            <Text
              style={{
                color: period === p.key ? theme.colors.text.primary : theme.colors.text.secondary,
                fontSize: theme.typography.body.fontSize,
              }}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Range navigation */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        }}
      >
        <Pressable
          onPress={() => setAnchor((a) => shiftAnchor(period, a, -1))}
          accessibilityRole="button"
          accessibilityLabel="Previous period"
          hitSlop={8}
        >
          <ChevronLeft color={theme.colors.text.secondary} size={theme.iconSize.md} />
        </Pressable>
        <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>
          {data?.rangeLabel ?? ''}
        </Text>
        <Pressable
          onPress={() => setAnchor((a) => shiftAnchor(period, a, 1))}
          accessibilityRole="button"
          accessibilityLabel="Next period"
          hitSlop={8}
        >
          <ChevronRight color={theme.colors.text.secondary} size={theme.iconSize.md} />
        </Pressable>
      </View>

      {loading || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.accent.primary} />
        </View>
      ) : data.rows.length === 0 ? (
        <EmptyState
          icon="Grid3x3"
          title="Nothing tracked yet"
          description="Once you complete habits or log skill practice, they'll show up here."
        />
      ) : (
        <>
          <ZoomableView contentWidth={size.width} contentHeight={size.height}>
            <TrackerGrid data={data} />
          </ZoomableView>
          <Text
            style={{
              color: theme.colors.text.disabled,
              fontSize: theme.typography.label.fontSize,
              textAlign: 'center',
              paddingVertical: theme.spacing[2],
            }}
          >
            Pinch to zoom · drag to pan · double-tap to reset
          </Text>
        </>
      )}
    </SafeAreaView>
  );
}
