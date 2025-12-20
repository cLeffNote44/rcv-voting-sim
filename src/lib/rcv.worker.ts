/**
 * Web Worker for RCV Simulation
 * Feature 16: Offload heavy computation for large elections
 */

import { runRCV } from './rcv';
import { generateElectorate } from './simulate';
import { Ballot, Candidate, CountResult } from './types';

export interface WorkerMessage {
  type: 'simulate' | 'count';
  payload: {
    seed: string;
    voterCount?: number;
    candidates?: Candidate[];
    positions?: Map<string, { x: number; y: number }>;
    ballots?: Ballot[];
    candidateIds?: string[];
    userBallotId?: string;
  };
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress';
  payload: {
    result?: CountResult;
    ballots?: Ballot[];
    error?: string;
    progress?: number;
  };
}

// Worker message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'simulate') {
      // Generate electorate in worker
      const { voterCount, candidates, positions, seed } = payload;

      if (!voterCount || !candidates || !positions) {
        throw new Error('Missing required parameters for simulation');
      }

      // Report progress
      self.postMessage({
        type: 'progress',
        payload: { progress: 10 }
      } as WorkerResponse);

      const ballots = generateElectorate(
        voterCount,
        candidates,
        positions,
        seed
      );

      self.postMessage({
        type: 'progress',
        payload: { progress: 50 }
      } as WorkerResponse);

      self.postMessage({
        type: 'result',
        payload: { ballots }
      } as WorkerResponse);
    } else if (type === 'count') {
      // Run RCV count in worker
      const { ballots, candidateIds, seed, userBallotId } = payload;

      if (!ballots || !candidateIds) {
        throw new Error('Missing required parameters for counting');
      }

      self.postMessage({
        type: 'progress',
        payload: { progress: 60 }
      } as WorkerResponse);

      const result = runRCV(ballots, candidateIds, seed, userBallotId);

      self.postMessage({
        type: 'progress',
        payload: { progress: 100 }
      } as WorkerResponse);

      self.postMessage({
        type: 'result',
        payload: { result }
      } as WorkerResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: { error: error instanceof Error ? error.message : 'Unknown error' }
    } as WorkerResponse);
  }
};
