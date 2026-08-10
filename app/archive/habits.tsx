import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useRoutineStore } from '@/stores/routineStore';
import { ArchiveScreen } from '@/components/ArchiveScreen';

export default function ArchivedHabitsScreen() {
  const { archivedHabits, loadArchivedHabits, restoreHabit } = useRoutineStore();

  useFocusEffect(
    useCallback(() => {
      loadArchivedHabits();
    }, [loadArchivedHabits])
  );

  return (
    <ArchiveScreen
      title="Archived Habits"
      items={archivedHabits}
      emptyDescription="Archived habits stay here and can be restored anytime."
      onRestore={restoreHabit}
    />
  );
}
