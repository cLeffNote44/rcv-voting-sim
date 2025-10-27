/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Core Configuration
  readonly VITE_DEFAULT_SEED: string
  readonly VITE_DEFAULT_VOTER_COUNT: string
  
  // Debug & Development
  readonly VITE_DEBUG_MODE: string
  
  // Analytics
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_PLAUSIBLE_DOMAIN: string
  
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  
  // Feature Flags
  readonly VITE_ENABLE_SHARE_BUTTON: string
  readonly VITE_ENABLE_EXPORT_RESULTS: string
  readonly VITE_ENABLE_CUSTOM_CANDIDATES: string
  
  // Simulation Limits
  readonly VITE_MAX_CANDIDATES: string
  readonly VITE_MIN_CANDIDATES: string
  readonly VITE_MAX_VOTER_COUNT: string
  readonly VITE_MIN_VOTER_COUNT: string
  
  // UI Configuration
  readonly VITE_SHOW_TIE_BREAKER_INFO: string
  readonly VITE_ANIMATE_TRANSITIONS: string
  readonly VITE_CHART_COLOR_SCHEME: string
  
  // Deployment Configuration
  readonly VITE_PUBLIC_URL: string
  readonly VITE_SITE_TITLE: string
  readonly VITE_META_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
