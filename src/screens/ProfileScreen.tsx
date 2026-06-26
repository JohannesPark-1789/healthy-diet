// 프로필 — 목표 수정, 리마인더 설정, 데이터 백업
import { useState } from 'react'
import type { Profile } from '../types'
import { exportAll, importAll, loadProfile, saveProfile } from '../lib/storage'
import {
  DEFAULT_REMINDER,
  loadReminder,
  requestNotifyPermission,
  saveReminder,
  type ReminderSettings,
} from '../lib/reminders'

export function ProfileScreen({ onClose }: { onClose: () => void }) {
  const [p, setP] = useState<Profile>(loadProfile)
  const [r, setR] = useState<ReminderSettings>(loadReminder() ?? DEFAULT_REMINDER)
  const [saved, setSaved] = useState(false)
  const [avoidInput, setAvoidInput] = useState('')

  function num(key: keyof Profile, v: string) {
    setP({ ...p, [key]: v === '' ? 0 : Number(v) })
  }

  function addAvoid() {
    const name = avoidInput.trim()
    if (!name) return
    const list = p.avoidFoods ?? []
    if (!list.includes(name)) setP({ ...p, avoidFoods: [...list, name] })
    setAvoidInput('')
  }

  function removeAvoid(name: string) {
    setP({ ...p, avoidFoods: (p.avoidFoods ?? []).filter((x) => x !== name) })
  }

  function save() {
    saveProfile(p)
    saveReminder(r)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function toggleReminder(enabled: boolean) {
    if (enabled) {
      const ok = await requestNotifyPermission()
      if (!ok) {
        alert('알림 권한이 필요해요. 브라우저 설정에서 알림을 허용해 주세요.')
        return
      }
    }
    const next = { ...r, enabled }
    setR(next)
    saveReminder(next)
  }

  function download() {
    const blob = new Blob([exportAll()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `식단코치_백업_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function restore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const res = importAll(String(reader.result))
        alert(`복원 완료: ${res.days}일치 기록을 불러왔어요. 화면을 새로고침합니다.`)
        location.reload()
      } catch {
        alert('파일을 읽을 수 없어요. 올바른 백업(JSON) 파일인지 확인해 주세요.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-[#f8faf8]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="safe-top sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
          <h2 className="text-base font-bold text-gray-800">{p.name} · 설정</h2>
          <button onClick={onClose} className="text-sm text-gray-400">
            닫기
          </button>
        </header>

        <div className="space-y-4 p-4">
          <Section title="나의 정보">
            <Field label="키 (cm)" value={p.heightCm} onChange={(v) => num('heightCm', v)} />
            <Field label="체중 (kg)" value={p.weightKg} onChange={(v) => num('weightKg', v)} />
          </Section>

          <Section title="목표 (검진·연구 기반)">
            <Field label="단백질 목표 (g)" value={p.proteinTargetG} onChange={(v) => num('proteinTargetG', v)} />
            <Field label="나트륨 상한 (mg)" value={p.sodiumLimitMg} onChange={(v) => num('sodiumLimitMg', v)} />
            <Field label="주당 등푸른생선 (회)" value={p.fishPerWeek} onChange={(v) => num('fishPerWeek', v)} />
            <Field label="항염증 점수 목표" value={p.antiScoreTarget} onChange={(v) => num('antiScoreTarget', v)} />
          </Section>

          {p.modules.constipation && (
            <Section title="변비 관리 목표">
              <Field label="식이섬유 목표 (g)" value={p.fiberTargetG ?? 25} onChange={(v) => num('fiberTargetG', v)} />
              <Field label="수분 목표 (잔)" value={p.waterTargetCups ?? 8} onChange={(v) => num('waterTargetCups', v)} />
            </Section>
          )}

          {p.modules.digestion && (
            <Section title="안 맞는 음식 (속 아픈 음식)">
              <div className="flex gap-2">
                <input
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAvoid()}
                  placeholder="예: 매운 음식, 밀가루"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-green-400"
                />
                <button onClick={addAvoid} className="shrink-0 rounded-lg bg-green-600 px-3 text-sm font-medium text-white">
                  추가
                </button>
              </div>
              {p.avoidFoods && p.avoidFoods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.avoidFoods.map((name) => (
                    <span key={name} className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-700">
                      {name}
                      <button onClick={() => removeAvoid(name)} className="text-red-400">✕</button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400">등록하면 음식 기록 시 경고가 떠요.</p>
            </Section>
          )}

          <Section title="8체질 (금음체질)">
            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>금음체질 가이드 표시</span>
              <input
                type="checkbox"
                checked={p.constitution === '금음'}
                onChange={(e) => setP({ ...p, constitution: e.target.checked ? '금음' : undefined })}
                className="h-5 w-5 accent-green-600"
              />
            </label>
            <p className="text-xs text-gray-400">
              켜면 음식에 금음 이로움/해로움이 표시돼요. 참고 가이드이며, 변비·단백질에 필요한 음식은 막지 않습니다.
            </p>
          </Section>

          <Section title="리마인더">
            <label className="flex items-center justify-between text-sm text-gray-700">
              <span>저녁 알림 (야식 금지·기록 확인)</span>
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) => toggleReminder(e.target.checked)}
                className="h-5 w-5 accent-green-600"
              />
            </label>
            <Field
              label="알림 시간 (HH:MM)"
              value={r.time}
              type="time"
              onChange={(v) => setR({ ...r, time: v })}
            />
            <p className="text-xs text-gray-400">
              ※ 앱이 열려 있을 때 동작합니다. 백그라운드 푸시는 추후 확장 예정.
            </p>
          </Section>

          <Section title="데이터 백업">
            <button
              onClick={download}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700"
            >
              📥 백업 내보내기 (JSON)
            </button>
            <label className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 text-center text-sm font-medium text-gray-700">
              📤 백업 복원하기
              <input type="file" accept="application/json,.json" onChange={restore} className="hidden" />
            </label>
            <p className="text-xs text-gray-400">
              ※ 데이터는 이 폰/브라우저에만 저장돼요. 가끔 백업을 내보내 두면 안전합니다.
            </p>
          </Section>

          <button
            onClick={save}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white active:bg-green-700"
          >
            {saved ? '✅ 저장됨' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'number',
}: {
  label: string
  value: number | string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="flex items-center justify-between text-sm text-gray-600">
      <span>{label}</span>
      <input
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-right text-gray-800 outline-none focus:border-green-400"
      />
    </label>
  )
}
