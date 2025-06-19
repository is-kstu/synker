import { borderRadius, colors, spacing, typography } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useMutation(api.users.loginUser);

  const handleSubmit = async () => {
    try {
      const user = await login({ username, password });
      onLogin(user);
    } catch (err) {
      setError("Неверное имя пользователя или пароль.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="business"
          size={48}
          color={colors.primary}
          style={{ marginBottom: spacing.md }}
        />
        <Text
          className="text-xl font-bold text-blue-500"
          // style={styles.titleText}
        >
          WorkSync
        </Text>
        <Text style={styles.subtitleText}>Войдите в свой аккаунт</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Имя пользователя</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="manager_alice"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Пароль</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type Styles = {
  container: ViewStyle;
  header: ViewStyle;
  form: ViewStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  button: ViewStyle;
  titleText: TextStyle;
  subtitleText: TextStyle;
  labelText: TextStyle;
  errorText: TextStyle;
  buttonText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
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
  labelText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: "center",
  },
});
