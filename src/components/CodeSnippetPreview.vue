<template>
  <!--
    Minimalist IDE window widget with two Java code snippets.
    Vue <Transition> handles the crossfade between snippets.
  -->
  <div class="editor-widget">
    <!-- IDE title bar -->
    <div class="editor-bar">
      <span class="dot red" /><span class="dot yellow" /><span class="dot green" />
      <div class="tab-strip">
        <button
          v-for="s in SNIPPETS"
          :key="s.id"
          class="file-tab"
          :class="{ active: active === s.id }"
          @click="active = s.id"
        >
          <span class="java-badge">J</span>
          {{ s.filename }}
        </button>
      </div>
    </div>

    <!-- Editor body: line numbers + code -->
    <div class="editor-body">
      <Transition name="snippet-fade" mode="out-in">
        <div class="code-pane" :key="active">
          <!-- Gutter with line numbers -->
          <div class="gutter">
            <span
              v-for="n in currentSnippet.lines"
              :key="n"
              class="line-num"
            >{{ n }}</span>
          </div>

          <!-- Code content (syntax highlighted via v-html) -->
          <pre class="code" v-html="currentSnippet.highlighted"></pre>
        </div>
      </Transition>
    </div>

    <!-- Footer: pattern label + language badge -->
    <div class="editor-footer">
      <span class="pattern-tag"><i class="fas fa-tag"></i> {{ currentSnippet.pattern }}</span>
      <div class="footer-right">
        <span class="lang-badge">Java 17</span>
        <span class="complexity-badge">{{ currentSnippet.complexity }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── Raw Java snippets ──────────────────────────────────────────────────
const SNIPPETS_RAW = [
  {
    id: 'dfs',
    filename: 'GraphDFS.java',
    pattern: 'Graph DFS — iterative traversal',
    complexity: 'O(V + E)',
    code: `import java.util.*;

public class GraphDFS {

    // Iterative DFS with explicit stack
    public static List<Integer> dfs(
            Map<Integer, List<Integer>> graph,
            int start) {

        List<Integer>  order   = new ArrayList<>();
        Deque<Integer> stack   = new ArrayDeque<>();
        Set<Integer>   visited = new HashSet<>();

        stack.push(start);

        while (!stack.isEmpty()) {
            int node = stack.pop();

            if (visited.add(node)) {   // mark on first visit
                order.add(node);

                // push neighbours reverse → left-first DFS
                List<Integer> nbrs =
                    graph.getOrDefault(node, List.of());
                for (int i = nbrs.size() - 1; i >= 0; i--) {
                    if (!visited.contains(nbrs.get(i)))
                        stack.push(nbrs.get(i));
                }
            }
        }
        return order;
    }
}`,
  },
  {
    id: 'knapsack',
    filename: 'Knapsack.java',
    pattern: 'DP — 0/1 Knapsack tabulation',
    complexity: 'O(n × W)',
    code: `public class Knapsack {

    // Bottom-up tabulation — space O(n × W)
    public static int solve(
            int[] weights, int[] values, int W) {

        int n      = weights.length;
        int[][] dp = new int[n + 1][W + 1];

        for (int i = 1; i <= n; i++) {
            int wt  = weights[i - 1];
            int val = values[i - 1];

            for (int w = 0; w <= W; w++) {
                // Option 1: skip item i
                dp[i][w] = dp[i - 1][w];

                // Option 2: take item i (if it fits)
                if (wt <= w) {
                    dp[i][w] = Math.max(
                        dp[i][w],
                        dp[i - 1][w - wt] + val
                    );
                }
            }
        }
        return dp[n][W];   // max value within capacity W
    }
}`,
  },
]

// ── Syntax highlighter for Java ────────────────────────────────────────
const KEYWORDS = /\b(import|public|private|static|void|int|boolean|return|for|while|if|else|new|class|true|false|null)\b/g
const TYPES    = /\b(List|Map|Set|Deque|ArrayDeque|ArrayList|HashSet|HashMap|String|Integer|Object)\b/g
const COMMENTS = /(\/\/[^\n]*)/g
const STRINGS  = /("(?:[^"\\]|\\.)*")/g
const NUMBERS  = /\b(\d+)\b/g

