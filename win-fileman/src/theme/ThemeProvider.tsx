import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppThemeDefinition, BUILTIN_THEMES, DENSITY_METRICS, ThemeDensity } from './themes';

const STORAGE_THEME_KEY = 'lumen.filelabs.themeId';
const STORAGE_DENSITY_KEY = 'lumen.filelabs.density';
const STORAGE_ACCENT_KEY = 'lumen.filelabs.accentOverride';

interface ThemeContextValue {
  themes: AppThemeDefinition[];
  activeTheme: AppThemeDefinition;
  density: ThemeDensity;
  accentOverride: string | null;
  setThemeId: (id: string) => void;
  setDensity: (density: ThemeDensity) => void;
  setAccentOverride: (hex: string | null) => void;
  registerTheme: (theme: AppThemeDefinition) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: AppThemeDefinition, density: ThemeDensity, accentOverride: string | null) {
  const root = document.documentElement;
  const t = theme.tokens;
  const accent = accentOverride || t.accent;
  const metrics = DENSITY_METRICS[density];

  root.dataset.theme = theme.id;
  root.dataset.themeMode = theme.mode;
  root.dataset.density = density;

  // File Labs semantic design tokens
  root.style.setProperty('--fl-bg-canvas', t.bgCanvas);
  root.style.setProperty('--fl-bg-overlay', t.bgBackdropOverlay);
  root.style.setProperty('--fl-sidebar-bg', t.sidebarBg);
  root.style.setProperty('--fl-pane-bg', t.paneBg);
  root.style.setProperty('--fl-popup-bg', t.popupBg);
  root.style.setProperty('--fl-tab-strip-bg', t.tabStripBg);
  root.style.setProperty('--fl-input-bg', t.inputBg);
  root.style.setProperty('--fl-card-bg', t.cardBg);
  root.style.setProperty('--fl-row-hover', t.rowHover);
  root.style.setProperty('--fl-row-alt', t.rowAlt);
  root.style.setProperty('--fl-border-subtle', t.borderSubtle);
  root.style.setProperty('--fl-border-strong', t.borderStrong);
  root.style.setProperty('--fl-text-primary', t.textPrimary);
  root.style.setProperty('--fl-text-secondary', t.textSecondary);
  root.style.setProperty('--fl-text-muted', t.textMuted);
  root.style.setProperty('--fl-accent', accent);
  root.style.setProperty('--fl-accent-secondary', t.accentSecondary);
  root.style.setProperty('--fl-accent-select', accentOverride ? `${accentOverride}33` : t.accentSelect);
  root.style.setProperty('--fl-accent-select-text', t.accentSelectText);
  root.style.setProperty('--fl-accent-soft', accentOverride ? `${accentOverride}24` : t.accentSoft);
  root.style.setProperty('--fl-accent-edge', accentOverride ? `${accentOverride}99` : t.accentEdge);
  root.style.setProperty('--fl-emerald', t.emerald);
  root.style.setProperty('--fl-amber', t.amber);
  root.style.setProperty('--fl-danger', t.danger);
  root.style.setProperty('--fl-radius-scale', String(t.radiusScale));
  root.style.setProperty('--fl-radius-sm', `${Math.round(4 * t.radiusScale)}px`);
  root.style.setProperty('--fl-radius-md', `${Math.round(6 * t.radiusScale)}px`);
  root.style.setProperty('--fl-radius-lg', `${Math.round(10 * t.radiusScale)}px`);
  root.style.setProperty('--fl-font-ui', t.fontFamily);
  root.style.setProperty('--fl-blur', t.backdropBlur);
  root.style.setProperty('--fl-shadow', t.shadowElevation);
  root.style.setProperty('--fl-row-height', metrics.rowHeight);
  root.style.setProperty('--fl-row-pad-y', metrics.rowPadY);
  root.style.setProperty('--fl-font-size', metrics.fontSize);

  // Bridge to legacy Lumen Files CSS variables so CleanerView, SyncView, and all existing add-ons adapt seamlessly
  root.style.setProperty('--bg-obsidian', t.bgCanvas);
  root.style.setProperty('--bg-deep', t.sidebarBg);
  root.style.setProperty('--surface-glass', t.paneBg);
  root.style.setProperty('--surface-glass-strong', t.popupBg);
  root.style.setProperty('--surface-glass-variant', t.cardBg);
  root.style.setProperty('--border-glass', t.borderSubtle);
  root.style.setProperty('--accent-indigo', t.accentSecondary);
  root.style.setProperty('--accent-cyan', accent);
  root.style.setProperty('--accent-emerald', t.emerald);
  root.style.setProperty('--accent-amber', t.amber);
  root.style.setProperty('--text-primary', t.textPrimary);
  root.style.setProperty('--text-secondary', t.textSecondary);
  root.style.setProperty('--text-muted', t.textMuted);
  root.style.setProperty('--shadow-glass', t.shadowElevation);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customThemes, setCustomThemes] = useState<AppThemeDefinition[]>([]);
  const [themeId, setThemeIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) || 'lumen-obsidian';
    } catch {
      return 'lumen-obsidian';
    }
  });
  const [density, setDensityState] = useState<ThemeDensity>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DENSITY_KEY) as ThemeDensity | null;
      return saved && saved in DENSITY_METRICS ? saved : 'comfortable';
    } catch {
      return 'comfortable';
    }
  });
  const [accentOverride, setAccentOverrideState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_ACCENT_KEY) || null;
    } catch {
      return null;
    }
  });

  const themes = useMemo(() => [...BUILTIN_THEMES, ...customThemes], [customThemes]);
  const activeTheme = useMemo(
    () => themes.find(item => item.id === themeId) ?? themes[0],
    [themes, themeId],
  );

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // ignore storage restrictions
    }
  }, []);

  const setDensity = useCallback((next: ThemeDensity) => {
    setDensityState(next);
    try {
      localStorage.setItem(STORAGE_DENSITY_KEY, next);
    } catch {
      // ignore storage restrictions
    }
  }, []);

  const setAccentOverride = useCallback((hex: string | null) => {
    setAccentOverrideState(hex);
    try {
      if (hex) localStorage.setItem(STORAGE_ACCENT_KEY, hex);
      else localStorage.removeItem(STORAGE_ACCENT_KEY);
    } catch {
      // ignore storage restrictions
    }
  }, []);

  const registerTheme = useCallback((theme: AppThemeDefinition) => {
    setCustomThemes(prev => {
      const without = prev.filter(item => item.id !== theme.id);
      return [...without, theme];
    });
  }, []);

  useEffect(() => {
    applyThemeToDocument(activeTheme, density, accentOverride);
  }, [activeTheme, density, accentOverride]);

  // Cross-window synchronization for Phase 2 multi-window support
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_THEME_KEY && event.newValue) setThemeIdState(event.newValue);
      if (event.key === STORAGE_DENSITY_KEY && event.newValue && event.newValue in DENSITY_METRICS) {
        setDensityState(event.newValue as ThemeDensity);
      }
      if (event.key === STORAGE_ACCENT_KEY) setAccentOverrideState(event.newValue || null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themes,
      activeTheme,
      density,
      accentOverride,
      setThemeId,
      setDensity,
      setAccentOverride,
      registerTheme,
    }),
    [themes, activeTheme, density, accentOverride, setThemeId, setDensity, setAccentOverride, registerTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
