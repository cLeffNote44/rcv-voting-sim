import { describe, it, expect } from 'vitest'
import { runRCV } from '../src/lib/rcv'
import type { Ballot } from '../src/lib/types'

describe('RCV exhaustion from overvote and blank handling', () => {
  it('counts an overvoted first rank as exhausted immediately', () => {
    const ballots: Ballot[] = [
      { id: 'v1', ranks: ['b','a','c',null], source: 'synthetic' },
      { id: 'v2', ranks: ['c','a','b',null], source: 'synthetic' },
      { id: 'v3', ranks: [['a','b'], 'c', null, null] as any, source: 'synthetic' },
    ]
    const res = runRCV(ballots, ['a','b','c'], 'seed', undefined)
    expect(res.rounds[0].exhausted).toBe(1)
  })
})

