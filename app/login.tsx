import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LoginScreen() {
  const theme = useTheme();
  const { signin, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      const result = isSignUp
        ? await signup(email, password)
        : await signin(email, password);

      if (result) {
        setError(result);
        return;
      }

      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.heading}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <TextInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6200ee"
            theme={{
              roundness: 12,
            }}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            label="Password"
            autoCapitalize="none"
            secureTextEntry
            placeholder="example@gmail.com"
            mode="outlined"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#6200ee"
            theme={{
              roundness: 12,
            }}
            onChangeText={setPassword}
            value={password}
          />
          {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
          <Button
            mode="contained"
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryLabel}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
          </Button>
          <Button
            mode="text"
            labelStyle={styles.textLabel}
            onPress={handleSwitch}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  input: {
    marginBottom: 5,
    backgroundColor: "white",
  },
  heading: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 12,
  },

  buttonContent: {
    paddingVertical: 6,
  },

  primaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  textLabel: {
    fontSize: 14,
    color: "#6200ee",
    fontWeight: "500",
  },
});
