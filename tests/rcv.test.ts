import { describe, test, expect } from 'vitest';
import { runRCV } from '../src/lib/rcv';
import { Ballot } from '../src/lib/types';

const cids = ['A', 'B', 'C', 'D'];

function b(id: string, ranks: any[]): Ballot {
  return { id, ranks, source: 'synthetic' };
}

describe('RCV basic scenarios', () => {
  test('immediate majority winner', () => {
    const ballots: Ballot[] = [
      b('1', ['A', 'B', 'C', 'D']),
      b('2', ['A', 'C', 'B', 'D']),
      b('3', ['A', 'D', 'B', 'C']),
    ];
    const res = runRCV(ballots, cids, 'seed1');
    expect(res.rounds[0].winner).toBe('A');
    expect(res.winner).toBe('A');
  });

  test('full exhaustion at first rank due to overvotes', () => {
    const ballots: Ballot[] = [
      b('1', [['A', 'B'], null, null, null]),
      b('2', [['B', 'C'], null, null, null]),
      b('3', [['C', 'D'], null, null, null]),
    ];
    const res = runRCV(ballots, cids, 'seed2');
    expect(res.rounds[0].exhausted).toBe(3);
    expect(res.winner).toBeTruthy();
  });

  test('single-rank ballots transfer only on eliminations', () => {
    const ballots: Ballot[] = [
      b('1', ['A', null, null, null]),
      b('2', ['B', null, null, null]),
      b('3', ['B', null, null, null]),
      b('4', ['C', null, null, null]),
    ];
    const res = runRCV(ballots, cids, 'seed3');
    expect(res.winner).toBeTruthy();
  });

  test('tie for last triggers seeded tie-break', () => {
    const ballots: Ballot[] = [
      b('1', ['A', 'B', null, null]),
      b('2', ['B', 'A', null, null]),
      b('3', ['C', 'A', null, null]),
      b('4', ['D', 'A', null, null]),
      b('5', ['A', null, null, null]),
      b('6', ['B', null, null, null]),
    ];
    const res = runRCV(ballots, cids, 'seed4');
    const r0 = res.rounds[0];
    expect(r0.tieBreak).toBeTruthy();
    if (r0.tieBreak) {
      expect(r0.tieBreak.tied.length).toBeGreaterThan(1);
      expect(r0.tieBreak.chosen).toBeDefined();
    }
  });
});

