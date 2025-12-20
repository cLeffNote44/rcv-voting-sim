import { CountResult } from '../lib/types';
import { t } from '../lib/i18n';

export interface RoundControlsAPI {
  updateRound: (round: number) => void;
}

export function renderRoundControls(
  container: HTMLElement,
  result: CountResult,
  onNavigate: (round: number) => void,
  onRestart: () => void
): RoundControlsAPI {
  container.innerHTML = '';
  const buttons = document.createElement('div');
  buttons.className = 'round-controls';

  // Round indicator
  const roundIndicator = document.createElement('span');
  roundIndicator.className = 'round-indicator';
  roundIndicator.textContent = `${t('round')} 1 / ${result.rounds.length}`;

  const prev = document.createElement('button');
  prev.textContent = `◀ ${t('previousRound')}`;
  prev.setAttribute('aria-label', t('previousRound'));

  const next = document.createElement('button');
  next.textContent = `${t('nextRound')} ▶`;
  next.setAttribute('aria-label', t('nextRound'));

  const restart = document.createElement('button');
  restart.textContent = `↻ ${t('restart')}`;
  restart.setAttribute('aria-label', t('restart'));

  // Track current round internally but sync with external state
  let currentIdx = 0;

  const updateButtonStates = () => {
    prev.disabled = currentIdx === 0;
    next.disabled = currentIdx >= result.rounds.length - 1;
    roundIndicator.textContent = `${t('round')} ${currentIdx + 1} / ${result.rounds.length}`;
  };

  prev.addEventListener('click', () => {
    if (currentIdx > 0) {
      currentIdx -= 1;
      updateButtonStates();
      onNavigate(currentIdx);
    }
  });

  next.addEventListener('click', () => {
    if (currentIdx < result.rounds.length - 1) {
      currentIdx += 1;
      updateButtonStates();
      onNavigate(currentIdx);
    }
  });

  restart.addEventListener('click', () => onRestart());

  // Initial button state
  updateButtonStates();

  buttons.append(prev, roundIndicator, next, restart);
  container.append(buttons);

  // Return API for external round updates (e.g., from keyboard navigation)
  return {
    updateRound: (round: number) => {
      currentIdx = Math.max(0, Math.min(result.rounds.length - 1, round));
      updateButtonStates();
    }
  };
}

