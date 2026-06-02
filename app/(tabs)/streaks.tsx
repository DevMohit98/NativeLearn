import { useAuth } from "@/context/AuthContext";
import { fetchCompletions, fetchHabits } from "@/lib/actions/habits";
import { APP_COLORS } from "@/lib/constant";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface StreakData {
  streak: number;
  bestStreak: number;
  total: number;
}

export default function Streaks() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [completedHabits, setCompletedHabits] = useState<any[]>([]);

  const getHabits = async () => {
    try {
      const data = await fetchHabits({ userId: user?.$id ?? "" });
      setHabits(data as []);
    } catch (err) {
      console.log(err);
    }
  };

  const getCompletions = async () => {
    try {
      const data = await fetchCompletions({ userId: user?.$id ?? "" });
      setCompletedHabits(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      getHabits();
      getCompletions();
    }
  }, [user]);

  const getStreakData = (id: string): StreakData => {
    const habitCompletions = completedHabits
      .filter((c) => c.habit_id === id)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      );

    if (habitCompletions.length === 0)
      return { streak: 0, bestStreak: 0, total: 0 };

    const total = habitCompletions.length;
    let currentStreak = 1;
    let bestStreak = 1;

    for (let i = 1; i < habitCompletions.length; i++) {
      const previousDate = new Date(habitCompletions[i - 1].completed_at);
      const currentDate = new Date(habitCompletions[i].completed_at);
      const diffDays =
        (currentDate.getTime() - previousDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays <= 1.5) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    const lastCompletion = new Date(
      habitCompletions[habitCompletions.length - 1].completed_at,
    );
    const daysSinceLastCompletion =
      (Date.now() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24);
    const streak = daysSinceLastCompletion <= 1.5 ? currentStreak : 0;

    return { streak, bestStreak, total };
  };

  const rankedHabits = habits
    .map((habit) => {
      const { streak, bestStreak, total } = getStreakData(habit.$id);
      return { habit, streak, bestStreak, total };
    })
    .sort((a, b) => b.bestStreak - a.bestStreak);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Inner View handles padding so SafeAreaView isn't styled directly */}
      <View style={styles.inner}>
        <View style={styles.headingContainer}>
          <Text variant="headlineMedium" style={styles.heading}>
            Habit Rankings
          </Text>
          <MaterialCommunityIcons name="trophy" size={28} color="#f59e0b" />
        </View>

        <Text variant="bodyMedium" style={styles.subHeading}>
          Track your most consistent habits
        </Text>

        {rankedHabits.length === 0 ? (
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
          <>
            {/* Top 3 badges — only shown when data exists */}
            {rankedHabits.slice(0, 3).map((item, index) => (
              <View
                key={item.habit.$id}
                style={[
                  styles.rankingBadge,
                  index === 0
                    ? styles.badge1
                    : index === 1
                      ? styles.badge2
                      : styles.badge3,
                ]}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankCircleText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topHabitTitle}>{item.habit.title}</Text>
                  <Text numberOfLines={1} style={styles.topHabitDescription}>
                    {item.habit.description}
                  </Text>
                </View>
                <View style={styles.streakPill}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={16}
                    color="#ff9800"
                  />
                  <Text style={styles.streakPillText}>{item.bestStreak}</Text>
                </View>
              </View>
            ))}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}>
              {rankedHabits.map(
                ({ habit, streak, bestStreak, total }, index) => (
                  <Card key={habit.$id} style={styles.card}>
                    <Card.Content>
                      <View style={styles.cardHeader}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleMedium" style={styles.title}>
                            {habit.title}
                          </Text>
                          <Text style={styles.description}>
                            {habit.description}
                          </Text>
                        </View>
                        {index === 0 && (
                          <MaterialCommunityIcons
                            name="trophy"
                            size={28}
                            color="#f59e0b"
                          />
                        )}
                      </View>

                      <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                          <MaterialCommunityIcons
                            name="fire"
                            size={22}
                            color="#f97316"
                          />
                          <Text style={styles.statValue}>{streak}</Text>
                          <Text style={styles.statLabel}>Current</Text>
                        </View>
                        <View style={[styles.statBox, styles.statBoxMiddle]}>
                          <MaterialCommunityIcons
                            name="trophy-outline"
                            size={22}
                            color="#eab308"
                          />
                          <Text style={styles.statValue}>{bestStreak}</Text>
                          <Text style={styles.statLabel}>Best</Text>
                        </View>
                        <View style={styles.statBox}>
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={22}
                            color="#22c55e"
                          />
                          <Text style={styles.statValue}>{total}</Text>
                          <Text style={styles.statLabel}>Total</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ),
              )}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },

  // Inner wrapper handles padding instead of SafeAreaView
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 8,
  },

  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  heading: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    marginRight: 8, // replaces gap: 8
  },

  subHeading: {
    color: "#6b7280",
    marginBottom: 24,
  },

  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },

  card: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: APP_COLORS.card,
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

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  rankBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14, // replaces gap: 14
  },

  rankText: {
    fontWeight: "700",
    color: "#4f46e5",
  },

  title: {
    fontWeight: "700",
    color: "#111827",
  },

  description: {
    color: "#6b7280",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingVertical: 14,
  },

  statBoxMiddle: {
    marginHorizontal: 8, // only middle item gets spacing
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
    color: "#111827",
  },

  statLabel: {
    color: "#6b7280",
    marginTop: 2,
    fontSize: 12,
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

  rankingBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },

  badge1: { backgroundColor: "#fef3c7" },
  badge2: { backgroundColor: "#e5e7eb" },
  badge3: { backgroundColor: "#fed7aa" },

  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14, // replaces gap
  },

  rankCircleText: {
    fontWeight: "700",
    fontSize: 16,
  },

  topHabitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  topHabitDescription: {
    color: "#6b7280",
    marginTop: 2,
  },

  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  streakPillText: {
    fontWeight: "700",
    color: "#ff9800",
    marginLeft: 4, // replaces gap: 4
  },
});
