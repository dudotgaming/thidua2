
import React, { useState } from 'react';
import type { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onScoreChange: (studentId: number, amount: number) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onScoreChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter global list first based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by teams
  const teams = [1, 2, 3, 4];

  // Button configs
  const positivePoints = [1, 2, 3, 5];
  const negativePoints = [-1, -2, -3, -4, -5];

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-indigo-300 whitespace-nowrap">
          <i className="fas fa-chalkboard-user mr-2"></i>
          Sơ Đồ Lớp
        </h2>
        <input
          type="text"
          placeholder="Tìm kiếm học sinh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {teams.map((teamId) => {
          // Get students for this team
          const teamStudents = filteredStudents.filter(s => s.team === teamId);
          
          // Chunk into pairs (desks)
          const desks = [];
          for (let i = 0; i < teamStudents.length; i += 2) {
            desks.push(teamStudents.slice(i, i + 2));
          }

          return (
            <div key={teamId} className="bg-gray-900 rounded-lg p-2 border border-gray-700">
              <h3 className="text-lg font-bold text-center text-teal-400 mb-3 border-b border-gray-700 pb-2">
                Tổ {teamId} <span className="text-xs font-normal text-gray-500">({teamStudents.length})</span>
              </h3>
              
              <div className="space-y-3">
                {desks.length > 0 ? (
                  desks.map((desk, deskIndex) => (
                    <div key={deskIndex} className="bg-gray-800 p-2 rounded border border-gray-600 relative pt-5">
                       {/* Visual Desk Label */}
                       <div className="absolute top-0 left-0 right-0 h-4 bg-gray-700 rounded-t flex items-center justify-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bàn {deskIndex + 1}</span>
                       </div>
                       
                       {/* Side-by-side Layout */}
                       <div className="flex flex-row gap-2 mt-1">
                          {desk.map((student) => (
                            <div key={student.id} className="flex-1 flex flex-col min-w-0 bg-gray-900/50 rounded p-1.5 border border-gray-700/50">
                                {/* Header: Name & Score */}
                                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                                    <span 
                                      className="font-bold text-xs text-white truncate max-w-[70px] sm:max-w-[80px]" 
                                      title={student.name}
                                    >
                                        {student.name}
                                    </span>
                                    <span className={`text-sm font-bold ${student.score >= 0 ? 'text-yellow-300' : 'text-red-400'}`}>
                                        {student.score}
                                    </span>
                                </div>

                                {/* Positive Buttons */}
                                <div className="grid grid-cols-4 gap-1 mb-1">
                                  {positivePoints.map(p => (
                                    <button
                                      key={`plus-${p}`}
                                      onClick={() => onScoreChange(student.id, p)}
                                      className="h-6 flex items-center justify-center rounded bg-green-900/40 hover:bg-green-600 text-[10px] text-green-400 hover:text-white border border-green-800 transition-colors"
                                    >
                                      +{p}
                                    </button>
                                  ))}
                                </div>

                                {/* Negative Buttons */}
                                <div className="grid grid-cols-5 gap-1">
                                  {negativePoints.map(p => (
                                    <button
                                      key={`minus-${p}`}
                                      onClick={() => onScoreChange(student.id, p)}
                                      className="h-6 flex items-center justify-center rounded bg-red-900/40 hover:bg-red-600 text-[10px] text-red-400 hover:text-white border border-red-800 transition-colors"
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                            </div>
                          ))}
                          {/* Filler for odd number of students */}
                          {desk.length === 1 && (
                            <div className="flex-1 bg-transparent rounded p-1.5 border border-dashed border-gray-800 flex items-center justify-center">
                              <span className="text-gray-600 text-xs">Trống</span>
                            </div>
                          )}
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4 text-xs">Trống</p>
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
