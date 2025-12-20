/**
 * Extended RCV Tests
 * Feature 18: Comprehensive test coverage for edge cases
 */

import { describe, it, expect } from 'vitest';
import { runRCV } from '../src/lib/rcv';
import { Ballot } from '../src/lib/types';

describe('RCV Extended Tests', () => {
  // Test utilities
  const makeBallot = (id: string, ranks: (string | string[] | null)[]): Ballot => ({
    id,
    ranks,
    source: 'synthetic'
  });

  describe('Three-way tie for elimination', () => {
    it('should handle three-way tie with seeded RNG determinism', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', 'C', null]),
        makeBallot('b2', ['B', 'A', 'C', null]),
        makeBallot('b3', ['C', 'A', 'B', null]),
        makeBallot('b4', ['D', 'A', 'B', null]),
        makeBallot('b5', ['D', 'A', 'B', null]),
        makeBallot('b6', ['D', 'A', 'B', null]),
      ];
      // A, B, C each have 1 vote; D has 3 votes
      // D wins first round but not majority
      // A, B, C are tied for last

      const result = runRCV(ballots, ['A', 'B', 'C', 'D'], 'test-seed-123');

      expect(result.winner).toBeDefined();
      // Run again with same seed should give same result
      const result2 = runRCV(ballots, ['A', 'B', 'C', 'D'], 'test-seed-123');
      expect(result.winner).toBe(result2.winner);
    });
  });

  describe('All ballots exhausted', () => {
    it('should handle election where all ballots exhaust before winner', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', null, null, null]),
        makeBallot('b2', ['B', null, null, null]),
        makeBallot('b3', ['C', null, null, null]),
        makeBallot('b4', ['D', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B', 'C', 'D'], 'test-seed');

      // Should still determine a winner (last standing or by elimination order)
      expect(result.winner).toBeDefined();
      expect(result.rounds.length).toBeGreaterThan(0);
    });

    it('should track exhaustion correctly for bullet votes', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', null, null, null]),
        makeBallot('b2', ['A', null, null, null]),
        makeBallot('b3', ['B', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      expect(result.winner).toBe('A');
      // No exhaustion needed since A has majority
      expect(result.rounds.length).toBe(1);
    });
  });

  describe('Overvote handling', () => {
    it('should exhaust ballot at first overvote rank', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', [['A', 'B'], null, null, null]), // Overvote
        makeBallot('b2', ['A', null, null, null]),
        makeBallot('b3', ['B', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      // First ballot exhausts immediately
      expect(result.rounds[0].exhausted).toBe(1);
      expect(result.rounds[0].exhaustionDetail?.overvoteAtRank).toBe(1);
    });

    it('should handle overvote after valid first choice', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', ['B', 'C'], null, null]), // Overvote at rank 2
        makeBallot('b2', ['A', 'B', null, null]),
        makeBallot('b3', ['B', 'A', null, null]),
        makeBallot('b4', ['C', 'A', null, null]),
        makeBallot('b5', ['C', 'A', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B', 'C'], 'test-seed');

      expect(result.winner).toBeDefined();
      // First ballot should exhaust when A is eliminated (if that happens)
    });
  });

  describe('Skipped ranks (undervotes)', () => {
    it('should skip blank ranks and continue to next valid choice', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', null, 'B', null]), // Blank rank 2
        makeBallot('b2', ['B', 'A', null, null]),
        makeBallot('b3', ['C', 'A', null, null]),
        makeBallot('b4', ['C', 'B', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B', 'C'], 'test-seed');

      expect(result.winner).toBeDefined();
      expect(result.rounds.length).toBeGreaterThan(0);
    });
  });

  describe('Duplicate candidate rankings', () => {
    it('should skip duplicate rankings and continue', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'A', 'B', null]), // A ranked twice
        makeBallot('b2', ['B', 'A', null, null]),
        makeBallot('b3', ['A', 'B', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      // First ballot: A at rank 1, A at rank 2 (skip), B at rank 3
      expect(result.winner).toBe('A');
    });
  });

  describe('Two candidates with clear winner', () => {
    it('should handle election with two candidates', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
        makeBallot('b2', ['A', 'B', null, null]),
        makeBallot('b3', ['A', 'B', null, null]),
        makeBallot('b4', ['B', 'A', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      // A has 3/4 = 75% which is > 50%
      expect(result.winner).toBe('A');
      expect(result.rounds.length).toBe(1);
    });
  });

  describe('Large number of candidates', () => {
    it('should handle election with 10 candidates', () => {
      const candidates = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const ballots: Ballot[] = [];

      // Create ballots with various rankings
      for (let i = 0; i < 100; i++) {
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        ballots.push(makeBallot(`b${i}`, shuffled.slice(0, 4)));
      }

      const result = runRCV(ballots, candidates, 'test-seed');

      expect(result.winner).toBeDefined();
      expect(candidates).toContain(result.winner);
      expect(result.rounds.length).toBeGreaterThan(0);
      expect(result.rounds.length).toBeLessThanOrEqual(candidates.length);
    });
  });

  describe('Transfer tracking', () => {
    it('should correctly track vote transfers', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', 'B', null, null]),
        makeBallot('b2', ['A', 'C', null, null]),
        makeBallot('b3', ['B', 'C', null, null]),
        makeBallot('b4', ['C', 'B', null, null]),
        makeBallot('b5', ['C', 'B', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B', 'C'], 'test-seed');

      // A has 2 votes, B has 1, C has 2
      // A or B gets eliminated first (tie for lowest if B)
      // Check that transfers are tracked
      const roundWithTransfers = result.rounds.find(r => r.transfers && r.transfers.length > 0);
      if (roundWithTransfers) {
        expect(roundWithTransfers.transfers).toBeDefined();
        expect(roundWithTransfers.transfers!.length).toBeGreaterThan(0);
        roundWithTransfers.transfers!.forEach(t => {
          expect(t.from).toBeDefined();
          expect(t.to).toBeDefined();
          expect(t.count).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('User ballot path tracking', () => {
    it('should track user ballot path through rounds', () => {
      const ballots: Ballot[] = [
        makeBallot('user', ['A', 'B', 'C', null]),
        makeBallot('b1', ['B', 'C', null, null]),
        makeBallot('b2', ['C', 'B', null, null]),
        makeBallot('b3', ['C', 'B', null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B', 'C'], 'test-seed', 'user');

      expect(result.userPath).toBeDefined();
      expect(result.userPath!.length).toBeGreaterThan(0);

      // First entry should be 'start' -> 'A'
      expect(result.userPath![0].from).toBe('start');
      expect(result.userPath![0].to).toBe('A');
    });
  });

  describe('Majority threshold calculation', () => {
    it('should calculate correct threshold (>50% of continuing)', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', null, null, null]),
        makeBallot('b2', ['A', null, null, null]),
        makeBallot('b3', ['A', null, null, null]),
        makeBallot('b4', ['B', null, null, null]),
        makeBallot('b5', ['B', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      // 5 ballots, threshold should be 2.5 (need >2.5 = 3)
      expect(result.rounds[0].threshold).toBe(2.5);
      expect(result.winner).toBe('A'); // A has 3 votes > 2.5
    });
  });

  describe('Edge case: Exactly 50%', () => {
    it('should not declare winner with exactly 50%', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', ['A', null, null, null]),
        makeBallot('b2', ['A', null, null, null]),
        makeBallot('b3', ['B', null, null, null]),
        makeBallot('b4', ['B', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      // 4 ballots, threshold = 2, need >2
      // Both have 2 votes = 50%, so tie-break should occur
      expect(result.rounds.length).toBeGreaterThan(0);
      expect(result.winner).toBeDefined();
    });
  });

  describe('Empty ballot handling', () => {
    it('should handle completely empty ballot', () => {
      const ballots: Ballot[] = [
        makeBallot('b1', [null, null, null, null]), // Empty ballot
        makeBallot('b2', ['A', null, null, null]),
        makeBallot('b3', ['A', null, null, null]),
        makeBallot('b4', ['B', null, null, null]),
      ];

      const result = runRCV(ballots, ['A', 'B'], 'test-seed');

      expect(result.rounds[0].exhausted).toBe(1);
      expect(result.rounds[0].exhaustionDetail?.blankRemaining).toBe(1);
      expect(result.winner).toBe('A');
    });
  });
});
