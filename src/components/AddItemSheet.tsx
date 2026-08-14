import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BottomSheet } from './BottomSheet';
import { InputField } from './InputField';
import { Button } from './Button';
import { routineService } from '@/services/routineService';
import { skillsService } from '@/services/skillsService';
import { todoService } from '@/services/todoService';
import { toUserMessage } from '@/utils/errors';

type Category = 'habit' | 'skill' | 'todo';
const CATEGORIES: { key: Category; label: string }[] = [{ key: 'habit', label: 'Habit' }, { key: 'skill', label: 'Skill' }, { key: 'todo', label: 'To-Do' }];
const HINTS: Record<Category, string> = { habit: 'Appears in your Routine right away and resets each day.', skill: 'Starts inactive — activate it from the Skills tab to add it to your Routine.', todo: 'Appears in your Routine right away and stays until you complete it.' };
interface AddItemSheetProps { visible: boolean; onClose: () => void; onCreated: (category: Category) => void | Promise<void>; }
export function AddItemSheet({ visible, onClose, onCreated }: AddItemSheetProps) {
 const theme = useTheme(); const [title, setTitle] = useState(''); const [category, setCategory] = useState<Category>('todo'); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
 const reset = () => { setTitle(''); setCategory('todo'); setError(null); };
 const handleClose = () => { if (saving) return; reset(); onClose(); };
 const handleSave = async () => { const trimmed = title.trim(); if (!trimmed || saving) return; setSaving(true); setError(null); try { if (category === 'habit') await routineService.createHabit(trimmed); else if (category === 'skill') await skillsService.createSkill(trimmed); else await todoService.createTodo(trimmed); const savedCategory = category; await onCreated(savedCategory); reset(); onClose(); } catch (e) { setError(toUserMessage(e)); } finally { setSaving(false); } };
 return <BottomSheet visible={visible} onClose={handleClose}><View style={{ gap: theme.spacing[4] }}><Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.card.fontSize, fontFamily: theme.typography.card.fontFamily }}>Add Item</Text><InputField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Read 10 pages" autoFocus returnKeyType="done" onSubmitEditing={handleSave} /><View style={{ gap: theme.spacing[2] }}><Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.label.fontSize }}>CATEGORY</Text><View style={{ flexDirection: 'row', backgroundColor: theme.colors.background.surface, borderRadius: theme.radius.sm, padding: 4 }}>{CATEGORIES.map((c) => <Pressable key={c.key} onPress={() => setCategory(c.key)} style={{ flex: 1, paddingVertical: theme.spacing[2], alignItems: 'center', borderRadius: theme.radius.sm, backgroundColor: category === c.key ? theme.colors.accent.primary : 'transparent' }}><Text style={{ color: category === c.key ? theme.colors.text.primary : theme.colors.text.secondary }}>{c.label}</Text></Pressable>)}</View><Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.caption.fontSize }}>{HINTS[category]}</Text></View>{error && <Text style={{ color: theme.colors.semantic.error, fontSize: theme.typography.caption.fontSize }}>{error}</Text>}<Button label="Save" onPress={handleSave} loading={saving} disabled={!title.trim() || saving} fullWidth /></View></BottomSheet>;
}
