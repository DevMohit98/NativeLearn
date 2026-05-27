import { DATABASE_ID, HABITS_TABLE_ID, tableDB } from "@/lib/appwrite";
import { ID, Query } from "react-native-appwrite";

export const createHabit = async ({
  title,
  description,
  frequency,
  userId,
}: {
  title: string;
  description: string;
  frequency: string;
  userId: string | null;
}) => {
  try {
    const res = await tableDB.createRow(
      DATABASE_ID,
      HABITS_TABLE_ID,
      ID.unique(),
      {
        title,
        description,
        frequency,
        user_id: userId,
        streak_count: 0,
        last_completed: new Date().toISOString(),
      },
    );
    return res;
  } catch (err) {
    throw err;
  }
};
export const fetchHabits = async ({ userId }: { userId: string }) => {
  try {
    const res = await tableDB.listRows(DATABASE_ID, HABITS_TABLE_ID, [
      Query.equal("user_id", userId ?? null),
    ]);
    return res.rows;
  } catch (err) {
    throw err;
  }
};
