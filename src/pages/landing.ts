import { landingCopy } from '../copy';

export function renderLanding(root: HTMLElement, onStart: () => void): void {
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
  navLinks.append(homeLink, learnLink, startLink);
  nav.append(brand, navLinks);

  // Hero section
  const hero = document.createElement('section');
  hero.className = 'hero';

  const kicker = document.createElement('div');
  kicker.className = 'kicker';
  kicker.textContent = 'Educational demo · Fort Collins';

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.innerHTML = 'Ranked Choice Voting <span class="accent">simulator</span>';

  const tagline = document.createElement('p');
  tagline.className = 'hero-tagline';
  tagline.textContent = 'See how ranked ballots are counted round by round, including transfers and ballot exhaustion.';

  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'cta-group';

  const startBtn = document.createElement('button');
  startBtn.className = 'primary';
  startBtn.textContent = 'Start simulation';
  startBtn.addEventListener('click', onStart);

  const learnBtn = document.createElement('button');
  learnBtn.className = 'outline';
  learnBtn.textContent = 'Learn more';
  learnBtn.addEventListener('click', () => {
    const el = document.getElementById('learn');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  ctaWrap.append(startBtn, learnBtn);
  hero.append(kicker, title, tagline, ctaWrap);

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
