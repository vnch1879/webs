import React from 'react';
import { Mountain } from 'lucide-react';

interface AraucariaForestProps {
  treeCount: number;
  totalTasks: number;
}

const AraucariaTree = ({ delay }: { delay: number }) => (
  <svg 
    viewBox="0 0 100 160" 
    className="w-12 h-20 md:w-16 md:h-24 animate-bounce-in origin-bottom drop-shadow-lg transition-all duration-700"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Trunk */}
    <path 
      d="M45,160 L55,160 L52,60 L48,60 Z" 
      fill="#5D4037" 
    />
    {/* Branches (Umbrella shape typical of Araucaria) */}
    <path 
      d="M20,70 Q50,90 80,70 L90,55 Q50,75 10,55 Z" 
      fill="#1B5E20" 
    />
    <path 
      d="M25,55 Q50,75 75,55 L85,40 Q50,60 15,40 Z" 
      fill="#2E7D32" 
    />
    <path 
      d="M30,40 Q50,60 70,40 L80,25 Q50,45 20,25 Z" 
      fill="#388E3C" 
    />
    <path 
      d="M35,25 Q50,40 65,25 L50,0 L35,25 Z" 
      fill="#4CAF50" 
    />
  </svg>
);

export const AraucariaForest: React.FC<AraucariaForestProps> = ({ treeCount, totalTasks }) => {
  const isAllCompleted = totalTasks > 0 && treeCount === totalTasks;

  return (
    <div className="w-full bg-gradient-to-b from-sky-200 to-sky-100 rounded-2xl overflow-hidden shadow-inner border border-sky-200 relative mb-6 min-h-[180px] transition-all duration-1000">
      
      {/* Sun (Appears when all tasks are done) */}
      <div 
        className={`absolute top-4 right-8 w-16 h-16 bg-yellow-400 rounded-full blur-sm transition-all duration-1000 transform ${isAllCompleted ? 'opacity-100 scale-110 translate-y-0' : 'opacity-0 translate-y-10 scale-50'}`} 
      />
      <div 
        className={`absolute top-4 right-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg transition-all duration-1000 transform ${isAllCompleted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 translate-y-10 scale-50'}`} 
      />

      {/* Background Mountains */}
      <div className="absolute bottom-0 left-0 w-full flex items-end opacity-30 text-emerald-900 pointer-events-none">
         <Mountain className="w-32 h-32 transform -translate-x-10 translate-y-10 fill-current" />
         <Mountain className="w-48 h-48 transform translate-x-20 translate-y-16 fill-current" />
         <Mountain className="w-40 h-40 transform translate-x-40 translate-y-12 fill-current" />
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-4 bg-emerald-600/80 backdrop-blur-sm z-10" />
      <div className="absolute bottom-2 w-full h-8 bg-emerald-500/60 rounded-[50%] scale-125 z-0" />

      {/* Trees Container */}
      <div className="absolute bottom-2 w-full flex items-end justify-center px-4 gap-2 z-20 flex-wrap-reverse h-full content-end pb-1">
        {treeCount === 0 && totalTasks > 0 && (
          <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sky-700/50 text-sm font-medium animate-pulse">
            Completa ejercicios para plantar tu bosque...
          </p>
        )}
        
        {Array.from({ length: treeCount }).map((_, index) => (
          <div key={index} className="relative -ml-4 first:ml-0 hover:z-30 hover:scale-110 transition-transform cursor-help" title="¡Objetivo cumplido!">
            <AraucariaTree delay={index * 100} />
          </div>
        ))}
      </div>
    </div>
  );
};