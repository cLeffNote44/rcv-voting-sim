import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { Candidate, CountResult } from '../lib/types';

type Node = { id: string; round: number; cid: string; name: string; value: number };
type Link = { source: string; target: string; value: number; kind: string };
type SankeyNode = Node & { x0: number; y0: number; x1: number; y1: number };
type SankeyLink = { source: SankeyNode; target: SankeyNode; value: number; kind: string; width: number };
type BarDataItem = { name: string; value: number; color: string; cid: string };

const EX = 'exhausted';
const COLORS = ['#1b9e77', '#d95f02', '#7570b3', '#66a61e'];

export type RCVisAPI = { focusRound: (r: number) => void };

function renderBarChart(
  container: HTMLElement,
  result: CountResult,
  candidates: Candidate[],
  colorMap: Record<string, string>,
  focusedRound: number = 0
): void {
  // Responsive width for bar chart - use fallback if container not yet laid out
  let containerWidth = container.getBoundingClientRect().width;
  if (containerWidth < 100) {
    containerWidth = 400; // Fallback width
  }
  const width = Math.max(Math.min(containerWidth - 20, 400), 280);
  const height = Math.min(width * 0.75, 300);
  const margin = { top: 20, right: 30, bottom: 40, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  container.innerHTML = '';
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const round = result.rounds[focusedRound];
  if (!round) return;

  // Prepare data
  const data: BarDataItem[] = [];
  for (const cid of round.continuing) {
    const cand = candidates.find(c => c.id === cid);
    data.push({
      name: cand ? (cand.shortLabel || cand.name) : cid,
      value: round.tallies[cid] || 0,
      color: colorMap[cid] || '#888',
      cid
    });
  }
  data.push({
    name: 'Exhausted',
    value: round.exhausted,
    color: colorMap[EX],
    cid: EX
  });

  // Sort by value descending
  data.sort((a, b) => b.value - a.value);

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) || 0])
    .range([0, innerWidth]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, innerHeight])
    .padding(0.1);

  // Bars
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => yScale(d.name) || 0)
    .attr('width', d => xScale(d.value))
    .attr('height', yScale.bandwidth())
    .attr('fill', d => d.color);

  // Value labels
  g.selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => xScale(d.value) + 3)
    .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 11)
    .text(d => d.value);

  // Y axis
  g.append('g')
    .call(d3.axisLeft(yScale));

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(5));

  // Majority threshold line
  const threshold = round.threshold;
  if (threshold > 0) {
    g.append('line')
      .attr('x1', xScale(threshold))
      .attr('x2', xScale(threshold))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#d00')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0.7);

    g.append('text')
      .attr('x', xScale(threshold) + 2)
      .attr('y', -5)
      .attr('font-size', 10)
      .attr('fill', '#d00')
      .text(`Majority: ${Math.round(threshold)}`);
  }

  // Title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 12)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
    .text(`Round ${focusedRound + 1} Vote Tallies`);
}

