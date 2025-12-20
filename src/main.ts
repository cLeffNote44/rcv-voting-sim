import './styles.css';
import './brand.css';
import { renderLanding } from './pages/landing';
import { renderSim } from './pages/sim';
import { initColorScheme } from './lib/theme';
import { initLanguage } from './lib/i18n';

// Initialize color scheme and language from localStorage
initColorScheme();
initLanguage();

function route() {
  const app = document.querySelector('#app') as HTMLElement;
  if (!app) return;
  const hash = window.location.hash || '#/'
  if (hash.indexOf('#/sim') === 0) {
    renderSim(app, () => route());
  } else {
    renderLanding(app, (voterCount?: number) => {
      // Build URL with voter count if provided
      const params = new URLSearchParams();
      if (voterCount) {
        params.set('n', String(voterCount));
      }
      const queryString = params.toString();
      window.location.hash = queryString ? `#/sim?${queryString}` : '#/sim';
    });
  }
}

window.addEventListener('hashchange', route);
route();

