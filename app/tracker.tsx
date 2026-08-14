import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { getTrackerGrid, shiftAnchor, type TrackerGrid as TrackerGridData, type TrackerPeriod } from '@/services/trackerService';
import { TrackerGrid, trackerContentSize } from '@/components/TrackerGrid';
import { EmptyState } from '@/components/EmptyState';

const PERIODS: { key: TrackerPeriod; label: string }[] = [{ key: 'month', label: 'Month' }, { key: 'quarter', label: 'Quarter' }, { key: 'year', label: 'Year' }];

export default function TrackerScreen() {
 const theme = useTheme(); const router = useRouter(); const [period, setPeriod] = useState<TrackerPeriod>('month'); const [anchor, setAnchor] = useState(new Date()); const [data, setData] = useState<TrackerGridData | null>(null); const [loading, setLoading] = useState(true);
 const load = useCallback(async () => { setLoading(true); setData(await getTrackerGrid(period, anchor)); setLoading(false); }, [period, anchor]);
 useEffect(() => { load(); }, [load]); useFocusEffect(useCallback(() => { load(); }, [load]));
 const size = data ? trackerContentSize(data) : { width: 0, height: 0 };
 return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], gap: theme.spacing[3] }}><Pressable onPress={() => router.back()}><ChevronLeft color={theme.colors.text.secondary} size={theme.iconSize.lg} /></Pressable><Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.title.fontSize, fontFamily: theme.typography.title.fontFamily }}>Tracker</Text></View>
  <View style={{ flexDirection: 'row', marginHorizontal: theme.spacing[4], backgroundColor: theme.colors.background.surface, borderRadius: theme.radius.sm, padding: 4 }}>{PERIODS.map((p) => <Pressable key={p.key} onPress={() => setPeriod(p.key)} style={{ flex: 1, paddingVertical: theme.spacing[2], alignItems: 'center', borderRadius: theme.radius.sm, backgroundColor: period === p.key ? theme.colors.accent.primary : 'transparent' }}><Text style={{ color: period === p.key ? theme.colors.text.primary : theme.colors.text.secondary }}>{p.label}</Text></Pressable>)}</View>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }}><Pressable onPress={() => setAnchor((a) => shiftAnchor(period, a, -1))}><ChevronLeft color={theme.colors.text.secondary} size={theme.iconSize.md} /></Pressable><Text style={{ color: theme.colors.text.primary }}>{data?.rangeLabel ?? ''}</Text><Pressable onPress={() => setAnchor((a) => shiftAnchor(period, a, 1))}><ChevronRight color={theme.colors.text.secondary} size={theme.iconSize.md} /></Pressable></View>
  {loading || !data ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.accent.primary} /></View> : data.rows.length === 0 ? <EmptyState icon="Grid3x3" title="Nothing tracked yet" description="Once you complete habits or log skill practice, they'll show up here." /> : <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ minWidth: Math.max(size.width, 1) }}><ScrollView showsVerticalScrollIndicator contentContainerStyle={{ paddingBottom: theme.spacing[4] }}><TrackerGrid data={data} /></ScrollView></ScrollView>}
 </SafeAreaView>;
}