export function renderRCVisChart(
  container: HTMLElement,
  result: CountResult,
  candidates: Candidate[],
  userPath?: { roundIndex: number; from: string; to: string }[]
): RCVisAPI {
  container.innerHTML = '';
  
  // Create wrapper for chart sections
  const wrapper = document.createElement('div');
  wrapper.className = 'chart-wrapper';
  container.appendChild(wrapper);
  
  // Create containers for Sankey and Bar Chart
  const sankeyContainer = document.createElement('div');
  sankeyContainer.className = 'sankey-container';
  const barChartContainer = document.createElement('div');
  barChartContainer.className = 'bar-chart-container';
  
  // Responsive width calculation - use fallback if container not yet laid out
  let containerWidth = container.getBoundingClientRect().width;
  if (containerWidth < 100) {
    // Container not yet laid out, use sensible default
    containerWidth = Math.min(window.innerWidth - 40, 1000);
  }
  const width = Math.max(Math.min(containerWidth - 40, 980), 320);
  const height = Math.min(width * 0.57, 560);

  const candMap: Record<string, Candidate> = {};
  for (const c of candidates) candMap[c.id] = c;

  // Build color map early so we can render a legend before the chart
  const colorMap: Record<string, string> = {};
  for (let i = 0; i !== candidates.length; i += 1) {
    const cid = candidates[i].id;
    colorMap[cid] = COLORS[i % COLORS.length];
  }
  colorMap[EX] = '#9e9e9e';

  // Legend
  const legend = document.createElement('div');
  legend.className = 'legend';
  const legendItems = candidates.map(c => ({ label: c.shortLabel || c.name, color: colorMap[c.id] }))
    .concat([{ label: 'Exhausted', color: colorMap[EX] }]);
  for (const item of legendItems) {
    const el = document.createElement('div');
    el.className = 'legend-item';
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.backgroundColor = item.color;
    const lab = document.createElement('span');
    lab.textContent = item.label;
    el.append(sw, lab);
    legend.appendChild(el);
  }
  wrapper.appendChild(legend);

  const chartsRow = document.createElement('div');
  chartsRow.className = 'charts-row';
  wrapper.appendChild(chartsRow);
  
  chartsRow.appendChild(sankeyContainer);
  chartsRow.appendChild(barChartContainer);

  const note = document.createElement('div');
  note.className = 'chart-note';
  note.textContent = 'Sankey diagram shows ballot flow between rounds. Bar chart shows current round vote tallies.';
  sankeyContainer.appendChild(note);

  // Create SVG with viewBox for responsive scaling
  const svg = d3.select(sankeyContainer)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const nodes: Node[] = [];
  const links: Link[] = [];
  const rounds = result.rounds;

  for (let r = 0; r !== rounds.length; r += 1) {
    const rr = rounds[r];
    const cids = rr.continuing.slice();
    for (const cid of cids) {
      const id = r + '|' + cid;
      const val = rr.tallies[cid] || 0;
      const name = candMap[cid] ? (candMap[cid].shortLabel || candMap[cid].name) : cid;
      nodes.push({ id, round: r, cid, name, value: val });
    }
    const exId = r + '|' + EX;
    nodes.push({ id: exId, round: r, cid: EX, name: 'Exhausted', value: rr.exhausted });
    if (r !== rounds.length - 1) {
      const next = rounds[r + 1];
      for (const cid of rr.continuing) {
        if (next.continuing.indexOf(cid) !== -1) {
          const v = rr.tallies[cid] || 0;
          links.push({ source: r + '|' + cid, target: (r + 1) + '|' + cid, value: v, kind: 'stay' });
        }
      }
      links.push({ source: exId, target: (r + 1) + '|' + EX, value: rr.exhausted, kind: 'ex-carry' });
      if (rr.transfers) {
        for (const tr of rr.transfers) {
          const to = tr.to === 'exhausted' ? EX : tr.to;
          links.push({ source: r + '|' + tr.from, target: (r + 1) + '|' + to, value: tr.count, kind: 'transfer' });
        }
      }
    }
  }

  const idToIndex: Record<string, number> = {};
  const sankeyNodes = nodes.map((n, i) => { idToIndex[n.id] = i; return { ...n } });
  const sankeyLinks = links.map(l => ({ source: idToIndex[l.source], target: idToIndex[l.target], value: l.value, kind: l.kind }));

  const sk = d3Sankey<any, any>()
    .nodeWidth(16)
    .nodePadding(24)
    .extent([[120, 30], [width - 20, height - 40]]);

  const graph = sk({ nodes: sankeyNodes as any, links: sankeyLinks as any });

  // Links with tooltips
  const linksSel = svg.append('g')
    .attr('class', 'links')
    .selectAll('path')
    .data(graph.links as any)
    .enter()
    .append('path')
    .attr('d', sankeyLinkHorizontal())
.attr('stroke', (d: SankeyLink) => colorMap[d.target.cid] || '#888')
    .attr('stroke-opacity', 0.35)
    .attr('stroke-width', (d: SankeyLink) => Math.max(1, d.width))
    .attr('fill', 'none');

  linksSel.append('title')
    .text((d: SankeyLink) => {
      const s = d.source.cid === EX ? 'Exhausted' : (candMap[d.source.cid]?.name || d.source.cid);
      const t = d.target.cid === EX ? 'Exhausted' : (candMap[d.target.cid]?.name || d.target.cid);
      const kind = d.kind || '';
      return `${s} → ${t}  •  ${d.value}  ${kind ? '(' + kind + ')' : ''}`;
    });

  const node = svg.append('g').attr('class', 'nodes').selectAll('g').data(graph.nodes as any).enter().append('g');

  node.append('rect')
    .attr('x', (d: SankeyNode) => d.x0)
    .attr('y', (d: SankeyNode) => d.y0)
    .attr('height', (d: SankeyNode) => Math.max(1, d.y1 - d.y0))
    .attr('width', (d: SankeyNode) => d.x1 - d.x0)
    .attr('fill', (d: SankeyNode) => colorMap[d.cid] || '#666')
    .attr('stroke', '#222');

  node.append('text')
    .attr('x', (d: SankeyNode) => d.x1 + 6)
    .attr('y', (d: SankeyNode) => (d.y0 + d.y1) / 2)
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 12)
    .text((d: SankeyNode) => d.name + ' ' + d.value);

  node.append('title')
    .text((d: SankeyNode) => `Round ${d.round + 1} • ${d.name}: ${d.value}`);

  const maxCont = d3.max(rounds.map(x => x.continuingBallots)) || 1;
  const yScale = d3.scaleLinear().domain([0, maxCont]).range([height - 40, 30]);

  // Calculate total ballots from first round data (must be done before renderExhaustionAnalysis)
  const totalBallots = result.rounds[0]
    ? result.rounds[0].continuingBallots + result.rounds[0].exhausted
    : 0;

  // Round stats panel
  const statsDiv = document.createElement('div');
  statsDiv.className = 'round-stats';
  wrapper.appendChild(statsDiv);

  // Exhaustion analysis panel
  const exhaustionDiv = document.createElement('div');
  exhaustionDiv.className = 'exhaustion-analysis';
  wrapper.appendChild(exhaustionDiv);

  function renderStats(r: number) {
    const rr = rounds[Math.max(0, Math.min(rounds.length - 1, r))];
    const h = document.createElement('div');
    h.className = 'round-stats-header';
    h.textContent = 'Round ' + (rr.roundIndex + 1) + ' summary';

    const meta = document.createElement('div');
    meta.className = 'round-stats-meta';
    const thresh = Math.round(rr.threshold * 100) / 100;
    meta.textContent = `Continuing ballots: ${rr.continuingBallots} • Threshold: ${thresh} • Exhausted: ${rr.exhausted}`;

    const list = document.createElement('ul');
    list.className = 'round-stats-list';
    const cids = rr.continuing.slice();
    for (const cid of cids) {
      const li = document.createElement('li');
      const nm = candMap[cid]?.name || cid;
      li.textContent = `${nm}: ${rr.tallies[cid] || 0}`;
      list.appendChild(li);
    }

    statsDiv.innerHTML = '';
    statsDiv.append(h, meta, list);
  }

  function renderExhaustionAnalysis() {
    exhaustionDiv.innerHTML = '';
    
    const h = document.createElement('div');
    h.className = 'exhaustion-header';
    h.textContent = 'Exhaustion Analysis';
    exhaustionDiv.appendChild(h);

    let totalExhausted = 0;
    let overvotes = 0;
    let noValidChoice = 0;
    let blanksOnly = 0;

    // Accumulate exhaustion across all rounds
    for (const round of rounds) {
      if (round.exhaustionDetail) {
        overvotes += round.exhaustionDetail.overvoteAtRank;
        noValidChoice += round.exhaustionDetail.noValidNext;
        blanksOnly += round.exhaustionDetail.blankRemaining;
      }
      totalExhausted = round.exhausted; // Use final round's total
    }

    if (totalExhausted === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'No ballots exhausted in this election.';
      msg.className = 'exhaustion-none';
      exhaustionDiv.appendChild(msg);
      return;
    }

    const exhaustionRate = ((totalExhausted / totalBallots) * 100).toFixed(1);

    // Summary
    const summary = document.createElement('div');
    summary.className = 'exhaustion-summary';
    summary.innerHTML = `
      <strong>${totalExhausted}</strong> of <strong>${totalBallots}</strong> ballots exhausted 
      (<strong>${exhaustionRate}%</strong>)
    `;
    exhaustionDiv.appendChild(summary);

    // Breakdown by reason
    const breakdown = document.createElement('div');
    breakdown.className = 'exhaustion-breakdown';
    
    const reasons = [
      { label: 'Overvote (multiple candidates at same rank)', count: overvotes, color: 'var(--danger)' },
      { label: 'All ranked candidates eliminated', count: noValidChoice, color: 'var(--warn)' },
      { label: 'Only blank ranks remaining', count: blanksOnly, color: 'var(--muted)' }
    ].filter(r => r.count > 0);

    if (reasons.length > 0) {
      const breakdownTitle = document.createElement('div');
      breakdownTitle.className = 'breakdown-title';
      breakdownTitle.textContent = 'Exhaustion reasons:';
      breakdown.appendChild(breakdownTitle);

      for (const reason of reasons) {
        const item = document.createElement('div');
        item.className = 'exhaustion-reason';
        
        const bar = document.createElement('div');
        bar.className = 'exhaustion-bar';
        const width = (reason.count / totalExhausted) * 100;
        bar.style.width = width + '%';
        bar.style.backgroundColor = reason.color;
        
        const label = document.createElement('div');
        label.className = 'exhaustion-label';
        label.innerHTML = `
          <span class="reason-text">${reason.label}</span>
          <span class="reason-count">${reason.count} (${((reason.count / totalExhausted) * 100).toFixed(0)}%)</span>
        `;
        
        item.appendChild(bar);
        item.appendChild(label);
        breakdown.appendChild(item);
      }
    }
    
    exhaustionDiv.appendChild(breakdown);
  }

  if (userPath && userPath.length !== 0) {
    const segs: SankeyLink[] = [];
    for (const s of userPath) {
      if (s.from === 'start') continue;
      const sourceId = s.roundIndex + '|' + (s.from === 'exhausted' ? EX : s.from);
      const targetId = (s.roundIndex + 1) + '|' + (s.to === 'exhausted' ? EX : s.to);
      const link = (graph.links as SankeyLink[]).find((l: SankeyLink) => l.source.id === sourceId && l.target.id === targetId);
      if (link) segs.push(link);
    }
    svg.append('g')
      .attr('class', 'user-path')
      .selectAll('path')
      .data(segs)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#000')
      .attr('stroke-width', (d: SankeyLink) => Math.max(2, d.width + 2))
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.6);
  }

  function applyFocus(r: number) {
    const rr = Math.max(0, Math.min(rounds.length - 1, r));
    svg.selectAll('.links path')
      .attr('opacity', (d: SankeyLink) => {
        const rn = d.source.round;
        if (r === -1) return 1;
        return rn === rr ? 1 : 0.15;
      });
    renderStats(rr);
    renderBarChart(barChartContainer, result, candidates, colorMap, rr);
  }

  applyFocus(0);
  renderExhaustionAnalysis();

  return { focusRound: (r: number) => applyFocus(r) };
}

