<template>
  <!--
    Interactive folder/package tree for the learn-java-dsa-structured repo.
    Folders toggle open/closed; clicking the card opens the GitHub link.
  -->
  <a
    href="https://github.com/25dp1000031/learn-java-dsa-structured"
    target="_blank"
    rel="noopener"
    class="repo-card"
    @click.stop
  >
    <!-- Card header -->
    <div class="card-header">
      <div class="repo-icon"><i class="fab fa-github"></i></div>
      <div>
        <h3 class="repo-name">learn-java-dsa-structured</h3>
        <p class="repo-sub">Pattern-based · Organized · Structured</p>
      </div>
      <span class="open-link"><i class="fas fa-external-link-alt"></i></span>
    </div>

    <!-- Pattern badges -->
    <div class="pattern-row">
      <span v-for="p in PATTERNS" :key="p.label" class="pattern-badge" :style="{ color: p.color, borderColor: p.color + '40', background: p.color + '12' }">
        {{ p.label }}
      </span>
    </div>

    <!-- Interactive file tree -->
    <div class="file-tree" @click.prevent>
      <div
        v-for="node in visibleNodes"
        :key="node.id"
        class="tree-row"
        :class="[`type-${node.type}`, { clickable: node.type === 'folder' }]"
        :style="{ paddingLeft: `${node.depth * 16 + 12}px` }"
        @click.prevent="node.type === 'folder' && toggle(node.id)"
      >
        <!-- Branch line indent guides -->
        <span class="branch-guides">
          <span v-for="d in node.depth" :key="d" class="guide-line" />
        </span>

        <!-- Icon -->
        <i
          class="node-icon"
          :class="nodeIcon(node)"
          :style="{ color: nodeColor(node) }"
        ></i>

        <!-- Name -->
        <span class="node-name">{{ node.name }}</span>

        <!-- Problem count badge for folders -->
        <span v-if="node.badge" class="node-badge">{{ node.badge }}</span>

        <!-- Chevron for folders -->
        <i
          v-if="node.type === 'folder'"
          class="fas fa-chevron-right fold-arrow"
          :class="{ open: node.open }"
        ></i>
      </div>
    </div>
  </a>
</template>

<script setup>
import { reactive, computed } from 'vue'

// ── Tree data ──────────────────────────────────────────────────────────
// Each node: { id, name, type, depth, open?, badge?, children? }
const rawTree = reactive({
  id: 'root', name: 'learn-java-dsa-structured', type: 'root', open: true,
  children: [
    {
      id: 'src', name: 'src', type: 'folder', open: true,
      children: [
        {
          id: 'arrays', name: 'arrays', type: 'folder', open: false, badge: '12 problems',
          children: [
            { id: 'a1', name: 'TwoPointers.java',    type: 'file' },
            { id: 'a2', name: 'SlidingWindow.java',  type: 'file' },
            { id: 'a3', name: 'MatrixTraversal.java',type: 'file' },
            { id: 'a4', name: 'PrefixSum.java',      type: 'file' },
          ],
        },
        {
          id: 'trees', name: 'trees', type: 'folder', open: false, badge: '15 problems',
          children: [
            { id: 't1', name: 'BinaryTree.java',     type: 'file' },
            { id: 't2', name: 'BSTOperations.java',  type: 'file' },
            { id: 't3', name: 'TreeDP.java',         type: 'file' },
            { id: 't4', name: 'TreeTraversals.java', type: 'file' },
          ],
        },
        {
          id: 'graphs', name: 'graphs', type: 'folder', open: false, badge: '18 problems',
          children: [
            { id: 'g1', name: 'BFS.java',              type: 'file' },
            { id: 'g2', name: 'DFS.java',              type: 'file' },
            { id: 'g3', name: 'TopologicalSort.java',  type: 'file' },
            { id: 'g4', name: 'ShortestPath.java',     type: 'file' },
          ],
        },
        {
          id: 'dp', name: 'dynamic_programming', type: 'folder', open: false, badge: '25 problems',
          children: [
            { id: 'd1', name: 'Knapsack.java',   type: 'file' },
            { id: 'd2', name: 'SubsetSum.java',  type: 'file' },
            { id: 'd3', name: 'LCS.java',        type: 'file' },
            { id: 'd4', name: 'Memoization.java',type: 'file' },
          ],
        },
        {
          id: 'sorting', name: 'sorting', type: 'folder', open: false, badge: '8 problems',
          children: [
            { id: 's1', name: 'MergeSort.java', type: 'file' },
            { id: 's2', name: 'QuickSort.java', type: 'file' },
          ],
        },
        {
          id: 'strings', name: 'strings', type: 'folder', open: false, badge: '10 problems',
          children: [
            { id: 'st1', name: 'StringMatching.java', type: 'file' },
            { id: 'st2', name: 'Anagram.java',        type: 'file' },
          ],
        },
      ],
    },
    { id: 'readme',  name: 'README.md', type: 'file' },
    { id: 'pom',     name: 'pom.xml',   type: 'file' },
  ],
})

