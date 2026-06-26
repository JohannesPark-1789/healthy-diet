// 간단한 SVG 라인차트 (체중·허리둘레 추세용)
export interface Point {
  label: string
  value: number | undefined
}

export function LineChart({
  points,
  color = '#16a34a',
  unit = '',
  height = 120,
}: {
  points: Point[]
  color?: string
  unit?: string
  height?: number
}) {
  const valid = points.filter((p): p is { label: string; value: number } => typeof p.value === 'number')
  if (valid.length < 1) {
    return <div className="py-6 text-center text-xs text-gray-300">데이터가 쌓이면 추세가 보여요</div>
  }

  const W = 320
  const H = height
  const PAD = 24
  const values = valid.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const n = points.length

  const x = (i: number) => PAD + (i / Math.max(1, n - 1)) * (W - PAD * 2)
  const y = (v: number) => PAD + (1 - (v - min) / range) * (H - PAD * 2)

  // 값이 있는 점만 이어서 polyline 좌표 생성
  const coords = points
    .map((p, i) => (typeof p.value === 'number' ? `${x(i)},${y(p.value)}` : null))
    .filter(Boolean)
    .join(' ')

  const last = valid[valid.length - 1]
  const first = valid[0]
  const delta = last.value - first.value

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xl font-bold text-gray-800">
          {last.value}
          <span className="text-xs font-normal text-gray-400"> {unit}</span>
        </span>
        {valid.length > 1 && (
          <span className={`text-xs font-medium ${delta <= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}{unit} (기간)
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <polyline points={coords} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) =>
          typeof p.value === 'number' ? (
            <circle key={i} cx={x(i)} cy={y(p.value)} r={3} fill={color} />
          ) : null,
        )}
      </svg>
    </div>
  )
}
