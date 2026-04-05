import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initAccordion } from './accordion.js';
import { initRSVP } from './rsvp.js';
import { initCandlelight } from './candlelight.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCandlelight();
  initAnimations();
  initAccordion();
  initRSVP();
});
