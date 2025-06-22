import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name={leftIcon} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: 9999,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
}); 