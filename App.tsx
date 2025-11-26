import React, { useState, useEffect, useMemo } from 'react';
import { ItemType, TodoItem, Priority, WeightEntry, ExerciseSet } from './types';
import { INITIAL_ITEMS, APPLAUSE_SOUND_URL, VAMOS_SOUND_URL, PRESET_EXERCISES, PIG_SOUND_URL, WEIGHT_LOSS_SOUND_URL, ORBE_SOUND_URL, INITIAL_WEIGHT_VAL } from './constants';
import { TaskItem } from './components/TaskItem';
import { AIModal } from './components/AIModal';
import { EditTaskModal } from './components/EditTaskModal';
import { EditWeightModal } from './components/EditWeightModal';
import { BodyVisualizer } from './components/BodyVisualizer';
import { WeightChart } from './components/WeightChart';
import { 
  Layout, 
  Calendar as CalendarIcon, 
  Target, 
  Plus, 
  Sparkles, 
  Trophy,
  Dumbbell,
  Briefcase,
  Scale,
  TrendingUp,
  Trash2,
  Edit2,
  Hammer
} from 'lucide-react';

const App: React.FC = () => {
  // --- State Management ---
  const [items, setItems] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('daystream_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [newItemText, setNewItemText] = useState('');
  
  // Exercise State
  const [exerciseSetsCount, setExerciseSetsCount] = useState<string>('');
  const [currentSetData, setCurrentSetData] = useState<{weight: string, reps: string}[]>([]);
  
  // Weight Control State
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem('daystream_weight_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Add ID if missing for old data
      return parsed.map((entry: any) => ({
        ...entry,
        id: entry.id || crypto.randomUUID()
      }));
    }
    // Initialize with start weight if history is empty
    return [{ id: 'init-1', date: Date.now(), weight: INITIAL_WEIGHT_VAL }];
  });

  // Calculate current weight based on the latest history entry
  const currentWeight = useMemo(() => {
    if (weightHistory.length === 0) return INITIAL_WEIGHT_VAL;
    // Sort by date descending
    const sorted = [...weightHistory].sort((a, b) => b.date - a.date);
    return sorted[0].weight;
  }, [weightHistory]);

  const [weightInput, setWeightInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<ItemType>(ItemType.DAILY_TASK);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  
  // Weight Editing State
  const [editingWeightEntry, setEditingWeightEntry] = useState<WeightEntry | null>(null);

  useEffect(() => {
    localStorage.setItem('daystream_items', JSON.stringify(items));
  }, [items]);
  
  useEffect(() => {
    localStorage.setItem('daystream_weight_history', JSON.stringify(weightHistory));
  }, [weightHistory]);

  // Update set data inputs when count changes
  useEffect(() => {
    const count = parseInt(exerciseSetsCount) || 0;
    if (count > 0 && count < 20) {
      setCurrentSetData(prev => {
        const newData = [...prev];
        if (count > prev.length) {
          // Add new rows
          for (let i = prev.length; i < count; i++) {
            // Copy previous set values if available for convenience
            const lastSet = i > 0 ? newData[i-1] : { weight: '', reps: '' };
            newData.push({ ...lastSet });
          }
        } else {
          // Trim rows
          return newData.slice(0, count);
        }
        return newData;
      });
    } else if (count === 0) {
      setCurrentSetData([]);
    }
  }, [exerciseSetsCount]);

  // --- Helpers ---
  const playSound = (type: ItemType) => {
    let url = APPLAUSE_SOUND_URL;
    let volume = 0.6;
    let cutoff = 0;

    if (type === ItemType.EXERCISE) {
        url = WEIGHT_LOSS_SOUND_URL; // Shared sound as per previous request
        volume = 1.0;
        cutoff = 10000; // 10s limit
    } else if (type === ItemType.WORK || type === ItemType.HOME_REPAIR) {
        url = ORBE_SOUND_URL;
        volume = 1.0;
        // No specific cutoff needed for Orbe sound as it's likely a short SFX
    }
    
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.error("Error playing sound:", e));

    if (cutoff > 0) {
      setTimeout(() => {
        try {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        } catch (e) {
          // Ignore error if audio is already paused/stopped
        }
      }, cutoff);
    }
  };

  const playWeightSound = (isLoss: boolean) => {
    const url = isLoss ? WEIGHT_LOSS_SOUND_URL : PIG_SOUND_URL;
    const audio = new Audio(url);
    audio.volume = 1.0;
    
    // Play sound on user interaction
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio playback failed:", error);
      });
    }

    // Safety cutoff for weight loss audio (10 seconds)
    if (isLoss) {
      setTimeout(() => {
        try {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        } catch (e) {
          // Ignore error if audio is already paused/stopped
        }
      }, 10000);
    }
  };

  // --- Handlers ---
  const handleToggle = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = !item.isCompleted;
        if (newStatus) {
          playSound(item.type);
        }
        return { ...item, isCompleted: newStatus };
      }
      return item;
    }));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEdit = (item: TodoItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedItem: TodoItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    let exerciseSets: ExerciseSet[] = [];
    if (activeTab === ItemType.EXERCISE) {
      exerciseSets = currentSetData.map(d => ({
        id: crypto.randomUUID(),
        weight: Number(d.weight) || 0,
        reps: Number(d.reps) || 0
      }));
    }

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      title: newItemText,
      isCompleted: false,
      type: activeTab,
      createdAt: Date.now(),
      priority: Priority.MEDIUM,
      // For summary display, we might still populate the legacy fields with averages or totals if needed,
      // but let's rely on detailedSets.
      sets: activeTab === ItemType.EXERCISE ? Number(exerciseSetsCount) : undefined,
      detailedSets: activeTab === ItemType.EXERCISE ? exerciseSets : undefined,
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemText('');
    setExerciseSetsCount('');
    setCurrentSetData([]);
  };

  const handleAddAITasks = (tasks: string[]) => {
    const newItems: TodoItem[] = tasks.map(task => ({
      id: crypto.randomUUID(),
      title: task,
      isCompleted: false,
      type: ItemType.DAILY_TASK,
      createdAt: Date.now(),
      priority: Priority.MEDIUM
    }));
    setItems(prev => [...newItems, ...prev]);
  };

  const handleUpdateWeight = () => {
    // Replace comma with dot for international support
    const normalizedInput = weightInput.replace(',', '.');
    const newW = parseFloat(normalizedInput);
    
    if (!isNaN(newW) && newW > 0) {
      // Logic for sound
      if (newW < currentWeight) {
        // Weight Loss - Success Sound
        playWeightSound(true); 
      } else if (newW > currentWeight) {
        // Weight Gain - Pig Sound
        playWeightSound(false); 
      }
      
      // Update History with new ID
      setWeightHistory(prev => {
        return [...prev, { id: crypto.randomUUID(), date: Date.now(), weight: newW }];
      });

      setWeightInput('');
    }
  };

  // Weight History Actions
  const handleDeleteWeightEntry = (id: string) => {
    // Allowed to delete even the last entry to clear history
    if (window.confirm("¿Seguro que quieres eliminar este registro?")) {
      setWeightHistory(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSaveWeightEdit = (updatedEntry: WeightEntry) => {
    setWeightHistory(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    setEditingWeightEntry(null);
  };

  const handleSetDataChange = (index: number, field: 'weight' | 'reps', value: string) => {
    setCurrentSetData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // --- Derived State ---
  const dailyTasks = useMemo(() => 
    items.filter(i => i.type === ItemType.DAILY_TASK), 
  [items]);
  
  const longTermGoals = useMemo(() => 
    items.filter(i => i.type === ItemType.LONG_TERM_GOAL), 
  [items]);

  const exercises = useMemo(() => 
    items.filter(i => i.type === ItemType.EXERCISE), 
  [items]);

  const workTasks = useMemo(() => 
    items.filter(i => i.type === ItemType.WORK), 
  [items]);

  const weightTasks = useMemo(() => 
    items.filter(i => i.type === ItemType.WEIGHT), 
  [items]);

  const homeRepairTasks = useMemo(() => 
    items.filter(i => i.type === ItemType.HOME_REPAIR), 
  [items]);

  // Calculate total volume (Tonaje) lifted
  const totalKgLifted = useMemo(() => {
    return items
      .filter(i => i.type === ItemType.EXERCISE && i.isCompleted)
      .reduce((acc, curr) => {
         // New logic: sum of all sets
         if (curr.detailedSets && curr.detailedSets.length > 0) {
           const setsVolume = curr.detailedSets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
           return acc + setsVolume;
         }
         // Fallback legacy logic
         const w = curr.weight || 0;
         const r = curr.reps || 1;
         const s = curr.sets || 1;
         return acc + (w * r * s);
      }, 0);
  }, [items]);

  const totalDaily = dailyTasks.length + exercises.length + workTasks.length + weightTasks.length + homeRepairTasks.length;
  const completedDailyTotal = dailyTasks.filter(i => i.isCompleted).length 
                              + exercises.filter(i => i.isCompleted).length
                              + workTasks.filter(i => i.isCompleted).length
                              + weightTasks.filter(i => i.isCompleted).length
                              + homeRepairTasks.filter(i => i.isCompleted).length;
  const completedGoals = longTermGoals.filter(i => i.isCompleted).length;

  const getProgress = (total: number, completed: number) => {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const getInputPlaceholder = () => {
    switch (activeTab) {
      case ItemType.EXERCISE: return "Ejercicio...";
      case ItemType.WORK: return "¿Qué pendiente laboral tienes?";
      case ItemType.HOME_REPAIR: return "¿Qué arreglo necesita tu casa?";
      case ItemType.WEIGHT: return "Nuevo objetivo de salud (ej: Sin azúcar)...";
      case ItemType.LONG_TERM_GOAL: return "¿Cuál es tu visión a largo plazo?";
      default: return "¿Qué objetivo tienes para hoy?";
    }
  };

  // Sorted history for list view
  const sortedHistory = useMemo(() => {
    return [...weightHistory].sort((a, b) => b.date - a.date);
  }, [weightHistory]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">DayStream</h1>
          </div>
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Asistente IA</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Actividad Diaria</p>
                <h2 className="text-3xl font-bold mt-1 text-gray-900">{completedDailyTotal}/{totalDaily}</h2>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-indigo-100 flex items-center justify-center relative">
                <span className="text-sm font-bold text-indigo-600">{getProgress(totalDaily, completedDailyTotal)}%</span>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent rotate-45" style={{opacity: getProgress(totalDaily, completedDailyTotal) ? 1 : 0}}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Metas Cumplidas</p>
                <h2 className="text-3xl font-bold mt-1 text-gray-900">{completedGoals}/{longTermGoals.length}</h2>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
        </div>

        {/* Input Section */}
        <div className="mb-10 max-w-4xl mx-auto">
            <form onSubmit={handleAddItem} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex flex-col gap-3">
                {activeTab === ItemType.EXERCISE ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-3">
                       <div className="col-span-8 md:col-span-8">
                          <input 
                             list="exercises-list"
                             type="text"
                             value={newItemText}
                             onChange={(e) => setNewItemText(e.target.value)}
                             placeholder={getInputPlaceholder()}
                             className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                          />
                          <datalist id="exercises-list">
                            {PRESET_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                          </datalist>
                       </div>
                       <div className="col-span-4 md:col-span-4">
                          <input
                            type="number"
                            value={exerciseSetsCount}
                            onChange={(e) => setExerciseSetsCount(e.target.value)}
                            placeholder="Series?"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-400 transition-all text-center"
                          />
                       </div>
                    </div>
                    
                    {/* Dynamic Set Inputs */}
                    {currentSetData.length > 0 && (
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-fade-in">
                        <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-bold text-orange-800 uppercase text-center">
                          <div className="col-span-2">Serie</div>
                          <div className="col-span-5">Peso (KG)</div>
                          <div className="col-span-5">Reps</div>
                        </div>
                        {currentSetData.map((data, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                             <div className="col-span-2 flex items-center justify-center font-bold text-orange-600">
                               {idx + 1}
                             </div>
                             <div className="col-span-5">
                               <input
                                  type="number"
                                  placeholder="0"
                                  value={data.weight}
                                  onChange={(e) => handleSetDataChange(idx, 'weight', e.target.value)}
                                  className="w-full p-2 text-center border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                               />
                             </div>
                             <div className="col-span-5">
                               <input
                                  type="number"
                                  placeholder="0"
                                  value={data.reps}
                                  onChange={(e) => handleSetDataChange(idx, 'reps', e.target.value)}
                                  className="w-full p-2 text-center border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                               />
                             </div>
                          </div>
                        ))}
                      </div>
                    )}

                     <button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center py-3 transition-colors shadow-lg shadow-orange-200"
                    >
                      <Plus className="w-6 h-6 mr-2" /> Agregar Ejercicio
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder={getInputPlaceholder()}
                      className={`w-full p-4 pl-6 pr-16 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-2 transition-all outline-none ${activeTab === ItemType.WORK ? 'focus:ring-sky-500' : activeTab === ItemType.WEIGHT ? 'focus:ring-rose-500' : activeTab === ItemType.HOME_REPAIR ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'}`}
                    />
                    <button 
                      type="submit" 
                      className={`absolute right-2 top-2 bottom-2 px-4 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg ${activeTab === ItemType.WORK ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' : activeTab === ItemType.WEIGHT ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : activeTab === ItemType.HOME_REPAIR ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                )}
                
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                  <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.DAILY_TASK)}
                    className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.DAILY_TASK ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    Objetivos Diarios
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.WORK)}
                    className={`whitespace-nowrap flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.WORK ? 'bg-sky-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Trabajo
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.HOME_REPAIR)}
                    className={`whitespace-nowrap flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.HOME_REPAIR ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Hammer className="w-4 h-4" />
                    Casa
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.EXERCISE)}
                    className={`whitespace-nowrap flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.EXERCISE ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Dumbbell className="w-4 h-4" />
                    Ejercicios
                  </button>
                   <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.WEIGHT)}
                    className={`whitespace-nowrap flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.WEIGHT ? 'bg-rose-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Scale className="w-4 h-4" />
                    Control de Peso
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab(ItemType.LONG_TERM_GOAL)}
                    className={`whitespace-nowrap text-sm font-medium px-4 py-2 rounded-full transition-colors ${activeTab === ItemType.LONG_TERM_GOAL ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    Objetivos a Largo Plazo
                  </button>
                </div>
              </div>
            </form>
        </div>

        {/* Content Columns */}
        <div className={`grid gap-6 ${activeTab === ItemType.EXERCISE || activeTab === ItemType.WORK || activeTab === ItemType.WEIGHT || activeTab === ItemType.HOME_REPAIR ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          
          {/* Daily Tasks Column */}
          {(activeTab === ItemType.DAILY_TASK || activeTab === ItemType.LONG_TERM_GOAL) && (
             <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4 bg-gray-100 p-3 rounded-lg w-fit">
                 <CalendarIcon className="w-5 h-5 text-gray-600" />
                 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Hoy</h3>
               </div>
               
               {dailyTasks.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                   <p className="text-gray-400 text-sm">Sin tareas diarias.</p>
                 </div>
               ) : (
                 dailyTasks.map(item => (
                   <TaskItem 
                     key={item.id} 
                     item={item} 
                     onToggle={handleToggle} 
                     onDelete={handleDelete}
                     onEdit={handleEdit}
                   />
                 ))
               )}
             </div>
          )}

          {/* Work Column */}
          {activeTab === ItemType.WORK && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4 bg-sky-50 p-3 rounded-lg w-fit">
                 <Briefcase className="w-5 h-5 text-sky-600" />
                 <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wide">Trabajo</h3>
               </div>
               
               {workTasks.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-sky-200">
                   <p className="text-gray-400 text-sm">Añade tareas laborales.</p>
                 </div>
               ) : (
                 workTasks.map(item => (
                   <TaskItem 
                     key={item.id} 
                     item={item} 
                     onToggle={handleToggle} 
                     onDelete={handleDelete}
                     onEdit={handleEdit}
                   />
                 ))
               )}
            </div>
          )}

          {/* Home Repair Column */}
          {activeTab === ItemType.HOME_REPAIR && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4 bg-purple-50 p-3 rounded-lg w-fit">
                 <Hammer className="w-5 h-5 text-purple-600" />
                 <h3 className="text-sm font-bold text-purple-800 uppercase tracking-wide">Arreglos de Casa</h3>
               </div>
               
               {homeRepairTasks.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-purple-200">
                   <p className="text-gray-400 text-sm">¿Qué necesitas reparar o mejorar en casa?</p>
                 </div>
               ) : (
                 homeRepairTasks.map(item => (
                   <TaskItem 
                     key={item.id} 
                     item={item} 
                     onToggle={handleToggle} 
                     onDelete={handleDelete}
                     onEdit={handleEdit}
                   />
                 ))
               )}
            </div>
          )}

           {/* Weight Column */}
          {activeTab === ItemType.WEIGHT && (
            <div className="space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Scale className="w-6 h-6 text-rose-500" />
                      <h3 className="text-lg font-bold text-gray-800">Visualizador Corporal</h3>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        inputMode="decimal"
                        placeholder="Nuevo peso..."
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <button 
                        onClick={handleUpdateWeight}
                        disabled={!weightInput}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>
                  
                  <BodyVisualizer currentWeight={currentWeight} startWeight={INITIAL_WEIGHT_VAL} />
                  
                  <WeightChart data={weightHistory} />

                  {/* Weight History Table */}
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Registro Detallado</h4>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Peso</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortedHistory.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(entry.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {entry.weight} kg
                              </td>
                              <td className="px-4 py-3 text-right flex justify-end gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setEditingWeightEntry(entry)}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteWeightEntry(entry.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-2">Objetivos de Salud</h3>
                 {weightTasks.length === 0 ? (
                   <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-rose-200">
                     <p className="text-gray-400 text-sm">Añade objetivos (ej: Comer sano)</p>
                   </div>
                 ) : (
                   weightTasks.map(item => (
                     <TaskItem 
                       key={item.id} 
                       item={item} 
                       onToggle={handleToggle} 
                       onDelete={handleDelete}
                       onEdit={handleEdit}
                   />
                 ))
                 )}
               </div>
            </div>
          )}

          {/* Exercises Column */}
          {activeTab === ItemType.EXERCISE && (
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg w-fit">
                   <Dumbbell className="w-5 h-5 text-orange-500" />
                   <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">Entrenamiento</h3>
                 </div>
                 
                 {/* Cumulative Volume Stat */}
                 <div className="flex flex-col items-end pr-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Volumen Histórico
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-gray-800 tabular-nums">
                        {totalKgLifted.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-orange-500">KG</span>
                    </div>
                 </div>
               </div>
               
               {exercises.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-orange-200">
                   <p className="text-gray-400 text-sm">Añade tus ejercicios.</p>
                 </div>
               ) : (
                 exercises.map(item => (
                   <TaskItem 
                     key={item.id} 
                     item={item} 
                     onToggle={handleToggle} 
                     onDelete={handleDelete}
                     onEdit={handleEdit}
                   />
                 ))
               )}
             </div>
          )}

          {/* Goals Column */}
          {(activeTab === ItemType.DAILY_TASK || activeTab === ItemType.LONG_TERM_GOAL) && (
            <div className="space-y-4 md:col-span-1 xl:col-span-1">
              <div className="flex items-center gap-2 mb-4 bg-indigo-50 p-3 rounded-lg w-fit">
                <Target className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide">Largo Plazo</h3>
              </div>

              {longTermGoals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-indigo-200">
                  <p className="text-gray-400 text-sm">Define tu visión.</p>
                </div>
              ) : (
                longTermGoals.map(item => (
                  <TaskItem 
                    key={item.id} 
                    item={item} 
                    onToggle={handleToggle} 
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        onAddTasks={handleAddAITasks}
      />
      
      <EditTaskModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSave={handleSaveEdit}
      />

      <EditWeightModal 
        isOpen={!!editingWeightEntry}
        onClose={() => setEditingWeightEntry(null)}
        entry={editingWeightEntry}
        onSave={handleSaveWeightEdit}
      />

    </div>
  );
};

export default App;