/**
 * Theme and color scheme management
 */

export type ColorScheme = 'default' | 'colorblind' | 'high-contrast';

const THEME_STORAGE_KEY = 'rcv-sim-color-scheme';

export function getColorScheme(): ColorScheme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'colorblind' || stored === 'high-contrast') {
    return stored;
  }
  return 'default';
}

export function setColorScheme(scheme: ColorScheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, scheme);
  applyColorScheme(scheme);
}

export function applyColorScheme(scheme: ColorScheme): void {
  document.documentElement.setAttribute('data-color-scheme', scheme);
}

export function initColorScheme(): void {
  const scheme = getColorScheme();
  applyColorScheme(scheme);
}
