import { colors, spacing, typography } from '@/constants/theme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEmployeeShifts } from '../../hooks/useShifts';
import { User, WeekDay } from '../../types';
import { formatDate, getWeekRange } from '../../utils/dateUtils';
import { EmptyState, Header, ShiftCard, WeekSelector } from '../ui';

interface MyScheduleScreenProps {
  currentUser: User;
}

export const MyScheduleScreen: React.FC<MyScheduleScreenProps> = ({ currentUser }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const weekRange = getWeekRange(currentWeek);
  const { groupedShifts, isLoading } = useEmployeeShifts(currentUser.id);

  const weekDays: WeekDay[] = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekRange.start);
      date.setDate(weekRange.start.getDate() + i);
      const dateKey = date.toDateString();
      const dayShifts = groupedShifts[dateKey] || [];
      return { date, dateKey, dayShifts };
    });
  }, [groupedShifts, weekRange]);

  const daysWithTasks = weekDays.filter(({ dayShifts }) => dayShifts.length > 0);

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Мой график"
        subtitle={currentUser.name}
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
            title="У вас нет смен на этой неделе."
          />
        ) : (
          <View>
            {daysWithTasks.map(({ date, dateKey, dayShifts }) => (
              <View key={dateKey} style={styles.daySection}>
                <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                {dayShifts.map(shift => (
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