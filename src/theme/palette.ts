/**
 * Derivação da paleta a partir de uma cor primária + modo (dark/light) + perfil de cor do estilo.
 *
 * Este módulo é puro (sem DOM/storage) para ser testável e determinístico. O shell aplica o
 * resultado como custom properties inline em `<html>`, sobre os valores de fallback de `:root`.
 */

export type ColorMode = 'dark' | 'light';
export type ColorProfile = 'pastel' | 'contrast' | 'balanced';

export interface PaletteVariables {
  '--app-bg': string;
  '--panel-bg': string;
  '--panel-border': string;
  '--text-primary': string;
  '--text-muted': string;
  '--accent': string;
  '--accent-strong': string;
  '--accent-rgb': string;
  '--danger': string;
  '--field-bg': string;
  '--toolbar-bg': string;
  '--toolbar-button': string;
  '--tab-selected-text': string;
  '--live-text': string;
  '--live-bg': string;
  '--live-border': string;
  '--live-dot': string;
}

export interface DerivedPalette {
  colorScheme: ColorMode;
  variables: PaletteVariables;
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_RE.test(value);
}

export function normalizeHex(input: string): string {
  const hex = input.trim().replace(/^#/, '');
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }
  return `#${hex}`.toLowerCase();
}

export function hexToRgb(input: string): [number, number, number] {
  const hex = normalizeHex(input).slice(1);
  if (hex.length !== 6) throw new Error(`Invalid hex color: ${input}`);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb: [number, number, number];
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [(rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255];
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function relativeLuminance(input: string): number {
  const [red, green, blue] = hexToRgb(input);
  const linearize = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = linearize(red);
  const g = linearize(green);
  const b = linearize(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function derivePalette(primary: string, mode: ColorMode, profile: ColorProfile): DerivedPalette {
  const [r, g, b] = hexToRgb(primary);
  const { h, s, l } = rgbToHsl(r, g, b);

  const accentSat =
    profile === 'pastel'
      ? clamp(s * 0.55, 15, 70)
      : profile === 'contrast'
        ? clamp(s + 25, 60, 100)
        : clamp(s, 8, 100);

  const bgSat = profile === 'contrast' ? 20 : profile === 'pastel' ? 8 : 13;
  const appBg = mode === 'dark' ? hslToHex(h, bgSat, 11) : hslToHex(h, bgSat, 96);
  const panelBg = mode === 'dark' ? hslToHex(h, bgSat, 15) : hslToHex(h, bgSat, 99);
  const panelBorder = mode === 'dark' ? hslToHex(h, 10, 30) : hslToHex(h, 10, 84);
  const fieldBg = mode === 'dark' ? hslToHex(h, bgSat, 13) : '#ffffff';
  const toolbarBg = mode === 'dark' ? hslToHex(h, bgSat, 12) : hslToHex(h, bgSat, 95);
  const toolbarButton = mode === 'dark' ? hslToHex(h, 12, 22) : hslToHex(h, 10, 88);

  const textPrimary = mode === 'dark' ? hslToHex(h, 10, 96) : hslToHex(h, 16, 12);
  const textMuted = mode === 'dark' ? hslToHex(h, 10, 72) : hslToHex(h, 10, 42);
  const tabSelectedText = mode === 'dark' ? '#10160f' : '#ffffff';
  let accentL = mode === 'dark' ? clamp(l, 56, 84) : clamp(l, 26, 50);
  let accent = hslToHex(h, accentSat, accentL);
  // Arbitrary RGB (especially blue in dark mode and yellow in light mode) must
  // remain readable as links AND as the fill of selected/hovered controls.
  for (let step = 0; step < 100; step++) {
    if (
      contrastRatio(accent, toolbarBg) >= 5 &&
      contrastRatio(accent, panelBg) >= 5 &&
      contrastRatio(accent, tabSelectedText) >= 4.5
    )
      break;
    accentL = clamp(accentL + (mode === 'dark' ? 1 : -1), 0, 100);
    accent = hslToHex(h, accentSat, accentL);
  }
  const accentStrong = hslToHex(
    h,
    accentSat,
    mode === 'dark' ? clamp(accentL + 10, 0, 96) : clamp(accentL - 10, 0, 100),
  );

  const danger = mode === 'dark' ? hslToHex(8, 82, 74) : hslToHex(8, 66, 40);

  const live =
    mode === 'dark'
      ? {
          text: hslToHex(8, 60, 88),
          bg: hslToHex(8, 45, 22),
          border: hslToHex(8, 40, 42),
          dot: hslToHex(8, 90, 62),
        }
      : {
          text: hslToHex(8, 70, 28),
          bg: hslToHex(8, 80, 92),
          border: hslToHex(8, 45, 72),
          dot: hslToHex(8, 75, 46),
        };

  const [ar, ag, ab] = hexToRgb(accent);

  return {
    colorScheme: mode,
    variables: {
      '--app-bg': appBg,
      '--panel-bg': panelBg,
      '--panel-border': panelBorder,
      '--text-primary': textPrimary,
      '--text-muted': textMuted,
      '--accent': accent,
      '--accent-strong': accentStrong,
      '--accent-rgb': `${ar}, ${ag}, ${ab}`,
      '--danger': danger,
      '--field-bg': fieldBg,
      '--toolbar-bg': toolbarBg,
      '--toolbar-button': toolbarButton,
      '--tab-selected-text': tabSelectedText,
      '--live-text': live.text,
      '--live-bg': live.bg,
      '--live-border': live.border,
      '--live-dot': live.dot,
    },
  };
}
