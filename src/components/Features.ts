/**
 * Features.ts - Additional feature components for the RCV simulator
 * Contains implementations for Features 2-20
 */

import * as d3 from 'd3';
import { Candidate, CountResult, Ballot } from '../lib/types';

// ============================================
// FEATURE 6: Keyboard Navigation
// ============================================
export function setupKeyboardNavigation(
  onPrev: () => void,
  onNext: () => void,
  onRestart: () => void
): () => void {
  const handler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // Don't interfere with input fields
    }
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case 'r':
      case 'R':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onRestart();
        }
        break;
      case ' ':
        e.preventDefault();
        onNext();
        break;
    }
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

export function renderKeyboardHint(container: HTMLElement): void {
  const hint = document.createElement('div');
  hint.className = 'keyboard-hint';
  hint.innerHTML = `
    <kbd>←</kbd>/<kbd>→</kbd> Navigate rounds &nbsp;
    <kbd>Space</kbd> Next &nbsp;
    <kbd>R</kbd> Restart
  `;
  container.appendChild(hint);
}

// ============================================
// FEATURE 7: Mobile Swipe Support
// ============================================
export function setupSwipeNavigation(
  element: HTMLElement,
  onPrev: () => void,
  onNext: () => void
): () => void {
  let touchStartX = 0;
  let touchStartY = 0;
  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only trigger if horizontal swipe is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

export function renderSwipeIndicator(container: HTMLElement): void {
  const indicator = document.createElement('div');
  indicator.className = 'swipe-indicator';
  indicator.innerHTML = `
    <div class="swipe-hint">
      <span>👆</span>
      <span>Swipe left/right to navigate rounds</span>
    </div>
  `;
  container.appendChild(indicator);
}

// ============================================
// FEATURE 8: Auto-Play Mode
// ============================================
export interface AutoplayController {
  start: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  setSpeed: (ms: number) => void;
}

export function renderAutoplayControls(
  container: HTMLElement,
  result: CountResult,
  onNavigate: (round: number) => void
): AutoplayController {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'autoplay-controls';

  const playBtn = document.createElement('button');
  playBtn.className = 'play-btn';
  playBtn.innerHTML = '▶️ Play';

  const speedSelect = document.createElement('select');
  speedSelect.className = 'speed-select';
  speedSelect.innerHTML = `
    <option value="2000">Slow (2s)</option>
    <option value="1000" selected>Normal (1s)</option>
    <option value="500">Fast (0.5s)</option>
  `;

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'progress-fill';
  progressBar.appendChild(progressFill);

  controlsDiv.append(playBtn, speedSelect, progressBar);
  container.appendChild(controlsDiv);

  let isPlaying = false;
  let currentRound = 0;
  let intervalId: number | null = null;
  let speed = 1000;

  const updateProgress = () => {
    const percent = ((currentRound + 1) / result.rounds.length) * 100;
    progressFill.style.width = `${percent}%`;
  };

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.innerHTML = '⏸️ Pause';
    playBtn.classList.add('playing');

    intervalId = window.setInterval(() => {
      currentRound++;
      if (currentRound >= result.rounds.length) {
        stop();
        currentRound = result.rounds.length - 1;
      } else {
        onNavigate(currentRound);
        updateProgress();
      }
    }, speed);
  };

  const stop = () => {
    isPlaying = false;
    playBtn.innerHTML = '▶️ Play';
    playBtn.classList.remove('playing');
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const setSpeed = (ms: number) => {
    speed = ms;
    if (isPlaying) {
      stop();
      start();
    }
  };

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  });

  speedSelect.addEventListener('change', () => {
    setSpeed(Number(speedSelect.value));
  });

  updateProgress();

  return {
    start,
    stop,
    isPlaying: () => isPlaying,
    setSpeed
  };
}

// ============================================
// FEATURE 9: Ballot Templates
// ============================================
export type BallotTemplate = {
  name: string;
  description: string;
  generate: (candidates: Candidate[]) => (string | null)[];
};

