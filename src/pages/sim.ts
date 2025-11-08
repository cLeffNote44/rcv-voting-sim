import pool from '../data/candidates.json';
import { Candidate, Ballot } from '../lib/types';
import { parseParams } from '../lib/utils';
import { chooseCandidates, generatePositions, generateElectorate } from '../lib/simulate';
import { renderBallot } from '../components/Ballot';
import { renderRCVisChart, RCVisAPI } from '../components/RCVisChart';
import { runRCV } from '../lib/rcv';
import { renderRoundControls } from '../components/RoundControls';
import { renderBallotSummary } from '../components/BallotSummary';
import { renderRulesModal } from '../components/RulesModal';
import { renderToolbar } from '../components/Toolbar';
import { showLoadingSpinner } from '../components/LoadingSpinner';

export function renderSim(root: HTMLElement, rerenderRoute: () => void): void {
  root.innerHTML = '';
  const { seed, n } = parseParams();
  const poolData = pool as Candidate[];
  const selected = chooseCandidates(poolData, seed);
  const pos = generatePositions(selected, seed);

  const ballotArea = document.createElement('div');
  const toolbarArea = document.createElement('div');
  const controlsArea = document.createElement('div');
  const chartArea = document.createElement('div');
  chartArea.className = 'chart-area';
  const summaryArea = document.createElement('div');

  root.append(ballotArea, toolbarArea, controlsArea, chartArea, summaryArea);

  renderBallot(ballotArea, selected, (userBallot: Ballot) => {
    // Show loading spinner for large simulations
    const hideSpinner = n > 10000 ? showLoadingSpinner(`Simulating ${n.toLocaleString()} voters...`) : null;

    // Use setTimeout to allow spinner to render before heavy computation
    setTimeout(() => {
      try {
        const synth = generateElectorate(n, selected, pos, seed);
        const ballots = synth.concat([userBallot]);
        const candidateIds = selected.map(c => c.id);
        const result = runRCV(ballots, candidateIds, seed, userBallot.id);

        // Hide spinner if it was shown
        if (hideSpinner) hideSpinner();

        // Render toolbar with share, export, and theme controls
        renderToolbar(toolbarArea, result, selected, seed, n);

        const api: RCVisAPI = renderRCVisChart(chartArea, result, selected, result.userPath);
        renderBallotSummary(summaryArea, result, selected, result.userPath);
        renderRoundControls(controlsArea, result, (round) => api.focusRound(round), () => {
          renderSim(root, rerenderRoute);
        });
        // Rules info button
        const rulesBtn = document.createElement('button');
        rulesBtn.textContent = '📖 How RCV Works';
        rulesBtn.className = 'rules-button';
        rulesBtn.addEventListener('click', () => {
          const modal = renderRulesModal(() => {
            document.body.removeChild(modal);
          });
          document.body.appendChild(modal);
        });
        controlsArea.append(rulesBtn);

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

