// ── Composable: terminal typewriter effect ──────────────────────────────
import { ref, onUnmounted } from 'vue'

/**
 * Animates text appearing character-by-character into a ref string.
 * Returns { output, isTyping, start }.
 *
 * @param {string} text - Full text to type
 * @param {number} speed - Ms per character (default 16)
 */
export function useTypewriter(text, speed = 16) {
  const output   = ref('')
  const isTyping = ref(false)
  let   timer    = null

  function start(onComplete) {
    output.value   = ''
    isTyping.value = true
    let i = 0

    function tick() {
      if (i < text.length) {
        output.value += text[i++]
        timer = setTimeout(tick, speed)
      } else {
        isTyping.value = false
        onComplete?.()
      }
    }
    tick()
  }

  function stop() {
    clearTimeout(timer)
    isTyping.value = false
  }

  onUnmounted(stop)

  return { output, isTyping, start, stop }
}
