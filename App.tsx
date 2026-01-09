
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Student } from './types';
import { INITIAL_STUDENTS, INITIAL_SCORE } from './constants';
import Leaderboard from './components/Leaderboard';
import StudentList from './components/StudentList';
import TeamChart from './components/TeamChart';

const STORAGE_KEY_STUDENTS = 'classLeaderboardData_11A3_v2';
const STORAGE_KEY_NOTE = 'classLeaderboardNote_11A3';
const STORAGE_KEY_RULES = 'classLeaderboardRules_11A3';
const STORAGE_KEY_CHART_OPEN = 'classLeaderboardChartOpen';

const rankColorsLate = [
  'bg-red-600', 'bg-red-500', 'bg-red-400', 'bg-gray-700', 'bg-gray-700',
  'bg-gray-700', 'bg-gray-700', 'bg-gray-700', 'bg-gray-700', 'bg-gray-700',
];

const rankColorsImprove = [
  'bg-green-600', 'bg-green-500', 'bg-green-400', 'bg-gray-700', 'bg-gray-700',
];

const teamBadgeColors: Record<number, string> = {
  1: 'bg-blue-900/40 text-blue-400 border-blue-800',
  2: 'bg-purple-900/40 text-purple-400 border-purple-800',
  3: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  4: 'bg-pink-900/40 text-pink-400 border-pink-800',
};

