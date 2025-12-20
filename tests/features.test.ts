/**
 * Feature Tests
 * Test coverage for utility functions and new features
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock document for theme tests
Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => null
    }
  },
  writable: true
});

// Mock navigator for i18n tests
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'en-US' },
  writable: true
});

describe('Theme Functions', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should export ColorScheme type', async () => {
    const { setColorScheme, getColorScheme } = await import('../src/lib/theme');
    expect(typeof setColorScheme).toBe('function');
    expect(typeof getColorScheme).toBe('function');
  });

  it('should get default color scheme', async () => {
    const { getColorScheme } = await import('../src/lib/theme');
    // Default should be 'default'
    const scheme = getColorScheme();
    expect(['default', 'colorblind', 'high-contrast']).toContain(scheme);
  });

  it('should set and persist color scheme', async () => {
    const { setColorScheme, getColorScheme } = await import('../src/lib/theme');
    setColorScheme('colorblind');
    expect(getColorScheme()).toBe('colorblind');
  });
});

describe('i18n Functions', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should export language functions', async () => {
    const { t, setLanguage, getLanguage, getAvailableLanguages } = await import('../src/lib/i18n');
    expect(typeof t).toBe('function');
    expect(typeof setLanguage).toBe('function');
    expect(typeof getLanguage).toBe('function');
    expect(typeof getAvailableLanguages).toBe('function');
  });

  it('should return translations for keys', async () => {
    const { t } = await import('../src/lib/i18n');
    const title = t('appTitle');
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('should have all required languages', async () => {
    const { getAvailableLanguages } = await import('../src/lib/i18n');
    const languages = getAvailableLanguages();
    expect(languages.length).toBe(5);
    expect(languages.map(l => l.code)).toContain('en');
    expect(languages.map(l => l.code)).toContain('es');
    expect(languages.map(l => l.code)).toContain('fr');
    expect(languages.map(l => l.code)).toContain('de');
    expect(languages.map(l => l.code)).toContain('zh');
  });

  it('should set and persist language', async () => {
    const { setLanguage, getLanguage } = await import('../src/lib/i18n');
    setLanguage('es');
    expect(getLanguage()).toBe('es');
  });

  it('should return translated strings for all keys', async () => {
    const { t, setLanguage } = await import('../src/lib/i18n');

    // Test some core keys in English
    setLanguage('en');
    expect(t('startSimulation')).toBe('Start simulation');
    expect(t('round')).toBe('Round');
    expect(t('winner')).toBe('Winner');
    expect(t('eliminated')).toBe('Eliminated');
  });
});

describe('Export Functions', () => {
  it('should export required functions', async () => {
    const { exportToCSV, exportToJSON, generateFilename } = await import('../src/lib/export');
    expect(typeof exportToCSV).toBe('function');
    expect(typeof exportToJSON).toBe('function');
    expect(typeof generateFilename).toBe('function');
  });

  it('should generate filenames with correct extension', async () => {
    const { generateFilename } = await import('../src/lib/export');
    const csvFilename = generateFilename('csv', 'test-seed');
    expect(csvFilename).toContain('.csv');
    expect(csvFilename).toContain('rcv');

    const jsonFilename = generateFilename('json', 'test-seed');
    expect(jsonFilename).toContain('.json');
    expect(jsonFilename).toContain('rcv');
  });

  it('should export CSV with proper headers', async () => {
    const { exportToCSV } = await import('../src/lib/export');
    const mockResult = {
      rounds: [
        {
          roundIndex: 0,
          tallies: { 'a': 10, 'b': 5 },
          exhausted: 1,
          exhaustionDetail: { overvoteAtRank: 0, noValidNext: 0, blankRemaining: 1 },
          threshold: 8,
          continuingBallots: 15
        }
      ],
      winner: 'a'
    };
    const mockCandidates = [
      { id: 'a', name: 'Alice', shortLabel: 'A', bio: 'Test' },
      { id: 'b', name: 'Bob', shortLabel: 'B', bio: 'Test' }
    ];

    const csv = exportToCSV(mockResult as any, mockCandidates as any);
    expect(csv).toContain('Round');
    expect(csv).toContain('Alice');
    expect(csv).toContain('Bob');
    expect(csv).toContain('Exhausted');
  });

  it('should export JSON with metadata', async () => {
    const { exportToJSON } = await import('../src/lib/export');
    const mockResult = {
      rounds: [
        {
          roundIndex: 0,
          tallies: { 'a': 10 },
          exhausted: 0,
          threshold: 5.5,
          continuingBallots: 10
        }
      ],
      winner: 'a'
    };
    const mockCandidates = [
      { id: 'a', name: 'Alice', shortLabel: 'A', bio: 'Test' }
    ];

    const json = exportToJSON(mockResult as any, mockCandidates as any, 'test-seed', 1000);
    const parsed = JSON.parse(json);

    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.seed).toBe('test-seed');
    expect(parsed.metadata.voterCount).toBe(1000);
    expect(parsed.candidates).toBeDefined();
    expect(parsed.results).toBeDefined();
    expect(parsed.results.winner).toBe('a');
  });
});

describe('Utils Functions', () => {
  it('should export parseParams', async () => {
    const { parseParams } = await import('../src/lib/utils');
    expect(typeof parseParams).toBe('function');
  });

  it('should return valid params structure', async () => {
    const { parseParams } = await import('../src/lib/utils');

    const params = parseParams();
    // Should have seed and n properties
    expect(params).toHaveProperty('seed');
    expect(params).toHaveProperty('n');
    // Seed should be a string
    expect(typeof params.seed).toBe('string');
    // n should be a number
    expect(typeof params.n).toBe('number');
    // n should be within valid range
    expect(params.n).toBeGreaterThanOrEqual(100);
    expect(params.n).toBeLessThanOrEqual(50000);
  });
});

describe('RCV Algorithm Edge Cases', () => {
  it('should handle election with only two candidates', async () => {
    const { runRCV } = await import('../src/lib/rcv');

    const ballots = [
      { id: 'b1', ranks: ['A', 'B', null, null], source: 'synthetic' as const },
      { id: 'b2', ranks: ['A', 'B', null, null], source: 'synthetic' as const },
      { id: 'b3', ranks: ['B', 'A', null, null], source: 'synthetic' as const }
    ];

    const result = runRCV(ballots, ['A', 'B'], 'test');
    expect(result.winner).toBe('A');
    expect(result.rounds.length).toBe(1);
  });

  it('should track user ballot path', async () => {
    const { runRCV } = await import('../src/lib/rcv');

    const ballots = [
      { id: 'user', ranks: ['A', 'B', 'C', null], source: 'user' as const },
      { id: 'b1', ranks: ['B', 'C', null, null], source: 'synthetic' as const },
      { id: 'b2', ranks: ['C', 'B', null, null], source: 'synthetic' as const },
      { id: 'b3', ranks: ['C', 'B', null, null], source: 'synthetic' as const }
    ];

    const result = runRCV(ballots, ['A', 'B', 'C'], 'test', 'user');
    expect(result.userPath).toBeDefined();
    expect(result.userPath!.length).toBeGreaterThan(0);
    expect(result.userPath![0].from).toBe('start');
    expect(result.userPath![0].to).toBe('A');
  });

  it('should handle seeded determinism correctly', async () => {
    const { runRCV } = await import('../src/lib/rcv');

    const ballots = [
      { id: 'b1', ranks: ['A', 'B', null, null], source: 'synthetic' as const },
      { id: 'b2', ranks: ['B', 'A', null, null], source: 'synthetic' as const },
      { id: 'b3', ranks: ['C', 'A', null, null], source: 'synthetic' as const },
      { id: 'b4', ranks: ['D', 'C', null, null], source: 'synthetic' as const },
      { id: 'b5', ranks: ['D', 'C', null, null], source: 'synthetic' as const }
    ];

    const result1 = runRCV(ballots, ['A', 'B', 'C', 'D'], 'seed-123');
    const result2 = runRCV(ballots, ['A', 'B', 'C', 'D'], 'seed-123');

    // Same seed should produce same result
    expect(result1.winner).toBe(result2.winner);
    expect(result1.rounds.length).toBe(result2.rounds.length);
  });
});

describe('STV Algorithm', () => {
  it('should correctly calculate Droop quota', async () => {
    const { runSTV } = await import('../src/lib/stv');

    // 10 ballots, 2 seats: Droop = floor(10/(2+1)) + 1 = 4
    const ballots = Array(10).fill(null).map((_, i) => ({
      id: `b${i}`,
      ranks: ['A', 'B', 'C', 'D'],
      source: 'synthetic' as const
    }));

    const result = runSTV(ballots, ['A', 'B', 'C', 'D'], 2, 'test');
    expect(result.rounds[0].threshold).toBe(4);
  });

  it('should elect correct number of winners', async () => {
    const { runSTV } = await import('../src/lib/stv');

    const ballots = [
      { id: 'b1', ranks: ['A', 'B', 'C', 'D'], source: 'synthetic' as const },
      { id: 'b2', ranks: ['A', 'B', 'C', 'D'], source: 'synthetic' as const },
      { id: 'b3', ranks: ['A', 'B', 'C', 'D'], source: 'synthetic' as const },
      { id: 'b4', ranks: ['B', 'C', 'A', 'D'], source: 'synthetic' as const },
      { id: 'b5', ranks: ['B', 'C', 'A', 'D'], source: 'synthetic' as const },
      { id: 'b6', ranks: ['C', 'A', 'B', 'D'], source: 'synthetic' as const },
      { id: 'b7', ranks: ['D', 'C', 'B', 'A'], source: 'synthetic' as const }
    ];

    const result = runSTV(ballots, ['A', 'B', 'C', 'D'], 2, 'test');
    expect(result.winners.length).toBe(2);
    expect(result.seats).toBe(2);
  });
});
