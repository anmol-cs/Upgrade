import React, { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect, useRouter } from 'expo-router';
import { Settings as SettingsIcon, Plus, Archive } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useRoutineStore, selectDailyProgress } from '@/stores/routineStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGreeting } from '@/hooks/useGreeting';
import { ProgressRing } from '@/components/ProgressRing';
import { RoutineItem } from '@/components/RoutineItem';
import { EmptyState } from '@/components/EmptyState';
import { AddItemSheet } from '@/components/AddItemSheet';
import { useSkillsStore } from '@/stores/skillsStore';
import { useTodoStore } from '@/stores/todoStore';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { RoutineDisplayItem } from '@/types';

/**
 * docs/02-Product/01-Product-Requirements.md — Routine
 * Default landing screen: greeting, progress ring, unified checklist.
 * Completed items move below a divider but remain visible.
 */
export default function RoutineScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { items, isLoading, load, toggleItem, reorderActiveItems } = useRoutineStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const greeting = useGreeting();
  const [creating, setCreating] = useState(false);

  // Only used here to keep their own screens' data fresh immediately after
  // adding a Skill or To-Do from this screen's "+" button — Routine itself
  // only ever reads habits + active skills + active to-dos via routineStore.
  const loadSkills = useSkillsStore((s) => s.load);
  const loadTodos = useTodoStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const progress = selectDailyProgress(items);
  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  const handleItemCreated = async (category: 'habit' | 'skill' | 'todo') => {
    await load();
    refreshRoutineWidget();
    // A newly created skill/todo won't be visible on THIS screen until those
    // stores reload too (skills start inactive; either way their own tab
    // should already reflect the new item next time it's opened).
    if (category === 'skill') loadSkills();
    if (category === 'todo') loadTodos();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing[4],
          paddingTop: theme.spacing[2],
        }}
      >
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.title.fontSize,
            fontFamily: theme.typography.title.fontFamily,
          }}
        >
          {greeting}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <Pressable
            onPress={() => router.push('/archive/habits')}
            accessibilityRole="button"
            accessibilityLabel="Archived habits"
            hitSlop={12}
          >
            <Archive color={theme.colors.text.secondary} size={theme.iconSize.lg} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/modal')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={12}
          >
            <SettingsIcon color={theme.colors.text.secondary} size={theme.iconSize.lg} />
          </Pressable>
        </View>
      </View>

      <View style={{ alignItems: 'center', paddingVertical: theme.spacing[6] }}>
        <ProgressRing completed={progress.completed} total={progress.total} reduceMotion={reduceMotion} />
      </View>

      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="Sunrise"
          title="Nothing here yet"
          description="Add a habit, skill, or to-do to build today's routine."
          actionLabel="Add an item"
          onAction={() => setCreating(true)}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            data={activeItems}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => reorderActiveItems(data)}
            activationDistance={12}
            renderItem={({ item, drag, isActive }: RenderItemParams<RoutineDisplayItem>) => (
              <ScaleDecorator>
                <Pressable onLongPress={drag} disabled={isActive} delayLongPress={150}>
                  <RoutineItem item={item} onToggle={() => toggleItem(item)} reduceMotion={reduceMotion} />
                </Pressable>
              </ScaleDecorator>
            )}
            contentContainerStyle={{ paddingBottom: completedItems.length > 0 ? 0 : theme.spacing[16] }}
          />

          {completedItems.length > 0 && (
            <>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.border.default,
                  marginVertical: theme.spacing[3],
                  marginHorizontal: theme.spacing[4],
                }}
              />
              {completedItems.map((item) => (
                <RoutineItem key={item.id} item={item} onToggle={() => toggleItem(item)} reduceMotion={reduceMotion} />
              ))}
            </>
          )}
        </View>
      )}

      <Pressable
        onPress={() => setCreating(true)}
        accessibilityRole="button"
        accessibilityLabel="Add item"
        style={{
          position: 'absolute',
          right: theme.spacing[4],
          bottom: theme.spacing[6],
          width: 56,
          height: 56,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.accent.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Plus color={theme.colors.text.primary} size={24} />
      </Pressable>

      <AddItemSheet visible={creating} onClose={() => setCreating(false)} onCreated={handleItemCreated} />
    </SafeAreaView>
  );
}
