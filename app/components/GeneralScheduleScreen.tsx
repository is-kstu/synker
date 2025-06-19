import { api } from '@/convex/_generated/api';
import type { DailySchedule, Employee } from '@/lib/mock-data';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useQuery } from 'convex/react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

interface GeneralScheduleScreenProps {
  dailySchedules: DailySchedule[];
  currentUserRole: Employee['role'];
}

const dayNameToShort: Record<string, string> = {
  "Понедельник": "Пн",
  "Вторник": "Вт",
  "Среда": "Ср",
  "Четверг": "Чт",
  "Пятница": "Пт",
  "Суббота": "Сб",
  "Воскресенье": "Вс",
};

function DaySchedule({ schedule, currentUserRole }: {
  schedule: DailySchedule;
  currentUserRole: Employee['role'];
}) {
  const employees = useQuery(api.users.getUsers, {}) || [];

  const getEmployeeById = (employeeId: string) => {
    return employees.find(employee => employee.id === employeeId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181b' }}>
      {schedule.shifts.map((shift, index) => {
        const employee = getEmployeeById(shift.employeeId);
        if (!employee) return null;
        
        return (
          <View key={index} style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#27272a',
          }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '500', marginBottom: 4 }}>
              {employee.name}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              {shift.startTime} - {shift.endTime}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function GeneralScheduleScreen({ dailySchedules, currentUserRole }: GeneralScheduleScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181b' }} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#18181b' },
          tabBarIndicatorStyle: { backgroundColor: '#3b82f6' },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarItemStyle: { width: 'auto' },
          tabBarScrollEnabled: true,
        }}
      >
        {dailySchedules.map((schedule) => (
          <Tab.Screen
            key={schedule.day}
            name={schedule.day}
            options={{ 
              title: dayNameToShort[schedule.day],
              tabBarLabel: dayNameToShort[schedule.day]
            }}
          >
            {() => (
              <DaySchedule
                schedule={schedule}
                currentUserRole={currentUserRole}
              />
            )}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </SafeAreaView>
  );
} 