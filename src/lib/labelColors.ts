// Label color definitions used across the app
export const LABEL_COLOR_OPTIONS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'blue', 'indigo', 'purple',
  'pink', 'rose',
] as const;

export type LabelColor = typeof LABEL_COLOR_OPTIONS[number];

// Maps color key to tailwind classes for badge display
export const labelColorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  red:     { bg: 'bg-red-500',     text: 'text-white', hover: 'hover:bg-red-600' },
  orange:  { bg: 'bg-orange-500',  text: 'text-white', hover: 'hover:bg-orange-600' },
  amber:   { bg: 'bg-amber-500',   text: 'text-white', hover: 'hover:bg-amber-600' },
  yellow:  { bg: 'bg-yellow-400',  text: 'text-yellow-900', hover: 'hover:bg-yellow-500' },
  lime:    { bg: 'bg-lime-500',    text: 'text-white', hover: 'hover:bg-lime-600' },
  green:   { bg: 'bg-green-500',   text: 'text-white', hover: 'hover:bg-green-600' },
  emerald: { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-600' },
  teal:    { bg: 'bg-teal-500',    text: 'text-white', hover: 'hover:bg-teal-600' },
  cyan:    { bg: 'bg-cyan-500',    text: 'text-white', hover: 'hover:bg-cyan-600' },
  blue:    { bg: 'bg-blue-500',    text: 'text-white', hover: 'hover:bg-blue-600' },
  indigo:  { bg: 'bg-indigo-500',  text: 'text-white', hover: 'hover:bg-indigo-600' },
  purple:  { bg: 'bg-purple-500',  text: 'text-white', hover: 'hover:bg-purple-600' },
  pink:    { bg: 'bg-pink-500',    text: 'text-white', hover: 'hover:bg-pink-600' },
  rose:    { bg: 'bg-rose-500',    text: 'text-white', hover: 'hover:bg-rose-600' },
};

// Swatch for color picker (smaller, lighter)
export const labelSwatchClasses: Record<string, string> = {
  red:     'bg-red-500',
  orange:  'bg-orange-500',
  amber:   'bg-amber-500',
  yellow:  'bg-yellow-400',
  lime:    'bg-lime-500',
  green:   'bg-green-500',
  emerald: 'bg-emerald-500',
  teal:    'bg-teal-500',
  cyan:    'bg-cyan-500',
  blue:    'bg-blue-500',
  indigo:  'bg-indigo-500',
  purple:  'bg-purple-500',
  pink:    'bg-pink-500',
  rose:    'bg-rose-500',
};

export function getLabelClasses(color: string): string {
  const c = labelColorClasses[color] || labelColorClasses.blue;
  return `${c.bg} ${c.text} ${c.hover}`;
}

export const DEFAULT_LABELS: Array<{ name: string; color: string }> = [
  { name: 'Urgente', color: 'red' },
  { name: 'Bug', color: 'orange' },
  { name: 'Feature', color: 'blue' },
  { name: 'Melhoria', color: 'green' },
  { name: 'Documentação', color: 'purple' },
  { name: 'Design', color: 'pink' },
];
