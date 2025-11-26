import { ItemType, Priority, TodoItem } from './types';

// Sound effect for completion (Applause/Cheer)
// Using Google Actions sound library for reliability
export const APPLAUSE_SOUND_URL = "https://actions.google.com/sounds/v1/crowds/applause_small.ogg";

// Sound for exercise completion (Updated to user request)
export const VAMOS_SOUND_URL = "https://impfox.webcindario.com/Audio-de-sr.mp3"; 

// Weight Control Sounds
// Pig sound (Grunting) for weight gain - Using Google Actions for reliability
export const PIG_SOUND_URL = "https://actions.google.com/sounds/v1/animals/pig_grunt.ogg";

// Custom Audio for weight loss
// Specific user provided audio
export const WEIGHT_LOSS_SOUND_URL = "https://impfox.webcindario.com/Audio-de-sr.mp3";

// New Sound for Work and Home Repair
export const ORBE_SOUND_URL = "https://impfox.webcindario.com/orbe.mp3";

export const INITIAL_WEIGHT_VAL = 88.5;

export const PRESET_EXERCISES = [
  "Press mancuernas",
  "Peso muerto",
  "Remo espalda",
  "Biceps con barra z"
];

export const INITIAL_ITEMS: TodoItem[] = [
  {
    id: '1',
    title: 'Aprender React Avanzado',
    description: 'Completar el curso de hooks y patrones de diseño.',
    isCompleted: false,
    type: ItemType.LONG_TERM_GOAL,
    createdAt: Date.now(),
    priority: Priority.HIGH
  },
  {
    id: '2',
    title: 'Beber 2 litros de agua',
    isCompleted: false,
    type: ItemType.DAILY_TASK,
    createdAt: Date.now(),
    priority: Priority.MEDIUM
  },
  {
    id: '3',
    title: 'Press mancuernas',
    isCompleted: false,
    type: ItemType.EXERCISE,
    createdAt: Date.now(),
    sets: 4,
    detailedSets: [
        { id: 's1', weight: 24, reps: 10 },
        { id: 's2', weight: 24, reps: 10 },
        { id: 's3', weight: 24, reps: 10 },
        { id: 's4', weight: 24, reps: 10 }
    ]
  }
];