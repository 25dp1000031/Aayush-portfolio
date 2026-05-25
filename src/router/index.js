import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // 🌟 THE FIX: Switch to Hash routing so GitHub Pages handles sub-routes safely
  history: createWebHashHistory(),
  routes: [ /* your routes */ ]
})