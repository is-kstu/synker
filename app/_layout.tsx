import { convex } from "@/lib/convex";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexProvider } from "convex/react";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "./global.css";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide the splash screen after the assets have been loaded and the navigation is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <ConvexProvider client={convex}>
      <NavigationContainer>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === "dark" ? "#18181b" : "#ffffff",
              },
            }}
          />
        </ThemeProvider>
      </NavigationContainer>
    </ConvexProvider>
  );
}
