import React, { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTodoStore } from '@/stores/todoStore';
import { Checkbox } from '@/components/Checkbox';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Todo } from '@/database/schema';

/** docs/07-Modules/03-ToDo-Module.md — persist until completed, completion archives automatically. */
export default function TodoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { active, load, create, complete, reorder } = useTodoStore();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await create(title);
      setTitle('');
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }} edges={['top']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing[4] }}>
        <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.title.fontSize, fontFamily: theme.typography.title.fontFamily }}>
          To-Do
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <Pressable onPress={() => router.push('/archive/todos')} accessibilityRole="button" accessibilityLabel="Archived tasks">
            <Icons.Archive color={theme.colors.text.secondary} size={theme.iconSize.lg} />
          </Pressable>
          <Pressable onPress={() => setCreating(true)} accessibilityRole="button" accessibilityLabel="Add task">
            <Icons.Plus color={theme.colors.accent.primary} size={theme.iconSize.lg} />
          </Pressable>
        </View>
      </View>

      {active.length === 0 ? (
        <EmptyState
          icon="ListTodo"
          title="Nothing to do"
          description="Capture a task and it will stay here until you complete it."
          actionLabel="Add a task"
          onAction={() => setCreating(true)}
        />
      ) : (
        <DraggableFlatList
          data={active}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => reorder(data.map((t) => t.id))}
          activationDistance={12}
          contentContainerStyle={{ paddingBottom: theme.spacing[16] }}
          renderItem={({ item, drag, isActive }: RenderItemParams<Todo>) => (
            <ScaleDecorator>
              <Pressable onLongPress={drag} disabled={isActive} delayLongPress={150}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.spacing[3],
                    paddingHorizontal: theme.spacing[4],
                    gap: theme.spacing[3],
                  }}
                >
                  <Text style={{ flex: 1, color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>
                    {item.title}
                  </Text>
                  <Checkbox
                    checked={item.completed}
                    onToggle={() => complete(item.id)}
                    reduceMotion={reduceMotion}
                    accessibilityLabel={`Mark "${item.title}" as complete`}
                  />
                </View>
              </Pressable>
            </ScaleDecorator>
          )}
        />
      )}

      <BottomSheet visible={creating} onClose={() => { setCreating(false); setError(null); }}>
        <View style={{ gap: theme.spacing[4] }}>
          <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.card.fontSize, fontFamily: theme.typography.card.fontFamily }}>
            New Task
          </Text>
          <InputField
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Pay electricity bill"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          {error && (
            <Text style={{ color: theme.colors.semantic.error, fontSize: theme.typography.caption.fontSize }}>
              {error}
            </Text>
          )}
          <Button label="Save" onPress={handleCreate} loading={saving} disabled={!title.trim()} fullWidth />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
