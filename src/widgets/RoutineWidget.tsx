import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { colors } from '@/theme/colors';
import type { WidgetData } from './widgetData';

/**
 * docs/03-Design/06-Widgets.md
 * Glanceable in under 3 seconds, read-only by default, matches app typography/spacing/colors.
 * A quick-complete tap is offered on each row (habits + to-dos only, per widgetData.ts).
 */
export function RoutineWidget({ completed, total, nextItems }: WidgetData) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  // FlexWidget only accepts a number | 'wrap_content' | 'match_parent' for width
  // (RemoteViews has no percentage-width support), so the bar track has a fixed
  // pixel width and the fill is computed as a pixel value against it.
  const BAR_WIDTH = 188; // 220dp widget minWidth - 2*16px padding, approximately
  const fillWidth = total === 0 ? 0 : Math.round((percentage / 100) * BAR_WIDTH);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'column',
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget
          text="Today's Routine"
          style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '500' }}
        />
        <TextWidget
          text={`${percentage}%`}
          style={{ fontSize: 16, color: colors.accent.primary, fontWeight: '700' }}
        />
      </FlexWidget>

      {/* Simple proportional progress bar (RemoteViews has no SVG support). */}
      <FlexWidget
        style={{
          height: 4,
          width: BAR_WIDTH,
          backgroundColor: colors.border.default,
          borderRadius: 2,
          marginTop: 8,
          marginBottom: 12,
        }}
      >
        <FlexWidget
          style={{
            height: 4,
            width: fillWidth,
            backgroundColor: colors.accent.primary,
            borderRadius: 2,
          }}
        />
      </FlexWidget>

      {total === 0 ? (
        <TextWidget text="Nothing scheduled today" style={{ fontSize: 13, color: colors.text.secondary }} />
      ) : nextItems.length === 0 ? (
        <TextWidget text="All done for today" style={{ fontSize: 13, color: colors.text.secondary }} />
      ) : (
        nextItems.map((item) => (
          <FlexWidget
            key={item.id}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
            clickAction={item.type !== 'skill' ? 'TOGGLE_ITEM' : undefined}
            clickActionData={item.type !== 'skill' ? { type: item.type, sourceId: item.sourceId } : undefined}
          >
            <FlexWidget
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.text.secondary,
                marginRight: 8,
              }}
            />
            <TextWidget
              text={item.title}
              style={{ fontSize: 13, color: colors.text.primary }}
              maxLines={1}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
