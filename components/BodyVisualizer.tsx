import React from 'react';

interface BodyVisualizerProps {
  currentWeight: number;
  startWeight: number;
}

export const BodyVisualizer: React.FC<BodyVisualizerProps> = ({ currentWeight, startWeight }) => {
  // Calculate a scale factor based on weight difference.
  // Base scale is 1. For every 1kg difference, adjust width slightly.
  // Example: 88.5 -> 1.0. 98.5 -> 1.1. 78.5 -> 0.9.
  const diff = currentWeight - startWeight;
  const scaleX = 1 + (diff * 0.015); 
  
  // Limit scale to avoid breaking the SVG too much
  const clampedScale = Math.max(0.7, Math.min(1.5, scaleX));

  return (
    <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-rose-50 to-white rounded-2xl border border-rose-100 shadow-inner">
      <div className="relative w-40 h-64 flex items-center justify-center transition-all duration-700 ease-in-out">
        <svg
          viewBox="0 0 100 200"
          className="h-full w-full drop-shadow-xl transition-all duration-1000"
          style={{ transform: `scaleX(${clampedScale})` }}
        >
          {/* Simple Male Silhouette */}
          <path
            d="M50,10 C40,10 35,18 35,28 C35,38 40,45 50,45 C60,45 65,38 65,28 C65,18 60,10 50,10 Z 
               M50,48 C35,48 20,60 20,80 L20,120 C20,130 25,135 30,135 L35,135 L35,190 C35,195 40,200 45,200 L55,200 C60,200 65,195 65,190 L65,135 L70,135 C75,135 80,130 80,120 L80,80 C80,60 65,48 50,48 Z"
            fill="#FDA4AF" // Rose-300
            stroke="#E11D48" // Rose-600
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Belt/Measure Tape Visual */}
        <div className="absolute top-[42%] w-full flex justify-center">
            <div 
                className="h-1 bg-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${60 * clampedScale}px` }}
            />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-rose-600 tabular-nums">
          {currentWeight.toFixed(1)} <span className="text-sm font-normal text-rose-400">kg</span>
        </p>
        <p className={`text-sm font-medium ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
           {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg desde el inicio
        </p>
      </div>
    </div>
  );
};