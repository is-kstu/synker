import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { AppView, UserRole } from '../../types';

interface NavButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onPress }) => {
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
};

interface NavigationBarProps {
  currentView: AppView;
  userRole: UserRole;
  onNavigate: (view: AppView) => void;
  style?: ViewStyle;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentView,
  userRole,
  onNavigate,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {userRole === "manager" && (
          <>
            <NavButton
              icon="people"
              label="Команда"
              isActive={currentView === "generalSchedule"}
              onPress={() => onNavigate("generalSchedule")}
            />
            <NavButton
              icon="add-circle"
              label="Добавить"
              isActive={currentView === "addShift"}
              onPress={() => onNavigate("addShift")}
            />
          </>
        )}
        <NavButton
          icon="person"
          label="Мой график"
          isActive={currentView === "mySchedule"}
          onPress={() => onNavigate("mySchedule")}
        />
        {userRole === "employee" && (
          <NavButton
            icon="people"
            label="Команда"
            isActive={currentView === "generalSchedule"}
            onPress={() => onNavigate("generalSchedule")}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  content: {
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
}); 