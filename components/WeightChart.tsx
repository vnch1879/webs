import React from 'react';
import { WeightEntry } from '../types';

interface WeightChartProps {
  data: WeightEntry[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="mt-6 p-6 bg-white rounded-2xl border border-rose-100 flex items-center justify-center text-rose-400 text-sm italic">
        Añade más registros para ver tu evolución gráfica
      </div>
    );
  }

  // Sort by date to ensure correct line drawing
  const sortedData = [...data].sort((a, b) => a.date - b.date);

  // Chart Dimensions
  const width = 500;
  const height = 200;
  const paddingX = 20;
  const paddingY = 30;

  // Scales
  const minDate = sortedData[0].date;
  const maxDate = sortedData[sortedData.length - 1].date;
  const minWeight = Math.min(...sortedData.map(d => d.weight));
  const maxWeight = Math.max(...sortedData.map(d => d.weight));
  
  // Add buffer to weight limits so the line isn't strictly on the edge
  const weightBuffer = (maxWeight - minWeight) * 0.1 || 1; 
  const domainMinY = minWeight - weightBuffer;
  const domainMaxY = maxWeight + weightBuffer;

  const getX = (date: number) => {
    if (maxDate === minDate) return width / 2;
    return paddingX + ((date - minDate) / (maxDate - minDate)) * (width - 2 * paddingX);
  };

  const getY = (weight: number) => {
    // Invert Y because SVG 0 is top
    return height - (paddingY + ((weight - domainMinY) / (domainMaxY - domainMinY)) * (height - 2 * paddingY));
  };

  const points = sortedData.map(d => `${getX(d.date)},${getY(d.weight)}`).join(' ');
  
  // Create area path (line points + corners at bottom)
  const areaPath = `
    M ${getX(sortedData[0].date)},${height - paddingY} 
    L ${getX(sortedData[0].date)},${getY(sortedData[0].weight)} 
    ${sortedData.map(d => `L ${getX(d.date)},${getY(d.weight)}`).join(' ')} 
    L ${getX(sortedData[sortedData.length - 1].date)},${getY(sortedData[sortedData.length - 1].weight)}
    L ${getX(sortedData[sortedData.length - 1].date)},${height - paddingY} 
    Z
  `;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Historial de Peso</h3>
        <div className="flex gap-2 text-xs">
             <span className="font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
               Max: {maxWeight}kg
            </span>
            <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
               Min: {minWeight}kg
            </span>
        </div>
      </div>
      
      <div className="relative w-full aspect-[5/2]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          
          {/* Defs for gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines (Horizontal) */}
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#fecdd3" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#fecdd3" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />

          {/* Area under the line */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Main Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points */}
          {sortedData.map((d, i) => (
            <g key={i} className="group">
               <circle
                  cx={getX(d.date)}
                  cy={getY(d.weight)}
                  r="4"
                  className="fill-white stroke-rose-500 stroke-2 transition-all duration-300 group-hover:r-6 group-hover:fill-rose-500 cursor-pointer"
               />
               {/* Tooltip on hover */}
               <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <rect 
                    x={getX(d.date) - 30} 
                    y={getY(d.weight) - 35} 
                    width="60" 
                    height="24" 
                    rx="4" 
                    fill="#1f2937" 
                 />
                 <text 
                   x={getX(d.date)} 
                   y={getY(d.weight) - 19} 
                   textAnchor="middle" 
                   fill="white"
                   fontSize="12" 
                   fontWeight="bold"
                 >
                   {d.weight}kg
                 </text>
                 {/* Little triangle for tooltip */}
                 <path d={`M ${getX(d.date)} ${getY(d.weight)-11} L ${getX(d.date)-4} ${getY(d.weight)-11} L ${getX(d.date)} ${getY(d.weight)-6} L ${getX(d.date)+4} ${getY(d.weight)-11} Z`} fill="#1f2937"/>
               </g>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-1">
        <span>{new Date(minDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
        <span>{new Date(maxDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
};