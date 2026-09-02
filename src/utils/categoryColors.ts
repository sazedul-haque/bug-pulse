// Map categories to distinct, persistent harmonious colors

export interface CategoryColorStyle {
  badge: string;
  dot: string;
  chartColor: string;
  chartHoverColor: string;
}

const CATEGORY_MAP: Record<string, CategoryColorStyle> = {
  'Monetization & Payments': {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
    chartColor: 'rgba(16, 185, 129, 0.85)',
    chartHoverColor: 'rgba(16, 185, 129, 1)',
  },
  'Quizzes & Grading': {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dot: 'bg-blue-500',
    chartColor: 'rgba(59, 130, 246, 0.85)',
    chartHoverColor: 'rgba(59, 130, 246, 1)',
  },
  'Video & Media Player': {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    dot: 'bg-purple-500',
    chartColor: 'rgba(168, 85, 247, 0.85)',
    chartHoverColor: 'rgba(168, 85, 247, 1)',
  },
  'Course Progression & Drip': {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
    chartColor: 'rgba(245, 158, 11, 0.85)',
    chartHoverColor: 'rgba(245, 158, 11, 1)',
  },
  'General & Other': {
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-500',
    chartColor: 'rgba(100, 116, 139, 0.85)',
    chartHoverColor: 'rgba(100, 116, 139, 1)',
  },
  'Integrations & Addons': {
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-500',
    chartColor: 'rgba(99, 102, 241, 0.85)',
    chartHoverColor: 'rgba(99, 102, 241, 1)',
  },
  'Email Notifications': {
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    dot: 'bg-cyan-500',
    chartColor: 'rgba(6, 182, 212, 0.85)',
    chartHoverColor: 'rgba(6, 182, 212, 1)',
  },
  'Translations & i18n': {
    badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    dot: 'bg-pink-500',
    chartColor: 'rgba(236, 72, 153, 0.85)',
    chartHoverColor: 'rgba(236, 72, 153, 1)',
  },
  'Dashboard & UI/UX': {
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    dot: 'bg-teal-500',
    chartColor: 'rgba(20, 184, 166, 0.85)',
    chartHoverColor: 'rgba(20, 184, 166, 1)',
  },
  'Certificates & Badges': {
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    dot: 'bg-orange-500',
    chartColor: 'rgba(249, 115, 22, 0.85)',
    chartHoverColor: 'rgba(249, 115, 22, 1)',
  },
  'Security & Auth': {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dot: 'bg-rose-500',
    chartColor: 'rgba(244, 63, 94, 0.85)',
    chartHoverColor: 'rgba(244, 63, 94, 1)',
  },
};

// Fallback palette generator for any new/custom categories
const FALLBACK_STYLES: CategoryColorStyle[] = [
  {
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    dot: 'bg-violet-500',
    chartColor: 'rgba(139, 92, 246, 0.85)',
    chartHoverColor: 'rgba(139, 92, 246, 1)',
  },
  {
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
    chartColor: 'rgba(14, 165, 233, 0.85)',
    chartHoverColor: 'rgba(14, 165, 233, 1)',
  },
  {
    badge: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    dot: 'bg-lime-500',
    chartColor: 'rgba(132, 204, 22, 0.85)',
    chartHoverColor: 'rgba(132, 204, 22, 1)',
  },
  {
    badge: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    dot: 'bg-fuchsia-500',
    chartColor: 'rgba(217, 70, 239, 0.85)',
    chartHoverColor: 'rgba(217, 70, 239, 1)',
  },
];

export const getCategoryStyle = (category: string): CategoryColorStyle => {
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  // Hash string to pick a deterministic fallback
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % FALLBACK_STYLES.length;
  return FALLBACK_STYLES[idx];
};
