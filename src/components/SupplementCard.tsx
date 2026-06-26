import { useMemo, useState } from 'react'
import type { Profile } from '../types'
import { recommendedSupplements } from '../data/supplements'

export function SupplementCard({
  profile,
  taken,
  onToggle,
}: {
  profile: Profile
  taken: string[]
  onToggle: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const items = useMemo(() => recommendedSupplements(profile), [profile])
  const tests = items.filter((i) => i.bloodTest).map((i) => i.bloodTest!)
  const doneCount = items.filter((i) => taken.includes(i.key)).length

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          💊 영양 보충 ({doneCount}/{items.length})
        </h3>
        <button onClick={() => setOpen((v) => !v)} className="text-xs text-green-600">
          {open ? '접기' : '자세히'}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((s) => {
          const on = taken.includes(s.key)
          return (
            <div key={s.key}>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(s.key)}
                  className="h-4 w-4 accent-green-600"
                />
                <span className={on ? 'text-gray-400 line-through' : ''}>{s.name}</span>
                {s.dose && <span className="text-xs text-gray-400">· {s.dose}</span>}
              </label>
              {open && (
                <div className="ml-6 mt-0.5 space-y-0.5 text-xs text-gray-500">
                  <div>· 이유: {s.reason}</div>
                  <div>· 음식 우선: {s.food}</div>
                  {s.bloodTest && <div>· 검사: {s.bloodTest}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {open && (
        <div className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-500">
          {tests.length > 0 && (
            <div>
              🩸 <b className="text-gray-600">다음 검진 때 확인</b>: {tests.join(', ')}
            </div>
          )}
          <div>※ 음식으로 먼저 채우고, 보충제·용량은 의사·검사로 확인하세요.</div>
        </div>
      )}
    </div>
  )
}
