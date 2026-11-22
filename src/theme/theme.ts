import { type ColorMode, type ColorProfile, derivePalette, isHexColor } from './palette.js';

export type { ColorMode, ColorProfile } from './palette.js';

/**
 * Cores primárias de partida (presets). Cada uma corresponde a uma antiga paleta do eixo de cor;
 * hoje são apenas atalhos que preenchem o painel RGB com uma cor primária + modo, e o sistema
 * deriva o restante da paleta automaticamente.
 */
export const THEME_PRESETS = [
  { id: 'forest', mode: 'dark', primary: '#8ce0b4' },
  { id: 'graphite', mode: 'dark', primary: '#c4c9d2' },
  { id: 'ocean', mode: 'dark', primary: '#8ecbff' },
  { id: 'light', mode: 'light', primary: '#276b49' },
  { id: 'lavender', mode: 'dark', primary: '#c7a9ff' },
  { id: 'sunset', mode: 'dark', primary: '#ff9a86' },
  { id: 'amber', mode: 'dark', primary: '#f4c56e' },
  { id: 'rose', mode: 'dark', primary: '#ff9bc5' },
] as const;

export type ThemeId = (typeof THEME_PRESETS)[number]['id'];

export interface ThemeColor {
  primary: string;
  mode: ColorMode;
}

export const THEME_STYLES = [
  {
    id: 'classic',
    colorProfile: 'balanced',
    preview: {
      label: 'Aa',
      radius: '0.7rem',
      borderWidth: '1px',
      fontWeight: 700,
      letterSpacing: '0em',
      fontFamily: 'var(--font-ui)',
      background: '#18211f',
      accent: '#8ce0b4',
    },
  },
  {
    id: 'modern',
    colorProfile: 'balanced',
    preview: {
      label: 'Aa',
      radius: '999px',
      borderWidth: '1px',
      fontWeight: 640,
      letterSpacing: '-0.02em',
      fontFamily: 'var(--font-ui)',
      background: '#101a29',
      accent: '#8ecbff',
    },
  },
  {
    id: 'rustic',
    colorProfile: 'balanced',
    preview: {
      label: 'Aa',
      radius: '0.3rem',
      borderWidth: '2px',
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: 'Georgia, "Times New Roman", serif',
      background: '#211b12',
      accent: '#f4c56e',
    },
  },
  {
    id: 'corporate',
    colorProfile: 'balanced',
    preview: {
      label: 'Aa',
      radius: '0.15rem',
      borderWidth: '2px',
      fontWeight: 750,
      letterSpacing: '0.06em',
      fontFamily: 'var(--font-ui)',
      background: '#0f1b2d',
      accent: '#5aa9ff',
    },
  },
  {
    id: 'minimal',
    colorProfile: 'balanced',
    preview: {
      label: 'Aa',
      radius: '0px',
      borderWidth: '1px',
      fontWeight: 500,
      letterSpacing: '0.01em',
      fontFamily: 'var(--font-ui)',
      background: '#f4f4f2',
      accent: '#2f3437',
    },
  },
  {
    id: 'frutiger-aero',
    colorProfile: 'pastel',
    preview: {
      label: 'Aa',
      radius: '1.1rem',
      borderWidth: '1px',
      fontWeight: 640,
      letterSpacing: '0em',
      fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
      background: '#bfe3f4',
      accent: '#2f9fe0',
    },
  },
  {
    id: 'neo-brutalism',
    colorProfile: 'contrast',
    preview: {
      label: 'Aa',
      radius: '0px',
      borderWidth: '2px',
      fontWeight: 800,
      letterSpacing: '0.04em',
      fontFamily: 'var(--font-ui)',
      background: '#f4e04d',
      accent: '#161616',
    },
  },
  {
    id: 'glassmorphism',
    colorProfile: 'pastel',
    preview: {
      label: 'Aa',
      radius: '1rem',
      borderWidth: '1px',
      fontWeight: 620,
      letterSpacing: '0em',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      background: '#cfe3f2',
      accent: '#7fb4d8',
    },
  },
  {
    id: 'neumorphism',
    colorProfile: 'pastel',
    preview: {
      label: 'Aa',
      radius: '0.9rem',
      borderWidth: '1px',
      fontWeight: 620,
      letterSpacing: '0em',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      background: '#e6e8ec',
      accent: '#9aa3b0',
    },
  },
  {
    id: 'retro-pixel',
    colorProfile: 'contrast',
    preview: {
      label: 'Aa',
      radius: '0px',
      borderWidth: '2px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      fontFamily: '"Courier New", monospace',
      background: '#2c2c54',
      accent: '#f4d35e',
    },
  },
  {
    id: 'claymorphism',
    colorProfile: 'pastel',
    preview: {
      label: 'Aa',
      radius: '1.4rem',
      borderWidth: '1px',
      fontWeight: 680,
      letterSpacing: '0em',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      background: '#f2c6de',
      accent: '#e07aa0',
    },
  },
] as const;

