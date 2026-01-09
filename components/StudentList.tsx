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

  // Hàm xử lý khi click vào một học sinh
  const handleStudentClick = (studentId: number) => {
    if (movingStudentId === null) {
      // Nếu chưa chọn ai, thì chọn học sinh này làm người bắt đầu di chuyển
      setMovingStudentId(studentId);
    } else if (movingStudentId === studentId) {
      // Nếu click lại chính người đó, hủy bỏ chọn
      setMovingStudentId(null);
    } else {
      // Nếu đã chọn người thứ nhất, và click người thứ hai -> Đổi chỗ
      onSwapStudents(movingStudentId, studentId);
      setMovingStudentId(null);
    }
  };

  const handleEmptySpotClick = (teamId: number) => {
    if (movingStudentId !== null) {
        onMoveToTeam(movingStudentId, teamId);
        setMovingStudentId(null);
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-2">
        <h2 className="text-xl font-bold text-indigo-300 flex items-center gap-2">
          <i className="fas fa-th-large"></i> Sơ Đồ Chỗ Ngồi
          {movingStudentId && (
              <span className="text-xs font-normal text-yellow-400 flex items-center gap-2 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                  <span className="animate-pulse h-2 w-2 rounded-full bg-yellow-500"></span>
                  Đang chọn: {students.find(s => s.id === movingStudentId)?.name}
              </span>
          )}
        </h2>
        {/* Input tìm kiếm giữ nguyên */}
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
              <h3 className="text-md font-bold text-center text-teal-400 mb-4 pb-2 border-b border-gray-800 flex justify-between px-2 uppercase text-xs">
                <span>Tổ {teamId}</span>
                <span className="text-gray-500 font-normal">{teamStudents.length} HS</span>
              </h3>
              
              <div className="space-y-4">
                {desks.map((desk, deskIndex) => (
                  <div key={deskIndex} className="bg-gray-900/80 p-2 rounded-lg border border-gray-800 relative pt-6">
                    <div className="absolute top-1 left-2 text-[9px] text-gray-600 font-bold">BÀN {deskIndex + 1}</div>
                    <div className="flex flex-row gap-2">
                      {desk.map((student) => {
                        const isMoving = movingStudentId === student.id;
                        return (
                          <div 
                            key={student.id} 
                            onClick={() => handleStudentClick(student.id)}
                            className={`flex-1 flex flex-col min-w-0 rounded-md p-1.5 border transition-all cursor-pointer
                              ${isMoving ? 'bg-indigo-900 border-indigo-400 ring-2 ring-indigo-500 scale-105 z-10' : 'bg-gray-950 border-gray-800 hover:border-indigo-500/50'}
                            `}
                          >
                            <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-1">
                                <span className="font-bold text-[10px] truncate text-white">
                                  {student.name}
                                </span>
                                <span className={`text-[10px] font-black ${student.score >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                                  {student.score}
                                </span>
                            </div>

                            {/* Nút cộng điểm - Thêm e.stopPropagation() để không bị nhảy sang chế độ đổi chỗ khi bấm điểm */}
                            <div className="grid grid-cols-4 gap-0.5 mb-1" onClick={e => e.stopPropagation()}>
                              {positivePoints.map(p => (
                                <button key={p} onClick={() => onScoreChange(student.id, p)} className="h-5 bg-green-950/30 text-[8px] text-green-500 rounded border border-green-900/50">+{p}</button>
                              ))}
                            </div>
                            <div className="grid grid-cols-5 gap-0.5" onClick={e => e.stopPropagation()}>
                              {negativePoints.map(p => (
                                <button key={p} onClick={() => onScoreChange(student.id, p)} className="h-5 bg-red-950/30 text-[8px] text-red-500 rounded border border-red-900/50">{p}</button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Ô trống để chuyển tổ */}
                      {desk.length === 1 && (
                        <div 
                          onClick={() => handleEmptySpotClick(teamId)}
                          className={`flex-1 border-2 border-dashed rounded-md flex items-center justify-center transition-all
                            ${movingStudentId !== null ? 'bg-teal-900/20 border-teal-500 cursor-pointer animate-pulse' : 'border-gray-800 opacity-20'}
                          `}
                        >
                          {movingStudentId && <span className="text-[8px] text-teal-400 font-bold">TỚI ĐÂY</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentList;
