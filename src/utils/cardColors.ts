export interface CardColorPalette {
  id: string;
  name: string;
  background: string;
  text: string;
  border: string;
  hoverBorder: string;
  draggingBorder: string;
  editingBorder: string;
  placeholder: string;
  charCounterNormal: string;
  charCounterWarning: string;
  shadowPrimary: string;
  shadowSecondary: string;
}

export const cardColorPalettes: CardColorPalette[] = [
  {
    id: 'red',
    name: 'Red',
    background: 'bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
    hoverBorder: 'hover:border-red-400',
    draggingBorder: 'border-red-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-red-700',
    charCounterNormal: 'text-red-800',
    charCounterWarning: 'text-red-900',
    shadowPrimary: 'rgba(239, 68, 68, 0.2)',
    shadowSecondary: 'rgba(220, 38, 38, 0.4)',
  },
  {
    id: 'orange',
    name: 'Orange',
    background: 'bg-orange-200',
    text: 'text-orange-900',
    border: 'border-orange-300',
    hoverBorder: 'hover:border-orange-400',
    draggingBorder: 'border-orange-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-orange-700',
    charCounterNormal: 'text-orange-800',
    charCounterWarning: 'text-orange-900',
    shadowPrimary: 'rgba(251, 146, 60, 0.2)',
    shadowSecondary: 'rgba(234, 88, 12, 0.4)',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    background: 'bg-yellow-200',
    text: 'text-yellow-900',
    border: 'border-yellow-300',
    hoverBorder: 'hover:border-yellow-400',
    draggingBorder: 'border-yellow-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-yellow-700',
    charCounterNormal: 'text-yellow-800',
    charCounterWarning: 'text-yellow-900',
    shadowPrimary: 'rgba(251, 191, 36, 0.2)',
    shadowSecondary: 'rgba(217, 119, 6, 0.4)',
  },
  {
    id: 'green',
    name: 'Green',
    background: 'bg-green-200',
    text: 'text-green-900',
    border: 'border-green-300',
    hoverBorder: 'hover:border-green-400',
    draggingBorder: 'border-green-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-green-700',
    charCounterNormal: 'text-green-800',
    charCounterWarning: 'text-green-900',
    shadowPrimary: 'rgba(34, 197, 94, 0.2)',
    shadowSecondary: 'rgba(22, 163, 74, 0.4)',
  },
  {
    id: 'blue',
    name: 'Blue',
    background: 'bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
    hoverBorder: 'hover:border-blue-400',
    draggingBorder: 'border-blue-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-blue-700',
    charCounterNormal: 'text-blue-800',
    charCounterWarning: 'text-blue-900',
    shadowPrimary: 'rgba(59, 130, 246, 0.2)',
    shadowSecondary: 'rgba(37, 99, 235, 0.4)',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    background: 'bg-indigo-200',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    hoverBorder: 'hover:border-indigo-400',
    draggingBorder: 'border-indigo-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-indigo-700',
    charCounterNormal: 'text-indigo-800',
    charCounterWarning: 'text-indigo-900',
    shadowPrimary: 'rgba(99, 102, 241, 0.2)',
    shadowSecondary: 'rgba(79, 70, 229, 0.4)',
  },
  {
    id: 'violet',
    name: 'Violet',
    background: 'bg-violet-200',
    text: 'text-violet-900',
    border: 'border-violet-300',
    hoverBorder: 'hover:border-violet-400',
    draggingBorder: 'border-violet-600',
    editingBorder: 'border-blue-500',
    placeholder: 'placeholder-violet-700',
    charCounterNormal: 'text-violet-800',
    charCounterWarning: 'text-violet-900',
    shadowPrimary: 'rgba(139, 92, 246, 0.2)',
    shadowSecondary: 'rgba(124, 58, 237, 0.4)',
  },
];

export const getColorPaletteById = (id: string): CardColorPalette => {
  return cardColorPalettes.find(palette => palette.id === id) || cardColorPalettes[2]; // Default to yellow
};