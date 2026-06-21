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
import { APP_COLORS } from "@/lib/constant";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
        setHabits((prev) => prev.filter((h) => h.$id !== id));
        setCompletedHabits((prev) => prev.filter((habitId) => habitId !== id));
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

      const now = new Date().toISOString();

      await updateHabit(id, {
        streak_count: habit.streak_count + 1,
        last_completed: now,
      });

      setCompletedHabits((prev) => [...prev, id]);
      setHabits((prev) =>
        prev.map((h) =>
          h.$id === id
            ? { ...h, streak_count: h.streak_count + 1, last_completed: now }
            : h,
        ),
      );
    } catch (err) {
      console.log("Complete habit error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user?.$id) return;
      getHabits();
      getTodayCompleted();
    }, [user?.$id]),
  );

  useEffect(() => {
    if (!user) return;

    const habitChannel = `databases.${DATABASE_ID}.tables.${HABITS_TABLE_ID}.rows`;
    const completionChannel = `databases.${DATABASE_ID}.tables.${HABIT_COMPLETION_ID}.rows`;

    const unsubscribe = client.subscribe(habitChannel, (res) => {
      if (
        res.events.some(
          (event) =>
            event.endsWith(".create") ||
            event.endsWith(".update") ||
            event.endsWith(".delete"),
        )
      ) {
        getHabits();
      }
    });

    const completionSubscribe = client.subscribe(completionChannel, (res) => {
      if (res.events.some((event) => event.endsWith(".create"))) {
        getTodayCompleted();
      }
    });

    return () => {
      unsubscribe();
      completionSubscribe();
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
    backgroundColor: APP_COLORS.background,
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
    overflow: "hidden", // Important for Android rounded corners
    backgroundColor: APP_COLORS.card,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardCompletedStyle: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#DCFCE7",

    ...Platform.select({
      ios: {
        shadowOpacity: 0.02,
      },
      android: {
        elevation: 0, // remove elevation to avoid dark corner artifacts
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
    marginLeft: 6,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#e53935",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    paddingLeft: 16,
  },

  swipeActionRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "#4caf50",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    paddingRight: 16,
  },
});
