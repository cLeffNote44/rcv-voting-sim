# RCV Voting Simulator

<div align="center">

**WTH is Rank Choice Voting? Well, when Fort Collins, Colorado voted it through we had no idea what it was, but SURE, WHY NOT?!**
**Well here's your guide. And sorry to break it to you, RCV is awful. I mean, AWFUL; Good Luck!!**

email me about your experence! cLeffNote44@pm.me

[![MIT License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)
[![Tests Passing](https://img.shields.io/badge/tests-6%2F6_passing-brightgreen)](#testing)

[🚀 Live Demo](https://rcv-voting-sim.netlify.app) • [📖 Documentation](CLAUDE.md) • [🐛 Report Bug](https://github.com/yourusername/rcv-voting-sim/issues)

</div>

---

## 📸 Screenshots

<div align="center">

![RCV Simulator Demo](https://via.placeholder.com/800x450/667eea/ffffff?text=Interactive+Ballot+Entry+%7C+Real-Time+Visualization+%7C+Data+Export)

*Interactive ranked choice voting with Sankey diagrams, ballot tracking, and instant results*

</div>

## Features

- 🗳️ **Interactive Ballot Entry** - Rank candidates just like a real RCV ballot
- 📊 **Real-Time Visualizations** - Sankey diagrams and bar charts show vote flow through elimination rounds
- 🔄 **Round-by-Round Tracking** - Step through each elimination round to understand the process
- 👤 **Personal Ballot Journey** - See how your specific ballot transfers between candidates
- 🎲 **Deterministic Simulations** - Shareable URLs with seed parameters for reproducible results
- 🔗 **One-Click Sharing** - Share simulation results with a single click via URL
- 📥 **Export Results** - Download simulation data as CSV or JSON for analysis
- 🎨 **Accessibility Themes** - Choose from default, colorblind-friendly, or high-contrast color schemes
- 📱 **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🎓 **Educational Focus** - Built-in explanations of RCV rules and tie-breaking procedures
- ⚡ **Client-Side Only** - No backend required, runs entirely in your browser

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rcv-voting-sim.git
cd rcv-voting-sim

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Built files will be in the `dist/` directory.

## How It Works

### 1. Enter Your Ballot
Rank up to 4 candidates in order of preference. You can rank as many or as few as you'd like.

### 2. Simulate the Election
The app generates a realistic electorate using a spatial voting model:
- Voters are distributed in 2D ideological space using Gaussian clusters
- Each voter ranks candidates based on proximity (with realistic noise)
- Ballot completion rates mirror real elections (10% rank 1, 40% rank all)

### 3. Run RCV Algorithm
The simulator implements Fort Collins instant-runoff voting rules:
- **Majority**: A candidate wins when they receive >50% of continuing ballots
- **Elimination**: The candidate with the fewest votes is eliminated each round
- **Transfers**: Eliminated candidate's votes transfer to next preferences
- **Tie-Breaking**: Uses "lookback-then-lot" strategy (compares prior rounds, then random lot)

### 4. Visualize Results
- **Sankey Diagram**: Shows vote flow between rounds
- **Bar Charts**: Round-by-round tallies with majority threshold
- **Exhaustion Analysis**: Breakdown of exhausted ballots (overvotes, no valid next choice, blanks)
- **Your Ballot Path**: Highlights your ballot's journey through the count

### 5. Share & Export
- **Share Link**: Copy the simulation URL to share exact results with others
- **CSV Export**: Download round-by-round tallies and exhaustion data for spreadsheet analysis
- **JSON Export**: Full simulation data including candidates, metadata, and all round details

### 6. Accessibility
Three color schemes available:
- **Default**: Standard color palette
- **Colorblind-Friendly**: Deuteranopia/protanopia safe colors
- **High Contrast**: WCAG AAA compliant for maximum readability

## Technology Stack

- **TypeScript** - Type-safe code throughout
- **Vite** - Fast development and optimized builds
- **D3.js** - Data-driven visualizations (Sankey diagrams, charts)
- **Vitest** - Unit testing framework
- **seedrandom** - Deterministic random number generation

No framework dependencies (React, Vue, etc.) - pure TypeScript with vanilla DOM manipulation for minimal bundle size and maximum control.

## Project Structure

```
rcv-voting-sim/
├── src/
│   ├── lib/              # Core algorithms
│   │   ├── rcv.ts        # RCV counting engine
│   │   ├── simulate.ts   # Spatial voting model
│   │   ├── types.ts      # TypeScript type definitions
│   │   └── utils.ts      # Utility functions (RNG, params)
│   ├── components/       # UI components
│   │   ├── Ballot.ts     # Interactive ballot entry
│   │   ├── RCVisChart.ts # D3 visualizations
│   │   ├── BallotSummary.ts
│   │   └── RoundControls.ts
│   ├── pages/            # Page views
│   │   ├── landing.ts    # Configuration page
│   │   └── sim.ts        # Main simulation page
│   ├── data/             # Candidate pool JSON
│   └── main.ts           # Entry point & router
├── tests/                # Vitest test suite
├── docs/                 # Documentation
│   ├── CLAUDE.md         # AI collaboration guide
│   ├── ENV_CONFIG.md     # Environment variables
│   └── DEPLOYMENT.md     # Deployment instructions
└── dist/                 # Production build (generated)
```

## Configuration

The simulator uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

```bash
# Default seed for reproducible simulations
VITE_DEFAULT_SEED=

# Number of simulated voters (100-50000)
VITE_DEFAULT_VOTER_COUNT=5000

# Enable debug logging
VITE_DEBUG_MODE=false
```

See [ENV_CONFIG.md](ENV_CONFIG.md) for complete documentation of all environment variables.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- rcv.test.ts
```

Tests cover:
- Core RCV algorithm correctness
- Tie-breaking logic
- Ballot exhaustion scenarios
- Edge cases (immediate majority, full exhaustion, etc.)

## Deployment

This is a static single-page application with no backend. Deploy to any static hosting platform:

**Recommended Platforms:**
- **Netlify** - Drag & drop the `dist/` folder
- **Vercel** - Run `npx vercel` or connect via Git
- **GitHub Pages** - Run `npm run deploy`
- **Surge** - Run `npx surge dist/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed platform-specific instructions.

## Educational Use

This simulator is designed for:
- **Voters** learning how RCV works before an election
- **Teachers** demonstrating voting theory and election methods
- **Civic organizations** explaining RCV to community members
- **Researchers** exploring spatial voting models and preference patterns

### Shareable Simulations

Every simulation has a unique URL with the random seed parameter. Share the link to let others see the exact same election:

```
https://your-domain.com/#/sim?seed=abc123&n=5000
```

## RCV Rules Implemented

This simulator follows Fort Collins, Colorado RCV rules:

1. **Majority Threshold**: Strictly greater than 50% of continuing ballots
2. **Single Elimination**: One candidate eliminated per round (no batch elimination)
3. **Tie-Breaking**: "Lookback-then-lot" strategy
   - Compare tied candidates' tallies in prior rounds (most recent to earliest)
   - Eliminate candidate with lowest prior-round tally
   - If tied in all prior rounds, use random lot (seeded for reproducibility)
4. **Ballot Exhaustion**: Ballots exhaust when:
   - They contain an overvote (multiple candidates ranked equally)
   - All remaining preferences are for eliminated candidates
   - Only blank/null ranks remain

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires ES2020+ JavaScript support.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing TypeScript patterns and naming conventions
- Add tests for new RCV algorithm features
- Update documentation for user-facing changes
- Ensure all tests pass (`npm test`)
- Build successfully (`npm run build`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Fort Collins, Colorado for implementing ranked choice voting
- D3.js community for excellent visualization libraries
- Spatial voting model inspired by academic research in voting theory

## Links

- **Documentation**: See [CLAUDE.md](CLAUDE.md) for comprehensive technical documentation
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Environment Variables**: [ENV_CONFIG.md](ENV_CONFIG.md)

## Support

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/rcv-voting-sim/issues).
