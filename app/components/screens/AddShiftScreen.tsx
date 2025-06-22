import { colors, spacing, typography } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from 'convex/react';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_SHIFT_TIMES } from '../../constants/app';
import { useShiftMutations } from '../../hooks/useShifts';
import { ShiftFormData, SubmissionStatus } from '../../types';
import { formatDateInput, formatTimeInput, getTodayDateString } from '../../utils/dateUtils';
import { Button, Header, Input, StatusMessage } from '../ui';

export const AddShiftScreen: React.FC = () => {
  const employees = useQuery(api.users.getUsers) || [];
  const { createShift } = useShiftMutations();

  const [formData, setFormData] = useState<ShiftFormData>({
    employeeId: '',
    day: getTodayDateString(),
    startTime: DEFAULT_SHIFT_TIMES.start,
    endTime: DEFAULT_SHIFT_TIMES.end,
    task: '',
  });
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.task || !formData.day || !formData.startTime || !formData.endTime) {
      setSubmissionStatus('error');
      setSubmissionMessage('Пожалуйста, заполните все обязательные поля.');
      setTimeout(() => setSubmissionStatus('idle'), 5000);
      return;
    }

    try {
      await createShift({
        employeeId: formData.employeeId as Id<'users'>,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        task: formData.task,
      });
      
      // Reset form
      setFormData({
        employeeId: '',
        day: getTodayDateString(),
        startTime: DEFAULT_SHIFT_TIMES.start,
        endTime: DEFAULT_SHIFT_TIMES.end,
        task: '',
      });
      
      setSubmissionStatus('success');
      setSubmissionMessage('Смена успешно добавлена!');
      setTimeout(() => setSubmissionStatus('idle'), 5000);
    } catch {
      setSubmissionStatus('error');
      setSubmissionMessage('Ошибка при добавлении смены. Пожалуйста, попробуйте снова.');
      setTimeout(() => setSubmissionStatus('idle'), 5000);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Header title="Новая смена" />

      {/* Employee Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Сотрудник</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.employeeId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value as Id<'users'> | '' }))}
            dropdownIconColor={colors.text.secondary}
            style={styles.picker}
          >
            <Picker.Item label="Выберите сотрудника" value="" />
            {employees.map((employee: { id: Id<'users'>; name: string }) => (
              <Picker.Item key={employee.id} label={employee.name} value={employee.id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Input
          label="Дата"
          value={formData.day}
          onChangeText={(text) => setFormData(prev => ({ ...prev, day: formatDateInput(text) }))}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          keyboardType="numeric"
        />
      </View>

      {/* Time */}
      <View style={styles.timeSection}>
        <View style={styles.timeInput}>
          <Input
            label="Начало"
            value={formData.startTime}
            onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: formatTimeInput(text) }))}
            placeholder="HH:MM"
            maxLength={5}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.timeInput}>
          <Input
            label="Конец"
            value={formData.endTime}
            onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: formatTimeInput(text) }))}
            placeholder="HH:MM"
            maxLength={5}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Task */}
      <View style={styles.section}>
        <Input
          label="Задача"
          value={formData.task}
          onChangeText={(text) => setFormData(prev => ({ ...prev, task: text }))}
          placeholder="Например, Встреча с клиентом"
          multiline
        />
      </View>

      <Button
        title="Добавить смену"
        onPress={handleSubmit}
        style={styles.button}
      />

      <StatusMessage
        status={submissionStatus}
        message={submissionMessage}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  timeSection: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    justifyContent: 'center',
    height: 50,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text.primary,
    backgroundColor: colors.backgroundLight,
    height: 50,
  },
  button: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
}); 