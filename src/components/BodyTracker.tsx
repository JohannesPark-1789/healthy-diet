import { useState } from 'react'
import { LineChart, type Point } from './LineChart'
import { getCheckupSeed, loadBodyEntries, seedCheckups, setBody, todayKST } from '../lib/storage'

// 체중·허리둘레 추세 + 아무 날짜나 기록/수정
export function BodyTracker() {
  const [entries, setEntries] = useState(loadBodyEntries)
  const [date, setDate] = useState(todayKST())
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  function refresh() {
    setEntries(loadBodyEntries())
  }

  function add() {
    if (weight === '' && waist === '') return
    setBody(date, weight === '' ? undefined : Number(weight), waist === '' ? undefined : Number(waist))
    setWeight('')
    setWaist('')
    refresh()
  }

  function doSeed() {
    seedCheckups()
    refresh()
  }

  const weightPts: Point[] = entries.map((e) => ({ label: e.date.slice(2), value: e.weightKg }))
  const waistPts: Point[] = entries.map((e) => ({ label: e.date.slice(2), value: e.waistCm }))
  const hasData = entries.length > 0
  const seed = getCheckupSeed()
  const alreadySeeded = seed.length === 0 || entries.some((e) => e.date === seed[0].date)

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">⚖️ 체중 추세 (kg)</h3>
        <LineChart points={weightPts} unit="kg" color="#16a34a" />
      </div>

      <div className="rounded-xl bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">📏 허리둘레 추세 (cm)</h3>
        <LineChart points={waistPts} unit="cm" color="#0ea5e9" />
      </div>

      {/* 기록 추가/수정 */}
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">기록 추가 · 수정</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm text-gray-600">
            <span>날짜</span>
            <input
              type="date"
              value={date}
              max={todayKST()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-gray-800 outline-none focus:border-green-400"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="체중 kg"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
            />
            <input
              type="number"
              inputMode="decimal"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="허리 cm"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
            />
          </div>
          <button
            onClick={add}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white active:bg-green-700"
          >
            저장
          </button>
          {!alreadySeeded && (
            <button
              onClick={doSeed}
              className="w-full rounded-lg border border-green-200 bg-green-50 py-2 text-xs font-medium text-green-700"
            >
              📋 건강검진 기록 불러오기 (2024·2026)
            </button>
          )}
        </div>
      </div>

      {/* 기록 목록 */}
      {hasData && (
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">기록 ({entries.length})</h3>
          <ul className="divide-y divide-gray-50">
            {[...entries].reverse().map((e) => (
              <li key={e.date} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-gray-500">{e.date}</span>
                <span className="text-gray-800">
                  {e.weightKg != null && <b>{e.weightKg}kg</b>}
                  {e.weightKg != null && e.waistCm != null && ' · '}
                  {e.waistCm != null && <span>{e.waistCm}cm</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
