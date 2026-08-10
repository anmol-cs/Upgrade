import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, Pressable } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSkillsStore } from '@/stores/skillsStore';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import type { Skill } from '@/database/schema';

/** docs/07-Modules/02-Skills-Module.md */
export default function SkillsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { active, inactive, completed, load, create, activate, complete, reorder } = useSkillsStore();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sections = [
    { title: 'Inactive', data: inactive },
    { title: 'Completed', data: completed },
  ].filter((s) => s.data.length > 0);

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
          Skills
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4] }}>
          <Pressable onPress={() => router.push('/archive/skills')} accessibilityRole="button" accessibilityLabel="Archived skills">
            <Icons.Archive color={theme.colors.text.secondary} size={theme.iconSize.lg} />
          </Pressable>
          <Pressable onPress={() => setCreating(true)} accessibilityRole="button" accessibilityLabel="Add skill">
            <Icons.Plus color={theme.colors.accent.primary} size={theme.iconSize.lg} />
          </Pressable>
        </View>
      </View>

      {active.length === 0 && sections.length === 0 ? (
        <EmptyState
          icon="Sparkles"
          title="No skills yet"
          description="Create a skill to start deliberate, long-term practice."
          actionLabel="Create a skill"
          onAction={() => setCreating(true)}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {active.length > 0 && (
            <>
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.label.fontSize,
                  paddingHorizontal: theme.spacing[4],
                  paddingBottom: theme.spacing[2],
                }}
              >
                ACTIVE
              </Text>
              <DraggableFlatList
                data={active}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => reorder(data.map((s) => s.id))}
                activationDistance={12}
                renderItem={({ item, drag, isActive }: RenderItemParams<Skill>) => (
                  <ScaleDecorator>
                    <Pressable onLongPress={drag} disabled={isActive} delayLongPress={150}>
                      <SkillRow skill={item} section="Active" onActivate={() => {}} onComplete={() => complete(item.id)} />
                    </Pressable>
                  </ScaleDecorator>
                )}
              />
            </>
          )}

          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: theme.spacing[16] }}
            renderSectionHeader={({ section }) => (
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.label.fontSize,
                  paddingHorizontal: theme.spacing[4],
                  paddingTop: theme.spacing[4],
                  paddingBottom: theme.spacing[2],
                }}
              >
                {section.title.toUpperCase()}
              </Text>
            )}
            renderItem={({ item, section }) => (
              <SkillRow
                skill={item}
                section={section.title}
                onActivate={() => activate(item.id)}
                onComplete={() => complete(item.id)}
              />
            )}
          />
        </View>
      )}

      <BottomSheet visible={creating} onClose={() => { setCreating(false); setError(null); }}>
        <View style={{ gap: theme.spacing[4] }}>
          <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.card.fontSize, fontFamily: theme.typography.card.fontFamily }}>
            New Skill
          </Text>
          <InputField
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Guitar"
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

function SkillRow({
  skill,
  section,
  onActivate,
  onComplete,
}: {
  skill: Skill;
  section: string;
  onActivate: () => void;
  onComplete: () => void;
}) {
  const theme = useTheme();
  const IconComponent = (Icons as Record<string, any>)[skill.icon ?? 'Sparkles'] ?? Icons.Sparkles;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[4],
        gap: theme.spacing[3],
      }}
    >
      <View
        style={{
          width: theme.iconSize.xl,
          height: theme.iconSize.xl,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.background.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent size={theme.iconSize.md} color={theme.colors.text.secondary} />
      </View>
      <Text style={{ flex: 1, color: theme.colors.text.primary, fontSize: theme.typography.body.fontSize }}>
        {skill.title}
      </Text>
      {section === 'Inactive' && <Button label="Activate" variant="secondary" onPress={onActivate} />}
      {section === 'Active' && <Button label="Complete" variant="secondary" onPress={onComplete} />}
    </View>
  );
}
