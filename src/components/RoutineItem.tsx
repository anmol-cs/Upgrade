import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Icons from 'lucide-react-native';
import { Checkbox } from './Checkbox';
import { useTheme } from '@/hooks/useTheme';
import type { RoutineDisplayItem } from '@/types';

interface RoutineItemProps {
  item: RoutineDisplayItem;
  onToggle: () => void;
  onPress?: () => void;
  reduceMotion?: boolean;
}

/**
 * docs/03-Design/03-Component-Library.md — Routine Item:
 * auto-selected icon, title, optional metadata, checkbox.
 * Completed items reduce opacity (0.6) and move below the divider.
 */
export function RoutineItem({ item, onToggle, onPress, reduceMotion }: RoutineItemProps) {
  const theme = useTheme();
  const IconComponent = (Icons as Record<string, any>)[item.icon] ?? Icons.Circle;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[4],
        opacity: item.completed ? theme.semantic.routineCompletedOpacity : 1,
        gap: theme.spacing[3],
      }}
    >
      <View
        style={{
          width: theme.iconSize.xl,
          height: theme.iconSize.xl,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.background.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent size={theme.iconSize.md} color={theme.colors.text.secondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.body.fontSize,
            fontFamily: theme.typography.body.fontFamily,
            textDecorationLine: item.completed ? 'line-through' : 'none',
          }}
        >
          {item.title}
        </Text>
        {item.metadata && (
          <Text
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.caption.fontSize,
            }}
          >
            {item.metadata}
          </Text>
        )}
      </View>

      <Checkbox
        checked={item.completed}
        onToggle={onToggle}
        reduceMotion={reduceMotion}
        accessibilityLabel={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
      />
    </Pressable>
  );
}
