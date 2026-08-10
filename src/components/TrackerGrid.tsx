import React from 'react';
import { View, Text } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { TrackerGrid as TrackerGridData } from '@/services/trackerService';

// Pixel dimensions for one grid cell / the fixed label column / one row. These
// are plain numbers (not theme spacing tokens) because ZoomableView needs to know
// the *exact* unscaled content size up front to size its content wrapper —
// trackerContentSize() below must stay in sync with whatever these three render.
const CELL_SIZE = 28;
const LABEL_COLUMN_WIDTH = 140;
const ROW_HEIGHT = 36;

interface TrackerGridProps {
  data: TrackerGridData;
}

/**
 * Computes the exact unscaled pixel size of the rendered grid, for ZoomableView's
 * contentWidth/contentHeight props. The 56 accounts for the two header rows
 * (20px month-label row + 36px day-number row) that sit above the data rows.
 */
export function trackerContentSize(data: TrackerGridData) {
  return {
    width: LABEL_COLUMN_WIDTH + data.days.length * CELL_SIZE,
    height: 56 + data.rows.length * ROW_HEIGHT,
  };
}


/**
 * Habit-tracker grid, matching the requested paper format: rows = habits/skills,
 * columns = days in the selected period, X for completed, blank for skipped.
 */
/**
 * Habit-tracker grid, matching the requested paper format: rows = habits/skills,
 * columns = days in the selected period, X for completed, blank for skipped.
 *
 * Rendered as three stacked pieces, all CELL_SIZE-aligned so columns line up:
 *   1. Month-label row  — "Jul", "Aug" markers over the first day of each month
 *   2. Day-number row   — "1", "2", "3"... one per column
 *   3. One row per habit/skill — a fixed-width label + one cell per day
 */
export function TrackerGrid({ data }: TrackerGridProps) {
  const theme = useTheme();

  return (
    <View>
      {/* Month grouping row (only meaningful for quarter/year).
          Labels are positioned absolutely at `index * CELL_SIZE` rather than laid
          out in a normal flex row, because most days *aren't* month-starts and a
          flex row would collapse those gaps — i.e. the labels would bunch together
          instead of sitting above the correct day column. Absolute positioning
          against a fixed-width container guarantees each label lines up with the
          day-number row and the data cells below it, regardless of which days
          happen to be month starts. */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: LABEL_COLUMN_WIDTH, height: 20 }} />
        <View style={{ width: data.days.length * CELL_SIZE, height: 20, position: 'relative' }}>
          {data.days.map((day, i) =>
            day.isFirstOfMonth ? (
              <Text
                key={`m-${day.dateKey}`}
                numberOfLines={1}
                style={{
                  position: 'absolute',
                  left: i * CELL_SIZE,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.label.fontSize,
                }}
              >
                {day.monthLabel}
              </Text>
            ) : null
          )}
        </View>
      </View>

      {/* Day-number header row */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: LABEL_COLUMN_WIDTH, height: 36, justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.label.fontSize }}>
            ACTIVITY
          </Text>
        </View>
        {data.days.map((day) => (
          <View
            key={day.dateKey}
            style={{
              width: CELL_SIZE,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: day.isToday ? theme.colors.background.card : 'transparent',
              borderRadius: day.isToday ? theme.radius.sm : 0,
            }}
          >
            <Text
              style={{
                color: day.isToday ? theme.colors.accent.primary : theme.colors.text.secondary,
                fontSize: theme.typography.caption.fontSize,
              }}
            >
              {day.dayLabel}
            </Text>
          </View>
        ))}
      </View>

      {/* Rows — row.cells[i] always corresponds to data.days[i] (same index, same
          order); trackerService builds both arrays from the same `days` list so
          this alignment is guaranteed without needing to match on date here. */}
      {data.rows.map((row) => {
        const IconComponent = (Icons as Record<string, any>)[row.icon] ?? Icons.Circle;
        return (
          <View key={row.id} style={{ flexDirection: 'row', height: ROW_HEIGHT, alignItems: 'center' }}>
            <View
              style={{
                width: LABEL_COLUMN_WIDTH,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing[2],
                paddingRight: theme.spacing[2],
              }}
            >
              <IconComponent size={14} color={theme.colors.text.secondary} />
              <Text
                numberOfLines={1}
                style={{ color: theme.colors.text.primary, fontSize: theme.typography.caption.fontSize, flex: 1 }}
              >
                {row.title}
              </Text>
            </View>
            {row.cells.map((completed, i) => (
              <View
                key={data.days[i].dateKey}
                style={{
                  width: CELL_SIZE,
                  height: ROW_HEIGHT - 4,
                  borderWidth: 1,
                  borderColor: theme.colors.border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {completed && (
                  <Text style={{ color: theme.colors.accent.primary, fontSize: 14, fontWeight: '700' }}>×</Text>
                )}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
