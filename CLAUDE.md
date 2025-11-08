# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **Ranked Choice Voting (RCV) simulator** built with TypeScript and Vite. It's a single-page application with no backend, structured as follows:

- `src/` - Application source code
  - `lib/` - Core RCV algorithm and simulation logic
  - `components/` - UI components (vanilla TypeScript)
  - `pages/` - Page-level views (landing, simulation)
  - `data/` - Candidate pool JSON data
  - `styles.css` - Global styles and layout
  - `brand.css` - Brand colors and theming
- `tests/` - Vitest test suite (3 files, 6 tests)
- `public/` - Static assets (favicon, robots.txt)
- `dist/` - Build output (generated)
- `docs/` - Additional documentation (DEPLOY.md, ENV_CONFIG.md)

## Common Commands

All commands should be run from the **project root**:

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch
```

## Development Workflow

### Running Tests

Tests are located in `tests/` and use Vitest:
- `rcv.test.ts` - Core RCV algorithm tests
- `rcv.tiebreak.test.ts` - Tie-breaking logic tests
- `rcv.exhaustion.test.ts` - Ballot exhaustion scenarios

To run a specific test file:
```bash
npm test -- rcv.test.ts
```

### Environment Variables

The app uses Vite environment variables (prefix: `VITE_`). See `.env.example` for all available options and `ENV_CONFIG.md` for comprehensive documentation.

**Core environment variables** (in `.env.example`):
- `VITE_DEFAULT_SEED` - Fixed seed for reproducible simulations (useful for testing)
- `VITE_DEFAULT_VOTER_COUNT` - Default number of simulated voters (default: 5000)
- `VITE_MIN_VOTER_COUNT` - Minimum allowed voter count (default: 100)
- `VITE_MAX_VOTER_COUNT` - Maximum allowed voter count (default: 50000)
- `VITE_DEBUG_MODE` - Enable console logging of simulation parameters (default: false)

To configure:
```bash
cp .env.example .env
# Edit .env with your values
```

**Additional variables** documented in `ENV_CONFIG.md` include feature flags, UI configuration, analytics integration, and deployment settings. Most are for future features or optional functionality.

## Architecture Overview

### Application Flow

1. **Entry Point** (`src/main.ts`):
   - Hash-based router that renders either the landing page or simulation page
   - Imports global CSS (`styles.css`, `brand.css`)
   - Initializes color scheme from localStorage

2. **Landing Page** (`src/pages/landing.ts`):
   - Initial view where users configure simulation parameters
   - Voter count selection (100-50,000)
   - Random seed input for reproducible simulations

3. **Simulation Page** (`src/pages/sim.ts`):
   - Main view orchestrating ballot entry, RCV counting, and visualization
   - Renders toolbar with share, export, and theme controls
   - Shows loading spinner for large simulations (>10,000 voters)
   - Displays toast notifications for user feedback

### Core Algorithms

**RCV Counting Engine** (`src/lib/rcv.ts`):
- Implements instant-runoff voting with Fort Collins-specific rules
- Majority condition: strictly > 50% of continuing ballots
- Tie-breaking: "lookback-then-lot" strategy (compare prior rounds, then random lot)
- Tracks ballot transfers, exhaustion reasons, and user ballot path through rounds

**Ballot Generation** (`src/lib/simulate.ts`):
- Spatial voting model: candidates and voters positioned in 2D ideological space
- Generates realistic voting patterns using Gaussian clusters
- Produces ballots with varying rank depths (10% rank 1, 20% rank 2, 30% rank 3, 40% rank all 4)

**Deterministic RNG** (`src/lib/utils.ts`):
- Uses `seedrandom` library for reproducible simulations
- Seed management via URL parameters and environment variables
- All randomness (candidate selection, voter generation, RCV tie-breaking) uses seeded RNG
- `copyLinkToClipboard()` - Share functionality for URL copying

**Export Utilities** (`src/lib/export.ts`):
- `exportToCSV()` - Converts RCV results to CSV format with round-by-round tallies
- `exportToJSON()` - Exports full simulation data including metadata
- `downloadFile()` - Browser file download handler
- `generateFilename()` - Creates timestamp-based filenames

**Theme Management** (`src/lib/theme.ts`):
- Three color schemes: default, colorblind-friendly, high-contrast
- `ColorScheme` type definition
- localStorage persistence for user preferences
- Applied via data attributes on document root

### Type System

Core types in `src/lib/types.ts`:
- `Ballot`: Represents a single voter's ranked choices (supports overvotes as arrays)
- `CountResult`: Complete RCV count with all rounds and winner
- `RoundResult`: Single round tallies, transfers, exhaustion details, and elimination
- `RCVRules`: Configuration for jurisdiction-specific RCV rules

### Components

All components use vanilla TypeScript (no framework):

**Core Visualization Components:**
- `Ballot.ts` - Interactive ranked ballot entry interface
- `RCVisChart.ts` - D3.js visualizations (Sankey diagram and bar charts) showing vote flow
- `RoundControls.ts` - Navigation controls for stepping through RCV rounds
- `BallotSummary.ts` - Displays user ballot's journey through elimination rounds

**UI Components:**
- `Modal.ts` - Generic modal component base class
- `RulesModal.ts` - Educational modal explaining RCV rules
- `LoadingSpinner.ts` - Loading overlay for long-running operations (shown when voter count >10,000)
- `Toolbar.ts` - Top toolbar containing share, export (CSV/JSON), and color scheme controls

### Data Flow

1. User enters ballot → `Ballot` component captures ranks
2. `simulate.ts` generates synthetic electorate based on spatial model
3. `rcv.ts` runs instant-runoff voting algorithm on all ballots
4. `RCVisChart` visualizes vote transfers and tallies per round
5. `BallotSummary` highlights user ballot's path through the count

### Phase 2 Features (Implemented)

The simulator includes advanced sharing, export, and accessibility features:

**1. Share Functionality** (`Toolbar.ts` + `utils.ts`):
- One-click URL copying to clipboard
- URL includes seed and voter count parameters for exact reproducibility
- Toast notification confirms successful copy
- Example: `#/sim?seed=abc123&n=5000`

