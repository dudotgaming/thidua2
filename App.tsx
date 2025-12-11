
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Student } from './types';
import { INITIAL_STUDENTS, INITIAL_SCORE } from './constants';
import Leaderboard from './components/Leaderboard';
import StudentList from './components/StudentList';

const STORAGE_KEY = 'classLeaderboardData_11A3_v2'; // Changed key to ensure fresh structure

const rankColorsLate = [
  'bg-red-600',
  'bg-red-500',
  'bg-red-400',
  'bg-gray-700',
  'bg-gray-700',
  'bg-gray-700',
  'bg-gray-700',
  'bg-gray-700',
  'bg-gray-700',
  'bg-gray-700',
];

const rankColorsImprove = [
  'bg-green-600',
  'bg-green-500',
  'bg-green-400',
  'bg-gray-700',
  'bg-gray-700',
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
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedStudents = JSON.parse(savedData);
        if (Array.isArray(parsedStudents) && parsedStudents.length > 0) {
            // Check if existing data has teams, if not, assign them
            if (parsedStudents[0].team === undefined) {
                return assignRandomTeams(parsedStudents);
            }
            return parsedStudents;
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    // Initial load: assign random teams to the constant list
    return assignRandomTeams(INITIAL_STUDENTS.map(s => ({ ...s, team: 0 })));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [students]);

  const handleScoreChange = useCallback((studentId: number, amount: number) => {
    setStudents(prevStudents => 
        prevStudents.map((student) =>
            student.id === studentId
            ? { ...student, score: student.score + amount }
            : student
        )
    );
  }, []);
  
  const resetData = () => {
    if (window.confirm('Bạn có muốn xóa dữ liệu điểm? (Nhấn OK để xóa điểm, Cancel để hủy)')) {
        const resetScoreStudents = students.map(s => ({ ...s, score: 0 }));
        setStudents(resetScoreStudents);
    }
  }

  const reshuffleTeams = () => {
      if (window.confirm('Bạn có chắc chắn muốn chia lại tổ ngẫu nhiên không? Vị trí ngồi sẽ bị thay đổi.')) {
          setStudents(prev => assignRandomTeams(prev));
      }
  }

  const sortedStudents = useMemo(() => {
     // We sort by ID or Name generically, but the UI will group by Team
    return [...students].sort((a,b) => a.name.localeCompare(b.name));
  }, [students]);

  const lateLeaderboard = useMemo(() => {
    return students
      .filter(student => student.score < 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
  }, [students]);

  const improvementLeaderboard = useMemo(() => {
    return students
      .filter(student => student.score > 0)
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