function escape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlight(code) {
  let s = escape(code)
  // Order matters: comments first so other rules don't apply inside them
  s = s.replace(COMMENTS, '<span class="c-comment">$1</span>')
  s = s.replace(STRINGS,  '<span class="c-string">$1</span>')
  s = s.replace(KEYWORDS, '<span class="c-kw">$1</span>')
  s = s.replace(TYPES,    '<span class="c-type">$1</span>')
  s = s.replace(NUMBERS,  '<span class="c-num">$1</span>')
  return s
}

// ── Build snippet objects ──────────────────────────────────────────────
const SNIPPETS = SNIPPETS_RAW.map(s => ({
  ...s,
  highlighted: highlight(s.code),
  lines: Array.from({ length: s.code.split('\n').length }, (_, i) => i + 1),
}))

const active = ref('dfs')

const currentSnippet = computed(
  () => SNIPPETS.find(s => s.id === active.value) || SNIPPETS[0]
)
</script>

<style scoped>
.editor-widget {
  background: var(--bg-code);
  border: 1px solid rgba(48,54,61,0.85);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card), 0 0 40px rgba(16,185,129,0.05);
  height: 100%;
}

/* Title bar */
.editor-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(48,54,61,0.6);
  flex-shrink: 0;
}

.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green  { background: #28c840; }

/* Tabs */
.tab-strip { display: flex; gap: 2px; margin-left: 8px; overflow: hidden; }

.file-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 4px 12px;
  border-radius: 4px 4px 0 0;
  color: var(--text-muted);
  border: 1px solid transparent;
  border-bottom: none;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.file-tab:hover { color: var(--text-secondary); }
.file-tab.active {
  color: #cdd9e5;
  background: rgba(255,255,255,0.05);
  border-color: rgba(48,54,61,0.6);
}

.java-badge {
  width: 14px; height: 14px;
  background: #f0883e;
  border-radius: 2px;
  font-size: 0.62rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  flex-shrink: 0;
}

/* Editor body */
.editor-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.code-pane {
  display: flex;
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,0.15) transparent;
}

/* Gutter */
.gutter {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  min-width: 42px;
  text-align: right;
  border-right: 1px solid rgba(48,54,61,0.5);
  flex-shrink: 0;
  background: rgba(0,0,0,0.15);
}

.line-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: rgba(148,163,184,0.3);
  padding: 0 12px 0 8px;
  line-height: 1.6;
  display: block;
  user-select: none;
}

/* Code */
.code {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  line-height: 1.6;
  padding: 16px 20px;
  color: #cdd9e5;
  white-space: pre;
  flex: 1;
  overflow: visible;
}

/* Java syntax highlight classes */
.code :deep(.c-kw)      { color: var(--accent-green); font-weight: 500; }
.code :deep(.c-type)    { color: #79c0ff; }
.code :deep(.c-string)  { color: #a5d6ff; }
.code :deep(.c-num)     { color: #f0883e; }
.code :deep(.c-comment) { color: rgba(148,163,184,0.45); font-style: italic; }

/* Footer */
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 16px;
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(48,54,61,0.5);
  flex-shrink: 0;
}

.pattern-tag {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent-green);
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-right { display: flex; gap: 8px; }

.lang-badge, .complexity-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 1px 7px;
  border-radius: 3px;
}

.lang-badge {
  background: rgba(59,130,246,0.12);
  color: var(--accent-blue);
  border: 1px solid rgba(59,130,246,0.2);
}

.complexity-badge {
  background: rgba(139,92,246,0.12);
  color: var(--accent-purple);
  border: 1px solid rgba(139,92,246,0.2);
}

/* Snippet crossfade transition */
.snippet-fade-enter-active,
.snippet-fade-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.snippet-fade-enter-from   { opacity: 0; transform: translateY(6px); }
.snippet-fade-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>
