import { Ballot, CountResult, RoundResult, RCVRules } from './types';
import { makeRng } from './utils';

type NextPref =
  | { type: 'vote'; id: string }
  | { type: 'exhausted'; reason: 'overvote' | 'noValid' | 'blank' };

function nextPreference(ranks: (string | string[] | null)[], continuing: Set<string>): NextPref {
  const seen = new Set<string>();
  let hasAnyNonBlank = false;
  for (const r of ranks) {
    if (r === null || r === undefined) continue;
    hasAnyNonBlank = true;
    if (Array.isArray(r)) {
      if (r.length !== 1) {
        return { type: 'exhausted', reason: 'overvote' };
      }
      const id = r[0];
      if (seen.has(id)) continue;
      seen.add(id);
      if (continuing.has(id)) return { type: 'vote', id };
    } else {
      const id = r;
      if (seen.has(id)) continue;
      seen.add(id);
      if (continuing.has(id)) return { type: 'vote', id };
    }
  }
  // Distinguish between "no valid continuing candidate" vs "only blanks"
  return { type: 'exhausted', reason: hasAnyNonBlank ? 'noValid' : 'blank' };
}

// Default rules approximating Fort Collins single-winner IRV:
// - No batch elimination
// - Majority > 50% of continuing ballots
// - Tie-breaker: look back to prior rounds among tied candidates, then random lot
const DEFAULT_RULES: RCVRules = {
  tieBreaker: 'lookback-then-lot',
  eliminateBatch: false,
  majorityCondition: '>',
};

export function runRCV(
  ballots: Ballot[],
  candidateIds: string[],
  seed: string,
  userBallotId?: string,
  rules: RCVRules = DEFAULT_RULES,
): CountResult {
  // Input validation
  if (!ballots || ballots.length === 0) {
    throw new Error('No ballots provided for RCV count');
  }
  if (!candidateIds || candidateIds.length === 0) {
    throw new Error('No candidates provided for RCV count');
  }
  if (!seed) {
    throw new Error('Seed required for RCV count');
  }

  const rng = makeRng(seed + '-rcv');
  const rounds: RoundResult[] = [];
  const continuing = new Set<string>(candidateIds);
  const allocationByBallot: Record<string, string> = {};
  const userPath: { roundIndex: number; from: string; to: string }[] = [];

  let roundIndex = 0;
  // Safety cap: with N candidates, max N-1 elimination rounds. Allow generous upper bound.
  while (continuing.size > 1 && rounds.length < 50) {
    const tallies: Record<string, number> = {};
    for (const cid of continuing) tallies[cid] = 0;
    let exhausted = 0;
    let exhaustedOvervote = 0;
    let exhaustedNoValid = 0;
    let exhaustedBlank = 0;
    const currentAlloc: Record<string, string> = {};

    for (const b of ballots) {
      const pref = nextPreference(b.ranks, continuing);
      if (pref.type === 'vote') {
        tallies[pref.id] = (tallies[pref.id] || 0) + 1;
        currentAlloc[b.id] = pref.id;
      } else {
        exhausted += 1;
        currentAlloc[b.id] = 'exhausted';
        // Track exhaustion reasons
        if (pref.reason === 'overvote') exhaustedOvervote += 1;
        else if (pref.reason === 'noValid') exhaustedNoValid += 1;
        else if (pref.reason === 'blank') exhaustedBlank += 1;
      }
    }

    const continuingBallots = Object.values(tallies).reduce((a, v) => a + v, 0);
    const threshold = continuingBallots / 2;

    let winner = '';
    for (const cid of continuing) {
      const v = tallies[cid] || 0;
      const meets = rules.majorityCondition === '>=' ? v >= threshold : v > threshold;
      if (meets) winner = cid;
    }

    const continuingList = Array.from(continuing);
    const resultBase: RoundResult = {
      roundIndex,
      continuing: continuingList,
      tallies,
      exhausted,
      exhaustionDetail: {
        overvoteAtRank: exhaustedOvervote,
        noValidNext: exhaustedNoValid,
        blankRemaining: exhaustedBlank,
      },
      continuingBallots,
      threshold,
    };

    if (winner) {
      resultBase.winner = winner;
      rounds.push(resultBase);
      break;
    }

    if (continuing.size === 1) {
      const only = continuingList[0];
      resultBase.winner = only;
      rounds.push(resultBase);
      break;
    }

    const votesArr = continuingList.map(cid => tallies[cid] || 0);
    const minVotes = votesArr.reduce((a, b) => Math.min(a, b), Infinity);
    const lows = continuingList.filter(cid => (tallies[cid] || 0) === minVotes);

    let eliminated = lows[0];
    if (lows.length !== 1) {
      // Try lookback if configured
      let resolved = false;
      if (rules.tieBreaker === 'lookback-then-lot' && rounds.length > 0) {
        for (let back = rounds.length - 1; back >= 0; back -= 1) {
          const rr = rounds[back];
          let min = Infinity;
          let minCands: string[] = [];
          for (const cid of lows) {
            const vPrev = rr.tallies[cid] ?? 0;
            if (vPrev < min) { min = vPrev; minCands = [cid]; }
            else if (vPrev === min) { minCands.push(cid); }
          }
          if (minCands.length === 1) {
            eliminated = minCands[0];
            resolved = true;
            break;
          }
        }
      }
      if (!resolved) {
        // Use seeded RNG for all tie-breaking to ensure reproducible simulations
        // Both 'seeded' and 'lot' modes now use the seeded random number generator
        const idx = Math.floor(rng() * lows.length);
        eliminated = lows[idx];
      }
      resultBase.tieBreak = { roundIndex, kind: 'elimination', tied: lows, chosen: eliminated };
    }
    resultBase.eliminated = eliminated;

    const nextContinuing = new Set<string>(continuing);
    nextContinuing.delete(eliminated);

    const transferMap: Record<string, number> = {};
    let transferToExhausted = 0;

    for (const b of ballots) {
      const alloc = currentAlloc[b.id];
      if (alloc !== eliminated) continue;
      const prefNext = nextPreference(b.ranks, nextContinuing);
      if (prefNext.type === 'vote') {
        const k = eliminated + '->' + prefNext.id;
        transferMap[k] = (transferMap[k] || 0) + 1;
      } else {
        transferToExhausted += 1;
      }
    }

    const transfers = [] as { from: string; to: string; count: number }[];
    for (const k of Object.keys(transferMap)) {
      const parts = k.split('->');
      transfers.push({ from: parts[0], to: parts[1], count: transferMap[k] });
    }
    if (transferToExhausted > 0) transfers.push({ from: eliminated, to: 'exhausted', count: transferToExhausted });
    resultBase.transfers = transfers;

    rounds.push(resultBase);

    if (userBallotId) {
      const prev = allocationByBallot[userBallotId] || 'start';
      const now = currentAlloc[userBallotId] || 'exhausted';
      userPath.push({ roundIndex, from: prev, to: now });
    }

    continuing.delete(eliminated);
    for (const bid of Object.keys(currentAlloc)) allocationByBallot[bid] = currentAlloc[bid];
    roundIndex += 1;
  }

  if (rounds.length !== 0 && !rounds[rounds.length - 1].winner && continuing.size === 1) {
    const last = rounds[rounds.length - 1];
    last.winner = Array.from(continuing)[0];
  }

  const winnerFinal = rounds[rounds.length - 1] && rounds[rounds.length - 1].winner ? (rounds[rounds.length - 1].winner as string) : '';
  return { rounds, winner: winnerFinal, userPath: userPath.length !== 0 ? userPath : undefined };
}

