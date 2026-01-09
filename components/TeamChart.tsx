
import React, { useMemo } from 'react';

interface TeamChartProps {
  teamTotals: { [key: number]: number };
  isOpen: boolean;
  onToggle: () => void;
}

const TeamChart: React.FC<TeamChartProps> = ({ teamTotals, isOpen, onToggle }) => {
  const teams = [1, 2, 3, 4];
  
  // Tính toán các thông số cho biểu đồ SVG
  const chartData = useMemo(() => {
    const values = teams.map(t => teamTotals[t] || 0);
    const min = Math.min(0, ...values);
    const max = Math.max(10, ...values);
    const range = max - min;
    
    // Padding cho biểu đồ
    const padding = 40;
    const width = 600;
    const height = 200;
    
    // Chuyển đổi điểm số thành tọa độ Y
    const getY = (val: number) => height - padding - ((val - min) / (range || 1)) * (height - 2 * padding);
    // Chuyển đổi số tổ thành tọa độ X
    const getX = (index: number) => padding + (index * (width - 2 * padding)) / (teams.length - 1);

    const points = teams.map((_, i) => ({
      x: getX(i),
      y: getY(values[i]),
      val: values[i]
    }));

    // Tạo đường dẫn (path) cho diện tích (Area)
    const areaPath = `
      M ${points[0].x} ${height - padding}
      ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}
      L ${points[points.length - 1].x} ${height - padding}
      Z
    `;

    // Tạo đường dẫn cho nét vẽ (Line)
    const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    return { width, height, points, areaPath, linePath, padding, min, max };
  }, [teamTotals]);

  return (
    <div className={`bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl backdrop-blur-md ${isOpen ? 'max-h-[400px] mb-8' : 'max-h-12 mb-4'}`}>
      <button 
        onClick={onToggle}
        className="w-full h-12 px-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <i className={`fas fa-chart-area text-indigo-400 transition-transform duration-500 ${isOpen ? 'rotate-0' : 'rotate-12'}`}></i>
          <span className="font-bold text-sm uppercase tracking-widest text-indigo-100">Thống Kê Tổng Điểm Các Tổ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-3 mr-4">
            {teams.map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  t === 1 ? 'bg-blue-400' : t === 2 ? 'bg-purple-400' : t === 3 ? 'bg-yellow-400' : 'bg-pink-400'
                }`}></div>
                <span className="text-[10px] text-gray-400 font-bold">T{t}: {teamTotals[t] || 0}đ</span>
              </div>
            ))}
          </div>
          <i className={`fas fa-chevron-down text-xs text-gray-500 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}></i>
        </div>
      </button>

      <div className={`p-6 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-full aspect-[3/1] max-h-[250px]">
          <svg 
            viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
            className="w-full h-full drop-shadow-2xl"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Đường kẻ trục ngang */}
            <line x1={chartData.padding} y1={chartData.height - chartData.padding} x2={chartData.width - chartData.padding} y2={chartData.height - chartData.padding} stroke="#374151" strokeWidth="1" />
            
            {/* Vẽ vùng diện tích */}
            <path d={chartData.areaPath} fill="url(#areaGradient)" className="transition-all duration-700 ease-in-out" />
            
            {/* Vẽ đường line chính */}
            <path d={chartData.linePath} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-in-out" />
            
            {/* Các điểm nút và nhãn */}
            {chartData.points.map((p, i) => (
              <g key={i} className="group/point">
                <circle 
                  cx={p.x} cy={p.y} r="5" 
                  fill={i === 0 ? '#60a5fa' : i === 1 ? '#c084fc' : i === 2 ? '#fbbf24' : '#f472b6'} 
                  className="transition-all duration-500 hover:r-7"
                />
                <text 
                  x={p.x} y={chartData.height - 10} 
                  textAnchor="middle" 
                  className="fill-gray-500 text-[12px] font-bold"
                >
                  Tổ {i + 1}
                </text>
                <text 
                  x={p.x} y={p.y - 12} 
                  textAnchor="middle" 
                  className="fill-white text-[14px] font-black"
                >
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TeamChart;
