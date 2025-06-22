import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Shift } from '../../types';

interface ShiftCardProps {
  shift: Shift;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  timeStyle?: TextStyle;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  style,
  titleStyle,
  timeStyle,
}) => {
  return (
    <LinearGradient
      colors={['#1f2230', '#2c2f44']}
      start={[0, 0]}
      end={[1, 0]}
      style={[styles.container, style]}
    >
      <Text style={[styles.title, titleStyle]}>{shift.task}</Text>
      <View style={styles.timeContainer}>
        <Ionicons
          name="time-outline"
          size={16}
          color={colors.text.accent}
        />
        <Text style={[styles.timeText, timeStyle]}>
          {shift.startTime} — {shift.endTime}
        </Text>
      </View>
      {shift.employee && (
        <View style={styles.employeeContainer}>
          <Ionicons
            name="person-outline"
            size={16}
            color={colors.text.accent}
          />
          <Text style={styles.employeeText}>{shift.employee.name}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.accent,
    marginLeft: spacing.xs,
  },
  employeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.accent,
    marginLeft: spacing.xs,
  },
}); 