import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { WeekRange } from '../../types';

interface WeekSelectorProps {
  weekRange: WeekRange;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  weekRange,
  onPreviousWeek,
  onNextWeek,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={onPreviousWeek} style={styles.arrow}>
        <Ionicons name="chevron-back" size={14} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, titleStyle]}>
          {weekRange.startFormatted} - {weekRange.endFormatted}
        </Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{weekRange.dateRange}</Text>
      </View>

      <TouchableOpacity onPress={onNextWeek} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={14} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  arrow: {
    padding: spacing.sm,
  },
  info: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
}); 