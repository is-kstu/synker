import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { DailySchedule } from '@/lib/mock-data';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AddShiftScreenProps {
  dailySchedules: DailySchedule[];
}

export function AddShiftScreen({ dailySchedules }: AddShiftScreenProps) {
  const employees = useQuery(api.users.getUsers, { role: "employee" }) || [];
  const createShift = useMutation(api.shifts.createShift);
  const [employeeId, setEmployeeId] = useState<Id<"users"> | "">("");
  const [day, setDay] = useState(dailySchedules[0]?.day || "");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [task, setTask] = useState("");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleStartTimeChange = (_: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartTime(selectedDate.toLocaleTimeString().slice(0, 5));
    }
  };

  const handleEndTimeChange = (_: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndTime(selectedDate.toLocaleTimeString().slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!employeeId || !day || !task) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      await createShift({
        employeeId,
        day,
        startTime,
        endTime,
        task,
      });
      
      // Clear form
      setEmployeeId("");
      setDay(dailySchedules[0]?.day || "");
      setStartTime("09:00");
      setEndTime("17:00");
      setTask("");
      
      alert("Смена успешно добавлена!");
    } catch (err) {
      alert("Ошибка при добавлении смены. Пожалуйста, попробуйте снова.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-900 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-slate-100">
          Новая смена
        </Text>
      </View>

      <View className="space-y-6">
        <View>
          <Text className="font-medium text-slate-300 mb-2">
            Сотрудник
          </Text>
          <View className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <Picker
              selectedValue={employeeId}
              onValueChange={(value) => setEmployeeId(value as Id<"users"> | "")}
              dropdownIconColor="#94a3b8"
              style={{ color: '#f1f5f9' }}
            >
              <Picker.Item label="Выберите сотрудника" value="" />
              {employees.map(emp => (
                <Picker.Item
                  key={emp.id}
                  label={emp.name}
                  value={emp.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View>
          <Text className="font-medium text-slate-300 mb-2">
            День
          </Text>
          <View className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <Picker
              selectedValue={day}
              onValueChange={setDay}
              dropdownIconColor="#94a3b8"
              style={{ color: '#f1f5f9' }}
            >
              <Picker.Item label="Выберите день" value="" />
              {dailySchedules.map(schedule => (
                <Picker.Item
                  key={schedule.day}
                  label={schedule.day}
                  value={schedule.day}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View className="flex-row space-x-4">
          <View className="flex-1">
            <Text className="font-medium text-slate-300 mb-2">
              Начало
            </Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
            >
              <Text className="text-slate-100">{startTime}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={new Date(`2024-01-01T${startTime}`)}
                mode="time"
                is24Hour={true}
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View className="flex-1">
            <Text className="font-medium text-slate-300 mb-2">
              Конец
            </Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3"
            >
              <Text className="text-slate-100">{endTime}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={new Date(`2024-01-01T${endTime}`)}
                mode="time"
                is24Hour={true}
                onChange={handleEndTimeChange}
              />
            )}
          </View>
        </View>

        <View>
          <Text className="font-medium text-slate-300 mb-2">
            Задача
          </Text>
          <TextInput
            value={task}
            onChangeText={setTask}
            placeholder="Например, Встреча с клиентом"
            placeholderTextColor="#64748b"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 py-3 rounded-lg mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold text-white text-center">
            Добавить смену
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 