import React from 'react';
import { Palette, RotateCcw, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeDensity } from '../theme/themes';

interface ThemeSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const ACCENT_PRESETS = [
  { label: 'Theme Default', value: null },
  { label: 'File Labs Blue', value: '#4c8dff' },
  { label: 'Lumen Cyan', value: '#38bdf8' },
  { label: 'Indigo', value: '#818cf8' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#fb7185' },
];

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ open, onClose }) => {
  const {
    themes,
    activeTheme,
    density,
    accentOverride,
    setThemeId,
    setDensity,
    setAccentOverride,
  } = useTheme();

  if (!open) return null;

  return (
    <div className="fl-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Appearance and Theme Settings">
      <div className="fl-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={16} color="var(--fl-accent)" />
            <strong style={{ fontSize: 14 }}>Appearance &amp; Themes</strong>
          </div>
          <button type="button" className="fl-icon-btn" onClick={onClose} aria-label="Close appearance settings">
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fl-text-muted)' }}>
            Theme Preset (Preserves Custom Themes)
          </span>
          <div className="fl-theme-grid">
            {themes.map(theme => (
              <button
                key={theme.id}
                type="button"
                className={`fl-theme-card ${activeTheme.id === theme.id ? 'active' : ''}`}
                onClick={() => setThemeId(theme.id)}
              >
                <div
                  className="fl-theme-swatch"
                  style={{ background: theme.tokens.bgCanvas, borderColor: theme.tokens.borderStrong }}
                >
                  <span className="fl-swatch-dot" style={{ background: theme.tokens.paneBg }} />
                  <span className="fl-swatch-dot" style={{ background: theme.tokens.accent }} />
                  <span className="fl-swatch-dot" style={{ background: theme.tokens.accentSecondary }} />
                </div>
                <strong style={{ fontSize: 12 }}>{theme.name}</strong>
                <span style={{ fontSize: 10.5, color: 'var(--fl-text-muted)', lineHeight: 1.3 }}>
                  {theme.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fl-text-muted)' }}>
              Row Density
            </span>
            <div className="fl-segmented">
              {(['compact', 'comfortable', 'spacious'] as ThemeDensity[]).map(level => (
                <button
                  key={level}
                  type="button"
                  className={density === level ? 'active' : ''}
                  onClick={() => setDensity(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fl-text-muted)' }}>
              Accent Override
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {ACCENT_PRESETS.map(preset => {
                const isSelected = accentOverride === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={preset.label}
                    onClick={() => setAccentOverride(preset.value)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--fl-text-primary)' : '1px solid var(--fl-border-strong)',
                      background: preset.value ?? activeTheme.tokens.accent,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {preset.value === null ? <RotateCcw size={10} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
