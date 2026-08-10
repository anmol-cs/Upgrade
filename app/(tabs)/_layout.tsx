import React from 'react';
import { Tabs } from 'expo-router';
import { ListChecks, Sparkles, BarChart3, ListTodo } from 'lucide-react-native';
import { theme } from '@/theme';

/**
 * docs/02-Product/04-Information-Architecture.md
 * Bottom navigation: Routine, Skills, Insights, To-Do.
 * Settings intentionally excluded — accessed from top-right corner instead.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.surface,
          borderTopColor: theme.colors.border.default,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: { fontSize: theme.typography.label.fontSize },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Routine', tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="skills"
        options={{ title: 'Skills', tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="todo"
        options={{ title: 'To-Do', tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }}
      />
    </Tabs>
  );
}
