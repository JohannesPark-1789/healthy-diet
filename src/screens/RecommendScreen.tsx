// 매일 메뉴 추천 — 오늘 기록 기반 동적 '채울 것' + 원탭 담기
import { useMemo, useState } from 'react'
import type { LoggedItem, MealType } from '../types'
import { addItemsToMeal, loadDay, loadProfile, loadRecentDays, todayKST } from '../lib/storage'
import { todayGaps, weeklyStats } from '../lib/insights'

interface MenuOption {
  name: string
  note: string
  items: LoggedItem[]
}
interface MenuSet {
  meal: MealType
  icon: string
  options: MenuOption[]
}

const MENUS: MenuSet[] = [
  {
    meal: '아침',
    icon: '🌅',
    options: [
      { name: '오트밀 + 그릭요거트 + 블루베리 + 견과', note: '항염증·고단백·간편', items: [{ foodId: 'oats', qty: 1 }, { foodId: 'greek-yogurt', qty: 1 }, { foodId: 'blueberry', qty: 1 }, { foodId: 'nuts', qty: 1 }] },
      { name: '계란 2개 + 잡곡밥 반공기 + 김', note: '단백질 빠르게 확보', items: [{ foodId: 'egg', qty: 2 }, { foodId: 'brown-rice', qty: 0.5 }, { foodId: 'gim', qty: 1 }] },
      { name: '두유 + 바나나 + 삶은계란 (편의점)', note: '조리 0분, 출근길 OK', items: [{ foodId: 'soymilk', qty: 1 }, { foodId: 'banana', qty: 1 }, { foodId: 'egg', qty: 1 }] },
    ],
  },
  {
    meal: '점심',
    icon: '🍱',
    options: [
      { name: '고등어구이 백반 (국물 적게)', note: '오메가3 주2회 채우기 ⭐', items: [{ foodId: 'mackerel', qty: 1 }, { foodId: 'brown-rice', qty: 1 }, { foodId: 'spinach', qty: 1 }, { foodId: 'kimchi', qty: 1 }] },
      { name: '닭가슴살 + 잡곡밥 + 쌈채소', note: '고단백·저자극', items: [{ foodId: 'chicken-breast', qty: 1 }, { foodId: 'brown-rice', qty: 1 }, { foodId: 'kale-greens', qty: 1 }] },
      { name: '비빔밥 (고추장 적게)', note: '외식 시 무난한 선택', items: [{ foodId: 'bibimbap', qty: 1 }] },
    ],
  },
  {
    meal: '저녁',
    icon: '🌙',
    options: [
      { name: '두부 + 살코기 수육 + 나물 + 현미밥', note: '가볍고 위에 부담 적음', items: [{ foodId: 'tofu', qty: 1 }, { foodId: 'lean-pork', qty: 1 }, { foodId: 'spinach', qty: 1 }, { foodId: 'brown-rice', qty: 1 }] },
      { name: '연어/삼치 구이 + 브로콜리', note: '항염증 최상', items: [{ foodId: 'salmon', qty: 1 }, { foodId: 'broccoli', qty: 1 }] },
      { name: '된장찌개(싱겁게) + 두부 + 잡곡밥', note: '발효식품, 단 국물 적게', items: [{ foodId: 'doenjang-jjigae', qty: 1 }, { foodId: 'tofu', qty: 1 }, { foodId: 'brown-rice', qty: 1 }] },
    ],
  },
  {
    meal: '간식',
    icon: '🍎',
    options: [
      { name: '견과 한 줌 + 토마토', note: '오메가3·항산화', items: [{ foodId: 'nuts', qty: 1 }, { foodId: 'tomato', qty: 1 }] },
      { name: '그릭요거트 + 블루베리', note: '고단백 디저트 대체', items: [{ foodId: 'greek-yogurt', qty: 1 }, { foodId: 'blueberry', qty: 1 }] },
      { name: '삶은계란 / 두유 (편의점)', note: '단 음료 대신', items: [{ foodId: 'egg', qty: 1 }] },
    ],
  },
]

export function RecommendScreen() {
  const profile = useMemo(loadProfile, [])
  const today = useMemo(() => loadDay(todayKST()), [])
  const week = useMemo(() => weeklyStats(loadRecentDays(7), profile), [profile])
  const gaps = useMemo(() => todayGaps(today, week, profile), [today, week, profile])
  const [added, setAdded] = useState<string | null>(null)

  function flash(key: string) {
    setAdded(key)
    setTimeout(() => setAdded((k) => (k === key ? null : k)), 1600)
  }

  function addMenu(meal: MealType, opt: MenuOption) {
    addItemsToMeal(todayKST(), meal, opt.items)
    flash(`${meal}:${opt.name}`)
  }

  function addOne(foodId: string) {
    addItemsToMeal(todayKST(), '간식', [{ foodId, qty: 1 }])
    flash(`one:${foodId}`)
  }

  const mods = profile.modules

  return (
    <div className="space-y-4">
      {profile.constitution === '금음' && (
        <div className="rounded-xl bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-sm">
          🧭 <b className="text-gray-700">금음체질</b> · <span className="text-green-600">이로움</span>: 바다생선·해조류·잎채소·흰쌀 ·{' '}
          <span className="text-red-600">해로움</span>: 육류·밀가루·유제품·뿌리채소·마늘·버섯
        </div>
      )}
      {mods.constipation && (
        <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
          🌿 변비·소화 친화: <b>자두·키위·오트밀·미역·나물</b>로 섬유와 수분을, 기름지고 매운 음식·과식은 피해요.
        </div>
      )}

      {/* 동적: 오늘 채울 것 */}
      {gaps.length > 0 ? (
        <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700">🎯 지금 채우면 좋아요</h3>
          {gaps.map((g) => (
            <div key={g.key} className="rounded-lg bg-green-50 px-3 py-2">
              <div className="text-sm font-medium text-green-800">{g.label}</div>
              {g.suggestions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {g.suggestions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => addOne(f.id)}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-green-700 active:bg-green-100"
                    >
                      {added === `one:${f.id}` ? '✓ 간식 추가됨' : `＋ ${f.name}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          ✅ 오늘 목표를 잘 채우고 있어요! 이 페이스 유지해요 🌿
        </div>
      )}

      {MENUS.map((m) => (
        <div key={m.meal} className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            {m.icon} {m.meal}
          </h3>
          <ul className="space-y-2">
            {m.options.map((o) => {
              const key = `${m.meal}:${o.name}`
              const done = added === key
              return (
                <li key={o.name} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800">{o.name}</div>
                    <div className="text-xs text-green-600">{o.note}</div>
                  </div>
                  <button
                    onClick={() => addMenu(m.meal, o)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      done ? 'bg-green-100 text-green-700' : 'bg-green-600 text-white active:bg-green-700'
                    }`}
                  >
                    {done ? '✓ 담음' : '＋ 담기'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="rounded-xl bg-white p-3 text-xs text-gray-500 shadow-sm">
        💡 <b>줄일 것</b>: 라면·가공육·튀김·단 음료·믹스커피·야식 ·{' '}
        <b className="text-green-700">늘릴 것</b>: 등푸른생선·채소·통곡물·콩·견과·들기름
      </div>
    </div>
  )
}
