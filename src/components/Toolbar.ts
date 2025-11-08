import { copyLinkToClipboard } from '../lib/utils';
import { exportToCSV, exportToJSON, downloadFile, generateFilename } from '../lib/export';
import { setColorScheme, getColorScheme, type ColorScheme } from '../lib/theme';
import type { CountResult, Candidate } from '../lib/types';

function showToast(message: string, duration = 2000): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

export function renderToolbar(
  container: HTMLElement,
  result: CountResult,
  candidates: Candidate[],
  seed: string,
  voterCount: number
): void {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  // Share section
  const shareSection = document.createElement('div');
  shareSection.className = 'toolbar-section';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'icon-button secondary';
  shareBtn.innerHTML = '🔗 Share Link';
  shareBtn.addEventListener('click', async () => {
    const success = await copyLinkToClipboard();
    if (success) {
      showToast('✅ Link copied to clipboard!');
      shareBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        shareBtn.innerHTML = '🔗 Share Link';
      }, 2000);
    } else {
      showToast('❌ Failed to copy link');
    }
  });
  shareSection.appendChild(shareBtn);

  // Divider
  const divider1 = document.createElement('div');
  divider1.className = 'toolbar-divider';

  // Export section
  const exportSection = document.createElement('div');
  exportSection.className = 'toolbar-section';

  const exportLabel = document.createElement('span');
  exportLabel.textContent = 'Export:';
  exportLabel.style.fontSize = '0.9rem';
  exportLabel.style.color = 'var(--muted)';
  exportSection.appendChild(exportLabel);

  const exportCSVBtn = document.createElement('button');
  exportCSVBtn.className = 'icon-button secondary';
  exportCSVBtn.innerHTML = '📄 CSV';
  exportCSVBtn.addEventListener('click', () => {
    const csv = exportToCSV(result, candidates);
    const filename = generateFilename('csv', seed);
    downloadFile(csv, filename, 'text/csv');
    showToast('✅ CSV downloaded!');
  });
  exportSection.appendChild(exportCSVBtn);

  const exportJSONBtn = document.createElement('button');
  exportJSONBtn.className = 'icon-button secondary';
  exportJSONBtn.innerHTML = '📋 JSON';
  exportJSONBtn.addEventListener('click', () => {
    const json = exportToJSON(result, candidates, seed, voterCount);
    const filename = generateFilename('json', seed);
    downloadFile(json, filename, 'application/json');
    showToast('✅ JSON downloaded!');
  });
  exportSection.appendChild(exportJSONBtn);

  // Divider
  const divider2 = document.createElement('div');
  divider2.className = 'toolbar-divider';

  // Color scheme section
  const themeSection = document.createElement('div');
  themeSection.className = 'toolbar-section';

  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Color Scheme:';
  themeLabel.htmlFor = 'color-scheme-select';
  themeSection.appendChild(themeLabel);

  const themeSelect = document.createElement('select');
  themeSelect.id = 'color-scheme-select';
  themeSelect.innerHTML = `
    <option value="default">Default</option>
    <option value="colorblind">Colorblind-Friendly</option>
    <option value="high-contrast">High Contrast</option>
  `;
  themeSelect.value = getColorScheme();
  themeSelect.addEventListener('change', (e) => {
    const scheme = (e.target as HTMLSelectElement).value as ColorScheme;
    setColorScheme(scheme);
    showToast(`✅ Switched to ${scheme === 'default' ? 'default' : scheme === 'colorblind' ? 'colorblind-friendly' : 'high contrast'} theme`);
  });
  themeSection.appendChild(themeSelect);

  // Assemble toolbar
  toolbar.append(shareSection, divider1, exportSection, divider2, themeSection);
  container.appendChild(toolbar);
}
