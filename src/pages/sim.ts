import pool from '../data/candidates.json';
import { Candidate, Ballot } from '../lib/types';
import { parseParams } from '../lib/utils';
import { t } from '../lib/i18n';
import { chooseCandidates, generatePositions, generateElectorate } from '../lib/simulate';
import { renderBallot } from '../components/Ballot';
import { renderRCVisChart, RCVisAPI } from '../components/RCVisChart';
import { runRCV } from '../lib/rcv';
import { renderRoundControls } from '../components/RoundControls';
import { renderBallotSummary } from '../components/BallotSummary';
import { renderRulesModal } from '../components/RulesModal';
import { renderToolbar } from '../components/Toolbar';
import { showLoadingSpinner } from '../components/LoadingSpinner';
import {
  setupKeyboardNavigation,
  renderKeyboardHint,
  setupSwipeNavigation,
  renderSwipeIndicator,
  renderAutoplayControls,
  renderTemplateSelector,
  renderCandidateFilter,
  renderCandidateSpace,
  renderWhatIfControls,
  renderComparisonPanel,
  renderPrintButton,
  startTour,
  renderTourButton,
  addAriaLabels,
  announceRound,
  setupEmbedMode,
  isEmbedMode
} from '../components/Features';

// Check for embed mode on load
setupEmbedMode();

