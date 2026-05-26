import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { MD3LightTheme, Provider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onPrimary: "#ffffff", // button text color
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Provider theme={theme}>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Stack screenOptions={{ headerShown: false }} />
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </Provider>
    </AuthProvider>
  );
}
