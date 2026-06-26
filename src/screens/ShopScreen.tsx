// 주간 장보기 리스트 — 항염증 식단 기본 식재료 (마트·편의점에서 바로)
// MVP: 카테고리별 추천 목록 + 체크. Phase C에서 추천 메뉴 연동 자동 생성.

import { useMemo, useState } from 'react'
import { loadProfile, loadRecentDays } from '../lib/storage'
import { weeklyStats } from '../lib/insights'

const SHOP_LIST: { cat: string; icon: string; items: string[] }[] = [
  { cat: '단백질', icon: '🥚', items: ['계란 한 판', '닭가슴살', '두부', '무가당 두유', '그릭요거트', '검은콩/콩자반'] },
  { cat: '등푸른생선 (주2회)', icon: '🐟', items: ['고등어/삼치 구이용', '연어', '참치캔(라이트)'] },
  { cat: '채소·발효', icon: '🥬', items: ['시금치/쌈채소', '브로콜리', '버섯', '토마토', '저염 김치', '된장'] },
  { cat: '과일·견과', icon: '🫐', items: ['블루베리(냉동 OK)', '바나나', '사과', '아몬드/호두'] },
  { cat: '통곡물·건강지방', icon: '🌾', items: ['현미/잡곡', '오트밀', '고구마', '들기름', '올리브유'] },
  { cat: '편의점 비상식량', icon: '🏪', items: ['삶은계란', '무가당 두유', '견과 소포장', '바나나'] },
]

export function ShopScreen() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const week = useMemo(() => weeklyStats(loadRecentDays(7), loadProfile()), [])
  const toggle = (k: string) => {
    const next = new Set(checked)
    next.has(k) ? next.delete(k) : next.add(k)
    setChecked(next)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
        🛒 이번 주 장보기 — 이대로 담으면 항염증 식단 기본기 완성
      </div>
      {week.daysLogged > 0 && week.fishCount < 2 && (
        <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
          🐟 이번 주 등푸른생선 {week.fishCount}회 — <b>고등어·삼치</b>를 꼭 담아요 (오메가3)
        </div>
      )}
      {SHOP_LIST.map((g) => (
        <div key={g.cat} className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            {g.icon} {g.cat}
          </h3>
          <div className="space-y-1.5">
            {g.items.map((it) => {
              const k = `${g.cat}:${it}`
              const on = checked.has(k)
              return (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(k)}
                    className="h-4 w-4 accent-green-600"
                  />
                  <span className={on ? 'text-gray-300 line-through' : 'text-gray-700'}>{it}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
