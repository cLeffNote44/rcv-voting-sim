import { landingCopy } from '../copy';
import { t, getLanguage, setLanguage, getAvailableLanguages, type Language } from '../lib/i18n';

export function renderLanding(root: HTMLElement, onStart: (voterCount?: number) => void): void {
  // Get environment defaults
  const envDefaultVoterCount = Number(import.meta.env.VITE_DEFAULT_VOTER_COUNT) || 5000;
  const minVoters = Number(import.meta.env.VITE_MIN_VOTER_COUNT) || 100;
  const maxVoters = Number(import.meta.env.VITE_MAX_VOTER_COUNT) || 50000;
  let selectedVoterCount = envDefaultVoterCount;
  root.innerHTML = '';

  // Top navigation with anchors
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  const brand = document.createElement('a');
  brand.href = '#/';
  brand.className = 'brand';
  brand.textContent = 'Fort Collins RCV';
  brand.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  const navLinks = document.createElement('div');
  navLinks.className = 'links';
  const homeLink = document.createElement('a');
  homeLink.href = '#';
  homeLink.textContent = 'Home';
  homeLink.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  const learnLink = document.createElement('a');
  learnLink.href = '#learn';
  learnLink.textContent = 'Learn';
  learnLink.addEventListener('click', (e) => { e.preventDefault(); const el = document.getElementById('learn'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const startLink = document.createElement('a');
  startLink.href = '#/sim';
  startLink.className = 'start';
  startLink.textContent = 'Start';

  // Language selector in nav
  const langSelect = document.createElement('select');
  langSelect.className = 'nav-lang-select';
  langSelect.setAttribute('aria-label', 'Select language');
  const languages = getAvailableLanguages();
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    langSelect.appendChild(option);
  });
  langSelect.value = getLanguage();
  langSelect.addEventListener('change', (e) => {
    const lang = (e.target as HTMLSelectElement).value as Language;
    setLanguage(lang);
    window.location.reload();
  });

  navLinks.append(homeLink, learnLink, startLink, langSelect);
  nav.append(brand, navLinks);

  // Hero section
  const hero = document.createElement('section');
  hero.className = 'hero';

  const kicker = document.createElement('div');
  kicker.className = 'kicker';
  kicker.textContent = 'Educational demo · Fort Collins';

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.innerHTML = `${t('appTitle')} <span class="accent">${t('appSubtitle')}</span>`;

  const tagline = document.createElement('p');
  tagline.className = 'hero-tagline';
  tagline.textContent = 'See how ranked ballots are counted round by round, including transfers and ballot exhaustion.';

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta-group';

  // Voter count selector
  const voterSelector = document.createElement('div');
  voterSelector.className = 'voter-selector';

  const voterLabel = document.createElement('label');
  voterLabel.htmlFor = 'voter-count';
  voterLabel.textContent = t('simulatedVoters') + ': ';

  const voterDisplay = document.createElement('span');
  voterDisplay.className = 'voter-display';
  voterDisplay.textContent = selectedVoterCount.toLocaleString();

  const voterSlider = document.createElement('input');
  voterSlider.type = 'range';
  voterSlider.id = 'voter-count';
  voterSlider.min = String(minVoters);
  voterSlider.max = String(maxVoters);
  voterSlider.value = String(selectedVoterCount);
  voterSlider.step = '100';
  voterSlider.className = 'voter-slider';
  voterSlider.setAttribute('aria-label', 'Number of simulated voters');

  voterSlider.addEventListener('input', () => {
    selectedVoterCount = Number(voterSlider.value);
    voterDisplay.textContent = selectedVoterCount.toLocaleString();
  });

  const voterPresets = document.createElement('div');
  voterPresets.className = 'voter-presets';
  [1000, 5000, 10000, 25000].forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = preset >= 1000 ? `${preset / 1000}k` : String(preset);
    btn.addEventListener('click', () => {
      selectedVoterCount = preset;
      voterSlider.value = String(preset);
      voterDisplay.textContent = preset.toLocaleString();
    });
    voterPresets.appendChild(btn);
  });

  voterSelector.append(voterLabel, voterDisplay, voterSlider, voterPresets);

  const startBtn = document.createElement('button');
  startBtn.className = 'primary';
  startBtn.textContent = t('startSimulation');
  startBtn.addEventListener('click', () => onStart(selectedVoterCount));

  const learnBtn = document.createElement('button');
  learnBtn.className = 'outline';
  learnBtn.textContent = t('learnMore');
  learnBtn.addEventListener('click', () => {
    const el = document.getElementById('learn');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  ctaWrap.append(startBtn, learnBtn);
  hero.append(kicker, title, tagline, voterSelector, ctaWrap);

  // Feature grid
  const features = document.createElement('section');
  features.className = 'feature-grid';

  features.append(
    featureCard('Interactive ballot', 'Fill a 4-rank ballot. Leave blanks or overvote to see how exhaustion can occur.'),
    featureCard('Understand exhaustion', 'Learn why a ballot may stop counting if no ranked continuing candidate remains.'),
    featureCard('Step-through results', 'Advance round by round. Watch votes transfer and the majority threshold line.')
  );

  // Info cards
  const info = document.createElement('section');
  info.id = 'learn';
  info.className = 'info-cards';

  const card1 = infoCard(landingCopy.whatIsRCVTitle, landingCopy.whatIsRCVBody);
  const card2 = infoCard(landingCopy.whatIsExhaustionTitle, landingCopy.whatIsExhaustionBody);
  const card3 = infoCard(landingCopy.howTitle, landingCopy.howBody);

  info.append(card1, card2, card3);

  const footnote = document.createElement('p');
  footnote.className = 'footnote';
  footnote.textContent = 'Ties for last place are broken by a seeded random draw for this demo to keep results reproducible.';

  const disclaimer = document.createElement('p');
  disclaimer.className = 'disclaimer';
  disclaimer.textContent = landingCopy.disclaimer;

  root.append(nav, hero, features, info, footnote, disclaimer);
}

function featureCard(title: string, body: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card feature';
  const h = document.createElement('h3');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  card.append(h, p);
  return card;
}

function infoCard(title: string, body: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card info';
  const h = document.createElement('h2');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  card.append(h, p);
  return card;
}
