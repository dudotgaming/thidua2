import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Student } from './types';
import { INITIAL_STUDENTS, INITIAL_SCORE } from './constants';
import Leaderboard from './components/Leaderboard';
import StudentList from './components/StudentList';
import TeamChart from './components/TeamChart';
import { listenData, writeData } from './firebase';

// --- CẤU HÌNH ---
const DB_ROOT = "class_11A3"; 
const STORAGE_KEY_CHART_OPEN = 'classLeaderboardChartOpen';
const DEFAULT_RULES = "1. Đi học đúng giờ\n2. Đồng phục chỉnh tề\n3. Giữ vệ sinh lớp học\n4. Hăng hái phát biểu (+ điểm)\n5. Nghỉ học có phép";

const teamBadgeColors: Record<number, string> = {
  1: 'bg-blue-900/40 text-blue-400 border-blue-800',
  2: 'bg-purple-900/40 text-purple-400 border-purple-800',
  3: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  4: 'bg-pink-900/40 text-pink-400 border-pink-800',
};

// --- HELPER FUNCTIONS ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const assignRandomTeams = (students: any[]): Student[] => {
  const shuffled = shuffleArray(students);
  return shuffled.map((student, index) => ({
    ...student,
    team: (Math.floor(index / 13) % 4) + 1,
    score: student.score ?? INITIAL_SCORE
  }));
};

