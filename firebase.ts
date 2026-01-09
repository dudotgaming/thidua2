// firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

// Cấu hình Firebase của bạn
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

// --- Các hàm hỗ trợ (Helpers) ---

// Ghi đè dữ liệu vào đường dẫn (Dùng để lưu danh sách học sinh, luật, note...)
export const writeData = (path: string, data: any) => {
  return set(ref(db, path), data);
};

// Cập nhật một phần dữ liệu (ít dùng trong app này nhưng cứ để đây)
export const updateData = (path: string, data: any) => {
  return update(ref(db, path), data);
};

// Lắng nghe dữ liệu thay đổi theo thời gian thực
export const listenData = (path: string, callback: (data: any) => void) => {
  const dbRef = ref(db, path);
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.val());
  });
};
