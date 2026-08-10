import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTodoStore } from '@/stores/todoStore';
import { ArchiveScreen } from '@/components/ArchiveScreen';

export default function ArchivedTodosScreen() {
  const { archived, load, restore } = useTodoStore();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ArchiveScreen
      title="Archived Tasks"
      items={archived.map((t) => ({ id: t.id, title: t.title, icon: 'ListTodo' }))}
      emptyDescription="Completed and archived tasks stay here, searchable and restorable."
      onRestore={restore}
    />
  );
}
