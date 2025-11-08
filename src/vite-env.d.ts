/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Core Configuration
  readonly VITE_DEFAULT_SEED: string
  readonly VITE_DEFAULT_VOTER_COUNT: string

  // Simulation Limits
  readonly VITE_MIN_VOTER_COUNT: string
  readonly VITE_MAX_VOTER_COUNT: string

  // Debug & Development
  readonly VITE_DEBUG_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
