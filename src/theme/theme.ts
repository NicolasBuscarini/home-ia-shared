export const THEMES = [
  {
    id: 'forest',
    colorScheme: 'dark',
    preview: { background: '#101615', panel: '#18211f', accent: '#8ce0b4', text: '#f1f5f2' },
  },
  {
    id: 'graphite',
    colorScheme: 'dark',
    preview: { background: '#17191d', panel: '#22252a', accent: '#c4c9d2', text: '#f3f4f6' },
  },
  {
    id: 'ocean',
    colorScheme: 'dark',
    preview: { background: '#101a29', panel: '#18263a', accent: '#8ecbff', text: '#f0f6ff' },
  },
  {
    id: 'light',
    colorScheme: 'light',
    preview: { background: '#f3f5f2', panel: '#ffffff', accent: '#276b49', text: '#202822' },
  },
  {
    id: 'lavender',
    colorScheme: 'dark',
    preview: { background: '#191526', panel: '#252039', accent: '#c7a9ff', text: '#f5f0ff' },
  },
  {
    id: 'sunset',
    colorScheme: 'dark',
    preview: { background: '#251719', panel: '#382326', accent: '#ff9a86', text: '#fff2ee' },
  },
  {
    id: 'amber',
    colorScheme: 'dark',
    preview: { background: '#211b12', panel: '#33291a', accent: '#f4c56e', text: '#fff8e8' },
  },
  {
    id: 'rose',
    colorScheme: 'dark',
    preview: { background: '#23151e', panel: '#35202d', accent: '#ff9bc5', text: '#fff1f7' },
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export const THEME_STYLES = [
  {
    id: 'classic',
    preview: { label: 'Aa', radius: '0.75rem', background: '#18211f', accent: '#8ce0b4' },
  },
  {
    id: 'modern',
    preview: { label: 'Aa', radius: '1.15rem', background: '#101a29', accent: '#8ecbff' },
  },
  {
    id: 'rustic',
    preview: { label: 'Aa', radius: '0.3rem', background: '#211b12', accent: '#f4c56e' },
  },
  {
    id: 'corporate',
    preview: { label: 'Aa', radius: '0.35rem', background: '#0f1b2d', accent: '#5aa9ff' },
  },
  {
    id: 'minimal',
    preview: { label: 'Aa', radius: '0.5rem', background: '#f4f4f2', accent: '#2f3437' },
  },
] as const;

export type ThemeStyleId = (typeof THEME_STYLES)[number]['id'];

export const DEFAULT_THEME: ThemeId = 'forest';
export const DEFAULT_THEME_STYLE: ThemeStyleId = 'classic';
const STORAGE_KEY = 'garage-watch.theme.v1';
const STYLE_STORAGE_KEY = 'garage-watch.theme-style.v1';

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function readSavedTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isThemeId(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
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

export function applyThemeStyle(styleId: ThemeStyleId): void {
  const style = THEME_STYLES.find((candidate) => candidate.id === styleId) ?? THEME_STYLES[0];
  document.documentElement.dataset.themeStyle = style.id;
  try {
    window.localStorage.setItem(STYLE_STORAGE_KEY, style.id);
  } catch {
    // O estilo ainda funciona nesta página quando armazenamento local está bloqueado.
  }
}

export function applyTheme(themeId: ThemeId): void {
  const theme = THEMES.find((candidate) => candidate.id === themeId) ?? THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  document.documentElement.dataset.bsTheme = theme.colorScheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.preview.background);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme.id);
  } catch {
    // Tema ainda funciona nesta página quando armazenamento local está bloqueado.
  }
}