export const BALLOT_TEMPLATES: BallotTemplate[] = [
  {
    name: 'Full Ranking',
    description: 'Rank all candidates 1-4',
    generate: (candidates) => candidates.map(c => c.id)
  },
  {
    name: 'Bullet Vote',
    description: 'Only rank first choice',
    generate: (candidates) => [candidates[0].id, null, null, null]
  },
  {
    name: 'Top Two',
    description: 'Rank only top 2 choices',
    generate: (candidates) => [candidates[0].id, candidates[1].id, null, null]
  },
  {
    name: 'Top Three',
    description: 'Rank 3 choices',
    generate: (candidates) => [candidates[0].id, candidates[1].id, candidates[2].id, null]
  },
  {
    name: 'Strategic',
    description: 'Rank favorite, skip 2nd, rank 3rd & 4th',
    generate: (candidates) => [candidates[0].id, null, candidates[2].id, candidates[3].id]
  },
  {
    name: 'Blank',
    description: 'Leave all ranks empty',
    generate: () => [null, null, null, null]
  }
];

export function renderTemplateSelector(
  container: HTMLElement,
  candidates: Candidate[],
  onSelect: (ranks: (string | null)[]) => void
): void {
  const selector = document.createElement('div');
  selector.className = 'template-selector';

  const label = document.createElement('label');
  label.textContent = 'Quick fill ballot:';
  selector.appendChild(label);

  const buttons = document.createElement('div');
  buttons.className = 'template-buttons';

  BALLOT_TEMPLATES.forEach(template => {
    const btn = document.createElement('button');
    btn.className = 'template-btn';
    btn.textContent = template.name;
    btn.title = template.description;
    btn.addEventListener('click', () => {
      const ranks = template.generate(candidates);
      onSelect(ranks);
      // Highlight selected
      buttons.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    buttons.appendChild(btn);
  });

  selector.appendChild(buttons);
  container.appendChild(selector);
}

// ============================================
// FEATURE 10: Vote Transfer Highlighting
// ============================================
export function renderCandidateFilter(
  container: HTMLElement,
  candidates: Candidate[],
  onFilter: (candidateId: string | null) => void
): void {
  const filterDiv = document.createElement('div');
  filterDiv.className = 'candidate-filter';

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    filterDiv.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    onFilter(null);
  });
  filterDiv.appendChild(allBtn);

  candidates.forEach(candidate => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = candidate.shortLabel || candidate.name;
    btn.addEventListener('click', () => {
      filterDiv.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onFilter(candidate.id);
    });
    filterDiv.appendChild(btn);
  });

  container.appendChild(filterDiv);
}

