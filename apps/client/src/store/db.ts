import {
  doc,
  setDoc,
  updateDoc,
  increment,
  DocumentReference,
} from 'firebase/firestore';

import { db, auth, signInAsAnonym } from '../services/firebase';
import { AUTH_PROVIDER, DB_FIELDS } from '../constants';

type getDocument = {
  collection: string;
  documentId: string;
};

export const getDocument = (
  collection: string,
  documentId: string,
): DocumentReference => {
  const docRef = doc(db, collection, documentId);
  return docRef;
};

export const addDocument = async (
  collection: string,
  documentId: string,
  data: Record<string, string | number | boolean | null>,
  merge?: boolean,
): Promise<DocumentReference> => {
  const docRef = getDocument(collection, documentId);
  await setDoc(docRef, data, { merge: merge || true });
  return docRef;
};

export const incrementValue = async (
  docRef: DocumentReference,
  field: string,
) => {
  await updateDoc(docRef, {
    [field]: increment(1),
  });
};

export const createIncognitoUser = async (name: string) => {
  const anonim = await signInAsAnonym(auth);
  const { uid } = anonim.user;

  const docRef = await addDocument('users', uid, {
    id: uid,
    name,
    email: '',
    providerId: AUTH_PROVIDER.INCOGNITO,
  });
  await incrementValue(docRef, DB_FIELDS.USERS.LOGIN_COUNT);
};
