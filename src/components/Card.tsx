import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

/** docs/03-Design/03-Component-Library.md — Card: subtle borders, generous spacing. */
export function Card({ children, style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          padding: theme.spacing[4],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
