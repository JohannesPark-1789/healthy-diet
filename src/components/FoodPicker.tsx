import { useMemo, useState } from 'react'
import { allFoods, addCustomFood, loadProfile } from '../lib/storage'
import { geumeumOf } from '../data/geumeum'
import type { Food, FoodCategory, FoodTag, GeumeumClass } from '../types'

const GEUM_BADGE: Record<GeumeumClass, { label: string; cls: string }> = {
  good: { label: '금음 이로움', cls: 'bg-green-100 text-green-700' },
  avoid: { label: '금음 해로움', cls: 'bg-red-100 text-red-700' },
  caution: { label: '금음 주의', cls: 'bg-amber-100 text-amber-700' },
}

function antiBadge(anti: number) {
  if (anti >= 2) return { label: '항염증', cls: 'bg-green-100 text-green-700' }
  if (anti >= 1) return { label: '약항염', cls: 'bg-emerald-50 text-emerald-600' }
  if (anti === 0) return { label: '중립', cls: 'bg-gray-100 text-gray-500' }
  if (anti >= -1) return { label: '약친염', cls: 'bg-orange-50 text-orange-600' }
  return { label: '친염증', cls: 'bg-red-100 text-red-700' }
}

// 직접 추가용 분류 프리셋 (영양 수치를 몰라도 대략 자동 설정)
interface Preset {
  key: string
  label: string
  category: FoodCategory
  anti: number
  protein: number
  sodium: number
  tags: FoodTag[]
}
const PRESETS: Preset[] = [
  { key: 'protein', label: '고기·계란·두부', category: '단백질', anti: 0, protein: 15, sodium: 200, tags: ['고단백'] },
  { key: 'fish', label: '등푸른생선', category: '생선', anti: 3, protein: 22, sodium: 400, tags: ['오메가3', '고단백'] },
  { key: 'veg', label: '채소·나물', category: '채소', anti: 2, protein: 2, sodium: 150, tags: [] },
  { key: 'fruit', label: '과일', category: '과일', anti: 1, protein: 1, sodium: 5, tags: [] },
  { key: 'grain', label: '통곡물·잡곡', category: '통곡물', anti: 1, protein: 5, sodium: 10, tags: [] },
  { key: 'rice', label: '밥·면(정제)', category: '정제탄수', anti: 0, protein: 6, sodium: 300, tags: [] },
  { key: 'soup', label: '국·찌개', category: '기타', anti: 0, protein: 6, sodium: 800, tags: ['고나트륨'] },
  { key: 'nuts', label: '견과·콩', category: '견과', anti: 2, protein: 6, sodium: 20, tags: [] },
  { key: 'processed', label: '가공·튀김·단 음식', category: '가공식품', anti: -2, protein: 4, sodium: 500, tags: [] },
  { key: 'drink', label: '음료(물·차)', category: '음료', anti: 0, protein: 0, sodium: 0, tags: [] },
  { key: 'etc', label: '기타', category: '기타', anti: 0, protein: 3, sodium: 150, tags: [] },
]

export function FoodPicker({ onPick, onClose }: { onPick: (f: Food) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const constitution = loadProfile().constitution

  const results = useMemo(() => {
    const s = q.trim()
    const list = s ? allFoods().filter((f) => f.name.includes(s)) : allFoods()
    return [...list].sort((a, b) => b.anti - a.anti)
  }, [q])

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        className="mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 (고정) */}
        <div className="safe-top flex items-center gap-2 border-b p-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="음식 검색 (예: 고등어, 계란)"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
          />
          <button onClick={onClose} className="shrink-0 px-2 text-sm text-gray-400">
            닫기
          </button>
        </div>

        {adding ? (
          <CustomFoodForm
            initialName={q.trim()}
            onCancel={() => setAdding(false)}
            onCreate={(food) => {
              addCustomFood(food)
              onPick(food)
            }}
          />
        ) : (
          // 결과 목록 (남은 공간 전체, 스크롤)
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 border-b border-gray-100 bg-green-50 px-4 py-3 text-left text-sm font-medium text-green-700 active:bg-green-100"
            >
              <span className="text-lg">＋</span>
              {q.trim() ? `‘${q.trim()}’ 직접 추가하기` : '목록에 없는 음식 직접 추가'}
            </button>

            {results.map((f) => {
              const b = antiBadge(f.anti)
              const custom = f.id.startsWith('custom-')
              return (
                <button
                  key={f.id}
                  onClick={() => onPick(f)}
                  className="flex w-full items-center justify-between border-b border-gray-50 px-4 py-3 text-left active:bg-green-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                      <span className="truncate">{f.name}</span>
                      {custom && <span className="text-[10px] text-gray-400">직접</span>}
                      {constitution === '금음' && geumeumOf(f.id) && (
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${GEUM_BADGE[geumeumOf(f.id)!].cls}`}>
                          {GEUM_BADGE[geumeumOf(f.id)!].label}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {f.serving} · 단백질 {f.protein}g · 나트륨 {f.sodium}mg
                    </div>
                  </div>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${b.cls}`}>
                    {b.label}
                  </span>
                </button>
              )
            })}

            {results.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                검색 결과가 없어요.<br />위 ‘직접 추가하기’로 등록하세요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CustomFoodForm({
  initialName,
  onCreate,
  onCancel,
}: {
  initialName: string
  onCreate: (f: Food) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initialName)
  const [presetKey, setPresetKey] = useState('protein')
  const preset = PRESETS.find((p) => p.key === presetKey)!
  const [protein, setProtein] = useState(String(preset.protein))

  function changePreset(key: string) {
    setPresetKey(key)
    const p = PRESETS.find((x) => x.key === key)!
    setProtein(String(p.protein))
  }

  function create() {
    const nm = name.trim()
    if (!nm) return
    const id = 'custom-' + Date.now().toString(36) + Math.floor(performance.now()).toString(36)
    const food: Food = {
      id,
      name: nm,
      category: preset.category,
      anti: preset.anti,
      protein: Number(protein) || 0,
      sodium: preset.sodium,
      serving: '1인분',
      tags: preset.tags,
    }
    onCreate(food)
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">직접 추가</h3>
      <div className="space-y-3">
        <label className="block text-xs text-gray-500">
          음식 이름
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 순두부찌개"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-400"
          />
        </label>

        <div className="block text-xs text-gray-500">
          분류 (대략 고르면 항염증 점수·나트륨이 자동 설정돼요)
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => changePreset(p.key)}
                className={`rounded-lg border px-2 py-2 text-xs ${
                  presetKey === p.key
                    ? 'border-green-500 bg-green-50 font-semibold text-green-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-xs text-gray-500">
          단백질 (g, 모르면 그대로 두세요)
          <input
            type="number"
            inputMode="decimal"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-400"
          />
        </label>

        <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-500">
          미리보기: <b className="text-gray-700">{name.trim() || '이름 없음'}</b> · 항염증{' '}
          {preset.anti > 0 ? `+${preset.anti}` : preset.anti} · 단백질 {protein || 0}g · 나트륨 {preset.sodium}mg
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600">
            취소
          </button>
          <button
            onClick={create}
            className="flex-[2] rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white active:bg-green-700"
          >
            추가하고 기록
          </button>
        </div>
      </div>
    </div>
  )
}
