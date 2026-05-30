import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, Provider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onPrimary: "#ffffff",
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Provider theme={theme}>
          <SafeAreaProvider>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: {
                    backgroundColor: theme.colors.background,
                  },
                }}
              />
            </KeyboardAvoidingView>
          </SafeAreaProvider>
        </Provider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
