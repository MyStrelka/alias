import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import type { User } from '@alias/shared';

import { firebaseDatabaseId, FirebaseServiceAccountKey } from '../config';

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
      await db
        .collection('users')
        .doc(dbUserId)
        .set(
          { ...user, loginCount: (existing.loginCount || 0) + 1 },
          { merge: true },
        );
    } else {
      await db
        .collection('users')
        .doc(dbUserId)
        .set({ ...user, loginCount: 1 });
    }
    return dbUserId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error inserting/updating user: ${message}`);
    return null;
  }
};

export const findUser = async (dbUserId: string): Promise<User | null> => {
  try {
    const doc = await db.collection('users').doc(dbUserId).get();
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
    const data = await db.collection('users').get();
    data.forEach((user) => {
      const { id, name, email, providerId, avatar } = user.data();
      users.push({
        id,
        name,
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

export default { findUser, getUsers, insertOrUpdateUser };
