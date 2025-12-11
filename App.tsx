// App.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Student } from "./types";
import { INITIAL_STUDENTS } from "./constants";
import Leaderboard from "./components/Leaderboard";
import StudentList from "./components/StudentList";

import { listenData, writeData } from "./firebase";

const DB_PATH = "students"; // đường dẫn trong Realtime DB

const rankColorsLate = [
  "bg-red-600",
  "bg-red-500",
  "bg-red-400",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700"
];

const rankColorsImprove = [
  "bg-green-600",
  "bg-green-500",
  "bg-green-400",
  "bg-gray-700",
  "bg-gray-700"
];

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper to assign teams
const assignRandomTeams = (students: Student[]): Student[] => {
  const shuffled = shuffleArray(students);
  return shuffled.map((student, index) => ({
    ...student,
    team: (Math.floor(index / 13) % 4) + 1 // Divides into 4 groups of ~13
  }));
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  // Kết nối realtime tới Firebase, load dữ liệu ban đầu nếu chưa có
  useEffect(() => {
    const unsub = listenData(DB_PATH, (data) => {
      if (data && Array.isArray(data)) {
        setStudents(data);
      } else if (data && typeof data === "object") {
        // nếu Firebase lưu object (keyed), convert thành array (nếu bạn dùng array trên DB thì bỏ khúc này)
        try {
          const arr = Object.values(data) as Student[];
          setStudents(arr);
        } catch {
          setStudents([]);
        }
      } else {
        // chưa có dữ liệu -> khởi tạo từ constants
        const initial = assignRandomTeams(
          INITIAL_STUDENTS.map((s) => ({ ...s, team: 0, score: (s as any).score ?? 0 }))
        );
        writeData(DB_PATH, initial).catch((e) => console.error("Write init failed", e));
      }
    });

    return () => {
      // cleanup listener khi component unmount
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // Handle điểm: ghi toàn bộ danh sách mới lên Firebase
  const handleScoreChange = useCallback(
    (studentId: number, amount: number) => {
      const newData = students.map((s) =>
        s.id === studentId ? { ...s, score: s.score + amount } : s
      );
      // ghi lên Firebase
      writeData(DB_PATH, newData).catch((e) => console.error("Write failed", e));
    },
    [students]
  );

  const resetData = () => {
    if (window.confirm("Bạn có muốn xóa dữ liệu điểm? (Nhấn OK để xóa điểm, Cancel để hủy)")) {
      const resetScoreStudents = students.map((s) => ({ ...s, score: 0 }));
      writeData(DB_PATH, resetScoreStudents).catch((e) => console.error("Write failed", e));
    }
  };

  const reshuffleTeams = () => {
    if (window.confirm("Bạn có chắc chắn muốn chia lại tổ ngẫu nhiên không? Vị trí ngồi sẽ bị thay đổi.")) {
      const reassigned = assignRandomTeams(students);
      writeData(DB_PATH, reassigned).catch((e) => console.error("Write failed", e));
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const lateLeaderboard = useMemo(() => {
    return students
      .filter((student) => student.score < 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
  }, [students]);

  const improvementLeaderboard = useMemo(() => {
    return students
      .filter((student) => student.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [students]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      <div className="container mx-auto max-w-[1600px]">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Sơ Đồ Thi Đua Lớp 11A3
          </h1>
        </header>

        <main className="flex flex-col gap-6">
          {/* Top stats area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Leaderboard
              title="Top Đi Trễ"
              icon="fas fa-person-running"
              students={lateLeaderboard}
              rankColors={rankColorsLate}
            />
            <Leaderboard
              title="Top Phấn Đấu"
              icon="fas fa-rocket"
              students={improvementLeaderboard}
              rankColors={rankColorsImprove}
            />
          </div>

          {/* Main classroom layout */}
          <div className="w-full">
            <StudentList students={sortedStudents} onScoreChange={handleScoreChange} />
          </div>
        </main>

        <footer className="flex justify-center gap-4 mt-8 pb-8">
          <button
            onClick={reshuffleTeams}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <i className="fas fa-random mr-2"></i>
            Chia Lại Tổ
          </button>
          <button
            onClick={resetData}
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Reset Điểm
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
