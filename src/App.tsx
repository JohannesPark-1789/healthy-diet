import { useState } from 'react'
import { TabBar, type TabKey } from './components/TabBar'
import { TodayScreen } from './screens/TodayScreen'
import { RecommendScreen } from './screens/RecommendScreen'
import { ShopScreen } from './screens/ShopScreen'
import { TrendsScreen } from './screens/TrendsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { useReminders } from './lib/reminders'
import { getActiveId, loadProfiles, setActiveProfile } from './lib/storage'

function initials(name: string) {
  return name.length >= 2 ? name.slice(-2) : name
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('today')
  const [showProfile, setShowProfile] = useState(false)
  const [active, setActive] = useState(getActiveId)
  const profiles = loadProfiles()
  useReminders()

  function switchTo(pid: string) {
    setActiveProfile(pid)
    setActive(pid)
    setTab('today')
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-[#f8faf8]">
      <header className="safe-top sticky top-0 z-10 border-b border-green-100 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 pt-3">
          <h1 className="text-base font-bold text-green-700">🌿 항염증 식단 코치</h1>
          <button
            onClick={() => setShowProfile(true)}
            className="rounded-full p-1.5 text-lg text-gray-400 active:bg-gray-100"
            aria-label="설정"
          >
            ⚙️
          </button>
        </div>
        {/* 프로필 전환기 */}
        <div className="flex gap-2 px-4 pb-2 pt-2">
          {profiles.map((p) => {
            const on = p.id === active
            return (
              <button
                key={p.id}
                onClick={() => switchTo(p.id)}
                className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm ${
                  on
                    ? 'border-2 border-green-500 bg-green-50 font-semibold text-green-700'
                    : 'border border-gray-200 text-gray-500'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                    p.sex === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {initials(p.name)}
                </span>
                {p.name}
              </button>
            )
          })}
        </div>
      </header>

      {/* active를 key로 → 프로필 전환 시 화면이 그 사람 데이터로 재로드 */}
      <main key={active} className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'today' && <TodayScreen />}
        {tab === 'recommend' && <RecommendScreen />}
        {tab === 'shop' && <ShopScreen />}
        {tab === 'trends' && <TrendsScreen />}
      </main>

      <TabBar active={tab} onChange={setTab} />

      {showProfile && (
        <ProfileScreen
          onClose={() => {
            setShowProfile(false)
            setActive(getActiveId())
          }}
        />
      )}
    </div>
  )
}
