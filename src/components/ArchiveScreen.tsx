import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import * as Icons from 'lucide-react-native';

interface ArchiveItem {
  id: string;
  title: string;
  icon?: string | null;
}

interface ArchiveScreenProps {
  title: string;
  items: ArchiveItem[];
  emptyDescription: string;
  onRestore: (id: string) => void;
}

/**
 * docs/02-Product/03-User-Flows.md — Flow 8: Archive an item.
 * Archived content is hidden from primary workflows but remains recoverable
 * (docs/02-Product/04-Information-Architecture.md).
 */
export function ArchiveScreen({ title, items, emptyDescription, onRestore }: ArchiveScreenProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], gap: theme.spacing[3] }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft color={theme.colors.text.secondary} size={theme.iconSize.lg} />
        </Pressable>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.title.fontSize,
            fontFamily: theme.typography.title.fontFamily,
          }}
        >
          {title}
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState icon="Archive" title="Nothing archived" description={emptyDescription} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: theme.spacing[16] }}
          renderItem={({ item }) => {
            const IconComponent = (Icons as Record<string, any>)[item.icon ?? 'Archive'] ?? Icons.Archive;
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: theme.spacing[3],
                  paddingHorizontal: theme.spacing[4],
                  gap: theme.spacing[3],
                  opacity: theme.semantic.routineCompletedOpacity,
                }}
              >
                <IconComponent size={theme.iconSize.md} color={theme.colors.text.secondary} />
                <Text style={{ flex: 1, color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>
                  {item.title}
                </Text>
                <Button label="Restore" variant="secondary" onPress={() => onRestore(item.id)} />
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
