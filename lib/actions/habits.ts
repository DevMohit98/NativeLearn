import {
  DATABASE_ID,
  HABIT_COMPLETION_ID,
  HABITS_TABLE_ID,
  tableDB,
} from "@/lib/appwrite";
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

export const deleteHabit = async ({ id }: { id: string }) => {
  try {
    await tableDB.deleteRow(DATABASE_ID, HABITS_TABLE_ID, id);
    return true;
  } catch (err) {
    throw err;
  }
};

export const completeHabit = async ({
  id,
  userId,
}: {
  id: string;
  userId: string | null;
}) => {
  try {
    await tableDB.createRow(DATABASE_ID, HABIT_COMPLETION_ID, ID.unique(), {
      habit_id: id,
      user_id: userId,
      completed_at: new Date().toISOString(),
    });
  } catch (err) {
    throw err;
  }
};

export const updateHabit = async (id: string, payload: any) => {
  try {
    await tableDB.updateRow(DATABASE_ID, HABITS_TABLE_ID, id, {
      ...payload,
    });
  } catch (err) {
    throw err;
  }
};

export const fetchTodayCompletion = async ({ userId }: { userId: string }) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const res = await tableDB.listRows(DATABASE_ID, HABIT_COMPLETION_ID, [
      Query.equal("user_id", userId ?? null),
      Query.greaterThanEqual("completed_at", today.toISOString()),
    ]);
    return res.rows;
  } catch (err) {
    throw err;
  }
};

export const fetchCompletions = async ({ userId }: { userId: string }) => {
  try {
    const res = await tableDB.listRows(DATABASE_ID, HABIT_COMPLETION_ID, [
      Query.equal("user_id", userId ?? null),
    ]);
    return res.rows;
  } catch (err) {
    throw err;
  }
};
