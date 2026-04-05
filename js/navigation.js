/**
 * Sticky navigation scroll behavior and mobile menu toggle.
 */
export function initNavigation() {
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const overlay = document.getElementById('mobile-menu-overlay');
  const overlayLinks = overlay?.querySelectorAll('a');

  if (!nav || !toggle) return;

  // ─── Scroll class toggle ───
  const SCROLL_THRESHOLD = 50;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check

  // ─── Mobile menu toggle ───
  function toggleMenu() {
    const isOpen = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', toggleMenu);

  // Close on overlay link click
  overlayLinks?.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // ─── Smooth scroll offset for nav links ───
  const allNavLinks = document.querySelectorAll('.nav-menu a, .mobile-menu-links a');
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      const offset = nav.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
