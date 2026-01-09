
import React from 'react';
import type { Student } from '../types';

interface LeaderboardProps {
  title: string;
  icon: string;
  students: Student[];
  rankColors: string[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ title, icon, students, rankColors }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-2xl font-bold text-center mb-4 text-teal-300">
        <i className={`${icon} mr-2`}></i>
        {title}
      </h2>
      <div className="space-y-3">
        {students.length > 0 ? (
          students.map((student, index) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                rankColors[index] || 'bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-gray-900 mr-4 ${
                    index < 3 ? 'text-lg' : ''
                  } ${rankColors[index] || 'bg-gray-500'}`}
                >
                  {index + 1}
                </span>
                <span className="font-semibold text-white">{student.name}</span>
              </div>
              <span className="font-bold text-lg text-yellow-300">{student.score}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">Chưa có dữ liệu xếp hạng.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
