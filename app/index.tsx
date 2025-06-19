import { colors, spacing, typography } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AddShiftScreen } from './components/AddShiftScreen';
import { GeneralScheduleScreen } from './components/GeneralScheduleScreen';
import { LoginScreen } from './components/LoginScreen';
import { MyScheduleScreen } from './components/MyScheduleScreen';

type AppView = "login" | "generalSchedule" | "mySchedule" | "addShift";

const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("login");
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  
  const dailySchedules = DAYS.map(day => {
    const shifts = useQuery(api.shifts.getShiftsByDay, { day }) || [];
    return {
      day,
      shifts,
    };
  });

  const handleLogin = useCallback((user: any) => {
    setLoggedInUser(user);
    setCurrentView(user.role === "manager" ? "generalSchedule" : "mySchedule");
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setCurrentView("login");
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "generalSchedule":
        if (!loggedInUser) return <UnauthorizedScreen />;
        return (
          <GeneralScheduleScreen
            dailySchedules={dailySchedules}
            currentUserRole={loggedInUser.role}
          />
        );
      case "mySchedule":
        if (!loggedInUser) return <UnauthorizedScreen />;
        return <MyScheduleScreen currentUser={loggedInUser} />;
      case "addShift":
        if (loggedInUser?.role !== "manager") return <UnauthorizedScreen />;
        return <AddShiftScreen dailySchedules={DAYS.map(day => ({ day, shifts: [] }))} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <Text style={styles.headerTitleText}>WorkSync</Text>
        </View>
        {loggedInUser && (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderView()}
      </View>

      {/* Navigation Bar */}
      {loggedInUser && (
        <View style={styles.navbar}>
          <View style={styles.navbarContent}>
            {loggedInUser.role === "manager" && (
              <>
                <NavButton
                  icon="people"
                  label="Команда"
                  isActive={currentView === "generalSchedule"}
                  onPress={() => setCurrentView("generalSchedule")}
                />
                <NavButton
                  icon="add-circle"
                  label="Добавить"
                  isActive={currentView === "addShift"}
                  onPress={() => setCurrentView("addShift")}
                />
              </>
            )}
            <NavButton
              icon="person"
              label="Мой график"
              isActive={currentView === "mySchedule"}
              onPress={() => setCurrentView("mySchedule")}
            />
            {loggedInUser.role === "employee" && (
              <NavButton
                icon="people"
                label="Команда"
                isActive={currentView === "generalSchedule"}
                onPress={() => setCurrentView("generalSchedule")}
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function NavButton({ icon, label, isActive, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.navButton, isActive && styles.navButtonActive]}
      activeOpacity={0.7}
    >
      <View style={styles.navIcon}>
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? colors.primary : colors.text.secondary}
        />
      </View>
      <Text style={[styles.navLabelText, isActive && styles.navLabelActiveText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function UnauthorizedScreen() {
  return (
    <View style={styles.unauthorized}>
      <View style={styles.unauthorizedIcon}>
        <Ionicons 
          name="shield-outline" 
          size={64} 
          color={colors.error} 
        />
      </View>
      <Text style={styles.unauthorizedTitleText}>Доступ запрещен</Text>
      <Text style={styles.unauthorizedDescText}>У вас нет необходимых прав для этого раздела.</Text>
    </View>
  );
}

type Styles = {
  container: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  headerIcon: ViewStyle;
  headerTitleText: TextStyle;
  logoutButton: ViewStyle;
  content: ViewStyle;
  navbar: ViewStyle;
  navbarContent: ViewStyle;
  navButton: ViewStyle;
  navButtonActive: ViewStyle;
  navIcon: ViewStyle;
  navLabelText: TextStyle;
  navLabelActiveText: TextStyle;
  unauthorized: ViewStyle;
  unauthorizedIcon: ViewStyle;
  unauthorizedTitleText: TextStyle;
  unauthorizedDescText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  headerTitleText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  logoutButton: {
    padding: spacing.sm,
    borderRadius: 9999,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navbar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  navbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: spacing.xl,
    opacity: 0.6,
  },
  navButtonActive: {
    opacity: 1,
  },
  navIcon: {
    marginBottom: spacing.xs,
  },
  navLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  navLabelActiveText: {
    color: colors.primary,
  },
  unauthorized: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  unauthorizedIcon: {
    opacity: 0.8,
    marginBottom: spacing.xl,
  },
  unauthorizedTitleText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  unauthorizedDescText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
}); 