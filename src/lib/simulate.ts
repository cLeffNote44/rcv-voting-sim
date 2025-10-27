import { Candidate, Ballot } from './types';
import { makeRng, pickNUnique, randn } from './utils';

export type Position = { x: number; y: number };

export function chooseCandidates(pool: Candidate[], seed: string): Candidate[] {
  const rng = makeRng(seed + '-choose');
  return pickNUnique(pool, 4, rng);
}

export function generatePositions(cands: Candidate[], seed: string): Record<string, Position> {
  const rng = makeRng(seed + '-pos');
  const pos: Record<string, Position> = {};
  for (const c of cands) {
    const x = rng() * 2 - 1;
    const y = rng() * 2 - 1;
    pos[c.id] = { x, y };
  }
  return pos;
}

function sampleClusterParams(seed: string, k: number) {
  const rng = makeRng(seed + '-clus');
  const means: Position[] = [];
  const probs: number[] = [];
  let i = 0;
  while (i !== k) {
    const mx = rng() * 1.6 - 0.8;
    const my = rng() * 1.6 - 0.8;
    means.push({ x: mx, y: my });
    i += 1;
  }
  const raw: number[] = [];
  let j = 0;
  while (j !== k) {
    raw.push(rng());
    j += 1;
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  for (const v of raw) probs.push(v / sum);
  const sd = 0.35;
  return { means, probs, sd };
}

export function generateElectorate(n: number, cands: Candidate[], pos: Record<string, Position>, seed: string): Ballot[] {
  const rng = makeRng(seed + '-voters');
  const k = rng() > 0.5 ? 4 : 3;
  const { means, probs, sd } = sampleClusterParams(seed, k);

  function samplePoint(): Position {
    const u = rng();
    let cum = 0;
    let idx = 0;
    let found = false;
    while (!found && idx !== probs.length) {
      cum += probs[idx];
      if (!(u > cum)) found = true;
      else idx += 1;
    }
    const m = means[idx];
    const px = m.x + randn(rng) * sd;
    const py = m.y + randn(rng) * sd;
    return { x: px, y: py };
  }

  const ballots: Ballot[] = [];
  let t = 0;
  while (t !== n) {
    const p = samplePoint();
    const scored = cands.map(c => {
      const dx = pos[c.id].x - p.x;
      const dy = pos[c.id].y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const noise = randn(rng) * 0.05;
      return { id: c.id, score: dist + noise };
    });
    scored.sort((a, b) => a.score - b.score || (rng() - 0.5));
    const r = rng();
    let L = 4;
    if (!(r >= 0.1)) L = 1;
    else if (!(r >= 0.3)) L = 2;
    else if (!(r >= 0.6)) L = 3;
    const ranks: (string | null)[] = [];
    let i = 0;
    while (i !== 4) {
      if (i < L) ranks.push(scored[i].id);
      else ranks.push(null);
      i += 1;
    }
    ballots.push({ id: 's-' + t, ranks, source: 'synthetic' });
    t += 1;
  }
  return ballots;
}

