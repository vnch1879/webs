import React from 'react';
import { ItemType, Priority, TodoItem } from '../types';
import { CheckCircle, Circle, Trash2, Dumbbell, Edit2, AlertTriangle, Briefcase, Scale, Hammer } from 'lucide-react';

interface TaskItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: TodoItem) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ item, onToggle, onDelete, onEdit }) => {
  const isGoal = item.type === ItemType.LONG_TERM_GOAL;
  const isExercise = item.type === ItemType.EXERCISE;
  const isWork = item.type === ItemType.WORK;
  const isWeight = item.type === ItemType.WEIGHT;
  const isHomeRepair = item.type === ItemType.HOME_REPAIR;

  // Calculate days passed since creation
  const daysOld = Math.floor((Date.now() - item.createdAt) / (1000 * 60 * 60 * 24));

  const getExerciseAgingClasses = () => {
    if (item.isCompleted) return "bg-emerald-100 border-emerald-300 shadow-none";
    
    if (daysOld >= 7) return "bg-gray-900 border-gray-900 shadow-md"; // Black Alert
    if (daysOld >= 5) return "bg-red-200 border-red-300"; // Intense Red
    if (daysOld >= 3) return "bg-red-50 border-red-200"; // Light Red
    
    return "bg-white border-gray-100 hover:border-indigo-200"; // Normal
  };

  const baseClasses = "group relative flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-500 ease-in-out shadow-sm hover:shadow-md";
  
  // Dynamic styles based on completion and type
  let statusClasses = item.isCompleted
    ? "bg-emerald-100 border-emerald-300 shadow-none" 
    : "bg-white border-gray-100 hover:border-indigo-200";

  // Override status classes for exercises aging logic
  if (isExercise) {
    statusClasses = getExerciseAgingClasses();
  }

  // Work specific styling override if not completed
  if (isWork && !item.isCompleted) {
    statusClasses = "bg-sky-50 border-sky-100 hover:border-sky-300";
  }

  // Weight specific styling
  if (isWeight && !item.isCompleted) {
    statusClasses = "bg-rose-50 border-rose-100 hover:border-rose-300";
  }

  // Home Repair specific styling
  if (isHomeRepair && !item.isCompleted) {
    statusClasses = "bg-purple-50 border-purple-100 hover:border-purple-300";
  }

  // Text color logic based on aging
  let textClasses = item.isCompleted
    ? "text-emerald-800 line-through opacity-70"
    : "text-gray-800";

  if (isExercise && !item.isCompleted && daysOld >= 7) {
    textClasses = "text-white";
  }

  const iconColorClass = () => {
    if (item.isCompleted) return 'text-emerald-600 fill-emerald-100';
    if (isExercise && daysOld >= 7) return 'text-red-500'; // Red circle on black background
    if (isGoal) return 'text-indigo-400';
    if (isExercise) return 'text-orange-400';
    if (isWork) return 'text-sky-500';
    if (isWeight) return 'text-rose-500';
    if (isHomeRepair) return 'text-purple-500';
    return 'text-gray-400';
  };

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <button
          onClick={() => onToggle(item.id)}
          className={`flex-shrink-0 transition-transform duration-300 ${item.isCompleted ? 'scale-110' : 'hover:scale-110'}`}
        >
          {item.isCompleted ? (
            <CheckCircle className={`w-6 h-6 ${iconColorClass()}`} />
          ) : (
            <Circle className={`w-6 h-6 ${iconColorClass()}`} />
          )}
        </button>

        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isGoal && (
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                Objetivo
              </span>
            )}
            {isWork && (
              <span className="text-[10px] font-bold tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Trabajo
              </span>
            )}
            {isWeight && (
              <span className="text-[10px] font-bold tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Scale className="w-3 h-3" /> Peso
              </span>
            )}
            {isHomeRepair && (
              <span className="text-[10px] font-bold tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Hammer className="w-3 h-3" /> Casa
              </span>
            )}
            {isExercise && (
              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${daysOld >= 7 && !item.isCompleted ? 'text-gray-900 bg-white' : 'text-orange-600 bg-orange-50'}`}>
                <Dumbbell className="w-3 h-3" /> 
                {daysOld >= 7 && !item.isCompleted ? 'CRÍTICO' : 'Ejercicio'}
              </span>
            )}
            {!isGoal && !isExercise && !isWork && !isWeight && !isHomeRepair && item.priority === Priority.HIGH && (
              <span className="text-[10px] font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                Urgente
              </span>
            )}
             {isExercise && !item.isCompleted && daysOld >= 3 && daysOld < 7 && (
              <span className="text-[10px] font-bold tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {daysOld} días
              </span>
            )}
          </div>
          
          <div className="flex flex-col pr-2 gap-y-1">
            <span className={`font-medium text-lg ${textClasses} transition-colors duration-300 truncate mr-2`}>
              {item.title}
            </span>
            
            {/* Exercise Stats */}
            {isExercise && (
              <div className="mt-2 w-full">
                {item.detailedSets && item.detailedSets.length > 0 ? (
                  <div className={`grid grid-cols-2 gap-1 text-xs ${item.isCompleted ? 'opacity-70' : ''}`}>
                    {item.detailedSets.map((set, idx) => (
                      <div key={idx} className={`px-2 py-1 rounded flex justify-between items-center ${daysOld >= 7 && !item.isCompleted ? 'bg-gray-800 text-gray-300' : 'bg-white/60 text-gray-600'}`}>
                        <span className="font-bold mr-1">#{idx+1}</span>
                        <span>{set.weight}kg × {set.reps}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                   /* Fallback for old items */
                   (item.weight || item.reps || item.sets) && (
                    <div className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap flex items-center gap-2 w-fit ${
                        item.isCompleted ? 'bg-emerald-200 text-emerald-800' 
                        : daysOld >= 7 ? 'bg-gray-700 text-gray-200' 
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {item.sets && (
                        <span className="flex items-center gap-1">
                          {item.sets} <span className={`text-[10px] font-normal uppercase opacity-70`}>series</span>
                        </span>
                      )}
                      {item.sets && (item.weight || item.reps) && (
                        <span className="opacity-30">|</span>
                      )}
                      <span className="flex items-center gap-1">
                         {item.weight ? <>{item.weight}kg</> : ''}
                         {item.weight && item.reps ? <span className="opacity-50">×</span> : ''}
                         {item.reps ? <>{item.reps} reps</> : ''}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {item.description && (
            <p className={`text-sm mt-1 truncate ${item.isCompleted ? 'text-emerald-700/60' : isExercise && daysOld >= 7 ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => onEdit(item)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black/5 rounded-full ${isExercise && daysOld >= 7 && !item.isCompleted ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-indigo-500'}`}
          aria-label="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(item.id)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black/5 rounded-full ${isExercise && daysOld >= 7 && !item.isCompleted ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-rose-500'}`}
          aria-label="Eliminar"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};