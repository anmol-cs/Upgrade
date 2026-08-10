import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { RoutineWidget } from './src/widgets/RoutineWidget';
import { getWidgetData, toggleWidgetItem, type WidgetItem } from './src/widgets/widgetData';

function isToggleClickData(data: unknown): data is Pick<WidgetItem, 'type' | 'sourceId'> {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (d.type === 'habit' || d.type === 'todo') && typeof d.sourceId === 'string';
}

/**
 * docs/06-Implementation/08-Widget-Implementation.md
 * Registered in index.js via registerWidgetTaskHandler. Runs in a headless JS
 * context — reads local SQLite data directly, never the network, and must
 * tolerate running without the main app mounted.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await getWidgetData();
      props.renderWidget(<RoutineWidget {...data} />);
      break;
    }

    case 'WIDGET_CLICK': {
      // clickActionData arrives as Record<string, unknown> — narrow it before use
      // rather than trusting its shape (it's a payload set by RoutineWidget.tsx,
      // but this handler shouldn't assume that source stays in sync).
      if (props.clickAction === 'TOGGLE_ITEM' && isToggleClickData(props.clickActionData)) {
        await toggleWidgetItem(props.clickActionData);
      }
      const data = await getWidgetData();
      props.renderWidget(<RoutineWidget {...data} />);
      break;
    }

    case 'WIDGET_DELETED':
    default:
      break;
  }
}
