export function renderRoundControls(
  container: HTMLElement,
  result: any,
  onNavigate: (round: number) => void,
  onRestart: () => void
): void {
  container.innerHTML = '';
  const buttons = document.createElement('div');
  buttons.className = 'round-controls';

  const prev = document.createElement('button');
  prev.textContent = 'Previous round';
  const next = document.createElement('button');
  next.textContent = 'Next round';
  const restart = document.createElement('button');
  restart.textContent = 'Restart';

  let idx = 0;
  prev.addEventListener('click', () => {
    if (idx > 0) {
      idx -= 1;
      onNavigate(idx);
    }
  });
  next.addEventListener('click', () => {
    if (idx < result.rounds.length - 1) {
      idx += 1;
      onNavigate(idx);
    }
  });
  restart.addEventListener('click', () => onRestart());

  buttons.append(prev, next, restart);
  container.append(buttons);
}

