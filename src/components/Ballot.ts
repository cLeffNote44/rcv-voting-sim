import { Candidate, Ballot, Rank } from '../lib/types';
import { showModal } from './Modal';
import { t } from '../lib/i18n';

export function renderBallot(container: HTMLElement, candidates: Candidate[], onProceed: (userBallot: Ballot) => void): void {
  container.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = t('fillBallot');

  const grid = document.createElement('div');
  grid.className = 'ballot-grid';

  const headerRow = document.createElement('div');
  headerRow.className = 'ballot-row header';
  const nameHeader = document.createElement('div');
  nameHeader.className = 'cell name';
  nameHeader.textContent = 'Candidate';
  headerRow.appendChild(nameHeader);

  // Rank headers using translations
  const rankLabels = [t('rank1'), t('rank2'), t('rank3'), t('rank4')];
  for (let r = 0; r < 4; r += 1) {
    const h = document.createElement('div');
    h.className = 'cell rank';
    h.textContent = rankLabels[r];
    headerRow.appendChild(h);
  }
  grid.appendChild(headerRow);

  for (const c of candidates) {
    const row = document.createElement('div');
    row.className = 'ballot-row';

    const nameCell = document.createElement('div');
    nameCell.className = 'cell name';
    const name = document.createElement('div');
    name.className = 'cand-name';
    name.textContent = c.name;
    const bio = document.createElement('div');
    bio.className = 'cand-bio';
    bio.textContent = c.bio;
    nameCell.append(name, bio);
    row.appendChild(nameCell);

    let ri = 1;
    while (ri !== 5) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const label = document.createElement('label');
      label.className = 'checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('data-candidate', c.id);
      input.setAttribute('data-rank', String(ri));
      input.setAttribute('aria-label', c.name + ' at rank ' + ri);
      label.append(input);
      cell.append(label);
      row.appendChild(cell);
      ri += 1;
    }

    grid.appendChild(row);
  }

  const warn = document.createElement('div');
  warn.className = 'warning-area';
  warn.textContent = 'Tip: Mark at most one candidate per rank to avoid overvotes. Ranking more candidates helps prevent ballot exhaustion.';

  const proceed = document.createElement('button');
  proceed.className = 'primary';
  proceed.textContent = t('submitBallot');

  proceed.addEventListener('click', async () => {
    const { ranks, missing, overvote } = readSelection(grid);
    const messages: string[] = [];

    // Overvotes cause the ballot to exhaust at that rank once earlier valid choices are no longer continuing.
    if (overvote.length !== 0) {
      messages.push('Overvote at rank ' + overvote.join(', ') + '. If your higher-ranked choices are eliminated, your ballot will become exhausted at the first overvoted rank.');
    }

    // Blank ranks (undervotes) increase the chance of running out of valid next choices later.
    if (missing.length !== 0) {
      messages.push('You left rank ' + missing.join(', ') + ' blank. Ranking more candidates reduces the risk of exhaustion.');
    }

    // Immediate exhaustion checks
    const hasSingle = ranks.some(r => typeof r === 'string');
    const hasAny = ranks.some(r => r !== null);
    if (!hasAny) {
      messages.push('You have not selected any candidates. Your ballot would not count.');
    } else if (!hasSingle && overvote.length !== 0) {
      // No single-choice anywhere and at least one overvote implies the first marked rank would trigger immediate exhaustion
      messages.push('Your ballot has no single-choice selection. Because your first marked rank contains multiple candidates, it would exhaust immediately.');
    }

    // Duplicate candidates across ranks are ignored beyond their first occurrence and don\'t add backups
    const counts: Record<string, number> = {};
    for (const r of ranks) {
      if (typeof r === 'string') counts[r] = (counts[r] || 0) + 1;
      else if (Array.isArray(r) && r.length === 1) {
        const id = r[0];
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    const duplicates = Object.keys(counts).filter(cid => counts[cid] > 1);
    if (duplicates.length !== 0) {
      messages.push('You ranked the same candidate more than once. Duplicate rankings beyond the first are ignored and do not add backup choices.');
    }

    // Only one unique candidate ranked
    const uniqueCount = Object.keys(counts).length;
    if (uniqueCount === 1) {
      messages.push('You selected only one candidate. If that candidate is eliminated, your ballot will exhaust with no backup choice.');
    }

    if (messages.length !== 0) {
      const ok = await showModal({ title: 'Check your ballot', message: messages, confirmText: 'Proceed anyway', cancelText: 'Go back' });
      if (!ok) return;
    }
    const userBallot: Ballot = { id: 'user', ranks, source: 'user' };
    onProceed(userBallot);
  });

  container.append(title, grid, warn, proceed);
}

function readSelection(grid: HTMLElement): { ranks: Rank[]; missing: number[]; overvote: number[] } {
  const ranks: Rank[] = [];
  const missing: number[] = [];
  const overvote: number[] = [];
  let r = 1;
  while (r !== 5) {
    const all = Array.from(grid.querySelectorAll('input[data-rank="' + r + '"]')) as HTMLInputElement[];
    const selected = all.filter(x => x.checked).map(x => x.getAttribute('data-candidate') || '').filter(Boolean);
    if (selected.length === 0) {
      ranks.push(null);
      missing.push(r);
    } else if (selected.length === 1) {
      ranks.push(selected[0]);
    } else {
      ranks.push(selected);
      overvote.push(r);
    }
    r += 1;
  }
  return { ranks, missing, overvote };
}

