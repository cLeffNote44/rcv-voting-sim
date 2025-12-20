export type Candidate = {
  id: string;
  name: string;
  shortLabel: string;
  bio: string;
  headshotUrl?: string;
};

export type Rank = string | string[] | null;

export type Ballot = {
  id: string;
  ranks: Rank[];
  source: 'synthetic' | 'user';
};

export type TieBreak = {
  roundIndex: number;
  kind: 'elimination';
  tied: string[];
  chosen: string;
};

export type Transfer = { from: string; to: string; count: number };

export type ExhaustionDetail = {
  overvoteAtRank: number;  // Count of ballots exhausted due to overvote at this round
  noValidNext: number;      // Count of ballots with no remaining valid candidates
  blankRemaining: number;   // Count of ballots with only blanks remaining
};

export type RoundResult = {
  roundIndex: number;
  continuing: string[];
  tallies: Record<string, number>;
  exhausted: number;
  exhaustionDetail?: ExhaustionDetail;
  continuingBallots: number;
  threshold: number;
  winner?: string;
  eliminated?: string;
  tieBreak?: TieBreak;
  transfers?: Transfer[];
};

export type CountResult = {
  rounds: RoundResult[];
  winner: string;
  userPath?: { roundIndex: number; from: string; to: string }[];
};

// RCV rule configuration. This enables jurisdiction-specific nuances without changing callers.
export type TieBreakerStrategy = 'lot' | 'seeded' | 'lookback-then-lot';

export type RCVRules = {
  // Tie-breaking strategy when multiple candidates are tied for lowest.
  // 'lookback-then-lot': compare prior-round tallies among tied candidates, if still tied use lot.
  // 'lot': break ties purely by random lot (Math.random).
  // 'seeded': break ties with seeded RNG (deterministic for demos).
  tieBreaker: TieBreakerStrategy;
  // Whether to eliminate multiple candidates at once (not used for Fort Collins; keep false/undefined).
  eliminateBatch?: boolean;
  // Majority condition; most single-winner IRV jurisdictions require strictly greater than 50% of continuing ballots.
  majorityCondition?: '>' | '>=';
};