const DEFAULT_RULES = "1. Đi học đúng giờ\n2. Đồng phục chỉnh tề\n3. Giữ vệ sinh lớp học\n4. Hăng hái phát biểu (+ điểm)\n5. Nghỉ học có phép";

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
        team: (Math.floor(index / 13) % 4) + 1
    }));
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return assignRandomTeams(INITIAL_STUDENTS.map(s => ({ ...s, team: 0, score: INITIAL_SCORE })));
  });

  const [classNote, setClassNote] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_NOTE) || "Ghi chú thi đua tuần này...";
  });

  const [classRules, setClassRules] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_RULES) || DEFAULT_RULES;
  });

  const [isChartOpen, setIsChartOpen] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_CHART_OPEN) === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [rulesSaveStatus, setRulesSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTE, classNote);
  }, [classNote]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHART_OPEN, isChartOpen.toString());
  }, [isChartOpen]);

  const handleScoreChange = useCallback((studentId: number, amount: number) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, score: s.score + amount } : s));
  }, []);

  const handleUpdateName = (studentId: number, newName: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
  };

  const handleSaveNames = () => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveRules = () => {
    localStorage.setItem(STORAGE_KEY_RULES, classRules);
    setRulesSaveStatus('saved');
    setTimeout(() => setRulesSaveStatus('idle'), 2000);
  };

  const handleRestoreOriginalNames = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại tên ban đầu của toàn bộ thành viên? (Điểm số vẫn giữ nguyên)')) {
      setStudents(prev => prev.map(current => {
        const original = INITIAL_STUDENTS.find(s => s.id === current.id);
        return original ? { ...current, name: original.name } : current;
      }));
    }
  };

  const handleSwapStudents = useCallback((id1: number, id2: number) => {
    setStudents(prev => {
      const next = [...prev];
      const idx1 = next.findIndex(s => s.id === id1);
      const idx2 = next.findIndex(s => s.id === id2);
      
      if (idx1 !== -1 && idx2 !== -1) {
          const s1 = { ...next[idx1] };
          const s2 = { ...next[idx2] };
          const team1 = s1.team;
          const team2 = s2.team;
          next[idx1] = { ...s2, team: team1 };
          next[idx2] = { ...s1, team: team2 };
      }
      return next;
    });
  }, []);

  const handleMoveToTeam = useCallback((studentId: number, targetTeamId: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, team: targetTeamId } : s
    ));
  }, []);

  const resetData = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ điểm số về 0?')) {
      setStudents(prev => prev.map(s => ({ ...s, score: 0 })));
    }
  };

  // Tính toán tổng điểm theo tổ
  const teamTotals = useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.team] = (acc[student.team] || 0) + student.score;
      return acc;
    }, {} as { [key: number]: number });
  }, [students]);

  const lateLeaderboard = students
    .filter(s => s.score < 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  const improvementLeaderboard = students
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden">
      {/* LEFT Sidebar - Note & Name Editor */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col shadow-2xl
      `}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10 shadow-md">
          <h2 className="font-bold text-indigo-400 flex items-center gap-2 text-lg">
            <i className="fas fa-list-check"></i> Quản Lý Lớp
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <h3 className="text-sm font-bold text-yellow-500 mb-2 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-sticky-note"></i> Ghi chú nhanh
            </h3>
            <textarea
              value={classNote}
              onChange={(e) => setClassNote(e.target.value)}
              className="w-full bg-transparent text-yellow-100 text-sm focus:outline-none resize-none min-h-[100px]"
              placeholder="Nhập ghi chú quan trọng..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleSaveNames}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <i className={`fas ${saveStatus === 'saved' ? 'fa-check' : 'fa-save'}`}></i>
              {saveStatus === 'saved' ? 'Đã lưu' : 'Lưu tên'}
            </button>
            <button 
              onClick={handleRestoreOriginalNames}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold transition-all"
            >
              <i className="fas fa-undo"></i>
              Tên gốc
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-teal-500 mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
              <i className="fas fa-user-edit"></i> Chỉnh sửa tên
            </h3>
            <div className="space-y-1.5">
              {students.map(s => (
                <div key={s.id} className="flex gap-2 items-center bg-gray-800/40 p-1.5 rounded border border-gray-800 focus-within:border-indigo-500 transition-colors">
                  <span className="text-[9px] text-gray-500 w-5 text-center font-mono">{s.id}</span>
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleUpdateName(s.id, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white focus:text-indigo-300 focus:outline-none"
                    placeholder="Nhập tên..."
                  />
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${s.score >= 0 ? 'bg-teal-900/30 text-teal-400' : 'bg-red-900/30 text-red-400'}`}>
                    {s.score}đ
                  </span>
                  <div 
                    className={`shrink-0 w-6 h-4 rounded flex items-center justify-center text-[8px] font-black border ${teamBadgeColors[s.team] || 'bg-gray-700 text-gray-400'}`}
                    title={`Tổ ${s.team}`}
                  >
                    T{s.team}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto relative bg-gray-950">
        {/* Toggle Left Sidebar Button */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 bg-indigo-600 p-2.5 rounded-full shadow-lg lg:hidden hover:bg-indigo-500 transition-colors"
          >
            <i className="fas fa-bars"></i>
          </button>
        )}

        {/* Toggle Right Rules Button */}
        <button 
            onClick={() => setIsRulesOpen(!isRulesOpen)}
            className="fixed top-4 right-4 z-40 bg-amber-600 p-2.5 rounded-full shadow-lg hover:bg-amber-500 transition-all hover:scale-110 flex items-center justify-center"
            title="Luật & Nội quy"
        >
            <i className={`fas ${isRulesOpen ? 'fa-times' : 'fa-gavel'}`}></i>
        </button>

        <header className="p-4 sm:p-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500">
            Sơ Đồ Thi Đua Lớp 11A3
          </h1>
          <p className="text-gray-500 text-xs mt-2 font-medium tracking-widest uppercase opacity-60">
            Quản lý thi đua & chỗ ngồi học tập
          </p>
        </header>

        <main className="px-2 sm:px-6 space-y-8 max-w-[1400px] mx-auto w-full">
          {/* Team Statistics Chart */}
          <TeamChart 
            teamTotals={teamTotals} 
            isOpen={isChartOpen} 
            onToggle={() => setIsChartOpen(!isChartOpen)} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Leaderboard title="Top Đi Trễ" icon="fas fa-person-running" students={lateLeaderboard} rankColors={rankColorsLate} />
            <Leaderboard title="Top Phấn Đấu" icon="fas fa-rocket" students={improvementLeaderboard} rankColors={improvementLeaderboard.map((_, i) => rankColorsImprove[i] || 'bg-gray-700')} />
          </div>

          <div className="pb-24">
            <StudentList 
                students={students} 
                onScoreChange={handleScoreChange} 
                onSwapStudents={handleSwapStudents}
                onMoveToTeam={handleMoveToTeam}
            />
          </div>
        </main>

        <footer className="fixed bottom-6 right-6 flex flex-col items-end">
          <button 
            onClick={resetData} 
            className="bg-red-600 hover:bg-red-500 text-white font-bold h-14 w-14 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-110 flex items-center justify-center group active:scale-90" 
            title="Đặt lại toàn bộ điểm"
          >
            <i className="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500 text-xl"></i>
          </button>
        </footer>
      </div>

      {/* RIGHT Sidebar - Rules & Policies */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-gray-900 border-l border-gray-800 transition-transform duration-300 transform
        ${isRulesOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col shadow-2xl
      `}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10 shadow-md">
          <h2 className="font-bold text-amber-500 flex items-center gap-2 text-lg uppercase tracking-wider">
            <i className="fas fa-gavel"></i> Luật Lớp
          </h2>
          <button onClick={() => setIsRulesOpen(false)} className="text-gray-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex-1 flex flex-col">
            <p className="text-[10px] text-gray-500 mb-2 italic">Chỉnh sửa nội dung luật bên dưới và nhấn Lưu để cập nhật.</p>
            <textarea
              value={classRules}
              onChange={(e) => setClassRules(e.target.value)}
              className="flex-1 w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50 resize-none font-mono leading-relaxed"
              placeholder="Nhập luật lớp..."
            />
          </div>
          
          <button 
            onClick={handleSaveRules}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all shadow-lg ${
                rulesSaveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
            }`}
          >
            <i className={`fas ${rulesSaveStatus === 'saved' ? 'fa-check' : 'fa-save'}`}></i>
            {rulesSaveStatus === 'saved' ? 'Đã lưu thành công' : 'Lưu thay đổi'}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default App;
