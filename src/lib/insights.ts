import type { DayLog, Food, Profile } from '../types'
import { FOODS } from '../data/foods'
import { resolveFood } from './storage'
import { scoreDay } from './score'

// ── 주간 통계 & 부족분 분석 (동적 추천·장보기의 근거) ──────────

export interface WeeklyStats {
  fishCount: number // 이번 주 등푸른생선 섭취 횟수
  avgAnti: number // 최근 평균 항염증 점수
  avgProtein: number // 최근 평균 단백질(g)
  daysLogged: number
}

/** 최근 days 기록으로 주간 통계 집계 */
export function weeklyStats(days: DayLog[], profile: Profile): WeeklyStats {
  let fishCount = 0
  let antiSum = 0
  let proteinSum = 0
  for (const d of days) {
    for (const meal of d.meals) {
      for (const it of meal.items) {
        const f = resolveFood(it.foodId)
        if (f && f.category === '생선' && f.tags.includes('오메가3')) fishCount += it.qty
      }
    }
    const s = scoreDay(d, profile)
    antiSum += s.antiScore
    proteinSum += s.proteinG
  }
  const n = days.length || 1
  return {
    fishCount,
    avgAnti: Math.round(antiSum / n),
    avgProtein: Math.round(proteinSum / n),
    daysLogged: days.length,
  }
}

export interface Gap {
  key: 'protein' | 'fish' | 'anti' | 'sodium' | 'fiber'
  label: string
  /** 이 부족분을 채우는 데 좋은 음식 추천 */
  suggestions: Food[]
}

/** 오늘 기록 + 주간 통계로 '지금 채우면 좋을 것' 산출 */
export function todayGaps(today: DayLog, week: WeeklyStats, profile: Profile): Gap[] {
  const s = scoreDay(today, profile)
  const gaps: Gap[] = []

  if (s.proteinG < profile.proteinTargetG) {
    const need = profile.proteinTargetG - s.proteinG
    gaps.push({
      key: 'protein',
      label: `단백질 ${need}g 더 필요`,
      suggestions: topBy(FOODS.filter((f) => f.protein >= 9 && f.anti >= 0), (f) => f.protein, 3),
    })
  }

  if (profile.modules.constipation && profile.fiberTargetG && s.fiberG < profile.fiberTargetG) {
    gaps.push({
      key: 'fiber',
      label: `식이섬유 ${s.fiberG}/${profile.fiberTargetG}g — 변비 완화`,
      suggestions: topBy(FOODS.filter((f) => (f.fiber ?? 0) >= 3), (f) => f.fiber ?? 0, 4),
    })
  }

  if (week.fishCount < profile.fishPerWeek) {
    gaps.push({
      key: 'fish',
      label: `이번 주 등푸른생선 ${week.fishCount}/${profile.fishPerWeek}회`,
      suggestions: FOODS.filter((f) => f.category === '생선' && f.tags.includes('오메가3')).slice(0, 3),
    })
  }

  if (s.antiScore < profile.antiScoreTarget) {
    gaps.push({
      key: 'anti',
      label: `항염증 점수 ${s.antiScore} → 목표 ${profile.antiScoreTarget}`,
      suggestions: topBy(FOODS.filter((f) => f.anti >= 2), (f) => f.anti, 4),
    })
  }

  if (s.sodiumMg > profile.sodiumLimitMg) {
    gaps.push({
      key: 'sodium',
      label: `나트륨 초과 — 국물·면류 줄이기`,
      suggestions: [],
    })
  }

  return gaps
}

function topBy<T>(arr: T[], score: (t: T) => number, n: number): T[] {
  return [...arr].sort((a, b) => score(b) - score(a)).slice(0, n)
}
