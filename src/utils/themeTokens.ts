export type Palette = 'haze' | 'ocean' | 'carbon' | 'violet';

export interface ChartColors {
  primaryBar: string;
  primaryBarHover: string;
  gridColor: string;
  tickColor: string;
  donutBorder: string;
  donutColors: string[];
}

export const PALETTES: { id: Palette; name: string; iconColor: string; description: string }[] = [
  {
    id: 'ocean',
    name: 'Deep Ocean Blue (Default)',
    iconColor: '#06b6d4',
    description: 'Obsidian navy with cyan accents',
  },
  {
    id: 'haze',
    name: 'Mint Emerald (Haze)',
    iconColor: '#00dc82',
    description: 'Dark slate-navy with vibrant mint emerald',
  },
  {
    id: 'carbon',
    name: 'Amber & Carbon',
    iconColor: '#f59e0b',
    description: 'Charcoal with warm amber accents',
  },
  {
    id: 'violet',
    name: 'Electric Violet',
    iconColor: '#a855f7',
    description: 'Dark plum with electric violet',
  },
];

export const getChartPalette = (palette: Palette, isDark: boolean): ChartColors => {
  switch (palette) {
    case 'ocean':
      return {
        primaryBar: isDark ? 'rgba(6, 182, 212, 0.85)' : 'rgba(2, 132, 199, 0.80)',
        primaryBarHover: isDark ? 'rgba(34, 211, 238, 1)' : 'rgba(3, 105, 161, 1)',
        gridColor: isDark ? 'rgba(19, 34, 56, 0.8)' : 'rgba(225, 236, 246, 0.8)',
        tickColor: isDark ? '#8ec8f2' : '#334e68',
        donutBorder: isDark ? '#091120' : '#ffffff',
        donutColors: ['#10b981', '#f59e0b', '#06b6d4', '#38bdf8', '#64748b'],
      };
    case 'carbon':
      return {
        primaryBar: isDark ? 'rgba(245, 158, 11, 0.85)' : 'rgba(217, 119, 6, 0.80)',
        primaryBarHover: isDark ? 'rgba(251, 191, 36, 1)' : 'rgba(180, 83, 9, 1)',
        gridColor: isDark ? 'rgba(44, 40, 36, 0.8)' : 'rgba(232, 223, 213, 0.8)',
        tickColor: isDark ? '#d6d3d1' : '#44403c',
        donutBorder: isDark ? '#181614' : '#ffffff',
        donutColors: ['#10b981', '#f59e0b', '#06b6d4', '#d97706', '#78716c'],
      };
    case 'violet':
      return {
        primaryBar: isDark ? 'rgba(168, 85, 247, 0.85)' : 'rgba(124, 58, 237, 0.80)',
        primaryBarHover: isDark ? 'rgba(192, 132, 252, 1)' : 'rgba(109, 40, 217, 1)',
        gridColor: isDark ? 'rgba(35, 25, 60, 0.8)' : 'rgba(228, 221, 250, 0.8)',
        tickColor: isDark ? '#b9a8d9' : '#4c3a70',
        donutBorder: isDark ? '#130d22' : '#ffffff',
        donutColors: ['#10b981', '#f59e0b', '#a855f7', '#38bdf8', '#796898'],
      };
    case 'haze':
    default:
      return {
        primaryBar: isDark ? 'rgba(0, 220, 130, 0.85)' : 'rgba(5, 150, 105, 0.80)',
        primaryBarHover: isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(4, 120, 87, 1)',
        gridColor: isDark ? 'rgba(34, 48, 73, 0.8)' : 'rgba(226, 232, 240, 0.8)',
        tickColor: isDark ? '#8da2ba' : '#475569',
        donutBorder: isDark ? '#162032' : '#ffffff',
        donutColors: ['#00dc82', '#f59e0b', '#0ea5e9', '#6366f1', '#64748b'],
      };
  }
};
