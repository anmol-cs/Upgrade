import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, style, ...rest }: InputFieldProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[2] }}>
      <Text
        style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.label.fontSize,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.text.disabled}
        accessibilityLabel={label}
        style={[
          {
            backgroundColor: theme.colors.background.surface,
            color: theme.colors.text.primary,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
            borderColor: error ? theme.colors.semantic.error : theme.colors.border.default,
            paddingHorizontal: theme.spacing[4],
            minHeight: theme.semantic.touchMinimum,
            fontSize: theme.typography.body.fontSize,
          },
          style,
        ]}
        {...rest}
      />
      {error && (
        <Text style={{ color: theme.colors.semantic.error, fontSize: theme.typography.caption.fontSize }}>
          {error}
        </Text>
      )}
    </View>
  );
}
