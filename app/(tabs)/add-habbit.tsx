import { useAuth } from "@/context/AuthContext";
import { createHabit } from "@/lib/actions/habits";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
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
        router.replace("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err?.message);
        return;
      }
      setError("Error creating the habbit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.headerSection}>
                  <Text style={styles.emoji}>✨</Text>

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
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  left={<TextInput.Icon icon="text" />}
                />

                <Text style={styles.frequencyLabel}>Frequency</Text>

                <View style={styles.segmentWrapper}>
                  <SegmentedButtons
                    value={frequency}
                    onValueChange={setFrequency}
                    buttons={FREQUENCIES.map((feq) => ({
                      value: feq,
                      label: feq.charAt(0).toUpperCase() + feq.slice(1),
                    }))}
                  />
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
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  wrapper: {
    justifyContent: "center",
  },

  card: {
    borderRadius: 28,
    backgroundColor: "#fff",
    paddingVertical: 8,
    elevation: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  emoji: {
    fontSize: 42,
    marginBottom: 10,
  },

  heading: {
    fontWeight: "700",
    color: "#111827",
  },

  subHeading: {
    marginTop: 6,
    color: "#6b7280",
    textAlign: "center",
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  inputOutline: {
    borderRadius: 16,
  },

  frequencyLabel: {
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },

  segmentWrapper: {
    marginBottom: 24,
  },

  error: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },

  button: {
    borderRadius: 16,
  },

  buttonContent: {
    paddingVertical: 10,
  },
});
