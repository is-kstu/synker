import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  renderPicker?: () => React.ReactNode;
  multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  style,
  multiline,
  renderPicker,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      {renderPicker ? (
        renderPicker()
      ) : (
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            multiline && styles.multilineInput,
            style,
          ]}
          placeholderTextColor={colors.text.secondary}
          multiline={multiline}
          {...props}
        />
      )}
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    height: 50,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
}); 