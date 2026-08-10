import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { RoutineWidget } from './RoutineWidget';
import { getWidgetData } from './widgetData';

/**
 * docs/03-Design/06-Widgets.md — "Refresh after local data changes."
 * Call this after any mutation that could change today's routine/progress.
 * Safe to call even when no widget is pinned (no-ops in that case).
 */
export async function refreshRoutineWidget(): Promise<void> {
  try {
    const data = await getWidgetData();
    await requestWidgetUpdate({
      widgetName: 'RoutineWidget',
      renderWidget: () => <RoutineWidget {...data} />,
    });
  } catch (e) {
    console.warn('Widget refresh failed', e);
  }
}
