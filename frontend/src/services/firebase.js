// Configuration Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAQnPZo3HKxt9i1pMXHEGWDQ64gojCcp5o",
  authDomain: "betexexpress-420fc.firebaseapp.com",
  projectId: "betexexpress-420fc",
  storageBucket: "betexexpress-420fc.firebasestorage.app",
  messagingSenderId: "1075687132287",
  appId: "1:1075687132287:web:eb16b2521349779d90834a",
  measurementId: "G-LZNVBKPR33"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase avec la base de données par défaut
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