const App: React.FC = () => {
  // State dữ liệu
  const [students, setStudents] = useState<Student[]>([]);
  const [classNote, setClassNote] = useState("");
  const [classRules, setClassRules] = useState(DEFAULT_RULES);

  // State giao diện
  const [isChartOpen, setIsChartOpen] = useState(() => localStorage.getItem(STORAGE_KEY_CHART_OPEN) === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [rulesSaveStatus, setRulesSaveStatus] = useState<'idle' | 'saved'>('idle');

  // --- KẾT NỐI & ĐỒNG BỘ FIREBASE ---
  useEffect(() => {
    const unsub = listenData(DB_ROOT, (data) => {
      // 1. Cập nhật Note & Rules nếu tồn tại
      if (data) {
        if (data.note !== undefined) setClassNote(data.note);
        if (data.rules !== undefined) setClassRules(data.rules);
      }

      // 2. Kiểm tra danh sách học sinh
      if (data && data.students && Object.keys(data.students).length > 0) {
        // Nếu đã có học sinh trên Firebase -> Chuyển thành mảng và set state
        const studentData = Array.isArray(data.students) 
          ? data.students 
          : Object.values(data.students);
        setStudents(studentData as Student[]);
      } else {
        // Nếu CHƯA CÓ học sinh trên Firebase -> Khởi tạo từ constants
        console.log("Dữ liệu trống, đang nạp học sinh mặc định...");
        const initialStudents = assignRandomTeams(INITIAL_STUDENTS);
        
        // Cập nhật local UI ngay lập tức
        setStudents(initialStudents);

        // Lưu lên Firebase để đồng bộ
        const initialData = {
          students: initialStudents,
          note: data?.note || "Ghi chú thi đua tuần này...",
          rules: data?.rules || DEFAULT_RULES
        };
        writeData(DB_ROOT, initialData);
      }
    });

    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHART_OPEN, isChartOpen.toString());
  }, [isChartOpen]);

  // --- HÀM XỬ LÝ (HANDLERS) ---
  const saveStudentsToFirebase = (newStudents: Student[]) => {
    writeData(`${DB_ROOT}/students`, newStudents);
  };

  const handleScoreChange = useCallback((studentId: number, amount: number) => {
    setStudents(prev => {
      const next = prev.map(s => s.id === studentId ? { ...s, score: s.score + amount } : s);
      saveStudentsToFirebase(next);
      return next;
    });
  }, []);

  const handleUpdateName = (studentId: number, newName: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
  };

  const handleSaveSidebar = () => {
    writeData(`${DB_ROOT}/students`, students);
    writeData(`${DB_ROOT}/note`, classNote);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveRules = () => {
    writeData(`${DB_ROOT}/rules`, classRules);
    setRulesSaveStatus('saved');
    setTimeout(() => setRulesSaveStatus('idle'), 2000);
  };

  const handleRestoreOriginalNames = () => {
    if (window.confirm('Khôi phục lại tên ban đầu? (Giữ nguyên điểm)')) {
      const newStudents = students.map(current => {
        const original = INITIAL_STUDENTS.find(s => s.id === current.id);
        return original ? { ...current, name: original.name } : current;
      });
      setStudents(newStudents);
      saveStudentsToFirebase(newStudents);
    }
  };

  const handleSwapStudents = useCallback((id1: number, id2: number) => {
    setStudents(prev => {
      const next = [...prev];
      const idx1 = next.findIndex(s => s.id === id1);
      const idx2 = next.findIndex(s => s.id === id2);
      if (idx1 !== -1 && idx2 !== -1) {
        const team1 = next[idx1].team;
        const team2 = next[idx2].team;
        const temp = { ...next[idx1] };
        next[idx1] = { ...next[idx2], team: team1 };
        next[idx2] = { ...temp, team: team2 };
        saveStudentsToFirebase(next);
      }
      return next;
    });
  }, []);

  const handleMoveToTeam = useCallback((studentId: number, targetTeamId: number) => {
    setStudents(prev => {
      const next = prev.map(s => s.id === studentId ? { ...s, team: targetTeamId } : s);
      saveStudentsToFirebase(next);
      return next;
    });
  }, []);

  const resetData = () => {
    if (window.confirm('CẢNH BÁO: Đưa toàn bộ điểm số về 0?')) {
      const resetScoreStudents = students.map(s => ({ ...s, score: 0 }));
      setStudents(resetScoreStudents);
      saveStudentsToFirebase(resetScoreStudents);
    }
  };

  // --- TÍNH TOÁN DỮ LIỆU (MEMO) ---
  const teamTotals = useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.team] = (acc[student.team] || 0) + student.score;
      return acc;
    }, {} as { [key: number]: number });
  }, [students]);

  const lateLeaderboard = useMemo(() => [...students].filter(s => s.score < 0).sort((a, b) => a.score - b.score).slice(0, 10), [students]);
  const improvementLeaderboard = useMemo(() => [...students].filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5), [students]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden">
      {/* Sidebar Trái */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-indigo-400 text-lg uppercase">Quản Lý Lớp</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <textarea value={classNote} onChange={(e) => setClassNote(e.target.value)} className="w-full bg-transparent text-sm focus:outline-none min-h-[100px]" placeholder="Ghi chú..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSaveSidebar} className={`py-2 px-3 rounded-lg text-xs font-bold ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-indigo-600'}`}>
              {saveStatus === 'saved' ? 'Đã lưu' : 'Lưu & Note'}
            </button>
            <button onClick={handleRestoreOriginalNames} className="py-2 px-3 rounded-lg bg-gray-700 text-xs font-bold">Tên gốc</button>
          </div>
          <div className="space-y-1.5">
            {students.map(s => (
              <div key={s.id} className="flex gap-2 items-center bg-gray-800/40 p-1.5 rounded border border-gray-800 focus-within:border-indigo-500">
                <input type="text" value={s.name} onChange={(e) => handleUpdateName(s.id, e.target.value)} className="flex-1 bg-transparent text-xs outline-none" />
                <div className={`shrink-0 w-6 h-4 rounded flex items-center justify-center text-[8px] font-black ${teamBadgeColors[s.team]}`}>T{s.team}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 z-40 bg-indigo-600 p-2.5 rounded-full lg:hidden">☰</button>
        )}
        <button onClick={() => setIsRulesOpen(!isRulesOpen)} className="fixed top-4 right-4 z-40 bg-amber-600 p-2.5 rounded-full shadow-lg">⚖️</button>

        <header className="p-6 text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Sơ Đồ Thi Đua 11A3</h1>
        </header>

        <main className="px-6 space-y-8 max-w-[1400px] mx-auto w-full">
          <TeamChart teamTotals={teamTotals} isOpen={isChartOpen} onToggle={() => setIsChartOpen(!isChartOpen)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Leaderboard title="Top Đi Trễ" icon="fas fa-person-running" students={lateLeaderboard} rankColors={['bg-red-600', 'bg-red-500', 'bg-red-400']} />
            <Leaderboard title="Top Phấn Đấu" icon="fas fa-rocket" students={improvementLeaderboard} rankColors={['bg-green-600', 'bg-green-500', 'bg-green-400']} />
          </div>
          <StudentList students={students} onScoreChange={handleScoreChange} onSwapStudents={handleSwapStudents} onMoveToTeam={handleMoveToTeam} />
        </main>

        <footer className="fixed bottom-6 right-6">
          <button onClick={resetData} className="bg-red-600 h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all">🔄</button>
        </footer>
      </div>

      {/* Sidebar Phải (Luật) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-gray-900 border-l border-gray-800 transition-transform ${isRulesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-amber-500 uppercase">Luật Lớp</h2>
          <button onClick={() => setIsRulesOpen(false)}>✕</button>
        </div>
        <div className="p-4 flex flex-col h-full gap-4">
          <textarea value={classRules} onChange={(e) => setClassRules(e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm outline-none font-mono" />
          <button onClick={handleSaveRules} className={`py-3 rounded-lg text-sm font-bold ${rulesSaveStatus === 'saved' ? 'bg-green-600' : 'bg-amber-600'}`}>
            {rulesSaveStatus === 'saved' ? 'Đã lưu' : 'Lưu thay đổi'}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default App;
