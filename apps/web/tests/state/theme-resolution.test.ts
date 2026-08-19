// @vitest-environment jsdom
//
// The theme system is active: the default is `system` (follow the OS), and a
// persisted `light` / `dark` / `system` choice is honored by the config parser,
// the runtime appearance applier, and the pre-hydration inline script that
// paints before React mounts. These specs pin the invariant at all three
// places a persisted theme can reach the document, so the first paint matches
// the final theme (no light flash on load for dark-mode users) and the
// Settings Theme select keeps the document in sync.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyAppearanceToDocument } from '../../src/state/appearance';
import { DEFAULT_CONFIG, loadConfig } from '../../src/state/config';
import type { AppConfig } from '../../src/types';

const STORAGE_KEY = 'open-design:config';
const store = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    store.delete(key);
  }),
  clear: vi.fn(() => {
    store.clear();
  }),
});

function persist(config: Partial<AppConfig>): void {
  store.set(STORAGE_KEY, JSON.stringify(config));
}

/** Pretend the OS color scheme matches `dark`. */
function stubSystemPrefers(dark: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark') && dark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('theme resolution — persisted config', () => {
  beforeEach(() => {
    store.clear();
  });

  it('defaults a fresh install to the system theme', () => {
    expect(DEFAULT_CONFIG.theme).toBe('system');
    expect(loadConfig().theme).toBe('system');
  });

  it('honors an explicitly persisted dark theme', () => {
    persist({ theme: 'dark', accentColor: '#4F46E5' });

    const config = loadConfig();

    expect(config.theme).toBe('dark');
    // Unrelated preferences must survive resolution.
    expect(config.accentColor).toBe('#4f46e5');
  });

  it('honors an explicitly persisted light theme', () => {
    persist({ theme: 'light' });

    expect(loadConfig().theme).toBe('light');
  });

  it('honors a persisted system theme even when the OS prefers dark', () => {
    stubSystemPrefers(true);
    persist({ theme: 'system' });

    expect(loadConfig().theme).toBe('system');
  });
});

describe('theme resolution — document', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('stamps data-theme=light for an explicit light theme', () => {
    applyAppearanceToDocument({ theme: 'light', accentColor: '#059669' });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('stamps data-theme=dark for an explicit dark theme', () => {
    applyAppearanceToDocument({ theme: 'dark', accentColor: '#059669' });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('removes data-theme for the system theme so the OS preference applies', () => {
    stubSystemPrefers(true);

    applyAppearanceToDocument({ theme: 'system', accentColor: '#059669' });

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('defaults an omitted theme to system', () => {
    stubSystemPrefers(false);

    applyAppearanceToDocument({ accentColor: '#059669' });

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('theme resolution — pre-hydration script', () => {
  const layoutPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../app/layout.tsx',
  );

  function runThemeInitScript(): void {
    const source = readFileSync(layoutPath, 'utf8');
    const match = /const themeInitScript = `([^`]*)`;/.exec(source);
    if (!match?.[1]) throw new Error('themeInitScript not found in app/layout.tsx');
    // eslint-disable-next-line no-new-func
    new Function(match[1])();
  }

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('meta[name="theme-color"]')?.remove();
    store.clear();
  });

  it('paints dark before hydration when the stored theme is dark', () => {
    persist({ theme: 'dark' });

    runThemeInitScript();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('paints light before hydration when the stored theme is light', () => {
    persist({ theme: 'light' });

    runThemeInitScript();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('leaves the document in system mode for a stored system theme on a dark OS', () => {
    stubSystemPrefers(true);
    persist({ theme: 'system' });

    runThemeInitScript();

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('sets a dark theme-color so the browser chrome matches the painted theme', () => {
    persist({ theme: 'dark' });

    runThemeInitScript();

    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute('content')).toBe('#202020');
  });
});