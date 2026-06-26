// 앱 아이콘 생성: SVG → PNG (192/512) + maskable
// 실행: node scripts/make-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

// 🌿 잎사귀 아이콘 — 녹색 라운드 배경 + 흰 잎 + 녹색 잎맥
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22c55e"/>
      <stop offset="1" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <g transform="translate(256,256) rotate(-36)">
    <path d="M0,-150 C150,-86 150,86 0,150 C-150,86 -150,-86 0,-150 Z" fill="#ffffff"/>
    <g stroke="#16a34a" stroke-width="11" stroke-linecap="round" fill="none">
      <line x1="0" y1="-135" x2="0" y2="135"/>
      <path d="M0,-60 Q40,-72 78,-92"/>
      <path d="M0,-60 Q-40,-72 -78,-92"/>
      <path d="M0,0 Q44,-12 86,-34"/>
      <path d="M0,0 Q-44,-12 -86,-34"/>
      <path d="M0,60 Q40,48 74,30"/>
      <path d="M0,60 Q-40,48 -74,30"/>
    </g>
  </g>
</svg>`

const buf = Buffer.from(svg)

await sharp(buf).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(buf).resize(512, 512).png().toFile('public/icons/icon-512.png')
// maskable: 안전영역 위해 패딩 추가 (배경 녹색으로 확장)
await sharp(buf)
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#1a9c47' })
  .resize(512, 512)
  .png()
  .toFile('public/icons/icon-maskable-512.png')

console.log('✅ icons generated: icon-192.png, icon-512.png, icon-maskable-512.png')
