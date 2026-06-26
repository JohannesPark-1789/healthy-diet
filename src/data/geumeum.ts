import type { GeumeumClass } from '../types'

// ── 금음체질(8체질 섭생표) 음식 분류 — 가이드용 ─────────────────
// good: 이로움 / avoid: 해로움 / caution: 주의·애매
// 근거: 8체질의학 공식 섭생표(ecmed.org). 생의학적 검증은 약함 → '가이드'.
// 안전망: avoid라도 변비·단백질에 필요한 음식(두부·견과·통곡물 등)은 앱이 막지 않음.

export const GEUMEUM_CLASS: Record<string, GeumeumClass> = {
  // 🟢 이로움 — 바다생선·해조류·잎채소·흰쌀
  mackerel: 'good',
  samchi: 'good',
  kkongchi: 'good',
  salmon: 'good',
  'tuna-can': 'good',
  'perilla-oil': 'good',
  spinach: 'good',
  cabbage: 'good',
  'kale-greens': 'good',
  broccoli: 'good',
  seaweed: 'good',
  gim: 'good',
  'white-rice': 'good',
  baekban: 'good',

  // 🔴 해로움 — 육류·유제품·밀가루·콩·견과·뿌리채소·마늘·버섯·잡곡
  'chicken-breast': 'avoid',
  'chicken-thigh': 'avoid',
  'lean-pork': 'avoid',
  'lean-beef': 'avoid',
  milk: 'avoid',
  'greek-yogurt': 'avoid',
  tofu: 'avoid',
  soymilk: 'avoid',
  beans: 'avoid',
  nuts: 'avoid',
  mushroom: 'avoid',
  garlic: 'avoid',
  'brown-rice': 'avoid',
  oats: 'avoid',
  'sweet-potato': 'avoid',
  'white-bread': 'avoid',
  'noodle-soup': 'avoid',
  jjajang: 'avoid',
  ramen: 'avoid',
  sausage: 'avoid',
  bacon: 'avoid',
  'fried-chicken': 'avoid',
  burger: 'avoid',
  fries: 'avoid',
  'spicy-stew': 'avoid',
  'cake-donut': 'avoid',
  'mix-coffee': 'avoid',
  'coffee-black': 'avoid',

  // ⚪ 주의·애매 — 계란노른자·과일·발효·기타
  egg: 'caution',
  kimchi: 'caution',
  'doenjang-jjigae': 'caution',
  tomato: 'caution',
  prune: 'caution',
  kiwi: 'caution',
  blueberry: 'caution',
  banana: 'caution',
  apple: 'caution',
  avocado: 'caution',
  'olive-oil': 'caution',
  bibimbap: 'caution',
  kimbap: 'caution',
  'snack-sweet': 'caution',
  soda: 'caution',
  alcohol: 'caution',
}

export function geumeumOf(id: string): GeumeumClass | undefined {
  return GEUMEUM_CLASS[id]
}

export const GEUMEUM_LABEL: Record<GeumeumClass, string> = {
  good: '금음 이로움',
  avoid: '금음 해로움',
  caution: '금음 주의',
}