**2. Export Results** (`export.ts`):
- **CSV Export**: Round-by-round tallies with exhaustion breakdown
  - Structured format for spreadsheet analysis
  - Includes candidate vote counts per round
  - Exhaustion data (overvotes, no valid next, blanks)
- **JSON Export**: Complete simulation data
  - All round results with full metadata
  - Candidate information and vote flows
  - Timestamp and simulation parameters

**3. Accessibility & Theming** (`theme.ts`):
- **Three color schemes** selectable from toolbar:
  - Default: Standard color palette
  - Colorblind-friendly: Safe for deuteranopia/protanopia
  - High-contrast: WCAG AAA compliant
- Theme persists via localStorage across sessions
- Applied as data attributes on root element for CSS targeting

**4. UX Improvements**:
- Loading spinner overlay for simulations with >10,000 voters
- Toast notifications for user feedback
- Toolbar organization for all controls

## Key Implementation Details

### Ballot Exhaustion

The RCV engine tracks three types of ballot exhaustion:
- **Overvote**: Ballot ranked multiple candidates equally (array with >1 element)
- **No valid next**: Ballot has no remaining continuing candidates
- **Blank remaining**: Ballot has only null/blank ranks remaining

See `rcv.ts:nextPreference()` for exhaustion logic.

### Tie-Breaking Rules

Fort Collins uses "lookback-then-lot":
1. Compare tied candidates' tallies in previous rounds (most recent to earliest)
2. Eliminate candidate with lowest prior-round tally
3. If still tied in all prior rounds, use random lot (seeded for determinism in demos)

See `rcv.ts:runRCV()` around line 126 for tie-breaking implementation.

### Spatial Voting Model

Candidates and voters are positioned in 2D space. Each voter:
- Is sampled from 3-4 Gaussian clusters (random mixture model)
- Ranks candidates by Euclidean distance + small noise
- Has 40% chance to rank all 4, 30% to rank 3, 20% to rank 2, 10% to rank 1

This produces realistic preference patterns and transfers. See `simulate.ts:generateElectorate()`.

## Deployment

The app is a static SPA with no backend. Comprehensive deployment guide available in `DEPLOY.md` (313 lines covering 5 platforms with security, analytics, and troubleshooting).

**Recommended platforms**:
- Netlify (drag & drop `dist/` folder or git integration)
- Vercel (CLI: `npx vercel` or git integration)
- GitHub Pages (run `npm run deploy` - gh-pages already in devDependencies)
- Cloudflare Pages
- Surge

**Build configuration**:
- Vite base path is set to `./` for relative URLs (works on any subdomain)
- All environment variables must be prefixed with `VITE_` to be exposed to client
- See `DEPLOY.md` for platform-specific environment variable setup, pre-deployment checklists, and post-deployment verification steps

## Testing Philosophy

Tests focus on RCV algorithm correctness:
- Edge cases: immediate majority, full exhaustion, ties
- Ballot formats: overvotes, skipped ranks, duplicate candidates
- Tie-breaking: deterministic seeded RNG for reproducibility

When adding RCV features, add corresponding tests in `tests/`.

## Code Style Notes

- No build-time bundling of candidate data (loaded via `import pool from './data/candidates.json'`)
- Components render via imperative DOM manipulation (no JSX/template syntax)
- Event handlers use function callbacks, not custom events
- All user-facing text and rules descriptions in `src/copy.ts`
- CSS files (`styles.css`, `brand.css`) provide global styles and theming

## Configuration Files

**Build & Development:**
- **`vite.config.ts`** - Vite build configuration
  - Base path set to `./` for relative URLs (subdomain-friendly)
  - Test configuration for Vitest
- **`tsconfig.json`** - TypeScript compiler configuration
- **`package.json`** - Dependencies and npm scripts

**Deployment Configuration:**
- **`netlify.toml`** - Netlify deployment settings with SPA routing
- **`vercel.json`** - Vercel deployment configuration for hash routing
- Both files ensure hash-based routing works correctly (rewrites all routes to `/index.html`)

**Frontend:**
- **`index.html`** - Entry HTML file
- **`public/`** - Static assets (favicon.svg, robots.txt)

## Additional Documentation

This repository includes comprehensive documentation for various aspects of the project:

- **`README.md`** - User-facing documentation with features, quick start, and technology stack
- **`CLAUDE.md`** (this file) - Technical guide for AI collaboration and codebase architecture
- **`DEPLOY.md`** - Comprehensive deployment guide (312 lines) ⭐ **USE THIS**
  - 5 deployment platforms with step-by-step instructions
  - Pre-deployment checklist and build verification
  - Environment variable setup per platform
  - Post-deployment verification steps
  - Security considerations and best practices
  - Analytics integration (Google Analytics, Plausible)
  - Troubleshooting common deployment issues
- **`DEPLOYMENT.md`** - Legacy deployment guide (89 lines) - **DEPRECATED**, use DEPLOY.md instead
- **`ENV_CONFIG.md`** - Environment variable reference (219 lines)
  - Core configuration variables (seed, voter counts, debug mode)
  - Simulation limits and feature flags
  - UI configuration options
  - Analytics and deployment settings
  - Platform-specific setup instructions
  - TypeScript type definitions for env variables
- **`.env.example`** - Template with 5 core environment variables
  - Copy to `.env` for local development
  - All variables prefixed with `VITE_` for Vite exposure
