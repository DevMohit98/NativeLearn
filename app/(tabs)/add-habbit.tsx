import { useAuth } from "@/context/AuthContext";
import { createHabit } from "@/lib/actions/habits";
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
      }
    } catch (err) {
      console.log("Error adding habit", err);
      setError("Failed to create habit");
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
                <Text variant="headlineSmall" style={styles.heading}>
                  Add New Habit
                </Text>

                <TextInput
                  label="Title"
                  mode="outlined"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
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
                />

                <SegmentedButtons
                  value={frequency}
                  onValueChange={setFrequency}
                  buttons={FREQUENCIES.map((feq) => ({
                    value: feq,
                    label: feq.charAt(0).toUpperCase() + feq.slice(1),
                  }))}
                  style={styles.segment}
                />

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
                  {loading ? "Loading..." : "Add Habit"}
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
    backgroundColor: "#f4f6f8",
  },

  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#f4f6f8",
  },

  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f6f8",
  },

  card: {
    borderRadius: 24,
    paddingVertical: 10,
    elevation: 4,
  },

  heading: {
    marginBottom: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  input: {
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  inputOutline: {
    borderRadius: 14,
  },

  segment: {
    marginBottom: 24,
  },

  error: {
    marginBottom: 16,
    fontSize: 14,
  },

  button: {
    borderRadius: 14,
  },

  buttonContent: {
    paddingVertical: 8,
  },
});
