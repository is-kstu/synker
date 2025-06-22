import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';
import { AppView, User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>("login");
  const login = useMutation(api.users.loginUser);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const user = await login({ username, password });
      setCurrentUser(user as User);
      setCurrentView(user.role === "manager" ? "generalSchedule" : "mySchedule");
      return { success: true };
    } catch (err) {
      return { success: false, error: "Неверное имя пользователя или пароль." };
    }
  }, [login]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView("login");
  }, []);

  const navigateTo = useCallback((view: AppView) => {
    setCurrentView(view);
  }, []);

  return {
    currentUser,
    currentView,
    handleLogin,
    handleLogout,
    navigateTo,
    isAuthenticated: !!currentUser,
  };
}; 