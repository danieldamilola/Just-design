import { getOpenDesignHost } from '@open-design/host';
import type { AppTheme } from '../types';

const ACCENT_VARS = [
  '--accent',
  '--accent-strong',
  '--accent-soft',
  '--accent-tint',
  '--accent-hover',
] as const;

export const DEFAULT_ACCENT_COLOR = '#353535';
export const ACCENT_SWATCHES = [
  DEFAULT_ACCENT_COLOR,
  '#202020',
  '#848484',
  '#87ea5c',
  '#0d5400',
  '#1A74FF',
  '#FFBA12',
  '#FF7528',
  '#F04142',
] as const;

export function normalizeAccentColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : null;
}

export function resolveAccentColor(value: unknown): string {
  return normalizeAccentColor(value) ?? DEFAULT_ACCENT_COLOR;
}

function accentVars(accentColor: string): Record<(typeof ACCENT_VARS)[number], string> {
  return {
    '--accent': accentColor,
    // Keep these mix ratios in sync with the pre-hydration script in app/layout.tsx.
    '--accent-strong': `color-mix(in srgb, ${accentColor} 82%, var(--text-strong))`,
    '--accent-soft': `color-mix(in srgb, ${accentColor} 12%, var(--bg-subtle))`,
    '--accent-tint': `color-mix(in srgb, ${accentColor} 6%, var(--bg-panel))`,
    '--accent-hover': `color-mix(in srgb, ${accentColor} 86%, var(--text-strong))`,
  };
}

export function resolveAppTheme(persisted?: AppTheme | null): AppTheme {
  return persisted || 'system';
}

// Browser-chrome colors. Keep in sync with the pre-hydration script in
// app/layout.tsx; the dark value matches `--bg-app` in tokens.css.
export const THEME_COLOR_LIGHT = '#f7f7f7';
export const THEME_COLOR_DARK = '#202020';

function applyThemeColor(resolvedTheme: AppTheme): void {
  let color: string;
  if (resolvedTheme === 'dark') {
    color = THEME_COLOR_DARK;
  } else if (resolvedTheme === 'light') {
    color = THEME_COLOR_LIGHT;
  } else {
    color = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? THEME_COLOR_DARK
      : THEME_COLOR_LIGHT;
  }
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

export function applyAppearanceToDocument({
  accentColor,
  theme,
}: {
  accentColor?: string;
  theme?: AppTheme;
}): void {
  const root = document.documentElement;
  const resolvedTheme = resolveAppTheme(theme);

  if (resolvedTheme === 'system') {
    root.removeAttribute('data-theme');
    getOpenDesignHost()?.appearance?.setTheme('system');
  } else {
    root.setAttribute('data-theme', resolvedTheme);
    getOpenDesignHost()?.appearance?.setTheme(resolvedTheme);
  }

  applyThemeColor(resolvedTheme);

  const normalized = resolveAccentColor(accentColor);
  const vars = accentVars(normalized);
  for (const name of ACCENT_VARS) {
    root.style.setProperty(name, vars[name]);
  }
}
