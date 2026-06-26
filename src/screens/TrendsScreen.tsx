// 추세 — 체중·허리둘레(전체 기간) + 항염증 점수·단백질(최근 식사 기록)
import { useMemo } from 'react'
import { loadProfile, loadRecentDays } from '../lib/storage'
import { scoreDay } from '../lib/score'
import { BodyTracker } from '../components/BodyTracker'

export function TrendsScreen() {
  const profile = useMemo(loadProfile, [])
  const days = useMemo(() => loadRecentDays(14), [])
  // 음식 기록이 있는 날만 (체중만 입력한 날 제외)
  const scored = days.map((d) => ({ date: d.date, ...scoreDay(d, profile) })).filter((s) => s.itemCount > 0)

  const maxProtein = Math.max(profile.proteinTargetG, ...scored.map((s) => s.proteinG), 1)

  return (
    <div className="space-y-4">
      {/* 체중·허리둘레 — 전체 기간 */}
      <BodyTracker />

      {/* 식사 기반 추세 */}
      {scored.length > 0 ? (
        <>
          <ChartCard title="항염증 점수 (최근 식사 기록)">
            <BarChart
              data={scored.map((s) => ({ date: s.date, value: s.antiScore, ok: s.antiScore >= profile.antiScoreTarget }))}
              scale={(v) => v}
            />
          </ChartCard>
          <ChartCard title="단백질 (목표 대비)">
            <BarChart
              data={scored.map((s) => ({
                date: s.date,
                value: s.proteinG,
                ok: s.proteinG >= profile.proteinTargetG,
              }))}
              scale={(v) => Math.round((v / maxProtein) * 100)}
            />
          </ChartCard>
        </>
      ) : (
        <div className="rounded-xl bg-white p-4 text-center text-xs text-gray-400 shadow-sm">
          <span className="text-green-600">오늘 탭</span>에서 식사를 기록하면
          <br />항염증 점수·단백질 추세도 쌓입니다 📈
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  )
}

function BarChart({
  data,
  scale,
}: {
  data: { date: string; value: number; ok: boolean }[]
  scale: (v: number) => number
}) {
  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t"
            style={{ height: `${scale(d.value)}%`, background: d.ok ? '#16a34a' : '#eab308' }}
            title={`${d.date}: ${d.value}`}
          />
          <span className="text-[9px] text-gray-400">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}
