/**
 * STV (Single Transferable Vote) Implementation for Multi-Winner Elections
 * Feature 5: Multi-Winner RCV Mode
 */

import { Ballot, Rank, Transfer, ExhaustionDetail } from './types';
import { makeRng } from './utils';

export type STVRoundResult = {
  roundIndex: number;
  continuing: string[];
  elected: string[];
  tallies: Record<string, number>;
  exhausted: number;
  exhaustionDetail: ExhaustionDetail;
  threshold: number; // Droop quota
  action: 'elect' | 'eliminate' | 'final';
  affectedCandidate?: string;
  transfers?: Transfer[];
  surplusTransfer?: { from: string; surplus: number; transferValue: number };
};

export type STVResult = {
  rounds: STVRoundResult[];
  winners: string[];
  seats: number;
};

/**
 * Calculate Droop quota: floor(votes / (seats + 1)) + 1
 */
function calculateDroopQuota(totalBallots: number, seats: number): number {
  return Math.floor(totalBallots / (seats + 1)) + 1;
}

/**
 * Get the next valid preference from a ballot
 */
function getNextPreference(
  ballot: { ranks: Rank[]; weight: number },
  continuing: Set<string>,
  elected: Set<string>,
  fromRank: number
): { candidateId: string | null; exhaustionReason: string | null; atRank: number } {
  for (let i = fromRank; i < ballot.ranks.length; i++) {
    const rank = ballot.ranks[i];

    if (rank === null) continue; // Skip blanks

    if (Array.isArray(rank)) {
      // Overvote - ballot is exhausted
      return { candidateId: null, exhaustionReason: 'overvote', atRank: i };
    }

    if (continuing.has(rank)) {
      return { candidateId: rank, exhaustionReason: null, atRank: i };
    }
    // Skip elected or eliminated candidates
  }

  return { candidateId: null, exhaustionReason: 'noValidNext', atRank: ballot.ranks.length };
}

/**
 * Run STV election for multiple seats
 */
