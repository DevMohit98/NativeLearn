import { DATABASE_ID, HABITS_TABLE_ID, tableDB } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

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
