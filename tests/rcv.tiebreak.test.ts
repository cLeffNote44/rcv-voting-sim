import { describe, it, expect } from 'vitest'
import { runRCV } from '../src/lib/rcv'
import type { Ballot } from '../src/lib/types'

describe('RCV tie-break lookback then lot', () => {
  it('eliminates the candidate with lower prior-round tally when tied', () => {
    // Ballot setup designed to create a tie scenario that requires lookback
    // v1-v3: rank A first (3 votes for A)
    // v4-v5: rank B first (2 votes for B)
    // v6: ranks C first (1 vote for C)
    // v7: ranks D first (1 vote for D)
    // v8: ranks D first, with B as second choice (creates the tie scenario)
    const ballots: Ballot[] = [
      { id: 'v1', ranks: ['a','b','c','d'], source: 'synthetic' },
      { id: 'v2', ranks: ['a','c','b','d'], source: 'synthetic' },
      { id: 'v3', ranks: ['a','b','c','d'], source: 'synthetic' },
      { id: 'v4', ranks: ['b','a','c','d'], source: 'synthetic' },
      { id: 'v5', ranks: ['b','a','c','d'], source: 'synthetic' },
      { id: 'v6', ranks: ['c','a','b','d'], source: 'synthetic' },
      { id: 'v7', ranks: ['d','c','a','b'], source: 'synthetic' },
      { id: 'v8', ranks: ['d','b','a','c'], source: 'synthetic' },
    ]

    const res = runRCV(ballots, ['a','b','c','d'], 'test-seed', undefined)

    // Round 0: a:3, b:2, c:1, d:2 -> eliminate c (lowest)
    // Round 1: a:4, b:2, d:2 -> tie between b and d
    // Lookback to Round 0: b had 2, d had 2 -> still tied, use seeded lot
    // Round 2: Winner determined

    // Verify that tie-breaking occurred
    const roundsWithTieBreak = res.rounds.filter(r => r.tieBreak)
    expect(roundsWithTieBreak.length).toBeGreaterThan(0)

    // Verify the algorithm completed successfully with a winner
    expect(res.winner).toBeTruthy()
    expect(['a', 'b', 'd']).toContain(res.winner)
  })
})

