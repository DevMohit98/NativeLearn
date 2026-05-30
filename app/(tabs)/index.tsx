import { useAuth } from "@/context/AuthContext";
import { fetchHabits } from "@/lib/actions/habits";
import { client, DATABASE_ID, HABITS_TABLE_ID } from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Chip, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [habits, setHabits] = useState<any[]>([]);

  const handleLogout = async () => {
    logout();
    router.replace("/login");
  };

  const getHabits = async () => {
    try {
      const data = await fetchHabits({
        userId: user?.$id ?? "",
      });

      setHabits(data as []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channel = `databases.${DATABASE_ID}.tables.${HABITS_TABLE_ID}.rows`;

    const unsubscribe = client.subscribe(channel, () => {
      getHabits();
    });

    getHabits();

    return () => unsubscribe();
  }, [user]);

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.heading}>
            Today's Habits
          </Text>

          <Text variant="bodyMedium" style={styles.subHeading}>
            Stay consistent every day ✨
          </Text>
        </View>

        <Button mode="text" icon="logout" onPress={handleLogout}>
          Logout
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={80}
              color="#b0b0b0"
            />

            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No Habits Yet
            </Text>

            <Text style={styles.emptyText}>
              Start building your routine by adding a habit.
            </Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {habits.map((item, index) => (
              <Card style={styles.card} key={index}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Avatar.Icon size={48} icon="check-circle-outline" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={styles.title}>
                        {item.title}
                      </Text>

                      <Text variant="bodyMedium" style={styles.description}>
                        {item.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bottomRow}>
                    <Surface style={styles.streakBox} elevation={1}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color="#ff9800"
                      />

                      <Text style={styles.streakText}>
                        {item.streak_count} day streak
                      </Text>
                    </Surface>

                    <Chip compact mode="flat">
                      {item.frequency.charAt(0).toUpperCase() +
                        item.frequency.slice(1)}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    marginTop: 0,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 20,
    padding: 0,
  },

  heading: {
    fontWeight: "700",
    color: "#111827",
  },

  subHeading: {
    color: "#6b7280",
    marginTop: 4,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    marginBottom: 18,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },

  description: {
    color: "#6b7280",
    lineHeight: 22,
  },

  bottomRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  streakBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#fff7ed",
  },

  streakText: {
    fontWeight: "600",
    color: "#ff9800",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 18,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 22,
  },
});
