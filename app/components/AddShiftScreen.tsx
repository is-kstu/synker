import { colors, typography } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { useMutation, useQuery } from 'convex/react'
import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

type Styles = {
  employeePicker: TextStyle
  container: ViewStyle
  header: ViewStyle
  headerContent: ViewStyle
  headerTitle: TextStyle
  scrollContainer: ViewStyle
  section: ViewStyle
  sectionHeader: TextStyle
  shiftCard: ViewStyle
  shiftTitle: TextStyle
  timeContainer: ViewStyle
  button: ViewStyle
  buttonText: TextStyle
}

const styles = StyleSheet.create<Styles>({
  employeePicker: {
    color: colors.text.primary,
    backgroundColor: colors.backgroundLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  shiftCard: {
    backgroundColor: colors.backgroundLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shiftTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
})

export function AddShiftScreen() {
  const employees = useQuery(api.users.getUsers, { role: 'employee' }) || []
  const createShift = useMutation(api.shifts.createShift)

  const [employeeId, setEmployeeId] = useState<Id<'users'> | ''>('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [task, setTask] = useState('')
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  // Форматируем дату в строку dd.mm.yyyy
  const formatDay = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false)
    if (selected) setSelectedDate(selected)
  }

  const handleStartTimeChange = (_: any, date?: Date) => {
    setShowStartTimePicker(false)
    if (date) setStartTime(date.toLocaleTimeString().slice(0, 5))
  }
  const handleEndTimeChange = (_: any, date?: Date) => {
    setShowEndTimePicker(false)
    if (date) setEndTime(date.toLocaleTimeString().slice(0, 5))
  }

  const handleSubmit = async () => {
    if (!employeeId || !task) {
      alert('Пожалуйста, заполните все обязательные поля.')
      return
    }
    const day = formatDay(selectedDate)
    try {
      await createShift({ employeeId, day, startTime, endTime, task })
      // Сброс полей
      setEmployeeId('')
      setSelectedDate(new Date())
      setStartTime('09:00')
      setEndTime('17:00')
      setTask('')
      alert('Смена успешно добавлена!')
    } catch {
      alert('Ошибка при добавлении смены. Пожалуйста, попробуйте снова.')
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Новая смена</Text>
        </View>
      </View>

      {/* Сотрудник */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Сотрудник</Text>
        <View>
          <Picker
            selectedValue={employeeId}
            onValueChange={v => setEmployeeId(v as Id<'users'>)}
            dropdownIconColor='#64748b'
            style={styles.employeePicker}
          >
            <Picker.Item label='Выберите сотрудника' value='' />
            {employees.map(e => (
              <Picker.Item key={e.id} label={e.name} value={e.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Дата */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Дата</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.shiftCard}
        >
          <Text style={styles.shiftTitle}>{formatDay(selectedDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode='date'
            display='default'
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Время */}
      <View style={[styles.section, styles.timeContainer]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.sectionHeader}>Начало</Text>
          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.shiftTitle}>{startTime}</Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={new Date(`2024-01-01T${startTime}`)}
              mode='time'
              is24Hour
              onChange={handleStartTimeChange}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.sectionHeader}>Конец</Text>
          <TouchableOpacity
            style={styles.shiftCard}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.shiftTitle}>{endTime}</Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={new Date(`2024-01-01T${endTime}`)}
              mode='time'
              is24Hour
              onChange={handleEndTimeChange}
            />
          )}
        </View>
      </View>

      {/* Задача */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Задача</Text>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder='Например, Встреча с клиентом'
          placeholderTextColor='#64748b'
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 14,
            color: colors.text.primary,
            backgroundColor: colors.backgroundLight,
          }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Добавить смену</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
