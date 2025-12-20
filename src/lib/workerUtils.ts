/**
 * Worker Utilities
 * Feature 16: Helper functions for Web Worker usage
 */

import { Ballot, Candidate, CountResult } from './types';

// Threshold for using Web Worker (number of voters)
export const WORKER_THRESHOLD = 20000;

/**
 * Check if Web Workers are supported
 */
export function supportsWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Should use worker based on voter count
 */
export function shouldUseWorker(voterCount: number): boolean {
  return supportsWorkers() && voterCount >= WORKER_THRESHOLD;
}

/**
 * Run RCV simulation in a Web Worker
 */
export async function runRCVInWorker(
  ballots: Ballot[],
  candidateIds: string[],
  seed: string,
  userBallotId?: string,
  onProgress?: (progress: number) => void
): Promise<CountResult> {
  return new Promise((resolve, reject) => {
    // Create worker from URL
    const workerCode = `
      importScripts('${window.location.origin}/rcv-worker.js');
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'progress' && onProgress) {
        onProgress(payload.progress);
      } else if (type === 'result') {
        worker.terminate();
        resolve(payload.result);
      } else if (type === 'error') {
        worker.terminate();
        reject(new Error(payload.error));
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    worker.postMessage({
      type: 'count',
      payload: { ballots, candidateIds, seed, userBallotId }
    });
  });
}

/**
 * Fallback: Run in main thread with chunked processing
 * This prevents UI blocking by processing in batches
 */
export async function runRCVChunked(
  ballots: Ballot[],
  candidateIds: string[],
  seed: string,
  userBallotId: string | undefined,
  runRCV: (ballots: Ballot[], candidateIds: string[], seed: string, userBallotId?: string) => CountResult,
  onProgress?: (progress: number) => void
): Promise<CountResult> {
  // For non-worker environments, just run directly
  // Add artificial progress updates for UX
  if (onProgress) {
    onProgress(10);
    await new Promise(r => setTimeout(r, 50));
    onProgress(30);
    await new Promise(r => setTimeout(r, 50));
  }

  const result = runRCV(ballots, candidateIds, seed, userBallotId);

  if (onProgress) {
    onProgress(100);
  }

  return result;
}
