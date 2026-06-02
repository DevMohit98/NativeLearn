import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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

    // Validate before showing loading state
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
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
    setEmail("");
    setPassword("");
    setError(null); // clear error when switching modes
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
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
              theme={{ roundness: 12 }}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              label="Password"
              autoCapitalize="none"
              secureTextEntry
              placeholder="••••••••"
              mode="outlined"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#6200ee"
              theme={{ roundness: 12 }}
              onChangeText={setPassword}
              value={password}
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  container: {
    padding: 24,
    paddingBottom: Platform.OS === "android" ? 32 : 24,
  },

  heading: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 28,
    letterSpacing: 0.5,
  },

  input: {
    marginBottom: 12, // replaces gap: 12
    backgroundColor: "white",
  },

  errorText: {
    marginBottom: 8,
    fontSize: 14,
    textAlign: "center",
  },

  primaryButton: {
    marginTop: 10,
    marginBottom: 8, // replaces gap
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