export function renderSim(root: HTMLElement, rerenderRoute: () => void): void {
  root.innerHTML = '';
  const { seed, n } = parseParams();
  const poolData = pool as Candidate[];
  const selected = chooseCandidates(poolData, seed);
  const pos = generatePositions(selected, seed);

  // Convert positions Map for visualization
  const positionsMap = new Map<string, { x: number; y: number }>();
  selected.forEach(c => {
    const p = pos[c.id];
    if (p) positionsMap.set(c.id, p);
  });

  // Create layout areas
  const ballotArea = document.createElement('div');
  ballotArea.className = 'ballot-area';

  // Template selector area (Feature 9)
  const templateArea = document.createElement('div');
  templateArea.className = 'template-area';

  const toolbarArea = document.createElement('div');
  toolbarArea.className = 'toolbar-area';

  const controlsArea = document.createElement('div');
  controlsArea.className = 'controls-area';

  const chartArea = document.createElement('div');
  chartArea.className = 'chart-area';
  chartArea.setAttribute('tabindex', '0'); // Make focusable for keyboard nav

  const summaryArea = document.createElement('div');
  summaryArea.className = 'summary-area';

  // Candidate space visualization area (Feature 3)
  const spaceArea = document.createElement('div');
  spaceArea.className = 'space-area';

  // Comparison panel area (Feature 14)
  const comparisonArea = document.createElement('div');
  comparisonArea.className = 'comparison-area';

  // What-if controls area (Feature 4)
  const whatIfArea = document.createElement('div');
  whatIfArea.className = 'what-if-area';

  root.append(
    templateArea,
    ballotArea,
    toolbarArea,
    controlsArea,
    chartArea,
    summaryArea,
    spaceArea,
    comparisonArea,
    whatIfArea
  );

  // Store state for what-if mode
  let currentBallots: Ballot[] = [];
  let currentUserBallot: Ballot | null = null;

  // Callback to apply template to ballot
  const applyTemplate = (ranks: (string | null)[]) => {
    // Update ballot checkboxes
    const grid = ballotArea.querySelector('.ballot-grid');
    if (grid) {
      const checkboxes = grid.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      checkboxes.forEach(cb => cb.checked = false);

      ranks.forEach((candidateId, rankIndex) => {
        if (candidateId) {
          checkboxes.forEach(cb => {
            const [cbCandId, cbRank] = cb.name.split('-');
            if (cbCandId === candidateId && parseInt(cbRank) === rankIndex + 1) {
              cb.checked = true;
            }
          });
        }
      });
    }
  };

  // Render template selector (Feature 9)
  renderTemplateSelector(templateArea, selected, applyTemplate);

  // Main ballot rendering with callback
  renderBallot(ballotArea, selected, (userBallot: Ballot) => {
    currentUserBallot = userBallot;

    // Show loading spinner for large simulations
    const hideSpinner = n > 10000 ? showLoadingSpinner(`Simulating ${n.toLocaleString()} voters...`) : null;

    // Use setTimeout to allow spinner to render before heavy computation
    setTimeout(() => {
      try {
        const synth = generateElectorate(n, selected, pos, seed);
        const ballots = synth.concat([userBallot]);
        currentBallots = ballots;
        const candidateIds = selected.map(c => c.id);
        const result = runRCV(ballots, candidateIds, seed, userBallot.id);

        // Hide spinner if it was shown
        if (hideSpinner) hideSpinner();

        // Clear previous results
        toolbarArea.innerHTML = '';
        controlsArea.innerHTML = '';
        chartArea.innerHTML = '';
        summaryArea.innerHTML = '';
        spaceArea.innerHTML = '';
        comparisonArea.innerHTML = '';
        whatIfArea.innerHTML = '';

        // Render toolbar with share, export, and theme controls
        renderToolbar(toolbarArea, result, selected, seed, n);

        // Add print button to toolbar (Feature 12)
        renderPrintButton(toolbarArea.querySelector('.toolbar') || toolbarArea, seed, n);

        // Render chart
        const api: RCVisAPI = renderRCVisChart(chartArea, result, selected, result.userPath);

        // Add ARIA labels for accessibility (Feature 17)
        addAriaLabels(chartArea, result, selected);

        // Render ballot summary
        renderBallotSummary(summaryArea, result, selected, result.userPath);

        // Render candidate space visualization (Feature 3)
        renderCandidateSpace(spaceArea, selected, positionsMap);

        // Render comparison panel (Feature 14)
        renderComparisonPanel(comparisonArea, ballots, selected, result.winner);

        // State for round navigation
        let currentRound = 0;

        // Render round controls first so we have the API
        const roundControlsApi = renderRoundControls(controlsArea, result, (round: number) => {
          navigate(round);
        }, () => {
          renderSim(root, rerenderRoute);
        });

        const navigate = (round: number) => {
          currentRound = Math.max(0, Math.min(result.rounds.length - 1, round));
          api.focusRound(currentRound);
          // Sync round controls display
          roundControlsApi.updateRound(currentRound);
          // Announce round change to screen readers (Feature 17)
          announceRound(currentRound, result, selected);
        };

        const prevRound = () => navigate(currentRound - 1);
        const nextRound = () => navigate(currentRound + 1);
        const restart = () => {
          renderSim(root, rerenderRoute);
        };

        // Add keyboard navigation (Feature 6)
        const cleanupKeyboard = setupKeyboardNavigation(prevRound, nextRound, restart);
        renderKeyboardHint(controlsArea);

        // Add swipe navigation for mobile (Feature 7)
        const cleanupSwipe = setupSwipeNavigation(chartArea, prevRound, nextRound);
        renderSwipeIndicator(controlsArea);

        // Add autoplay controls (Feature 8)
        renderAutoplayControls(controlsArea, result, navigate);

        // Add candidate filter for highlighting (Feature 10)
        renderCandidateFilter(chartArea, selected, (candidateId) => {
          if (candidateId === null) {
            // Show all
            chartArea.classList.remove('highlight-mode');
            chartArea.querySelectorAll('.sankey-link').forEach(el => {
              el.classList.remove('highlighted');
            });
          } else {
            // Highlight only selected candidate's flows
            chartArea.classList.add('highlight-mode');
            chartArea.querySelectorAll('.sankey-link').forEach(el => {
              const sourceId = el.getAttribute('data-source');
              const targetId = el.getAttribute('data-target');
              if (sourceId === candidateId || targetId === candidateId) {
                el.classList.add('highlighted');
              } else {
                el.classList.remove('highlighted');
              }
            });
          }
        });

        // Add what-if controls (Feature 4)
        renderWhatIfControls(whatIfArea, () => {
          // Re-render ballot for modification
          renderSim(root, rerenderRoute);
        });

        // Rules info button
        const rulesBtn = document.createElement('button');
        rulesBtn.textContent = '📖 ' + t('howRCVWorks');
        rulesBtn.className = 'rules-button';
        rulesBtn.addEventListener('click', () => {
          const modal = renderRulesModal(() => {
            document.body.removeChild(modal);
          });
          document.body.appendChild(modal);
        });
        controlsArea.append(rulesBtn);

        // Add tour button (Feature 20) - manual only, no auto-start
        if (!isEmbedMode()) {
          renderTourButton(controlsArea, () => {
            startTour(() => {
              // Tour completed
            });
          });
        }

        // Show tie events
        const tieEvents = result.rounds.filter(r => r.tieBreak).map(r => {
          if (!r.tieBreak) return '';
          const c = r.tieBreak;
          return 'Round ' + (r.roundIndex + 1) + ' tie for elimination between ' + c.tied.join(', ') + '; chosen: ' + c.chosen + '.';
        }).filter(Boolean);

        if (tieEvents.length !== 0) {
          const tieInfo = document.createElement('div');
          tieInfo.className = 'tie-info';
          tieInfo.textContent = tieEvents.join(' ');
          controlsArea.append(tieInfo);
        }

        // Cleanup function for navigation handlers
        const cleanup = () => {
          cleanupKeyboard();
          cleanupSwipe();
        };

        // Store cleanup for future use if needed
        (root as any).__cleanup = cleanup;

      } catch (error) {
        // Hide spinner on error
        if (hideSpinner) hideSpinner();

        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
          <h3>⚠️ Simulation Error</h3>
          <p>An error occurred while running the RCV simulation. Please try again.</p>
          <p><small>${error instanceof Error ? error.message : 'Unknown error'}</small></p>
          <button class="btn-primary" onclick="window.location.reload()">Reload Page</button>
        `;
        chartArea.innerHTML = '';
        chartArea.appendChild(errorMsg);
        console.error('RCV simulation error:', error);
        return;
      }
    }, 10); // Small delay to let spinner render
  });
}