export function runSTV(
  ballots: Ballot[],
  candidateIds: string[],
  seats: number,
  seed: string
): STVResult {
  if (seats < 1) throw new Error('Must elect at least 1 seat');
  if (seats >= candidateIds.length) throw new Error('Seats must be fewer than candidates');
  if (ballots.length === 0) throw new Error('No ballots provided');

  const rng = makeRng(seed);
  const rounds: STVRoundResult[] = [];
  const elected: Set<string> = new Set();
  const eliminated: Set<string> = new Set();
  const continuing = new Set(candidateIds);

  // Track ballot weights for surplus transfers
  const ballotWeights = ballots.map(() => 1.0);
  const ballotCurrentRank = ballots.map(() => 0);

  const quota = calculateDroopQuota(ballots.length, seats);

  let roundIndex = 0;

  while (elected.size < seats && continuing.size > 0) {
    // Calculate tallies with current weights
    const tallies: Record<string, number> = {};
    candidateIds.forEach(id => {
      if (continuing.has(id)) tallies[id] = 0;
    });

    let exhausted = 0;
    let overvoteCount = 0;
    let noValidNextCount = 0;
    let blankCount = 0;

    // Count votes
    ballots.forEach((ballot, i) => {
      if (ballotWeights[i] <= 0) return;

      const pref = getNextPreference(
        { ranks: ballot.ranks, weight: ballotWeights[i] },
        continuing,
        elected,
        ballotCurrentRank[i]
      );

      if (pref.candidateId) {
        tallies[pref.candidateId] += ballotWeights[i];
        ballotCurrentRank[i] = pref.atRank;
      } else {
        exhausted += ballotWeights[i];
        if (pref.exhaustionReason === 'overvote') overvoteCount++;
        else if (pref.exhaustionReason === 'noValidNext') noValidNextCount++;
        else blankCount++;
        ballotWeights[i] = 0;
      }
    });

    // Find candidates at or above quota
    const atQuota = Object.entries(tallies)
      .filter(([_, votes]) => votes >= quota)
      .sort((a, b) => b[1] - a[1]);

    let action: 'elect' | 'eliminate' | 'final' = 'eliminate';
    let affectedCandidate: string | undefined;
    let transfers: Transfer[] = [];
    let surplusTransfer: { from: string; surplus: number; transferValue: number } | undefined;

    if (atQuota.length > 0) {
      // Elect candidate with most votes
      const [winnerId, winnerVotes] = atQuota[0];
      action = 'elect';
      affectedCandidate = winnerId;
      elected.add(winnerId);
      continuing.delete(winnerId);

      // Transfer surplus
      const surplus = winnerVotes - quota;
      if (surplus > 0 && elected.size < seats) {
        const transferValue = surplus / winnerVotes;
        surplusTransfer = { from: winnerId, surplus, transferValue };

        // Adjust weights for ballots that went to this winner
        ballots.forEach((ballot, i) => {
          if (ballotWeights[i] <= 0) return;
          const pref = getNextPreference(
            { ranks: ballot.ranks, weight: ballotWeights[i] },
            new Set([winnerId]),
            new Set(),
            ballotCurrentRank[i]
          );
          if (pref.candidateId === winnerId) {
            ballotWeights[i] *= transferValue;
            ballotCurrentRank[i] = pref.atRank + 1;
          }
        });
      }
    } else if (continuing.size + elected.size <= seats) {
      // Remaining candidates all get elected
      action = 'final';
      continuing.forEach(id => {
        elected.add(id);
      });
      continuing.clear();
    } else {
      // Eliminate lowest candidate
      const sorted = Object.entries(tallies).sort((a, b) => a[1] - b[1]);

      // Handle ties for elimination
      const lowest = sorted[0][1];
      const tied = sorted.filter(([_, v]) => v === lowest).map(([id]) => id);

      if (tied.length > 1) {
        // Random elimination among tied
        const idx = Math.floor(rng() * tied.length);
        affectedCandidate = tied[idx];
      } else {
        affectedCandidate = tied[0];
      }

      eliminated.add(affectedCandidate);
      continuing.delete(affectedCandidate);

      // Track transfers
      const transferCounts: Record<string, number> = {};
      ballots.forEach((ballot, i) => {
        if (ballotWeights[i] <= 0) return;
        const pref = getNextPreference(
          { ranks: ballot.ranks, weight: ballotWeights[i] },
          new Set([affectedCandidate!]),
          elected,
          ballotCurrentRank[i]
        );
        if (pref.candidateId === affectedCandidate) {
          // Find next preference
          const nextPref = getNextPreference(
            { ranks: ballot.ranks, weight: ballotWeights[i] },
            continuing,
            elected,
            pref.atRank + 1
          );
          if (nextPref.candidateId) {
            transferCounts[nextPref.candidateId] = (transferCounts[nextPref.candidateId] || 0) + ballotWeights[i];
            ballotCurrentRank[i] = nextPref.atRank;
          } else {
            exhausted += ballotWeights[i];
            ballotWeights[i] = 0;
          }
        }
      });

      transfers = Object.entries(transferCounts).map(([to, count]) => ({
        from: affectedCandidate!,
        to,
        count: Math.round(count)
      }));
    }

    rounds.push({
      roundIndex,
      continuing: Array.from(continuing),
      elected: Array.from(elected),
      tallies,
      exhausted: Math.round(exhausted),
      exhaustionDetail: {
        overvoteAtRank: overvoteCount,
        noValidNext: noValidNextCount,
        blankRemaining: blankCount
      },
      threshold: quota,
      action,
      affectedCandidate,
      transfers: transfers.length > 0 ? transfers : undefined,
      surplusTransfer
    });

    roundIndex++;

    // Safety check
    if (roundIndex > candidateIds.length * 2) {
      break;
    }
  }

  return {
    rounds,
    winners: Array.from(elected),
    seats
  };
}
