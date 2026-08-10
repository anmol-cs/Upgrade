import React from 'react';
import { View, Text } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** docs/03-Design/03-Component-Library.md — icon, short title, one-line explanation, primary action. */
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  const IconComponent = Icons[icon] as any;

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing[16],
        paddingHorizontal: theme.spacing[8],
        gap: theme.spacing[3],
      }}
    >
      <IconComponent size={32} color={theme.colors.text.secondary} />
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.card.fontSize,
          fontFamily: theme.typography.card.fontFamily,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.body.fontSize,
          textAlign: 'center',
        }}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <View style={{ marginTop: theme.spacing[3] }}>
          <Button label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      )}
    </View>
  );
}
