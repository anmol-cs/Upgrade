import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { HeatmapDay } from '@/services/insightsService';

interface HeatmapProps {
  days: HeatmapDay[];
}

/** docs/07-Modules/04-Insights-Module.md — GitHub-style heatmap. Color intensity only; never sole info source. */
export function Heatmap({ days }: HeatmapProps) {
  const theme = useTheme();
  // Math.max(1, ...) avoids a divide-by-zero below when every day in the window has 0 completions.
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  // Relative intensity, not absolute: a day with the most completions in this
  // window is always fully opaque, everything else scales against that — so the
  // heatmap stays readable whether the user has 2 habits or 20.
  const opacityFor = (count: number) => {
    if (count === 0) return 0.08; // faint "empty" square, never fully invisible
    return 0.25 + 0.75 * (count / maxCount);
  };

  // Chunk into columns of 7 starting from the oldest day (index 0), GitHub-style.
  // This is *not* aligned to actual calendar weeks (e.g. Sunday-start) — it's a
  // simple sequential grouping, so with a 90-day window (not a multiple of 7)
  // the last column will have fewer than 7 cells. That's expected, not a bug.
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View
      style={{ flexDirection: 'row', gap: 3 }}
      accessibilityLabel={`Activity heatmap for the last ${days.length} days`}
    >
      {weeks.map((week, wi) => (
        <View key={wi} style={{ gap: 3 }}>
          {week.map((day) => (
            <View
              key={day.date}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: theme.colors.accent.primary,
                opacity: opacityFor(day.count),
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
