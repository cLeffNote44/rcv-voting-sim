# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **Ranked Choice Voting (RCV) simulator** built with TypeScript and Vite. It's a single-page application with no backend, structured as follows:

- `src/` - Application source code
  - `lib/` - Core RCV algorithm and simulation logic
  - `components/` - UI components (vanilla TypeScript)
  - `pages/` - Page-level views (landing, simulation)
  - `data/` - Candidate pool JSON data
- `tests/` - Vitest test suite
- `dist/` - Build output (generated)

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

The app uses Vite environment variables (prefix: `VITE_`). See `.env.example` for all available options.

Key environment variables:
- `VITE_DEFAULT_SEED` - Fixed seed for reproducible simulations (useful for testing)
- `VITE_DEFAULT_VOTER_COUNT` - Default number of simulated voters (100-50000)
- `VITE_DEBUG_MODE` - Enable console logging of simulation parameters

To configure:
```bash
cp .env.example .env
# Edit .env with your values
```

## Architecture Overview

### Application Flow

1. **Entry Point** (`src/main.ts`): Hash-based router that renders either the landing page or simulation page
2. **Landing Page** (`src/pages/landing.ts`): Initial view where users configure simulation parameters
3. **Simulation Page** (`src/pages/sim.ts`): Main view orchestrating ballot entry, RCV counting, and visualization

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

### Type System

Core types in `src/lib/types.ts`:
- `Ballot`: Represents a single voter's ranked choices (supports overvotes as arrays)
- `CountResult`: Complete RCV count with all rounds and winner
- `RoundResult`: Single round tallies, transfers, exhaustion details, and elimination
- `RCVRules`: Configuration for jurisdiction-specific RCV rules

### Components

All components use vanilla TypeScript (no framework):
- `Ballot.ts` - Interactive ranked ballot entry interface
- `RCVisChart.ts` - D3.js visualizations (Sankey diagram and bar charts) showing vote flow
- `RoundControls.ts` - Navigation controls for stepping through RCV rounds
- `BallotSummary.ts` - Displays user ballot's journey through elimination rounds
- `RulesModal.ts` - Educational modal explaining RCV rules
- `Modal.ts` - Generic modal component

### Data Flow

1. User enters ballot → `Ballot` component captures ranks
2. `simulate.ts` generates synthetic electorate based on spatial model
3. `rcv.ts` runs instant-runoff voting algorithm on all ballots
4. `RCVisChart` visualizes vote transfers and tallies per round
5. `BallotSummary` highlights user ballot's path through the count

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

The app is a static SPA with no backend. Deployment options documented in `DEPLOYMENT.md`:

**Recommended platforms**:
- Netlify (drag & drop `dist/` folder or git integration)
- Vercel (CLI: `npx vercel` or git integration)
- GitHub Pages (run `npm run deploy` after adding `gh-pages` to devDependencies)

**Build configuration**:
- Vite base path is set to `./` for relative URLs (works on any subdomain)
- All environment variables must be prefixed with `VITE_` to be exposed to client

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
