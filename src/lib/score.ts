import type { DayLog, HabitCheck, Profile } from '../types'
import { resolveFood } from './storage'

// ── 항염증 점수 엔진 ─────────────────────────────────────────
// 하루 식사 기록 → 항염증 점수(0~100) + 단백질·나트륨 합계 + 인사이트

export interface DayScore {
  antiScore: number // 0~100 (높을수록 항염증)
  proteinG: number // 단백질 합계(g)
  sodiumMg: number // 나트륨 합계(mg)
  fiberG: number // 식이섬유 합계(g)
  itemCount: number
  habitScore: number // 0~4 (체크된 습관 수)
  insights: Insight[]
}

export interface Insight {
  kind: 'good' | 'warn' | 'bad'
  text: string
}

/** 모든 끼니의 음식을 펼쳐서 합산 */
function flatItems(day: DayLog) {
  return day.meals.flatMap((m) => m.items)
}

export function scoreDay(day: DayLog, profile: Profile): DayScore {
  const items = flatItems(day)
  let proteinG = 0
  let sodiumMg = 0
  let fiberG = 0
  let antiSum = 0
  let antiCount = 0

  for (const it of items) {
    const food = resolveFood(it.foodId)
    if (!food) continue
    proteinG += food.protein * it.qty
    sodiumMg += food.sodium * it.qty
    fiberG += (food.fiber ?? 0) * it.qty
    // 음료 중 물은 점수 계산에서 중립 제외 (anti 0, 영향 없음)
    antiSum += food.anti * it.qty
    antiCount += it.qty
  }

  // anti 평균(-3~+3) → 0~100 스케일로 변환
  const avgAnti = antiCount > 0 ? antiSum / antiCount : 0
  const antiScore = Math.round(((avgAnti + 3) / 6) * 100)

  const habitScore = countHabits(day.habits)
  const insights = buildInsights(day, profile, { proteinG, sodiumMg, fiberG, antiScore })

  return {
    antiScore,
    proteinG: Math.round(proteinG),
    sodiumMg: Math.round(sodiumMg),
    fiberG: Math.round(fiberG),
    itemCount: items.length,
    habitScore,
    insights,
  }
}

export function countHabits(h: HabitCheck): number {
  return [h.noLateNight, h.proteinEveryMeal, h.noProcessed, h.noAlcohol].filter(Boolean).length
}

function buildInsights(
  day: DayLog,
  profile: Profile,
  totals: { proteinG: number; sodiumMg: number; fiberG: number; antiScore: number },
): Insight[] {
  const out: Insight[] = []
  const proteinWhy = profile.modules.bone ? '근손실·골유합 주의' : '근육 유지에 필요'

  // 단백질
  if (totals.proteinG >= profile.proteinTargetG)
    out.push({ kind: 'good', text: `단백질 ${Math.round(totals.proteinG)}g — 목표 달성 💪` })
  else if (totals.proteinG >= profile.proteinTargetG * 0.7)
    out.push({ kind: 'warn', text: `단백질 ${Math.round(totals.proteinG)}g — 목표 ${profile.proteinTargetG}g까지 조금 더` })
  else
    out.push({ kind: 'bad', text: `단백질 ${Math.round(totals.proteinG)}g — 부족 (${proteinWhy})` })

  // 식이섬유 (변비 모듈)
  if (profile.modules.constipation && profile.fiberTargetG) {
    if (totals.fiberG >= profile.fiberTargetG)
      out.push({ kind: 'good', text: `식이섬유 ${totals.fiberG}g — 목표 달성 🌾` })
    else
      out.push({ kind: 'warn', text: `식이섬유 ${totals.fiberG}g/${profile.fiberTargetG}g — 채소·과일·통곡물로 변비 완화` })

    // 수분
    if (profile.waterTargetCups) {
      const cups = day.waterCups ?? 0
      if (cups < profile.waterTargetCups)
        out.push({ kind: 'warn', text: `수분 ${cups}/${profile.waterTargetCups}잔 — 물을 자주 (변비에 중요)` })
    }
    // 배변
    if (day.bowel === false)
      out.push({ kind: 'warn', text: `오늘 배변 없음 — 섬유·수분·가벼운 움직임 챙기기` })
  }

  // 나트륨 (가족력 고혈압이면 더 강조)
  const sodiumWhy = profile.modules.familyRisk ? '혈압 관리 (가족력)' : '국물 줄이기'
  if (totals.sodiumMg > profile.sodiumLimitMg)
    out.push({ kind: 'bad', text: `나트륨 ${Math.round(totals.sodiumMg)}mg — 상한(${profile.sodiumLimitMg}) 초과, ${sodiumWhy}` })
  else if (totals.sodiumMg > profile.sodiumLimitMg * 0.8)
    out.push({ kind: 'warn', text: `나트륨 ${Math.round(totals.sodiumMg)}mg — 상한에 근접` })

  // 항염증 점수
  if (totals.antiScore >= profile.antiScoreTarget)
    out.push({ kind: 'good', text: `항염증 점수 ${totals.antiScore} — 좋아요 🌿` })
  else
    out.push({ kind: 'warn', text: `항염증 점수 ${totals.antiScore} — 등푸른생선·채소·통곡물 추가` })

  // 위·식도 보호 습관
  if (!day.habits.noLateNight)
    out.push({ kind: 'warn', text: `취침 3시간 전 금식 — 위염·역류·체중에 가장 효과적` })

  return out
}
