import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoginFormData } from '../../types';
import { Button, Input } from '../ui';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await onLogin(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error || 'Произошла ошибка при входе.');
    }
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="business" 
          size={48} 
          color={colors.primary} 
          style={styles.headerIcon}
        />
        <Text style={styles.titleText}>WorkSync</Text>
        <Text style={styles.subtitleText}>Войдите в свой аккаунт</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Имя пользователя (manager/alice/bob)"
          value={formData.username}
          onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
          placeholder="manager"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Пароль (password123)"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          placeholder="password123"
          secureTextEntry
          error={error}
        />

        <Button
          title="Войти"
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitleText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
}); 