// ============================================
// FEATURE 3: Candidate Position Visualization
// ============================================
export function renderCandidateSpace(
  container: HTMLElement,
  candidates: Candidate[],
  positions: Map<string, { x: number; y: number }>
): void {
  const spaceDiv = document.createElement('div');
  spaceDiv.className = 'candidate-space';

  const header = document.createElement('div');
  header.className = 'candidate-space-header';
  header.innerHTML = '<span>Ideological Space</span>';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-space-btn';
  toggleBtn.textContent = 'Hide';
  header.appendChild(toggleBtn);
  spaceDiv.appendChild(header);

  const chartContainer = document.createElement('div');
  chartContainer.className = 'space-chart';
  spaceDiv.appendChild(chartContainer);

  // Add axis labels
  const xLabel = document.createElement('div');
  xLabel.className = 'space-axis-label x';
  xLabel.textContent = 'Dimension 1 →';
  chartContainer.appendChild(xLabel);

  const yLabel = document.createElement('div');
  yLabel.className = 'space-axis-label y';
  yLabel.textContent = 'Dimension 2 →';
  chartContainer.appendChild(yLabel);

  container.appendChild(spaceDiv);

  // Render the D3 scatter plot
  const width = 300;
  const height = 300;
  const margin = 30;

  const svg = d3.select(chartContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Candidate ideological positions in 2D space');

  // Get position bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  positions.forEach(pos => {
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
  });

  // Add padding
  const padding = 0.5;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  const xScale = d3.scaleLinear()
    .domain([minX, maxX])
    .range([margin, width - margin]);

  const yScale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([height - margin, margin]);

  // Draw grid
  svg.append('g')
    .attr('class', 'grid')
    .selectAll('line.h')
    .data(yScale.ticks(5))
    .enter()
    .append('line')
    .attr('x1', margin)
    .attr('x2', width - margin)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '2,2');

  svg.selectAll('line.v')
    .data(xScale.ticks(5))
    .enter()
    .append('line')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', margin)
    .attr('y2', height - margin)
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '2,2');

  // Colors for candidates
  const colors = ['#1b9e77', '#d95f02', '#7570b3', '#66a61e'];

  // Draw candidate points
  candidates.forEach((candidate, i) => {
    const pos = positions.get(candidate.id);
    if (!pos) return;

    const g = svg.append('g')
      .attr('transform', `translate(${xScale(pos.x)}, ${yScale(pos.y)})`);

    g.append('circle')
      .attr('r', 12)
      .attr('fill', colors[i % colors.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .text((i + 1).toString());

    // Label
    g.append('text')
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1a1a1a')
      .attr('font-size', 11)
      .text(candidate.shortLabel || candidate.name);
  });

  // Toggle visibility
  let visible = true;
  toggleBtn.addEventListener('click', () => {
    visible = !visible;
    chartContainer.style.display = visible ? 'block' : 'none';
    toggleBtn.textContent = visible ? 'Hide' : 'Show';
  });
}

// ============================================
// FEATURE 12: Print/PDF Export
// ============================================
export function renderPrintButton(
  container: HTMLElement,
  seed: string,
  voterCount: number
): void {
  const printBtn = document.createElement('button');
  printBtn.className = 'print-btn icon-button';
  printBtn.innerHTML = '🖨️ Print';
  printBtn.addEventListener('click', () => {
    // Add print header temporarily
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header';
    printHeader.innerHTML = `
      <h1>RCV Simulation Results</h1>
      <p>Seed: ${seed} | Voters: ${voterCount.toLocaleString()} | Generated: ${new Date().toLocaleString()}</p>
    `;
    document.body.insertBefore(printHeader, document.body.firstChild);

    window.print();

    // Remove print header after printing
    setTimeout(() => {
      document.body.removeChild(printHeader);
    }, 100);
  });
  container.appendChild(printBtn);
}

// ============================================
// FEATURE 4: What If Mode
// ============================================
export function renderWhatIfControls(
  container: HTMLElement,
  onModifyBallot: () => void
): void {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'what-if-controls';

  const label = document.createElement('span');
  label.textContent = 'Want to see different outcomes?';

  const modifyBtn = document.createElement('button');
  modifyBtn.className = 'what-if-btn';
  modifyBtn.textContent = '🔄 Modify My Ballot';
  modifyBtn.addEventListener('click', onModifyBallot);

  controlsDiv.append(label, modifyBtn);
  container.appendChild(controlsDiv);
}

// ============================================
// FEATURE 14: Comparative Analysis
// ============================================
export function runPluralityElection(ballots: Ballot[], candidateIds: string[]): string {
  const tallies: Record<string, number> = {};
  candidateIds.forEach(id => tallies[id] = 0);

  ballots.forEach(ballot => {
    // Only count first choice
    const firstChoice = ballot.ranks[0];
    if (typeof firstChoice === 'string' && candidateIds.includes(firstChoice)) {
      tallies[firstChoice]++;
    }
  });

  // Find winner (highest votes)
  let winner = candidateIds[0];
  let maxVotes = 0;
  Object.entries(tallies).forEach(([id, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      winner = id;
    }
  });

  return winner;
}

export function renderComparisonPanel(
  container: HTMLElement,
  ballots: Ballot[],
  candidates: Candidate[],
  rcvWinner: string
): void {
  const pluralityWinner = runPluralityElection(ballots, candidates.map(c => c.id));

  const panel = document.createElement('div');
  panel.className = 'comparison-panel';

  // Plurality column
  const pluralityCol = document.createElement('div');
  pluralityCol.className = 'comparison-column';
  const pluralityCandidate = candidates.find(c => c.id === pluralityWinner);
  pluralityCol.innerHTML = `
    <h3>Plurality (First-Past-The-Post)</h3>
    <p>Winner determined by most first-choice votes only.</p>
    <div class="comparison-winner">
      <span class="winner-badge">Winner</span>
      <span>${pluralityCandidate?.name || pluralityWinner}</span>
    </div>
  `;

  // RCV column
  const rcvCol = document.createElement('div');
  rcvCol.className = 'comparison-column';
  const rcvCandidate = candidates.find(c => c.id === rcvWinner);
  rcvCol.innerHTML = `
    <h3>Ranked Choice Voting</h3>
    <p>Winner determined through elimination rounds until majority.</p>
    <div class="comparison-winner">
      <span class="winner-badge">Winner</span>
      <span>${rcvCandidate?.name || rcvWinner}</span>
    </div>
  `;

  panel.append(pluralityCol, rcvCol);

  // Difference callout
  if (pluralityWinner !== rcvWinner) {
    const diff = document.createElement('div');
    diff.className = 'comparison-diff';
    diff.innerHTML = `
      <strong>🔄 Different Winners!</strong>
      <p>RCV's elimination rounds and vote transfers led to a different outcome than simple plurality voting.</p>
    `;
    panel.appendChild(diff);
  }

  container.appendChild(panel);
}

// ============================================
// FEATURE 13: Embed Mode
// ============================================
export function isEmbedMode(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('embed') === 'true' || window.self !== window.top;
  } catch {
    return false;
  }
}

