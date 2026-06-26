import { useEffect } from 'react'
import { getActiveId, todayKST } from './storage'

// ── 리마인더 (브라우저 알림, 프로필별) ───────────────────────
// 주의: 웹 PWA의 백그라운드 푸시는 서버가 필요합니다.
// 여기서는 '앱이 열려 있는 동안' 동작하는 포그라운드 알림으로 구현
// (야식 금지·기록 확인을 잊지 않게 하는 가벼운 넛지).

const K_REMINDER = () => `hdc.p.${getActiveId()}.reminder`
const K_FIRED = () => `hdc.p.${getActiveId()}.reminderFired`

export interface ReminderSettings {
  enabled: boolean
  time: string // "HH:MM" (KST)
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, time: '21:00' }

export function loadReminder(): ReminderSettings {
  try {
    const raw = localStorage.getItem(K_REMINDER())
    if (raw) return { ...DEFAULT_REMINDER, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_REMINDER
}

export function saveReminder(r: ReminderSettings): void {
  localStorage.setItem(K_REMINDER(), JSON.stringify(r))
}

export async function requestNotifyPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const res = await Notification.requestPermission()
  return res === 'granted'
}

function nowHHMM(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(11, 16)
}

/** 앱이 열려 있는 동안 리마인더 시간을 체크해 하루 한 번 알림 */
export function useReminders(): void {
  useEffect(() => {
    const tick = () => {
      const r = loadReminder()
      if (!r.enabled) return
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const today = todayKST()
      if (localStorage.getItem(K_FIRED()) === today) return
      if (nowHHMM() >= r.time) {
        new Notification('🌿 항염증 식단 코치', {
          body: '취침 3시간 전 금식! 오늘 먹은 것 기록했는지 확인해요.',
          icon: '/icons/icon-192.png',
        })
        localStorage.setItem(K_FIRED(), today)
      }
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
}
