export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';

export interface AppThemeTokens {
  /** Base window backdrop */
  bgCanvas: string;
  /** Ambient radial/surface wash behind panels */
  bgBackdropOverlay: string;
  /** Sidebar surface */
  sidebarBg: string;
  /** Pane card surface */
  paneBg: string;
  /** Elevated modal / popover / dropdown surface */
  popupBg: string;
  /** Tab strip trough behind inactive tabs */
  tabStripBg: string;
  /** Search / filter input surface */
  inputBg: string;
  /** Subtle card / stat surface */
  cardBg: string;
  /** Row hover veil */
  rowHover: string;
  /** Alternating zebra row tint */
  rowAlt: string;
  /** Default hairline border */
  borderSubtle: string;
  /** Stronger interactive border */
  borderStrong: string;
  /** Primary text */
  textPrimary: string;
  /** Secondary text */
  textSecondary: string;
  /** Muted / hint text */
  textMuted: string;
  /** Primary accent */
  accent: string;
  /** Secondary accent (used by Lumen widgets / badges) */
  accentSecondary: string;
  /** Active selection row background */
  accentSelect: string;
  /** Active selection row text */
  accentSelectText: string;
  /** Soft accent glow / marquee fill */
  accentSoft: string;
  /** Accent border / active pane edge */
  accentEdge: string;
  /** Status colors */
  emerald: string;
  amber: string;
  danger: string;
  /** Radius multiplier (0 = square retro, 1 = File Labs 10px, 1.4 = rounded glass) */
  radiusScale: number;
  /** Typography family */
  fontFamily: string;
  /** Backdrop blur (px) */
  backdropBlur: string;
  /** Shadow for elevated surfaces */
  shadowElevation: string;
}

export interface AppThemeDefinition {
  id: string;
  name: string;
  description: string;
  mode: 'dark' | 'light';
  source: 'lumen' | 'file-labs' | 'custom';
  tokens: AppThemeTokens;
}

