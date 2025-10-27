# Environment Configuration Guide

This document explains how to configure environment variables for the RCV Voting Simulator.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your desired values

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables Reference

### Core Configuration

#### `VITE_DEFAULT_SEED`
- **Type:** String
- **Default:** Empty (random seed generated)
- **Description:** Sets a default seed for the random number generator. When set, the simulation will produce consistent results across page reloads.
- **Example:** `VITE_DEFAULT_SEED=abc123`
- **Use Case:** Useful for testing, demonstrations, or creating reproducible scenarios

#### `VITE_DEFAULT_VOTER_COUNT`
- **Type:** Number
- **Default:** `5000`
- **Range:** 100-50000
- **Description:** Sets the default number of simulated voters
- **Performance Note:** Higher numbers provide more realistic results but may impact performance on slower devices

### Simulation Limits

#### `VITE_MIN_VOTER_COUNT` / `VITE_MAX_VOTER_COUNT`
- **Type:** Number
- **Default:** `100` / `50000`
- **Description:** Enforces minimum and maximum limits for voter count

#### `VITE_MIN_CANDIDATES` / `VITE_MAX_CANDIDATES`
- **Type:** Number
- **Default:** `3` / `10`
- **Description:** Controls the minimum and maximum number of candidates in a race

### Feature Flags

#### `VITE_ENABLE_SHARE_BUTTON`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Shows/hides the share button for copying simulation links

#### `VITE_ENABLE_EXPORT_RESULTS`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Enables exporting simulation results to CSV/JSON (future feature)

#### `VITE_ENABLE_CUSTOM_CANDIDATES`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Allows users to create custom candidate profiles (future feature)

### UI Configuration

#### `VITE_SHOW_TIE_BREAKER_INFO`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Shows detailed information when tie-breakers occur in the RCV process

#### `VITE_ANIMATE_TRANSITIONS`
- **Type:** Boolean
- **Default:** `true`
- **Description:** Enables smooth animations for chart transitions

#### `VITE_CHART_COLOR_SCHEME`
- **Type:** String
- **Default:** `default`
- **Options:** `default`, `colorblind`, `highcontrast`
- **Description:** Controls the color palette used in visualizations

### Debug & Development

#### `VITE_DEBUG_MODE`
- **Type:** Boolean
- **Default:** `false`
- **Description:** Enables console logging of simulation parameters and internal state

### Analytics (Optional)

#### `VITE_GA_TRACKING_ID`
- **Type:** String
- **Default:** Empty
- **Description:** Google Analytics 4 Measurement ID
- **Format:** `G-XXXXXXXXXX`

#### `VITE_PLAUSIBLE_DOMAIN`
- **Type:** String
- **Default:** Empty
- **Description:** Domain for Plausible Analytics tracking

### Deployment Configuration

#### `VITE_PUBLIC_URL`
- **Type:** String
- **Default:** Empty
- **Description:** The public URL where the application is hosted
- **Example:** `https://rcv-sim.example.com`

#### `VITE_SITE_TITLE`
- **Type:** String
- **Default:** `Fort Collins RCV Voting Simulator`
- **Description:** The title shown in browser tabs and SEO metadata

#### `VITE_META_DESCRIPTION`
- **Type:** String
- **Default:** `Interactive ranked choice voting simulator for Fort Collins elections`
- **Description:** SEO meta description for search engines

### API Configuration (Future Features)

#### `VITE_API_BASE_URL`
- **Type:** String
- **Default:** Empty
- **Description:** Base URL for backend API endpoints

#### `VITE_API_KEY`
- **Type:** String
- **Default:** Empty
- **Description:** API key for authenticated requests

## Environment-Specific Files

You can create environment-specific files for different deployment scenarios:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment
- `.env.test` - Testing environment

Vite will automatically load the appropriate file based on the `NODE_ENV`.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** containing actual values to version control
2. **Keep `.env.example` updated** with all available variables (without sensitive values)
3. **Use secrets management** in production deployments (e.g., Vercel Environment Variables, Netlify Environment Variables)
4. **Rotate API keys regularly** if using backend services

## Using Environment Variables in Code

Environment variables are accessed in the code using:

```typescript
// In TypeScript/JavaScript files
const seed = import.meta.env.VITE_DEFAULT_SEED;
const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
```

Only variables prefixed with `VITE_` are exposed to the client-side code.

## Platform-Specific Setup

### Netlify
1. Go to Site settings → Environment variables
2. Add each variable from `.env.example`
3. Deploy

### Vercel
1. Go to Project Settings → Environment Variables
2. Add variables for Production/Preview/Development
3. Redeploy

### GitHub Pages
GitHub Pages doesn't support environment variables directly. Use GitHub Actions secrets:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_DEFAULT_SEED: ${{ secrets.VITE_DEFAULT_SEED }}
```

## Troubleshooting

### Variables not loading
- Ensure variable names start with `VITE_`
- Restart the dev server after changing `.env`
- Check that `.env` is in the project root

### Type errors in TypeScript
Add type definitions in `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_SEED: string
  readonly VITE_DEFAULT_VOTER_COUNT: string
  // ... add other variables
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Contributing

When adding new environment variables:
1. Add to `.env.example` with a descriptive comment
2. Update this documentation
3. Add TypeScript types if needed
4. Consider backward compatibility
