import './styles.css';
import './brand.css';
import { renderLanding } from './pages/landing';
import { renderSim } from './pages/sim';

function route() {
  const app = document.querySelector('#app') as HTMLElement;
  if (!app) return;
  const hash = window.location.hash || '#/'
  if (hash.indexOf('#/sim') === 0) {
    renderSim(app, () => route());
  } else {
    renderLanding(app, () => { window.location.hash = '#/sim'; });
  }
}

window.addEventListener('hashchange', route);
route();

