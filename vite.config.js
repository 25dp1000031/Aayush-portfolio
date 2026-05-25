import { defineConfig }  from 'vite'
import vue              from '@vitejs/plugin-vue'
import tailwindcss      from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync } from 'fs'
import path             from 'path'

const ROOT       = process.cwd()
const ASSET_DIRS = ['Certs', 'profilePic', 'resume']

// Copy root-level asset folders into a destination (public/ for dev, dist/ for build)
function syncAssets(destBase) {
  ASSET_DIRS.forEach(dir => {
    const src  = path.join(ROOT, dir)
    const dest = path.join(destBase, dir)
    if (existsSync(src)) {
      mkdirSync(dest, { recursive: true })
      cpSync(src, dest, { recursive: true, force: false }) // force:false skips existing files
    }
  })
}

export default defineConfig({
  plugins: [
    vue(),
    
    tailwindcss(),
    {
      name: 'root-asset-sync',
      // Dev: sync to public/ so Vite serves them at /Certs, /profilePic, /resume
      configureServer() { syncAssets(path.join(ROOT, 'public')) },
      // Build: sync to dist/ after bundle is written
      closeBundle()     { syncAssets(path.join(ROOT, 'dist'))   },
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/Aayush-portfolio/' : '/',
  publicDir: 'public',
  resolve: { alias: { '@': path.resolve(ROOT, 'src') } },
})
