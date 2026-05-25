import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
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
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </Provider>
    </AuthProvider>
  );
}
