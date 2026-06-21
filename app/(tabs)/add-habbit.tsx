import { useAuth } from "@/context/AuthContext";
import { createHabit } from "@/lib/actions/habits";
import { APP_COLORS } from "@/lib/constant";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const FREQUENCIES = ["daily", "weekly", "monthly"];

export default function AddHabbit() {
  const user = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!user) return;
    if (!title || !description) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const res = await createHabit({
        title,
        description,
        frequency,
        userId: user.user?.$id ?? null,
      });
      if (res) {
        setTitle("");
        setDescription("");
        setFrequency("daily");
        router.replace("/(tabs)");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err?.message);
        return;
      }
      setError("Error creating the habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.headerSection}>
              <Text variant="headlineSmall" style={styles.heading}>
                Create New Habit
              </Text>
              <Text style={styles.subHeading}>
                Build consistency one day at a time
              </Text>
            </View>

            <TextInput
              label="Habit Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="notebook-outline" />}
            />

            <TextInput
              label="Description"
              mode="outlined"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multilineInput]}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="text" />}
            />

            <Text style={styles.frequencyLabel}>Frequency</Text>

            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((feq) => (
                <TouchableOpacity
                  key={feq}
                  style={[
                    styles.frequencyBtn,
                    frequency === feq && styles.frequencyBtnActive,
                  ]}
                  onPress={() => setFrequency(feq)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.frequencyBtnText,
                      frequency === feq && styles.frequencyBtnTextActive,
                    ]}>
                    {feq.charAt(0).toUpperCase() + feq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <Button
              mode="contained"
              style={styles.button}
              contentStyle={styles.buttonContent}
              disabled={!title || !description || loading}
              onPress={handleSubmit}>
              {loading ? "Creating..." : "Add Habit"}
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
    backgroundColor: APP_COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: Platform.OS === "android" ? 80 : 120,
  },

  formContainer: {
    backgroundColor: APP_COLORS.card,
    borderRadius: 32,
    padding: 24,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 24,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },

  heading: {
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  subHeading: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#FAFBFC",
  },

  multilineInput: {
    minHeight: Platform.OS === "android" ? 100 : 120,
  },

  inputOutline: {
    borderRadius: 18,
    borderWidth: 1.5,
  },

  frequencyLabel: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 12,
    color: "#374151",
  },

  frequencyRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },

  frequencyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  frequencyBtnActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  frequencyBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },

  frequencyBtnTextActive: {
    color: "#6200ee",
    fontWeight: "700",
  },

  error: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },

  button: {
    borderRadius: 18,
    marginTop: 8,
  },

  buttonContent: {
    height: 56,
  },
});
