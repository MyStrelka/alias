import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { User } from '@alias/shared';

import { firebaseDatabaseId, FirebaseServiceAccountKey } from '../config';

const TABLE = {
  USERS: 'users',
  ACTIVITIES: 'activities',
};

type ActivityActionType = 'login' | 'createRoom' | 'joinRoom';

interface Activity {
  loginCount: number;
  createRoomCount: number;
  joinRoomCount: number;
}

type ActivityActionMap = Record<ActivityActionType, keyof Activity>;

const ACTIVITY_ACTION_MAP: ActivityActionMap = {
  login: 'loginCount',
  createRoom: 'createRoomCount',
  joinRoom: 'joinRoomCount',
};

initializeApp({
  credential: cert({
    projectId: FirebaseServiceAccountKey.project_id,
    clientEmail: FirebaseServiceAccountKey.client_email,
    privateKey: FirebaseServiceAccountKey.private_key.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore();
db.settings({ databaseId: firebaseDatabaseId });

const insertOrUpdateUser = async (user: User): Promise<string | null> => {
  try {
    const dbUserId = `${user.providerId}_${user.id}`;
    const existing = await findUser(dbUserId);
    if (existing) {
      await db.collection(TABLE.USERS).doc(dbUserId).set(user, { merge: true });
    } else {
      await db.collection(TABLE.USERS).doc(dbUserId).set(user);
    }

    await logActivities('login', dbUserId);

    return dbUserId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error inserting/updating user: ${message}`);
    return null;
  }
};

export const findUser = async (dbUserId: string): Promise<User | null> => {
  try {
    const doc = await db.collection(TABLE.USERS).doc(dbUserId).get();
    if (!doc.exists) return null;
    const data = doc.data() as User;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SEARCH USER ERROR: ${message}`);
    return null;
  }
};

export const getUsers = async () => {
  let obj;
  try {
    const users: User[] = [];
    const data = await db.collection(TABLE.USERS).get();
    data.forEach((user) => {
      const { id, name, playerName, email, providerId, avatar } = user.data();
      users.push({
        id,
        name,
        playerName,
        email,
        providerId,
        avatar,
      });
    });
    obj = { success: true, users: users };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error getting users: ${message}`);
    obj = { success: false, error: message };
  }
  return obj;
};

export const logActivities = async (
  action: ActivityActionType,
  dbUserId: string,
) => {
  try {
    const activityRef = await db
      .collection(TABLE.ACTIVITIES)
      .doc(dbUserId)
      .get();
    const activity = activityRef.data() as Activity;

    if (activity) {
      let activityKey: keyof Activity | null = null;
      let activityData = null;
      activityKey = ACTIVITY_ACTION_MAP[action] || null;

      if (activityKey) {
        activityData = (activity[activityKey] || 0) + 1;
        await db
          .collection(TABLE.ACTIVITIES)
          .doc(dbUserId)
          .set({ ...activity, [activityKey]: activityData }, { merge: true });
      }
    } else {
      const initActivityRecord = Object.fromEntries(
        Object.values(ACTIVITY_ACTION_MAP).map((a) => [a, 0]),
      );

      const activityKey = ACTIVITY_ACTION_MAP[action] || null;
      if (activityKey) {
        await db
          .collection(TABLE.ACTIVITIES)
          .doc(dbUserId)
          .set({ ...initActivityRecord, [activityKey]: 1 });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error inserting/updating activity: ${message}`);
    return null;
  }
};

export const updatePlayerName = async (
  dbUserId: string,
  playerName: string,
) => {
  try {
    const userRef = await db.collection(TABLE.USERS).doc(dbUserId).get();
    const user = userRef.data() as User;
    await db
      .collection(TABLE.USERS)
      .doc(dbUserId)
      .set({ ...user, playerName }, { merge: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error updating playerName: ${message}`);
    return null;
  }
};

export default {
  findUser,
  getUsers,
  insertOrUpdateUser,
  logActivities,
  updatePlayerName,
};
