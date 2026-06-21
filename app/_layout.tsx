import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, Provider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true,
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onPrimary: "#ffffff",
  },
};

function RootNavigator() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hide();
    }
  }, [loading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "android" ? "fade" : "slide_from_right",
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Provider theme={theme}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <RootNavigator />
            </KeyboardAvoidingView>
          </Provider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
