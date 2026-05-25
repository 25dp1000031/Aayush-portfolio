// ── Composable: scroll-reveal via IntersectionObserver ─────────────────
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Adds the CSS class 'visible' to elements with class 'reveal'
 * when they enter the viewport.
 *
 * @param {string} selector - CSS selector for reveal targets (default '.reveal')
 * @param {{ threshold?: number, rootMargin?: string, delay?: number }} options
 */
export function useScrollReveal(selector = '.reveal', options = {}) {
  const {
    threshold  = 0.12,
    rootMargin = '0px 0px -40px 0px',
  } = options

  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const delay = parseInt(entry.target.dataset.delay || 0, 10)
        setTimeout(() => entry.target.classList.add('visible'), delay)
        observer.unobserve(entry.target)
      })
    }, { threshold, rootMargin })

    document.querySelectorAll(selector).forEach(el => observer.observe(el))
  })

  onUnmounted(() => observer?.disconnect())
}
