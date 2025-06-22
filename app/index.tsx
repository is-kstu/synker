import { colors, typography } from '@/constants/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import {
  AddShiftScreen,
  GeneralScheduleScreen,
  LoginScreen,
  MyScheduleScreen
} from './components/screens';
import { Header, NavigationBar, UnauthorizedScreen } from './components/ui';
import { APP_NAME } from './constants/app';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { currentUser, currentView, handleLogin, handleLogout, navigateTo, isAuthenticated } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "generalSchedule":
        if (!currentUser) return <UnauthorizedScreen />;
        return (
          <GeneralScheduleScreen
            currentUserRole={currentUser.role}
          />
        );
      case "mySchedule":
        if (!currentUser) return <UnauthorizedScreen />;
        return <MyScheduleScreen currentUser={currentUser} />;
      case "addShift":
        if (currentUser?.role !== "manager") return <UnauthorizedScreen />;
        return <AddShiftScreen />;
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

      {/* App Header */}
      <Header
        title={APP_NAME}
        leftIcon="business"
        rightIcon={isAuthenticated ? "log-out-outline" : undefined}
        onRightPress={isAuthenticated ? handleLogout : undefined}
        titleStyle={styles.headerTitle}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {renderView()}
      </View>

      {/* Navigation Bar */}
      {isAuthenticated && currentUser && (
        <NavigationBar
          currentView={currentView}
          userRole={currentUser.role}
          onNavigate={navigateTo}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
