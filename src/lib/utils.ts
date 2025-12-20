import seedrandom from 'seedrandom';

export type RNG = () => number;

export function makeRng(seed: string): RNG {
  const rng = seedrandom(seed);
  const f = () => rng.quick();
  return f;
}

function canUseHistory(): boolean {
  try {
    // Avoid mutating file:// URLs or non-standard contexts
    const p = window.location.protocol;
    if (!(p === 'http:' || p === 'https:')) return false;
    // Some embedded contexts may throw on replaceState
    window.history.replaceState({}, '', window.location.href);
    return true;
  } catch {
    return false;
  }
}

export function parseParams(defaultSeed?: string): { seed: string; n: number } {
  // Get environment variables with fallbacks
  const envDefaultSeed = import.meta.env.VITE_DEFAULT_SEED || '';
  const envDefaultVoterCount = Number(import.meta.env.VITE_DEFAULT_VOTER_COUNT) || 5000;
  
  let seed = '';
  let n = envDefaultVoterCount;
  try {
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    seed = sp.get('seed') || '';
    const maybeN = Number(sp.get('n') || '');
    if (Number.isFinite(maybeN) && maybeN > 0) {
      // Apply limits from environment if set
      const minVoters = Number(import.meta.env.VITE_MIN_VOTER_COUNT) || 100;
      const maxVoters = Number(import.meta.env.VITE_MAX_VOTER_COUNT) || 50000;
      n = Math.min(maxVoters, Math.max(minVoters, maybeN));
    }
    if (!seed) {
      // Use environment default seed, then passed default, then random
      const s = envDefaultSeed || defaultSeed || Math.random().toString(36).slice(2, 10);
      seed = s;
      if (canUseHistory()) {
        sp.set('seed', s);
        sp.set('n', String(n));
        url.search = sp.toString();
        window.history.replaceState(null, '', url.toString());
      }
    }
  } catch {
    // Fallback: use environment defaults or generate random
    seed = envDefaultSeed || defaultSeed || Math.random().toString(36).slice(2, 10);
    n = envDefaultVoterCount;
  }
  
  // Debug logging if enabled
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log('RCV Sim Params:', { seed, n, envDefaultSeed, envDefaultVoterCount });
  }
  
  return { seed, n };
}

export function seededShuffle<T>(arr: T[], rng: RNG): T[] {
  const a = arr.slice();
  let i = a.length - 1;
  while (i !== -1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
    i -= 1;
  }
  return a;
}

export function pickNUnique<T>(arr: T[], n: number, rng: RNG): T[] {
  const s = seededShuffle(arr, rng);
  return s.slice(0, n);
}

export function randn(rng: RNG): number {
  let u = rng();
  let v = rng();
  if (u === 0) u = Number.MIN_VALUE;
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z;
}

export async function copyLinkToClipboard(): Promise<boolean> {
  const text = window.location.href;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts or older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      const success = document.execCommand('copy');
      return success;
    } finally {
      document.body.removeChild(ta);
    }
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
}

