import { colors, spacing, typography } from '@/constants/theme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShifts } from '../../hooks/useShifts';
import { UserRole } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState, Header, ShiftCard, WeekSelector } from '../ui';

interface GeneralScheduleScreenProps {
  currentUserRole?: UserRole;
}

export const GeneralScheduleScreen: React.FC<GeneralScheduleScreenProps> = ({
  currentUserRole = "manager",
}) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const { weekDays, daysWithTasks, weekRange, isLoading } = useShifts(currentWeek);

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Header
        title="График команды"
        subtitle="Просмотр и управление предстоящими сменами команды."
      />

      <WeekSelector
        weekRange={weekRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        ) : daysWithTasks.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="На этой неделе нет запланированных смен."
          />
        ) : (
          <View>
            {daysWithTasks.map(({ date, dateKey, dayShifts }) => (
              <View key={dateKey} style={styles.daySection}>
                <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                {dayShifts.map((shift) => (
                  <ShiftCard key={shift._id} shift={shift} />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  dayHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
}); 