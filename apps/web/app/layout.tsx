import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { I18nProvider } from '../src/i18n';
import { AnalyticsProvider } from '../src/analytics/provider';
import '@excalidraw/excalidraw/index.css';
import '../src/index.css';
import '../src/styles/home/index.css';

export const metadata: Metadata = {
  title: 'Open Design',
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#f7f7f7',
};

/**
 * Inline script that runs before React hydrates so the first paint already
 * carries the app's appearance — no flash of unstyled content.
 *
 * The theme system is active: the resolved theme (persisted `light` / `dark`
 * / `system`, defaulting to `system`) is stamped before paint so the first
 * frame matches the final theme. `system` removes `data-theme` so the
 * `@media (prefers-color-scheme)` dark tokens follow the OS, and the browser
 * chrome's `theme-color` meta is set to match the painted theme.
 * Keep the theme-color values and the accent variable mix ratios in sync with
 * `applyAppearanceToDocument()` in `src/state/appearance.ts`; this script
 * cannot import application modules.
 */
const themeInitScript = `(function(){var meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=document.createElement('meta');meta.setAttribute('name','theme-color');document.head.appendChild(meta);}var theme='system';try{var c=JSON.parse(localStorage.getItem('open-design:config')||'{}');if(c.theme==='light'||c.theme==='dark'||c.theme==='system')theme=c.theme;var a=typeof c.accentColor==='string'&&/^#[0-9a-fA-F]{6}$/.test(c.accentColor.trim())?c.accentColor.trim().toLowerCase():'#353535';if(c.configMigrationVersion!==3&&(a==='#87ea5c'||a==='#c96442'))a='#353535';var s=document.documentElement.style;s.setProperty('--accent',a);s.setProperty('--accent-strong','color-mix(in srgb, '+a+' 82%, var(--text-strong))');s.setProperty('--accent-soft','color-mix(in srgb, '+a+' 12%, var(--bg-subtle))');s.setProperty('--accent-tint','color-mix(in srgb, '+a+' 6%, var(--bg-panel))');s.setProperty('--accent-hover','color-mix(in srgb, '+a+' 86%, var(--text-strong))');}catch(e){}if(theme==='system'){document.documentElement.removeAttribute('data-theme');var osDark=false;try{osDark=!!window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;}catch(e){}meta.setAttribute('content',osDark?'#202020':'#f7f7f7');}else{document.documentElement.setAttribute('data-theme',theme);meta.setAttribute('content',theme==='dark'?'#202020':'#f7f7f7');}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme-init inline script to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <I18nProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
