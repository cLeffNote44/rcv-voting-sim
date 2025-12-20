import type { CountResult, Candidate } from './types';

/**
 * Export utilities for simulation results
 */

export function exportToCSV(result: CountResult, candidates: Candidate[]): string {
  const candidateMap = new Map(candidates.map(c => [c.id, c.name]));

  // Build CSV header
  const headers = ['Round', ...candidates.map(c => c.name), 'Exhausted', 'Continuing Ballots', 'Threshold', 'Eliminated', 'Winner'];

  // Build CSV rows
  const rows: string[][] = [headers];

  result.rounds.forEach((round, idx) => {
    const row = [
      String(idx + 1),
      ...candidates.map(c => String(round.tallies[c.id] || 0)),
      String(round.exhausted),
      String(round.continuingBallots),
      round.threshold.toFixed(1),
      round.eliminated ? (candidateMap.get(round.eliminated) || round.eliminated) : '',
      round.winner ? (candidateMap.get(round.winner) || round.winner) : ''
    ];
    rows.push(row);
  });

  // Add exhaustion detail section
  rows.push([]);
  rows.push(['Exhaustion Breakdown']);
  rows.push(['Round', 'Overvotes', 'No Valid Next', 'Blank Remaining']);

  result.rounds.forEach((round, idx) => {
    rows.push([
      String(idx + 1),
      String(round.exhaustionDetail?.overvoteAtRank ?? 0),
      String(round.exhaustionDetail?.noValidNext ?? 0),
      String(round.exhaustionDetail?.blankRemaining ?? 0)
    ]);
  });

  // Convert to CSV string
  return rows.map(row =>
    row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      const escaped = cell.replace(/"/g, '""');
      return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
}

export function exportToJSON(result: CountResult, candidates: Candidate[], seed: string, voterCount: number): string {
  const exportData = {
    metadata: {
      timestamp: new Date().toISOString(),
      seed,
      voterCount,
      candidateCount: candidates.length
    },
    candidates: candidates.map(c => ({
      id: c.id,
      name: c.name,
      shortLabel: c.shortLabel,
      bio: c.bio
    })),
    results: {
      winner: result.winner,
      totalRounds: result.rounds.length,
      rounds: result.rounds.map(r => ({
        roundIndex: r.roundIndex,
        continuing: r.continuing,
        tallies: r.tallies,
        exhausted: r.exhausted,
        exhaustionDetail: r.exhaustionDetail,
        continuingBallots: r.continuingBallots,
        threshold: r.threshold,
        eliminated: r.eliminated,
        winner: r.winner,
        tieBreak: r.tieBreak,
        transfers: r.transfers
      })),
      userBallotPath: result.userPath
    }
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFilename(extension: string, seed: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const seedPart = seed.slice(0, 8);
  return `rcv-simulation-${timestamp}-${seedPart}.${extension}`;
}
