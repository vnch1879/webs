import React, { useState, useEffect } from 'react';
import { ItemType, TodoItem, ExerciseSet } from '../types';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { PRESET_EXERCISES } from '../constants';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TodoItem | null;
  onSave: (updatedItem: TodoItem) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Legacy or single fields
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');

  // Detailed sets
  const [detailedSets, setDetailedSets] = useState<ExerciseSet[]>([]);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setWeight(item.weight?.toString() || '');
      setReps(item.reps?.toString() || '');
      setSets(item.sets?.toString() || '');
      
      if (item.detailedSets) {
        setDetailedSets(item.detailedSets);
      } else if (item.type === ItemType.EXERCISE && item.sets) {
        // Convert legacy to detailed if editing for the first time
        const generatedSets: ExerciseSet[] = [];
        for(let i=0; i< item.sets; i++) {
            generatedSets.push({
                id: crypto.randomUUID(),
                weight: item.weight || 0,
                reps: item.reps || 0
            });
        }
        setDetailedSets(generatedSets);
      } else {
        setDetailedSets([]);
      }
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedItem: TodoItem = {
      ...item,
      title,
      description: description.trim() || undefined,
      // Update legacy fields based on first set or average? Let's just keep them sync with first set or blank
      weight: item.type === ItemType.EXERCISE && detailedSets.length > 0 ? detailedSets[0].weight : Number(weight),
      reps: item.type === ItemType.EXERCISE && detailedSets.length > 0 ? detailedSets[0].reps : Number(reps),
      sets: item.type === ItemType.EXERCISE ? detailedSets.length : Number(sets),
      detailedSets: item.type === ItemType.EXERCISE ? detailedSets : undefined
    };

    onSave(updatedItem);
    onClose();
  };

  const handleSetChange = (index: number, field: 'weight' | 'reps', value: string) => {
    setDetailedSets(prev => {
        const newSets = [...prev];
        newSets[index] = { ...newSets[index], [field]: Number(value) };
        return newSets;
    });
  };

  const addSet = () => {
    setDetailedSets(prev => [
        ...prev, 
        { 
            id: crypto.randomUUID(), 
            weight: prev.length > 0 ? prev[prev.length-1].weight : 0, 
            reps: prev.length > 0 ? prev[prev.length-1].reps : 0 
        }
    ]);
  };

  const removeSet = (index: number) => {
    setDetailedSets(prev => prev.filter((_, i) => i !== index));
  };

  const isExercise = item.type === ItemType.EXERCISE;
  const isWork = item.type === ItemType.WORK;
  const isHomeRepair = item.type === ItemType.HOME_REPAIR;

  const getTitle = () => {
    if (isExercise) return 'Editar Ejercicio';
    if (isWork) return 'Editar Trabajo';
    if (isHomeRepair) return 'Editar Arreglo de Casa';
    if (item.type === ItemType.LONG_TERM_GOAL) return 'Editar Objetivo';
    return 'Editar Tarea';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white flex-shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            {getTitle()}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            {isExercise ? (
               <>
                <input 
                   list="edit-exercises-list"
                   type="text"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <datalist id="edit-exercises-list">
                  {PRESET_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                </datalist>
               </>
            ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
            )}
          </div>

          {!isExercise && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />
            </div>
          )}

          {isExercise && (
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                   <label className="block text-sm font-bold text-gray-700">Series Detalladas</label>
                   <button 
                    type="button" 
                    onClick={addSet}
                    className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100"
                   >
                       <Plus className="w-3 h-3" /> Agregar Serie
                   </button>
               </div>
               
               <div className="space-y-2">
                   {detailedSets.map((set, idx) => (
                       <div key={set.id || idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded-lg">
                           <div className="col-span-1 text-xs font-bold text-gray-400 text-center">#{idx+1}</div>
                           <div className="col-span-5">
                               <div className="relative">
                                   <input
                                      type="number"
                                      value={set.weight}
                                      onChange={(e) => handleSetChange(idx, 'weight', e.target.value)}
                                      className="w-full p-1 pl-2 pr-6 border border-gray-200 rounded text-sm"
                                      placeholder="KG"
                                   />
                                   <span className="absolute right-2 top-1.5 text-xs text-gray-400">kg</span>
                               </div>
                           </div>
                           <div className="col-span-4">
                               <div className="relative">
                                   <input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                                      className="w-full p-1 pl-2 pr-8 border border-gray-200 rounded text-sm"
                                      placeholder="Reps"
                                   />
                                   <span className="absolute right-2 top-1.5 text-xs text-gray-400">reps</span>
                               </div>
                           </div>
                           <div className="col-span-2 flex justify-center">
                               <button 
                                type="button" 
                                onClick={() => removeSet(idx)}
                                className="text-gray-400 hover:text-red-500"
                               >
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
               {detailedSets.length === 0 && (
                   <p className="text-xs text-gray-400 italic text-center py-2">Sin series definidas</p>
               )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};