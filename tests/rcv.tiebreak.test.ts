import { describe, it, expect } from 'vitest'
import { runRCV } from '../src/lib/rcv'
import type { Ballot } from '../src/lib/types'

// Candidates: a, b, c, d
// Round 0 tallies: a:3, b:2, c:1, d:1 (eliminate d)
// After transferring d -> c, Round 1 tallies: a:3, b:2, c:2
// Tie for last between b and c; lookback to Round 0 (b:2, c:1) => eliminate c

describe('RCV tie-break lookback then lot', () => {
  it('eliminates the candidate with lower prior-round tally when tied', () => {
    const ballots: Ballot[] = [
      { id: 'v1', ranks: ['a','b','c','d'], source: 'synthetic' },
      { id: 'v2', ranks: ['a','c','b','d'], source: 'synthetic' },
      { id: 'v3', ranks: ['a','b','c','d'], source: 'synthetic' },
      { id: 'v4', ranks: ['b','a','c','d'], source: 'synthetic' },
      { id: 'v5', ranks: ['b','a','c','d'], source: 'synthetic' },
      { id: 'v6', ranks: ['c','a','b','d'], source: 'synthetic' },
      { id: 'v7', ranks: ['d','c','a','b'], source: 'synthetic' },
    ]
    const res = runRCV(ballots, ['a','b','c','d'], 'test-seed', undefined)
    // After first elimination (roundIndex 0 -> eliminate d), roundIndex 1 should tie-break and eliminate c
    const r1 = res.rounds[1]
    expect(r1.tieBreak).toBeDefined()
    expect(r1.eliminated).toBe('c')
  })
})

