import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSkillsStore } from '@/stores/skillsStore';
import { ArchiveScreen } from '@/components/ArchiveScreen';

export default function ArchivedSkillsScreen() {
  const { archived, load, restore } = useSkillsStore();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ArchiveScreen
      title="Archived Skills"
      items={archived}
      emptyDescription="Archived skills stay here and can be restored anytime."
      onRestore={restore}
    />
  );
}
