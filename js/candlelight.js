/**
 * Candlelight particle effect — subtle warm glow particles in the hero section.
 * Respects prefers-reduced-motion.
 */
export function initCandlelight() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const container = document.getElementById('hero-particles');
  if (!container) return;

  const PARTICLE_COUNT = 22;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');

    // Randomize properties
    const size = 2 + Math.random() * 4; // 2-6px
    const x = Math.random() * 100; // % position
    const y = Math.random() * 100;
    const baseOpacity = 0.15 + Math.random() * 0.35; // 0.15-0.5
    const duration = 3 + Math.random() * 5; // 3-8s
    const delay = Math.random() * 6; // 0-6s
    const driftX = -4 + Math.random() * 8; // -4 to 4px
    const driftY = -6 + Math.random() * 4; // -6 to -2px

    // Slight color variation — warm gold to soft amber
    const hue = 38 + Math.random() * 12; // 38-50
    const sat = 70 + Math.random() * 20; // 70-90%
    const light = 55 + Math.random() * 15; // 55-70%

    particle.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: hsl(${hue}, ${sat}%, ${light}%);
      opacity: ${baseOpacity};
      mix-blend-mode: screen;
      pointer-events: none;
      will-change: opacity, transform;
      --particle-base-opacity: ${baseOpacity};
      --drift-x: ${driftX}px;
      --drift-y: ${driftY}px;
      animation:
        flicker ${duration}s ease-in-out ${delay}s infinite,
        drift ${duration * 1.5}s ease-in-out ${delay}s infinite;
      filter: blur(${0.5 + Math.random() * 1}px);
    `;

    container.appendChild(particle);
  }
}
