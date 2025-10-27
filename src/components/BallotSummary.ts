import { Candidate, CountResult } from '../lib/types';

export function renderBallotSummary(
  container: HTMLElement,
  result: CountResult,
  candidates: Candidate[],
  userPath?: { roundIndex: number; from: string; to: string }[]
): void {
  container.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = 'How your ballot counted';
  const p = document.createElement('p');

  if (!userPath || userPath.length === 0) {
    p.textContent = 'Fill out the ballot to see how your vote moved in each round.';
    container.append(title, p);
    return;
  }

  const nameById: Record<string, string> = {};
  for (const c of candidates) nameById[c.id] = c.name;

  const lines: string[] = [];
  for (const step of userPath) {
    if (step.from === 'start') continue;
    const r = step.roundIndex + 1;
    const from = step.from === 'exhausted' ? 'Exhausted' : (nameById[step.from] || step.from);
    const to = step.to === 'exhausted' ? 'Exhausted' : (nameById[step.to] || step.to);
    if (from === to) {
      lines.push(`Round ${r}: your ballot stayed with ${to}.`);
    } else if (to === 'Exhausted') {
      lines.push(`Round ${r}: your ballot became exhausted (no valid next choice).`);
    } else {
      lines.push(`Round ${r}: your ballot transferred from ${from} to ${to}.`);
    }
  }

  const winnerId = result.winner;
  const winnerName = winnerId ? (nameById[winnerId] || winnerId) : '';
  if (winnerName) {
    lines.push(`Final: ${winnerName} reached a majority and won.`);
  }

  p.textContent = lines.join(' ');
  container.append(title, p);
}

