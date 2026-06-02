import { useAuth } from "@/context/AuthContext";
import {
  completeHabit,
  deleteHabit,
  fetchHabits,
  fetchTodayCompletion,
  updateHabit,
} from "@/lib/actions/habits";
import {
  client,
  DATABASE_ID,
  HABIT_COMPLETION_ID,
  HABITS_TABLE_ID,
} from "@/lib/appwrite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Avatar, Button, Card, Chip, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [habits, setHabits] = useState<any[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const isHabitCompleted = (id: string) => completedHabits.includes(id);

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

  const getTodayCompleted = async () => {
    try {
      const data = await fetchTodayCompletion({ userId: user?.$id ?? "" });
      const completions = data?.map((c) => c.habit_id);
      setCompletedHabits(completions);
    } catch (err) {
      console.log(err);
    }
  };

  const renderRightActions = (id: string) => (
    <View style={styles.swipeActionRight}>
      {isHabitCompleted(id) ? (
        <Text style={{ color: "#FFF" }} variant="headlineSmall">
          Completed!
        </Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color="#FFF"
        />
      )}
    </View>
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteHabit({ id });
      if (res) {
        console.log("Habit deleted");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons name="trash-can-outline" size={32} color="#FFF" />
    </View>
  );

  const handleComplete = async (id: string) => {
    if (!user?.$id || completedHabits?.includes(id)) return;

    try {
      const habit = habits.find((h) => h.$id === id);

      if (!habit) return;

      await completeHabit({
        id,
        userId: user.$id,
      });

      await updateHabit(id, {
        streak_count: habit.streak_count + 1,
        last_completed: new Date().toISOString(),
      });
    } catch (err) {
      console.log("Complete habit error:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const habitChannel = `databases.${DATABASE_ID}.tables.${HABITS_TABLE_ID}.rows`;
    const completionChannel = `databases.${DATABASE_ID}.tables.${HABIT_COMPLETION_ID}.rows`;

    const unsubscribe = client.subscribe(habitChannel, (res) => {
      if (res.events.some((event) => event.endsWith(".create"))) {
        getHabits();
      }

      if (res.events.some((event) => event.endsWith(".update"))) {
        getHabits();
      }

      if (res.events.some((event) => event.endsWith(".delete"))) {
        getHabits();
      }
    });

    const completionSubcribe = client.subscribe(completionChannel, (res) => {
      if (res.events.some((event) => event.endsWith(".create"))) {
        getTodayCompleted();
      }
    });

    getHabits();
    getTodayCompleted();

    return () => {
      unsubscribe();
      completionSubcribe();
    };
  }, [user]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "bottom", "right"]}>
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
        <ScrollView>
          <View style={styles.listContent}>
            {habits.map((item, index) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[item.$id] = ref;
                }}
                key={index}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={() => renderRightActions(item.$id)}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    handleDelete(item.$id);
                  } else if (direction === "right") {
                    handleComplete(item.$id);
                  }
                  swipeableRefs.current[item.$id]?.close();
                }}>
                <Card
                  style={[
                    styles.card,
                    isHabitCompleted(item.$id) && styles.cardCompletedStyle,
                  ]}>
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
              </Swipeable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 16,
    marginBottom: 12,
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
    // Use only elevation on Android; shadow props on iOS
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardCompletedStyle: {
    backgroundColor: "#F3F4F6", // grey out the background
    ...Platform.select({
      ios: {
        shadowOpacity: 0.03, // fade the shadow on iOS
      },
      android: {
        elevation: 0, // remove shadow on Android
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    // Replace gap with marginRight on the icon for compatibility
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14, // replaces gap: 14
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#fff7ed",
  },

  streakText: {
    fontWeight: "600",
    color: "#ff9800",
    marginLeft: 6, // replaces gap: 6
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

  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 24, // match card radius
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },

  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 24, // match card radius
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