// ── Flatten tree into visible rows ─────────────────────────────────────
function flatten(node, depth = 0, result = []) {
  result.push({ ...node, depth })
  if (node.open && node.children) {
    node.children.forEach(child => flatten(child, depth + 1, result))
  }
  return result
}

const visibleNodes = computed(() => flatten(rawTree))

// ── Toggle folder ──────────────────────────────────────────────────────
function findNode(node, id) {
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  return null
}

function toggle(id) {
  const node = findNode(rawTree, id)
  if (node) node.open = !node.open
}

// ── Icon + color helpers ───────────────────────────────────────────────
function nodeIcon(node) {
  if (node.type === 'root')   return 'fab fa-github'
  if (node.type === 'folder') return node.open ? 'fas fa-folder-open' : 'fas fa-folder'
  if (node.name.endsWith('.java')) return 'fas fa-coffee'
  if (node.name.endsWith('.md'))   return 'fab fa-markdown'
  if (node.name.endsWith('.xml'))  return 'fas fa-code'
  return 'fas fa-file-alt'
}

function nodeColor(node) {
  if (node.type === 'root')   return 'var(--accent-green)'
  if (node.type === 'folder') return '#79c0ff'
  if (node.name.endsWith('.java')) return '#f0883e'
  if (node.name.endsWith('.md'))   return '#a5d6ff'
  if (node.name.endsWith('.xml'))  return '#fcd34d'
  return 'var(--text-muted)'
}

const PATTERNS = [
  { label: 'Two Pointers',  color: '#10B981' },
  { label: 'Sliding Window',color: '#3B82F6' },
  { label: 'BFS / DFS',     color: '#8B5CF6' },
  { label: 'Tree DP',       color: '#F59E0B' },
  { label: 'Memoization',   color: '#06B6D4' },
  { label: 'Knapsack DP',   color: '#EF4444' },
]
</script>

<style scoped>
.repo-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
  cursor: pointer;
}
.repo-card:hover {
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow);
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.repo-icon {
  width: 38px; height: 38px;
  background: rgba(16,185,129,0.1);
  border-radius: var(--radius-xs);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent-green);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.repo-name { font-family: var(--font-mono); font-size: 0.88rem; font-weight: 600; margin-bottom: 2px; }
.repo-sub  { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); }

.open-link {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 0.78rem;
  transition: color 0.2s;
}
.repo-card:hover .open-link { color: var(--accent-green); }

/* Pattern badges */
.pattern-row { display: flex; flex-wrap: wrap; gap: 5px; }
.pattern-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid;
  font-weight: 500;
}

/* File tree */
.file-tree {
  background: var(--bg-code);
  border: 1px solid rgba(48,54,61,0.8);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,0.2) transparent;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 12px;
  font-family: var(--font-mono);
  font-size: 0.73rem;
  color: #cdd9e5;
  position: relative;
  transition: background 0.15s;
  user-select: none;
}

.tree-row.clickable { cursor: pointer; }
.tree-row.clickable:hover { background: rgba(255,255,255,0.04); }

.branch-guides {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  display: flex;
}
.guide-line {
  display: block;
  width: 16px;
  border-left: 1px solid rgba(148,163,184,0.12);
  height: 100%;
}

.node-icon { font-size: 0.78rem; flex-shrink: 0; z-index: 1; }
.node-name { flex: 1; z-index: 1; }

.node-badge {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(16,185,129,0.1);
  color: var(--accent-green);
  border: 1px solid rgba(16,185,129,0.2);
  white-space: nowrap;
}

.fold-arrow {
  font-size: 0.6rem;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.fold-arrow.open { transform: rotate(90deg); }

.type-root { background: rgba(16,185,129,0.04); }
</style>
