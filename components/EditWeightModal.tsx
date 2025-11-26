import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { Save, X, Calendar, Scale } from 'lucide-react';

interface EditWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: WeightEntry | null;
  onSave: (updatedEntry: WeightEntry) => void;
}

export const EditWeightModal: React.FC<EditWeightModalProps> = ({ isOpen, onClose, entry, onSave }) => {
  const [weight, setWeight] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    if (entry) {
      setWeight(entry.weight.toString());
      // Format date for datetime-local input
      const d = new Date(entry.date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setDateStr(d.toISOString().slice(0, 16));
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !dateStr) return;

    const newDate = new Date(dateStr).getTime();
    
    onSave({
      ...entry,
      weight: parseFloat(weight),
      date: newDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="bg-rose-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold flex items-center gap-2">
            Editar Registro de Peso
          </h2>
          <button onClick={onClose} className="text-rose-100 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <Scale className="w-3 h-3" /> Peso (KG)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Fecha y Hora
            </label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
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