export const BUILTIN_THEMES: AppThemeDefinition[] = [
  {
    id: 'lumen-obsidian',
    name: 'Lumen Obsidian',
    description: 'Signature FileMan obsidian glass with indigo & cyan accents',
    mode: 'dark',
    source: 'lumen',
    tokens: {
      bgCanvas: 'oklch(13% 0.03 245)',
      bgBackdropOverlay:
        'radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.12), transparent 28%)',
      sidebarBg: 'rgba(12, 18, 32, 0.78)',
      paneBg: 'rgba(17, 24, 39, 0.72)',
      popupBg: 'rgba(15, 23, 42, 0.94)',
      tabStripBg: 'rgba(2, 6, 23, 0.44)',
      inputBg: 'rgba(15, 23, 42, 0.72)',
      cardBg: 'rgba(15, 23, 42, 0.62)',
      rowHover: 'rgba(148, 163, 184, 0.1)',
      rowAlt: 'rgba(148, 163, 184, 0.045)',
      borderSubtle: 'rgba(148, 163, 184, 0.16)',
      borderStrong: 'rgba(148, 163, 184, 0.28)',
      textPrimary: 'oklch(97% 0.02 250)',
      textSecondary: 'oklch(76% 0.02 250)',
      textMuted: 'oklch(66% 0.02 250)',
      accent: '#38bdf8',
      accentSecondary: '#818cf8',
      accentSelect: 'rgba(56, 189, 248, 0.2)',
      accentSelectText: '#f8fafc',
      accentSoft: 'rgba(56, 189, 248, 0.14)',
      accentEdge: 'rgba(56, 189, 248, 0.55)',
      emerald: '#34d399',
      amber: '#fbbf24',
      danger: '#f87171',
      radiusScale: 1,
      fontFamily: "'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif",
      backdropBlur: '16px',
      shadowElevation: '0 16px 40px rgba(2, 6, 23, 0.45)',
    },
  },
  {
    id: 'file-labs-dark',
    name: 'File Labs Dark',
    description: 'Windows 11 translucent acrylic dark with crisp blue focus',
    mode: 'dark',
    source: 'file-labs',
    tokens: {
      bgCanvas: '#0a0d13',
      bgBackdropOverlay:
        'radial-gradient(circle at top right, rgba(76, 141, 255, 0.1), transparent 36%), linear-gradient(180deg, rgba(10, 13, 19, 0.7), rgba(10, 13, 19, 0.85))',
      sidebarBg: 'rgba(0, 0, 0, 0.38)',
      paneBg: 'rgba(255, 255, 255, 0.05)',
      popupBg: 'rgba(22, 27, 36, 0.96)',
      tabStripBg: 'rgba(0, 0, 0, 0.28)',
      inputBg: 'rgba(255, 255, 255, 0.07)',
      cardBg: 'rgba(255, 255, 255, 0.04)',
      rowHover: 'rgba(255, 255, 255, 0.07)',
      rowAlt: 'rgba(255, 255, 255, 0.03)',
      borderSubtle: 'rgba(255, 255, 255, 0.1)',
      borderStrong: 'rgba(255, 255, 255, 0.2)',
      textPrimary: '#e8eef6',
      textSecondary: '#b4becc',
      textMuted: '#8a97aa',
      accent: '#4c8dff',
      accentSecondary: '#60a5fa',
      accentSelect: '#2f4e84',
      accentSelectText: '#ffffff',
      accentSoft: 'rgba(76, 141, 255, 0.22)',
      accentEdge: 'rgba(76, 141, 255, 0.65)',
      emerald: '#34d399',
      amber: '#ffd23f',
      danger: '#f87171',
      radiusScale: 1,
      fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Inter', system-ui, sans-serif",
      backdropBlur: '18px',
      shadowElevation: '0 14px 36px rgba(0, 0, 0, 0.48)',
    },
  },
  {
    id: 'file-labs-light',
    name: 'Liquid Glass Light',
    description: 'Clean airy light theme inspired by File Labs macOS 27',
    mode: 'light',
    source: 'file-labs',
    tokens: {
      bgCanvas: '#f1f3f7',
      bgBackdropOverlay:
        'radial-gradient(circle at top left, rgba(0, 113, 227, 0.08), transparent 36%), linear-gradient(180deg, rgba(245, 245, 247, 0.9), rgba(236, 239, 245, 0.95))',
      sidebarBg: 'rgba(232, 236, 242, 0.86)',
      paneBg: 'rgba(255, 255, 255, 0.88)',
      popupBg: 'rgba(250, 250, 252, 0.98)',
      tabStripBg: 'rgba(220, 224, 232, 0.78)',
      inputBg: 'rgba(255, 255, 255, 0.92)',
      cardBg: 'rgba(255, 255, 255, 0.84)',
      rowHover: 'rgba(15, 23, 42, 0.05)',
      rowAlt: 'rgba(15, 23, 42, 0.025)',
      borderSubtle: 'rgba(15, 23, 42, 0.1)',
      borderStrong: 'rgba(15, 23, 42, 0.2)',
      textPrimary: '#1d1d1f',
      textSecondary: '#48484f',
      textMuted: '#6e6e73',
      accent: '#0071e3',
      accentSecondary: '#2563eb',
      accentSelect: 'rgba(0, 113, 227, 0.16)',
      accentSelectText: '#0f172a',
      accentSoft: 'rgba(0, 113, 227, 0.12)',
      accentEdge: 'rgba(0, 113, 227, 0.55)',
      emerald: '#059669',
      amber: '#d97706',
      danger: '#dc2626',
      radiusScale: 1.25,
      fontFamily: "'Segoe UI Variable Display', 'Inter', system-ui, sans-serif",
      backdropBlur: '14px',
      shadowElevation: '0 10px 30px rgba(15, 23, 42, 0.1)',
    },
  },
  {
    id: 'terminal-amber',
    name: 'Amber Terminal',
    description: 'High-contrast monochrome amber CRT with crisp square geometry',
    mode: 'dark',
    source: 'file-labs',
    tokens: {
      bgCanvas: '#0c0700',
      bgBackdropOverlay: 'none',
      sidebarBg: '#120a00',
      paneBg: '#100900',
      popupBg: '#180e00',
      tabStripBg: '#080500',
      inputBg: '#1a1000',
      cardBg: '#140c00',
      rowHover: 'rgba(255, 176, 0, 0.1)',
      rowAlt: 'rgba(255, 176, 0, 0.04)',
      borderSubtle: 'rgba(255, 176, 0, 0.24)',
      borderStrong: 'rgba(255, 176, 0, 0.48)',
      textPrimary: '#ffb000',
      textSecondary: '#d99600',
      textMuted: '#996a00',
      accent: '#ffb000',
      accentSecondary: '#ffd166',
      accentSelect: 'rgba(255, 176, 0, 0.24)',
      accentSelectText: '#fff3d6',
      accentSoft: 'rgba(255, 176, 0, 0.16)',
      accentEdge: 'rgba(255, 176, 0, 0.72)',
      emerald: '#ffb000',
      amber: '#ffd166',
      danger: '#ff6b35',
      radiusScale: 0,
      fontFamily: "'Cascadia Mono', 'Consolas', monospace",
      backdropBlur: '0px',
      shadowElevation: '0 0 0 1px rgba(255, 176, 0, 0.35)',
    },
  },
  {
    id: 'terminal-phosphor',
    name: 'Phosphor Green',
    description: 'Retro monochrome phosphor green terminal theme',
    mode: 'dark',
    source: 'file-labs',
    tokens: {
      bgCanvas: '#010a02',
      bgBackdropOverlay: 'none',
      sidebarBg: '#031205',
      paneBg: '#021004',
      popupBg: '#041807',
      tabStripBg: '#010701',
      inputBg: '#051e09',
      cardBg: '#031406',
      rowHover: 'rgba(51, 255, 102, 0.1)',
      rowAlt: 'rgba(51, 255, 102, 0.04)',
      borderSubtle: 'rgba(51, 255, 102, 0.22)',
      borderStrong: 'rgba(51, 255, 102, 0.46)',
      textPrimary: '#33ff66',
      textSecondary: '#22c55e',
      textMuted: '#1a8f45',
      accent: '#33ff66',
      accentSecondary: '#86efac',
      accentSelect: 'rgba(51, 255, 102, 0.22)',
      accentSelectText: '#ecfdf5',
      accentSoft: 'rgba(51, 255, 102, 0.15)',
      accentEdge: 'rgba(51, 255, 102, 0.7)',
      emerald: '#33ff66',
      amber: '#a3e635',
      danger: '#fb7185',
      radiusScale: 0,
      fontFamily: "'Cascadia Mono', 'Consolas', monospace",
      backdropBlur: '0px',
      shadowElevation: '0 0 0 1px rgba(51, 255, 102, 0.35)',
    },
  },
];

export const DENSITY_METRICS: Record<ThemeDensity, { rowHeight: string; rowPadY: string; fontSize: string }> = {
  compact: { rowHeight: '28px', rowPadY: '4px', fontSize: '12px' },
  comfortable: { rowHeight: '34px', rowPadY: '7px', fontSize: '12.5px' },
  spacious: { rowHeight: '40px', rowPadY: '10px', fontSize: '13px' },
};
