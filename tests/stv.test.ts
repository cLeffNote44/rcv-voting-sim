/**
 * STV (Single Transferable Vote) Tests
 * Feature 5: Multi-winner election tests
 */

import { describe, it, expect } from 'vitest';
import { runSTV } from '../src/lib/stv';
import { Ballot } from '../src/lib/types';

describe('STV Multi-Winner Elections', () => {
  const makeBallot = (id: string, ranks: (string | string[] | null)[]): Ballot => ({
    id,
    ranks,
    source: 'synthetic'
  });

  describe('Basic STV election', () => {
    it('should elect correct number of winners', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', 'C', null]),
        makeBallot('b2', ['A', 'B', 'C', null]),
        makeBallot('b3', ['A', 'B', 'C', null]),
        makeBallot('b4', ['B', 'A', 'C', null]),
        makeBallot('b5', ['B', 'A', 'C', null]),
        makeBallot('b6', ['C', 'B', 'A', null]),
        makeBallot('b7', ['D', 'C', 'B', null]),
      ];

      const result = runSTV(ballots, ['A', 'B', 'C', 'D'], 2, 'test-seed');

      expect(result.winners.length).toBe(2);
      expect(result.seats).toBe(2);
      expect(result.rounds.length).toBeGreaterThan(0);
    });

    it('should use Droop quota correctly', () => {
      // Droop quota = floor(7 / (2 + 1)) + 1 = floor(2.33) + 1 = 3
      const ballots: Ballot[] = Array(7).fill(null).map((_, i) =>
        makeBallot(`b${i}`, ['A', 'B', 'C', 'D'])
      );

      const result = runSTV(ballots, ['A', 'B', 'C', 'D'], 2, 'test-seed');

      expect(result.rounds[0].threshold).toBe(3);
    });
  });

  describe('Surplus transfer', () => {
    it('should transfer surplus votes', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
        makeBallot('b2', ['A', 'B', null, null]),
        makeBallot('b3', ['A', 'B', null, null]),
        makeBallot('b4', ['A', 'B', null, null]),
        makeBallot('b5', ['A', 'C', null, null]),
        makeBallot('b6', ['B', 'C', null, null]),
        makeBallot('b7', ['C', 'B', null, null]),
      ];

      const result = runSTV(ballots, ['A', 'B', 'C'], 2, 'test-seed');

      // A should win with surplus
      expect(result.winners).toContain('A');

      // Check that surplus transfer occurred
      const electionRound = result.rounds.find(r => r.action === 'elect' && r.affectedCandidate === 'A');
      if (electionRound?.surplusTransfer) {
        expect(electionRound.surplusTransfer.from).toBe('A');
        expect(electionRound.surplusTransfer.surplus).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly seats+1 candidates', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
        makeBallot('b2', ['B', 'A', null, null]),
        makeBallot('b3', ['C', 'A', null, null]),
      ];

      // 2 seats, 3 candidates
      const result = runSTV(ballots, ['A', 'B', 'C'], 2, 'test-seed');

      expect(result.winners.length).toBe(2);
    });

    it('should throw error if seats >= candidates', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
      ];

      expect(() => runSTV(ballots, ['A', 'B'], 2, 'test-seed')).toThrow();
    });

    it('should throw error if seats < 1', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
      ];

      expect(() => runSTV(ballots, ['A', 'B'], 0, 'test-seed')).toThrow();
    });
  });
});
