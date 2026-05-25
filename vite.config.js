import { defineConfig } from 'vite'
import vue          from '@vitejs/plugin-vue'
import tailwindcss      from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync } from 'fs'
import path             from 'path'

const ROOT       = process.cwd()
const ASSET_DIRS = ['Certs', 'profilePic', 'resume']

function syncAssets(destBase) {
  ASSET_DIRS.forEach(dir => {
    const src  = path.join(ROOT, dir)
    const dest = path.join(destBase, dir)
    if (existsSync(src)) {
      mkdirSync(dest, { recursive: true })
      cpSync(src, dest, { recursive: true, force: false })
    }
  })
}

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'root-asset-sync',
      configureServer() { syncAssets(path.join(ROOT, 'public')) },
      closeBundle()     { syncAssets(path.join(ROOT, 'dist'))   },
    },
  ],
  // 🌟 THE FIX: Switch to lowercase repository matching string!
  // GitHub Pages normalization registers asset directories in lowercase behind the scenes.
  base: command === 'build' ? '/Aayush-portfolio/' : '/',
  publicDir: 'public',
  resolve: { alias: { '@': path.resolve(ROOT, 'src') } },
}))