import { colors, typography } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { LinearGradient } from 'expo-linear-gradient'

import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

interface MyScheduleScreenProps {
  currentUser: {
    id: Id<'users'>
    name: string
    avatarUrl: string
  }
}

const getWeekRange = (weekOffset: number = 0) => {
  const today = new Date()
  const currentDay = today.getDay()
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay

  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return {
    start: monday,
    end: sunday,
    startFormatted: `${monday.getDate().toString().padStart(2, '0')} ${getMonthName(monday.getMonth())}`,
    endFormatted: `${sunday.getDate().toString().padStart(2, '0')} ${getMonthName(sunday.getMonth())}`,
    dateRange: `${monday.getFullYear()}-${(monday.getMonth() + 1).toString().padStart(2, '0')}-${monday.getDate().toString().padStart(2, '0')} - ${sunday.getFullYear()}-${(sunday.getMonth() + 1).toString().padStart(2, '0')}-${sunday.getDate().toString().padStart(2, '0')}`,
  }
}

const getMonthName = (month: number) => {
  const months = [
    'янв.',
    'фев.',
    'мар.',
    'апр.',
    'май',
    'июн.',
    'июл.',
    'авг.',
    'сен.',
    'окт.',
    'ноя.',
    'дек.',
  ]
  return months[month]
}
const getDayName = (date: Date) => {
  const days = [
    'воскресенье',
    'понедельник',
    'вторник',
    'среда',
    'четверг',
    'пятница',
    'суббота',
  ]
  return days[date.getDay()]
}
const formatDate = (date: Date) => {
  return `${getDayName(date)}, ${date.getDate()} ${getMonthName(date.getMonth()).replace('.', '')}`
}

export function MyScheduleScreen({ currentUser }: MyScheduleScreenProps) {
  const [currentWeek, setCurrentWeek] = useState(0)
  const weekRange = getWeekRange(currentWeek)

  const shifts = useQuery(api.shifts.getShiftsByEmployee, {
    employeeId: currentUser.id,
  })
  const groupedShifts = React.useMemo(() => {
    if (!shifts) return {}

    const grouped: { [key: string]: any[] } = {}
    shifts.forEach(shift => {
      const [day, month, year] = shift.day.split('.')
      const shiftDate = new Date(+year, +month - 1, +day)

      const dateKey = shiftDate.toDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(shift)
    })
    return grouped
  }, [shifts])

  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekRange.start)
      date.setDate(weekRange.start.getDate() + i)
      const dateKey = date.toDateString()
      const dayShifts = groupedShifts[dateKey] || []
      return { date, dateKey, dayShifts }
    })
  }, [groupedShifts, weekRange])

  const daysWithTasks = weekDays.filter(({ dayShifts }) => dayShifts.length > 0)

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev - 1)
  }

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev + 1)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Мой график</Text>
          <Text style={styles.headerSubtitle}>{currentUser.name}</Text>
        </View>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.weekArrow}>
          <Ionicons name='chevron-back' size={14} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>
            {weekRange.startFormatted} - {weekRange.endFormatted}
          </Text>
          <Text style={styles.weekSubtitle}>{weekRange.dateRange}</Text>
        </View>

        <TouchableOpacity onPress={goToNextWeek} style={styles.weekArrow}>
          <Ionicons
            name='chevron-forward'
            size={14}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Schedule Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!shifts ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        ) : daysWithTasks.length === 0 ? (
          // Пустая неделя
          <View>
            <View style={styles.emptyWeekCard}>
              <Ionicons
                name='calendar-outline'
                size={48}
                color={colors.text.secondary}
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyWeekText}>
                У вас нет смен на этой неделе.
              </Text>
            </View>
          </View>
        ) : (
          // Обычный рендер дней с задачами
          <View>
            {daysWithTasks.map(({ date, dateKey, dayShifts }) => (
              <View key={dateKey} style={styles.daySection}>
                <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                {dayShifts.map(shift => (
                  <LinearGradient
                    colors={['#1f2230', '#2c2f44']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={styles.shiftCard}
                    key={shift.id}
                  >
                    <Text style={styles.shiftTitle}>{shift.task}</Text>
                    <View style={styles.timeContainer}>
                      <Ionicons
                        name='time-outline'
                        size={16}
                        color={colors.text.accent}
                      />
                      <Text style={styles.timeText}>
                        {shift.startTime} — {shift.endTime}
                      </Text>
                    </View>
                  </LinearGradient>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

type Styles = {
  container: ViewStyle
  emptyWeekCard: ViewStyle
  emptyWeekText: TextStyle
  header: ViewStyle
  headerContent: ViewStyle
  headerTitle: TextStyle
  headerSubtitle: TextStyle
  weekSelector: ViewStyle
  weekArrow: ViewStyle
  weekInfo: ViewStyle
  weekTitle: TextStyle
  weekSubtitle: TextStyle
  scrollContainer: ViewStyle
  loadingContainer: ViewStyle
  loadingText: TextStyle
  daySection: ViewStyle
  dayHeader: TextStyle
  shiftCard: ViewStyle
  shiftTitle: TextStyle
  timeContainer: ViewStyle
  timeText: TextStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },
  header: {
    padding: 12,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  weekArrow: {
    padding: 8,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.accent,
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  daySection: {
    marginBottom: 13,
  },
  dayHeader: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginBottom: 12,
    textTransform: 'lowercase',
  },

  shiftCard: {
    borderColor: colors.text.accent,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  shiftTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.accent,
    fontWeight: typography.weights.regular,
  },

  emptyWeekCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyWeekText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