export function setupEmbedMode(): void {
  if (isEmbedMode()) {
    document.body.classList.add('embed-mode');

    const badge = document.createElement('div');
    badge.className = 'embed-badge';
    badge.textContent = 'RCV Simulator';
    document.body.appendChild(badge);
  }
}

// ============================================
// FEATURE 20: Tour/Walkthrough
// ============================================
export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '.ballot-grid',
    title: 'Fill Your Ballot',
    content: 'Click checkboxes to rank candidates from 1st to 4th choice. You can leave ranks blank or create overvotes to see how they affect the count.',
    position: 'bottom'
  },
  {
    selector: '.chart-area',
    title: 'Vote Flow Visualization',
    content: 'The Sankey diagram shows how votes flow between rounds. Watch transfers happen when candidates are eliminated.',
    position: 'top'
  },
  {
    selector: '.round-controls',
    title: 'Navigate Rounds',
    content: 'Use these buttons or keyboard arrows to step through each round of the RCV count.',
    position: 'top'
  },
  {
    selector: '.exhaustion-analysis',
    title: 'Exhaustion Analysis',
    content: 'See why ballots stopped being counted - whether from overvotes, blank ranks, or all choices being eliminated.',
    position: 'top'
  },
  {
    selector: '.toolbar',
    title: 'Share & Export',
    content: 'Copy a shareable link, export results to CSV/JSON, or change the color scheme for accessibility.',
    position: 'bottom'
  }
];

