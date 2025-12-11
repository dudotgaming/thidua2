import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAiWL0oL1bduh6dbW_sWJKxK7E6zm4Zaes",
  authDomain: "a3-6040f.firebaseapp.com",
  projectId: "a3-6040f",
  storageBucket: "a3-6040f.firebasestorage.app",
  messagingSenderId: "751960145856",
  appId: "1:751960145856:web:43a7dc4c6105a8f9cb5225",
  databaseURL: "https://a3-6040f-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// helpers
export const writeData = (path: string, data: any) => set(ref(db, path), data);
export const updateData = (path: string, data: any) => update(ref(db, path), data);
export const listenData = (path: string, callback: (data: any) => void) => {
  return onValue(ref(db, path), (snapshot) => {
    callback(snapshot.val());
  });
};
