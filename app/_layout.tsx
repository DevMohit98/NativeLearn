import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { MD3LightTheme, Provider } from "react-native-paper";
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onPrimary: "#ffffff", // button text color
  },
};

export default function RootLayout() {
  return (
    <Provider theme={theme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </Provider>
  );
}