export function startTour(onComplete: () => void): () => void {
  let currentStep = 0;
  let overlay: HTMLElement | null = null;
  let tooltip: HTMLElement | null = null;
  let cleanup: (() => void) | null = null;

  const showStep = (index: number) => {
    // Clean up previous
    if (overlay) overlay.remove();
    if (tooltip) tooltip.remove();
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    if (index >= TOUR_STEPS.length) {
      localStorage.setItem('rcv-tour-completed', 'true');
      onComplete();
      return;
    }

    const step = TOUR_STEPS[index];
    const target = document.querySelector(step.selector);

    if (!target) {
      // Skip missing elements
      showStep(index + 1);
      return;
    }

    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    document.body.appendChild(overlay);

    // Highlight target
    target.classList.add('tour-highlight');

    // Create tooltip
    tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';
    tooltip.innerHTML = `
      <h4>${step.title}</h4>
      <p>${step.content}</p>
      <div class="tour-nav">
        <button class="tour-skip">Skip Tour</button>
        <div class="tour-progress">
          ${TOUR_STEPS.map((_, i) => `<div class="tour-dot ${i === index ? 'active' : ''}"></div>`).join('')}
        </div>
        <button class="tour-next">${index === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    `;

    // Position tooltip
    const rect = target.getBoundingClientRect();
    const position = step.position || 'bottom';

    switch (position) {
      case 'top':
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.left - 10}px`;
        tooltip.style.transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
    }

    document.body.appendChild(tooltip);

    // Event handlers
    tooltip.querySelector('.tour-skip')?.addEventListener('click', () => {
      if (cleanup) cleanup();
      onComplete();
    });

    tooltip.querySelector('.tour-next')?.addEventListener('click', () => {
      currentStep++;
      showStep(currentStep);
    });

    // Click overlay to advance
    overlay.addEventListener('click', () => {
      currentStep++;
      showStep(currentStep);
    });
  };

  cleanup = () => {
    if (overlay) overlay.remove();
    if (tooltip) tooltip.remove();
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  };

  // Start tour
  showStep(0);

  return cleanup;
}

export function shouldShowTour(): boolean {
  return !localStorage.getItem('rcv-tour-completed');
}

export function renderTourButton(container: HTMLElement, onStart: () => void): void {
  const btn = document.createElement('button');
  btn.className = 'secondary';
  btn.textContent = '📚 Take Tour';
  btn.addEventListener('click', onStart);
  container.appendChild(btn);
}

// ============================================
// FEATURE 17: ARIA Labels with Live Regions
// ============================================
export function addAriaLabels(chartArea: HTMLElement, result: CountResult, candidates: Candidate[]): void {
  const winnerName = candidates.find(c => c.id === result.winner)?.name || result.winner;
  const lastRound = result.rounds[result.rounds.length - 1];

  // Main results summary (polite live region)
  const srDesc = document.createElement('div');
  srDesc.className = 'sr-only';
  srDesc.id = 'rcv-results-summary';
  srDesc.setAttribute('role', 'status');
  srDesc.setAttribute('aria-live', 'polite');
  srDesc.textContent = `RCV election results: ${winnerName} wins after ${result.rounds.length} rounds. ${lastRound.exhausted} ballots exhausted.`;

  // Round-by-round announcer (for navigation updates)
  const roundAnnouncer = document.createElement('div');
  roundAnnouncer.className = 'sr-only';
  roundAnnouncer.id = 'rcv-round-announcer';
  roundAnnouncer.setAttribute('role', 'status');
  roundAnnouncer.setAttribute('aria-live', 'assertive');
  roundAnnouncer.setAttribute('aria-atomic', 'true');

  // Add to chart area
  chartArea.insertBefore(roundAnnouncer, chartArea.firstChild);
  chartArea.insertBefore(srDesc, chartArea.firstChild);

  // Make SVG accessible with detailed description
  const svg = chartArea.querySelector('svg');
  if (svg) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Vote flow diagram showing ${result.rounds.length} rounds of ranked choice voting. ${winnerName} wins with a majority.`);

    // Add descriptive title and desc elements for screen readers
    const svgTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    svgTitle.textContent = 'Ranked Choice Voting Results Visualization';
    svg.insertBefore(svgTitle, svg.firstChild);

    const svgDesc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
    svgDesc.textContent = `This diagram shows how votes flow between ${candidates.length} candidates across ${result.rounds.length} rounds. ${winnerName} wins the election.`;
    svg.insertBefore(svgDesc, svgTitle.nextSibling);
  }

  // Make bar chart accessible if present
  const barChart = chartArea.querySelector('.bar-chart');
  if (barChart) {
    barChart.setAttribute('role', 'img');
    barChart.setAttribute('aria-label', 'Bar chart showing vote counts per candidate for the current round');
  }

  // Add keyboard navigation instructions
  const navInstructions = document.createElement('div');
  navInstructions.className = 'sr-only';
  navInstructions.setAttribute('role', 'note');
  navInstructions.textContent = 'Use left and right arrow keys to navigate between rounds. Press Space to toggle autoplay. Press R to restart the simulation.';
  chartArea.appendChild(navInstructions);
}

/**
 * Announce round changes to screen readers
 * Call this when the user navigates to a different round
 */
export function announceRound(round: number, result: CountResult, candidates: Candidate[]): void {
  const announcer = document.getElementById('rcv-round-announcer');
  if (!announcer) return;

  const currentRound = result.rounds[round];
  if (!currentRound) return;

  // Build announcement message
  let message = `Round ${round + 1} of ${result.rounds.length}. `;

  // Add tallies
  const tallies = Object.entries(currentRound.tallies)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id, count]) => {
      const name = candidates.find(c => c.id === id)?.name || id;
      return `${name}: ${count} votes`;
    });

  if (tallies.length > 0) {
    message += tallies.join(', ') + '. ';
  }

  // Add elimination or winner info
  if (currentRound.eliminated && currentRound.eliminated.length > 0) {
    const eliminatedNames = currentRound.eliminated.map(id =>
      candidates.find(c => c.id === id)?.name || id
    );
    message += `Eliminated: ${eliminatedNames.join(', ')}. `;
  }

  if (round === result.rounds.length - 1 && result.winner) {
    const winnerName = candidates.find(c => c.id === result.winner)?.name || result.winner;
    message += `${winnerName} wins the election!`;
  }

  // Update announcer content (triggers aria-live announcement)
  announcer.textContent = message;
}

