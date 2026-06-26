import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 프로젝트 경로: https://JohannesPark-1789.github.io/healthy-diet/
const BASE = '/healthy-diet/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // 로컬 dev는 '/', 빌드(배포)는 '/healthy-diet/'
  base: command === 'build' ? BASE : '/',
  server: {
    // 미리보기 매니저가 지정한 포트(PORT env)를 따른다
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'],
      manifest: {
        name: '항염증 식단 코치',
        short_name: '식단코치',
        description: '40대 후반 한국 남성 맞춤 항염증·밸런스 식단관리',
        theme_color: '#16a34a',
        background_color: '#f8faf8',
        display: 'standalone',
        id: BASE,
        start_url: BASE,
        scope: BASE,
        lang: 'ko',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
}))
