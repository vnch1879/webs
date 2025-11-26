import React, { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { generateBreakdown } from '../services/geminiService';
import { AIPlanResponse } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: string[]) => void;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onAddTasks }) => {
  const [goalInput, setGoalInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIPlanResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goalInput.trim()) return;
    setIsLoading(true);
    const response = await generateBreakdown(goalInput);
    setResult(response);
    setIsLoading(false);
  };

  const handleAccept = () => {
    if (result) {
      onAddTasks(result.tasks);
      onClose();
      setResult(null);
      setGoalInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold">Asistente IA</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            Dime tu gran objetivo y crearé un plan diario para ti.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {!result ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                ¿Qué quieres lograr a largo plazo?
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-32"
                placeholder="Ej: Correr un maratón, Aprender un nuevo idioma, Escribir un libro..."
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !goalInput.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Pensando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generar Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-800 font-medium text-center italic">
                  "{result.motivation}"
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Tareas sugeridas:</h3>
                <ul className="space-y-2">
                  {result.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 p-2 bg-gray-50 rounded-lg">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Atrás
                </button>
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Añadir a mi día
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};