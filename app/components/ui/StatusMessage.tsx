import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SubmissionStatus } from '../../types';

interface StatusMessageProps {
  status: SubmissionStatus;
  message: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  message,
  style,
  textStyle,
}) => {
  if (status === 'idle') return null;

  return (
    <View style={[styles.container, styles[status], style]}>
      <Text style={[styles.text, textStyle]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  success: {
    backgroundColor: '#10b981',
  },
  error: {
    backgroundColor: '#ef4444',
  },
  text: {
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
}); 