import {
  doc,
  setDoc,
  updateDoc,
  increment,
  DocumentReference,
} from 'firebase/firestore';

import { db } from '../services/firebase';

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
