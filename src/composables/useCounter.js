// ── Composable: animated number counter triggered by IntersectionObserver ─
import { ref, unref, onMounted, onUnmounted } from 'vue'

/**
 * Counts from 0 → target when the element enters the viewport.
 *
 * @param {import('vue').Ref<HTMLElement|null>} elRef - Template ref for the element to observe
 * @param {number | import('vue').Ref<number> | import('vue').ComputedRef<number>} target
 *   Final value — accepts a plain number OR a reactive/computed ref so the
 *   store can drive the target dynamically (e.g. admin edits the LeetCode count).
 * @param {number} duration - Animation duration in ms (default 1400)
 */
export function useCounter(elRef, target, duration = 1400) {
  const count    = ref(0)
  let observer   = null
  let rafHandle  = null

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      const start = performance.now()
      const step  = (now) => {
        const elapsed  = now - start
        const progress = Math.min(elapsed / duration, 1)
        // unref() handles both plain numbers and reactive/computed refs transparently
        count.value    = Math.round(progress * (2 - progress) * unref(target))
        if (progress < 1) rafHandle = requestAnimationFrame(step)
      }
      rafHandle = requestAnimationFrame(step)
    }, { threshold: 0.5 })

    if (elRef.value) observer.observe(elRef.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    if (rafHandle) cancelAnimationFrame(rafHandle)
  })

  return { count }
}