export type ThemeStyleId = (typeof THEME_STYLES)[number]['id'];

export const DEFAULT_THEME_COLOR: ThemeColor = { primary: '#8ce0b4', mode: 'dark' };
export const DEFAULT_THEME_STYLE: ThemeStyleId = 'classic';

const COLOR_STORAGE_KEY = 'garage-watch.color.v1';
const STYLE_STORAGE_KEY = 'garage-watch.theme-style.v1';

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_PRESETS.some((preset) => preset.id === value);
}

export function presetColor(themeId: string): ThemeColor | undefined {
  const preset = THEME_PRESETS.find((candidate) => candidate.id === themeId);
  return preset ? { primary: preset.primary, mode: preset.mode } : undefined;
}

export function presetForColor(color: ThemeColor): ThemeId | undefined {
  const normalized = color.primary.toLowerCase();
  const match = THEME_PRESETS.find(
    (preset) => preset.primary.toLowerCase() === normalized && preset.mode === color.mode,
  );
  return match?.id;
}

export function colorProfileForStyle(styleId: ThemeStyleId): ColorProfile {
  const style = THEME_STYLES.find((candidate) => candidate.id === styleId);
  return style?.colorProfile ?? 'balanced';
}

export function readSavedColor(): ThemeColor {
  try {
    const raw = window.localStorage.getItem(COLOR_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_COLOR;
    const parsed = JSON.parse(raw) as Partial<ThemeColor>;
    if (
      typeof parsed.primary === 'string' &&
      isHexColor(parsed.primary) &&
      (parsed.mode === 'dark' || parsed.mode === 'light')
    ) {
      return { primary: parsed.primary, mode: parsed.mode };
    }
    return DEFAULT_THEME_COLOR;
  } catch {
    return DEFAULT_THEME_COLOR;
  }
}

export function hasSavedColor(): boolean {
  try {
    return window.localStorage.getItem(COLOR_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function isThemeStyleId(value: unknown): value is ThemeStyleId {
  return THEME_STYLES.some((style) => style.id === value);
}

export function readSavedThemeStyle(): ThemeStyleId {
  try {
    const saved = window.localStorage.getItem(STYLE_STORAGE_KEY);
    return isThemeStyleId(saved) ? saved : DEFAULT_THEME_STYLE;
  } catch {
    return DEFAULT_THEME_STYLE;
  }
}

export function applyAppearance(color: ThemeColor, styleId: ThemeStyleId): void {
  const style = THEME_STYLES.find((candidate) => candidate.id === styleId) ?? THEME_STYLES[0];
  const { variables, colorScheme } = derivePalette(color.primary, color.mode, style.colorProfile);
  const root = document.documentElement;
  root.dataset.themeStyle = style.id;
  root.dataset.bsTheme = colorScheme;
  root.style.colorScheme = colorScheme;
  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', variables['--app-bg'] ?? color.primary);
  try {
    window.localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(color));
    window.localStorage.setItem(STYLE_STORAGE_KEY, style.id);
  } catch {
    // A aparência ainda se aplica nesta página quando o armazenamento local está bloqueado.
  }
}