// ============================================
// FEATURE 11: Custom Candidate Creator
// ============================================
export interface CustomCandidate {
  id: string;
  name: string;
  shortLabel: string;
  bio: string;
}

export function renderCandidateCreator(
  container: HTMLElement,
  onCandidatesChange: (candidates: CustomCandidate[]) => void
): void {
  const creator = document.createElement('div');
  creator.className = 'candidate-creator';

  let customCandidates: CustomCandidate[] = [];

  const form = document.createElement('div');
  form.className = 'candidate-form';
  form.innerHTML = `
    <h3>Create Custom Candidates</h3>
    <div class="form-group">
      <label for="cand-name">Full Name</label>
      <input type="text" id="cand-name" placeholder="e.g., Jane Smith">
    </div>
    <div class="form-group">
      <label for="cand-short">Short Label</label>
      <input type="text" id="cand-short" placeholder="e.g., Smith">
    </div>
    <div class="form-group">
      <label for="cand-bio">Bio</label>
      <textarea id="cand-bio" placeholder="Brief candidate description..."></textarea>
    </div>
    <button class="primary" id="add-candidate">Add Candidate</button>
  `;

  const list = document.createElement('div');
  list.className = 'candidate-list';

  const updateList = () => {
    list.innerHTML = '';
    customCandidates.forEach((cand, i) => {
      const item = document.createElement('div');
      item.className = 'candidate-item';
      item.innerHTML = `
        <span><strong>${cand.name}</strong> (${cand.shortLabel})</span>
        <button class="remove-btn" data-index="${i}">Remove</button>
      `;
      list.appendChild(item);
    });

    // Add remove handlers
    list.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = Number((e.target as HTMLButtonElement).dataset.index);
        customCandidates.splice(index, 1);
        updateList();
        onCandidatesChange(customCandidates);
      });
    });
  };

  creator.append(form, list);
  container.appendChild(creator);

  // Add candidate handler
  form.querySelector('#add-candidate')?.addEventListener('click', () => {
    const nameInput = form.querySelector('#cand-name') as HTMLInputElement;
    const shortInput = form.querySelector('#cand-short') as HTMLInputElement;
    const bioInput = form.querySelector('#cand-bio') as HTMLTextAreaElement;

    if (nameInput.value.trim() && customCandidates.length < 10) {
      customCandidates.push({
        id: `custom-${Date.now()}`,
        name: nameInput.value.trim(),
        shortLabel: shortInput.value.trim() || nameInput.value.trim().split(' ').pop() || '',
        bio: bioInput.value.trim()
      });

      nameInput.value = '';
      shortInput.value = '';
      bioInput.value = '';

      updateList();
      onCandidatesChange(customCandidates);
    }
  });
}

// ============================================
// FEATURE 15: Election Data Import
// ============================================
export function renderImportPanel(
  container: HTMLElement,
  onImport: (data: { candidates: Candidate[]; ballots: Ballot[] }) => void
): void {
  const panel = document.createElement('div');
  panel.className = 'import-panel';

  const dropzone = document.createElement('div');
  dropzone.className = 'import-dropzone';
  dropzone.innerHTML = `
    <div class="import-dropzone-icon">📁</div>
    <p>Drop a JSON file here or click to upload</p>
    <p><small>Format: { "candidates": [...], "ballots": [...] }</small></p>
  `;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.className = 'file-input';

  panel.append(dropzone, fileInput);
  container.appendChild(panel);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.candidates && data.ballots) {
          onImport(data);
        } else {
          alert('Invalid file format. Expected { "candidates": [...], "ballots": [...] }');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Click to upload
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      handleFile(fileInput.files[0]);
    }
  });

  // Drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
}
