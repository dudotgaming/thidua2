
import React, { useState } from 'react';
import type { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onScoreChange: (studentId: number, amount: number) => void;
  onSwapStudents: (id1: number, id2: number) => void;
  onMoveToTeam: (studentId: number, teamId: number) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onScoreChange, onSwapStudents, onMoveToTeam }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movingStudentId, setMovingStudentId] = useState<number | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teams = [1, 2, 3, 4];
  const positivePoints = [1, 2, 3, 5];
  const negativePoints = [-1, -2, -3, -4, -5];

  const handleStudentClick = (studentId: number) => {
    if (movingStudentId !== null) {
      if (movingStudentId !== studentId) {
          onSwapStudents(movingStudentId, studentId);
      }
      setMovingStudentId(null);
    }
  };

  const handleEmptySpotClick = (teamId: number) => {
    if (movingStudentId !== null) {
        onMoveToTeam(movingStudentId, teamId);
        setMovingStudentId(null);
    }
  };

  const toggleMoveMode = (e: React.MouseEvent, studentId: number) => {
    e.stopPropagation();
    setMovingStudentId(movingStudentId === studentId ? null : studentId);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-2">
        <h2 className="text-xl font-bold text-indigo-300 flex items-center gap-2">
          <i className="fas fa-th-large"></i> Sơ Đồ Chỗ Ngồi
          {movingStudentId && (
              <span className="text-xs font-normal text-yellow-400 flex items-center gap-2 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                  Chọn mục tiêu để đổi chỗ hoặc chuyển tổ
              </span>
          )}
        </h2>
        <div className="relative w-full sm:w-64">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
          <input
            type="text"
            placeholder="Tìm học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-full py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {teams.map((teamId) => {
          const teamStudents = filteredStudents.filter(s => s.team === teamId);
          const desks = [];
          for (let i = 0; i < teamStudents.length; i += 2) {
            desks.push(teamStudents.slice(i, i + 2));
          }

          return (
            <div key={teamId} className="bg-gray-950/40 rounded-xl p-3 border border-gray-800">
              <h3 className="text-md font-bold text-center text-teal-400 mb-4 pb-2 border-b border-gray-800 flex justify-between px-2 uppercase tracking-widest text-xs">
                <span>Tổ {teamId}</span>
                <span className="text-gray-500 font-normal">{teamStudents.length} HS</span>
              </h3>
              
              <div className="space-y-4">
                {desks.length > 0 ? (
                  desks.map((desk, deskIndex) => (
                    <div key={deskIndex} className="bg-gray-900/80 p-2 rounded-lg border border-gray-800/80 relative pt-6 shadow-inner">
                       <div className="absolute top-1 left-2">
                          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Bàn {deskIndex + 1}</span>
                       </div>
                       
                       <div className="flex flex-row gap-2">
                          {desk.map((student) => {
                            const isMoving = movingStudentId === student.id;
                            const isTarget = movingStudentId !== null && !isMoving;
                            
                            return (
                                <div 
                                    key={student.id} 
                                    onClick={() => isTarget && handleStudentClick(student.id)}
                                    className={`flex-1 flex flex-col min-w-0 rounded-md p-1.5 border transition-all duration-300 relative group
                                        ${isMoving 
                                            ? 'bg-indigo-900/80 border-indigo-400 ring-2 ring-indigo-500 scale-105 z-20 shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                                            : isTarget
                                                ? 'bg-gray-800 border-yellow-500/50 cursor-pointer hover:scale-105 hover:z-10 hover:border-yellow-400'
                                                : 'bg-gray-950 border-gray-800'
                                        }
                                    `}
                                >
                                    {isTarget && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 rounded-md pointer-events-none z-30">
                                            <span className="text-[8px] font-bold text-yellow-400 uppercase">Đổi chỗ</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
                                        <div className="flex items-center gap-1 overflow-hidden">
                                            <button 
                                                onClick={(e) => toggleMoveMode(e, student.id)}
                                                className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-sm text-[10px] transition-all ${
                                                    isMoving 
                                                        ? 'bg-red-500 text-white hover:bg-red-400' 
                                                        : 'text-gray-600 hover:text-indigo-400 hover:bg-gray-800 bg-gray-900/50'
                                                }`}
                                                title={isMoving ? "Hủy di chuyển" : "Bắt đầu di chuyển"}
                                            >
                                                <i className={`fas ${isMoving ? 'fa-times' : 'fa-arrows-alt'}`}></i>
                                            </button>
                                            <span className={`font-bold text-[10px] truncate max-w-[85%] ${isMoving ? 'text-indigo-200' : 'text-white'}`} title={`${student.name} (${student.score}đ)`}>
                                                {student.name} <span className={`text-[9px] font-black ml-1 ${student.score >= 0 ? 'text-teal-400' : 'text-red-400'}`}>({student.score})</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`grid grid-cols-4 gap-0.5 mb-1 ${movingStudentId !== null ? 'opacity-20 pointer-events-none' : ''}`}>
                                    {positivePoints.map(p => (
                                        <button
                                        key={`plus-${p}`}
                                        onClick={(e) => { e.stopPropagation(); onScoreChange(student.id, p); }}
                                        className="h-5 flex items-center justify-center rounded-[2px] bg-green-950/30 hover:bg-green-600 text-[8px] text-green-500 hover:text-white border border-green-900/50 transition-colors shadow-sm"
                                        >
                                        +{p}
                                        </button>
                                    ))}
                                    </div>

                                    <div className={`grid grid-cols-5 gap-0.5 ${movingStudentId !== null ? 'opacity-20 pointer-events-none' : ''}`}>
                                    {negativePoints.map(p => (
                                        <button
                                        key={`minus-${p}`}
                                        onClick={(e) => { e.stopPropagation(); onScoreChange(student.id, p); }}
                                        className="h-5 flex items-center justify-center rounded-[2px] bg-red-950/30 hover:bg-red-600 text-[8px] text-red-500 hover:text-white border border-red-900/50 transition-colors shadow-sm"
                                        >
                                        {p}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                            );
                          })}
                          
                          {/* Ô trống trong bàn (xử lý di chuyển vào tổ) */}
                          {desk.length === 1 && (
                              <div 
                                onClick={() => handleEmptySpotClick(teamId)}
                                className={`flex-1 border-2 border-dashed rounded-md flex items-center justify-center transition-all duration-300
                                    ${movingStudentId !== null 
                                        ? 'bg-teal-900/20 border-teal-500/50 cursor-pointer hover:bg-teal-900/40 hover:border-teal-400 animate-pulse' 
                                        : 'border-gray-800 bg-transparent opacity-20'
                                    }
                                `}
                              >
                                {movingStudentId !== null && (
                                    <div className="flex flex-col items-center gap-1">
                                        <i className="fas fa-plus-circle text-teal-400 text-xs"></i>
                                        <span className="text-[8px] text-teal-400 font-bold uppercase">Tới đây</span>
                                    </div>
                                )}
                              </div>
                          )}
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-700 py-8 text-xs italic">Không có dữ liệu</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentList;
