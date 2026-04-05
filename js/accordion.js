/**
 * Enhanced FAQ accordion with smooth height transitions.
 * Falls back gracefully — <details> elements work without JS.
 */
export function initAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const summary = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!summary || !answer) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      // Close other open items
      items.forEach(other => {
        if (other !== item && other.open) {
          other.open = false;
        }
      });

      // Toggle current
      item.open = !item.open;
    });
  });
}
