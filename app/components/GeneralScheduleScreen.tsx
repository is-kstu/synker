import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useQuery } from 'convex/react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

interface GeneralScheduleScreenProps {
  currentUserRole: 'manager' | 'employee';
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

function DaySchedule({ day, currentUserRole }: {
  day: string;
  currentUserRole: 'manager' | 'employee';
}) {
  const shifts = useQuery(api.shifts.getShiftsByDay, { day }) || [];
  const employees = useQuery(api.users.getUsers, {}) || [];

  const getEmployeeById = (employeeId: Id<"users">) => {
    return employees.find(employee => employee.id === employeeId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181b' }}>
      {shifts.map((shift) => {
        const employee = getEmployeeById(shift.employeeId);
        if (!employee) return null;
        
        return (
          <View key={shift.id} style={{
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

export function GeneralScheduleScreen({ currentUserRole }: GeneralScheduleScreenProps) {
  const days = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье"
  ];

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
        {days.map((day) => (
          <Tab.Screen
            key={day}
            name={day}
            options={{ 
              title: dayNameToShort[day],
              tabBarLabel: dayNameToShort[day]
            }}
          >
            {() => (
              <DaySchedule
                day={day}
                currentUserRole={currentUserRole}
              />
            )}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </SafeAreaView>
  );
} 