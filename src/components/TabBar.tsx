export type TabKey = 'today' | 'recommend' | 'shop' | 'trends'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'today', label: '오늘', icon: '📝' },
  { key: 'recommend', label: '추천', icon: '🍽️' },
  { key: 'shop', label: '장보기', icon: '🛒' },
  { key: 'trends', label: '추세', icon: '📈' },
]

export function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-green-100 bg-white">
      <div className="flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              active === t.key ? 'text-green-700' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className={active === t.key ? 'font-semibold' : ''}>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
