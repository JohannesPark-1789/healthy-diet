import { useMemo, useState } from 'react'
import type { DayLog, Food, MealType } from '../types'
import { MEAL_TYPES } from '../types'
import { loadDay, loadProfile, resolveFood, saveDay, todayKST } from '../lib/storage'
import { scoreDay } from '../lib/score'
import { FoodPicker } from '../components/FoodPicker'
import { geumeumOf } from '../data/geumeum'

const HABIT_LABELS: { key: keyof DayLog['habits']; label: string }[] = [
  { key: 'noLateNight', label: '취침 3시간 전 금식' },
  { key: 'proteinEveryMeal', label: '매 끼니 단백질' },
  { key: 'noProcessed', label: '가공식품·단 음료 안 먹음' },
  { key: 'noAlcohol', label: '금주' },
]

export function TodayScreen() {
  const date = todayKST()
  const profile = useMemo(loadProfile, [])
  const [day, setDay] = useState<DayLog>(() => loadDay(date))
  const [picking, setPicking] = useState<MealType | null>(null)

  const score = useMemo(() => scoreDay(day, profile), [day, profile])
  const m = profile.modules
  const isGeum = profile.constitution === '금음'

  function update(next: DayLog) {
    setDay(next)
    saveDay(next)
  }

  function addFood(meal: MealType, food: Food) {
    if (m.digestion && profile.avoidFoods?.includes(food.name)) {
      if (!window.confirm(`'${food.name}'은(는) 안 맞는 음식으로 등록돼 있어요. 그래도 추가할까요?`)) {
        setPicking(null)
        return
      }
    }
    const meals = [...day.meals]
    let mm = meals.find((x) => x.meal === meal)
    if (!mm) {
      mm = { meal, items: [] }
      meals.push(mm)
    }
    mm.items = [...mm.items, { foodId: food.id, qty: 1 }]
    update({ ...day, meals })
    setPicking(null)
  }

  function removeItem(meal: MealType, idx: number) {
    const meals = day.meals
      .map((x) => (x.meal === meal ? { ...x, items: x.items.filter((_, i) => i !== idx) } : x))
      .filter((x) => x.items.length > 0)
    update({ ...day, meals })
  }

  function toggleHabit(key: keyof DayLog['habits']) {
    update({ ...day, habits: { ...day.habits, [key]: !day.habits[key] } })
  }

  function setMetric(key: 'weightKg' | 'waistCm', value: string) {
    update({ ...day, [key]: value === '' ? undefined : Number(value) })
  }

  function addWater(delta: number) {
    update({ ...day, waterCups: Math.max(0, (day.waterCups ?? 0) + delta) })
  }

  /** 끼니 항목 수량 조절 (0.5인분 단위, 0 이하면 삭제) */
  function setQty(meal: MealType, idx: number, delta: number) {
    const meals = day.meals
      .map((x) =>
        x.meal === meal
          ? {
              ...x,
              items: x.items
                .map((it, i) => (i === idx ? { ...it, qty: Math.round((it.qty + delta) * 2) / 2 } : it))
                .filter((it) => it.qty > 0),
            }
          : x,
      )
      .filter((x) => x.items.length > 0)
    update({ ...day, meals })
  }

  return (
    <div className="space-y-4">
      <ScoreCard score={score} target={profile.antiScoreTarget} />

      {/* 게이지 */}
      <div className="grid grid-cols-2 gap-3">
        <Gauge label="단백질" value={score.proteinG} target={profile.proteinTargetG} unit="g" good="high" />
        <Gauge label="나트륨" value={score.sodiumMg} target={profile.sodiumLimitMg} unit="mg" good="low" />
        {m.constipation && profile.fiberTargetG && (
          <Gauge label="식이섬유" value={score.fiberG} target={profile.fiberTargetG} unit="g" good="high" />
        )}
        {m.constipation && profile.waterTargetCups && (
          <Gauge label="수분" value={day.waterCups ?? 0} target={profile.waterTargetCups} unit="잔" good="high" />
        )}
      </div>

      {/* 인사이트 */}
      {score.insights.length > 0 && (
        <div className="space-y-1.5 rounded-xl bg-white p-3 shadow-sm">
          {score.insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span>{ins.kind === 'good' ? '✅' : ins.kind === 'warn' ? '⚠️' : '🔴'}</span>
              <span className="text-gray-700">{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* 변비 관리: 수분·배변 */}
      {m.constipation && (
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">💧 수분</span>
            <button onClick={() => addWater(-1)} className="h-7 w-7 rounded-full bg-gray-100 text-gray-600">−</button>
            <span className="w-8 text-center text-sm font-bold">{day.waterCups ?? 0}잔</span>
            <button onClick={() => addWater(1)} className="h-7 w-7 rounded-full bg-sky-100 text-sky-700">＋</button>
          </div>
          <button
            onClick={() => update({ ...day, bowel: !day.bowel })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              day.bowel ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {day.bowel ? '✓ 배변 함' : '배변 기록'}
          </button>
        </div>
      )}

      {/* 금음체질 가이드 (안전망 안내) */}
      {isGeum && (
        <div className="rounded-xl bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-sm">
          <span className="font-semibold text-gray-700">🧭 금음체질 가이드</span> — 음식에{' '}
          <span className="text-green-600">이로움</span>/<span className="text-red-600">해로움</span> 표시가 떠요.
          단, <b>변비·단백질</b>에 필요한 콩·견과·통곡물은 금음 ‘해로움’이라도 막지 않아요(영양 안전망). 8체질은 참고 가이드이며 과학적 근거는 제한적입니다.
        </div>
      )}

      {/* 안 맞는 음식 안내 */}
      {m.digestion && profile.avoidFoods && profile.avoidFoods.length > 0 && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
          <i>⚠️ 안 맞는 음식</i>: {profile.avoidFoods.join(', ')} — 설정에서 관리
        </div>
      )}

      {/* 끼니별 기록 */}
      <div className="space-y-3">
        {MEAL_TYPES.map((meal) => {
          const mealLog = day.meals.find((x) => x.meal === meal)
          return (
            <div key={meal} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">{meal}</h3>
                <button
                  onClick={() => setPicking(meal)}
                  className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white active:bg-green-700"
                >
                  + 추가
                </button>
              </div>
              {mealLog && mealLog.items.length > 0 ? (
                <ul className="space-y-1">
                  {mealLog.items.map((it, idx) => {
                    const f = resolveFood(it.foodId)
                    if (!f) return null
                    const avoid = m.digestion && profile.avoidFoods?.includes(f.name)
                    return (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          {f.name}
                          <AntiDot anti={f.anti} />
                          {isGeum && <GeumMark id={f.id} />}
                          {avoid && <span className="ml-1 text-red-500">⚠️</span>}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => setQty(meal, idx, -0.5)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
                            aria-label="수량 줄이기"
                          >
                            −
                          </button>
                          <span className="w-9 text-center text-xs font-medium text-gray-700">×{it.qty}</span>
                          <button
                            onClick={() => setQty(meal, idx, 0.5)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 active:bg-green-200"
                            aria-label="수량 늘리기"
                          >
                            ＋
                          </button>
                          <button
                            onClick={() => removeItem(meal, idx)}
                            className="ml-0.5 text-xs text-gray-300 active:text-red-500"
                            aria-label="삭제"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-300">아직 기록 없음</p>
              )}
            </div>
          )
        })}
      </div>

      {/* 습관 체크 */}
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">오늘의 습관 ({score.habitScore}/4)</h3>
        <div className="space-y-1.5">
          {HABIT_LABELS.map((h) => (
            <label key={h.key} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={day.habits[h.key]}
                onChange={() => toggleHabit(h.key)}
                className="h-4 w-4 accent-green-600"
              />
              {h.label}
            </label>
          ))}
        </div>
      </div>

      {/* 컨디션·스트레스 메모 */}
      {m.conditionMemo && (
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">😌 오늘 컨디션·스트레스</h3>
          <textarea
            value={day.conditionNote ?? ''}
            onChange={(e) => update({ ...day, conditionNote: e.target.value })}
            placeholder="예: 강의 준비로 스트레스, 속이 더부룩함"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
          />
        </div>
      )}

      {/* 오늘의 몸 */}
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">오늘의 몸</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-500">
            체중 (kg)
            <input
              type="number"
              inputMode="decimal"
              value={day.weightKg ?? ''}
              onChange={(e) => setMetric('weightKg', e.target.value)}
              placeholder={String(profile.weightKg)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-400"
            />
          </label>
          <label className="text-xs text-gray-500">
            허리둘레 (cm)
            <input
              type="number"
              inputMode="decimal"
              value={day.waistCm ?? ''}
              onChange={(e) => setMetric('waistCm', e.target.value)}
              placeholder="허리"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-400"
            />
          </label>
        </div>
      </div>

      {picking && <FoodPicker onPick={(f) => addFood(picking, f)} onClose={() => setPicking(null)} />}
    </div>
  )
}

function ScoreCard({ score, target }: { score: ReturnType<typeof scoreDay>; target: number }) {
  const v = score.antiScore
  const color = v >= target ? '#16a34a' : v >= target * 0.7 ? '#eab308' : '#dc2626'
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${color} ${v * 3.6}deg, #f1f5f1 0deg)` }}
      >
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-xl font-bold" style={{ color }}>
            {v}
          </span>
          <span className="text-[10px] text-gray-400">점</span>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-700">오늘의 항염증 점수</div>
        <div className="text-xs text-gray-400">목표 {target}점 · 음식 {score.itemCount}개 기록</div>
      </div>
    </div>
  )
}

function Gauge({
  label,
  value,
  target,
  unit,
  good,
}: {
  label: string
  value: number
  target: number
  unit: string
  good: 'high' | 'low'
}) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  const ok = good === 'high' ? value >= target : value <= target
  const barColor = ok ? 'bg-green-500' : good === 'low' && value > target ? 'bg-red-500' : 'bg-yellow-500'
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-sm font-bold text-gray-800">
          {value}
          <span className="text-xs font-normal text-gray-400">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AntiDot({ anti }: { anti: number }) {
  const color = anti >= 1 ? 'bg-green-400' : anti === 0 ? 'bg-gray-300' : 'bg-red-400'
  return <span className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${color}`} />
}

function GeumMark({ id }: { id: string }) {
  const g = geumeumOf(id)
  if (!g) return null
  const map = { good: '🟢금음', avoid: '🔴금음', caution: '🟡금음' } as const
  return <span className="ml-1.5 align-middle text-[10px] text-gray-400">{map[g]}</span>
}
