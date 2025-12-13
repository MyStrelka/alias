import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9KKQH2_gdwZGT_-q8MfSsp165k1VNuT8",
  authDomain: "nikita-01.firebaseapp.com",
  // databaseURL:
  // "https://nikita-01-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nikita-01",
  storageBucket: "nikita-01.firebasestorage.app",
  messagingSenderId: "926202091508",
  appId: "1:926202091508:web:81495d8ce11f2115c2cba1",
  measurementId: "G-SRMT7QHX63",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
