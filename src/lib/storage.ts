import type { BodyEntry, DayLog, Food, LoggedItem, MealType, Profile } from '../types'
import { EMPTY_HABITS } from '../types'
import { DEFAULT_PROFILE, DEFAULT_PROFILES, PROFILE_HAEJUN } from '../data/profiles'
import { FOODS, FOOD_MAP } from '../data/foods'

// ── 로컬 저장소 (멀티 프로필, 서버 없음 = 개인정보 로컬 전용) ──
// 키 네임스페이스: hdc.p.{pid}.day.{date} / .dayIndex / .customFoods / .reminder

const K_PROFILES = 'hdc.profiles'
const K_ACTIVE = 'hdc.activeProfile'
const K_VERSION = 'hdc.schemaVersion'
const CURRENT_VERSION = 3

/** 프로필 id 네임스페이스 이름 변경 (개인정보 제거: 이름기반 id → 일반 id). 데이터 보존. */
function renameProfileId(oldId: string, newId: string): void {
  const prefix = `hdc.p.${oldId}.`
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(prefix)) keys.push(k)
  }
  for (const k of keys) {
    const nk = `hdc.p.${newId}.` + k.slice(prefix.length)
    const v = localStorage.getItem(k)
    if (v !== null) localStorage.setItem(nk, v)
    localStorage.removeItem(k)
  }
  const profs = readJSON<Profile[]>(K_PROFILES, [])
  let changed = false
  for (const p of profs) if (p.id === oldId) { p.id = newId; changed = true }
  if (changed) localStorage.setItem(K_PROFILES, JSON.stringify(profs))
  if (localStorage.getItem(K_ACTIVE) === oldId) localStorage.setItem(K_ACTIVE, newId)
}
const kDay = (pid: string, date: string) => `hdc.p.${pid}.day.${date}`
const kIndex = (pid: string) => `hdc.p.${pid}.dayIndex`
const kCustom = (pid: string) => `hdc.p.${pid}.customFoods`

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return fallback
}

/** KST 기준 YYYY-MM-DD */
export function todayKST(d: Date = new Date()): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

// ── 초기화 / 기존 단일사용자 데이터 마이그레이션 ────────────────
let _inited = false
function ensureInit(): void {
  if (_inited) return
  _inited = true

  // 이미 초기화됨 → 스키마 업그레이드만 (기본 프로필의 새 필드 보강)
  if (localStorage.getItem(K_PROFILES)) {
    // 이름기반 id → 일반 id (개인정보 제거). 잔여 키 있으면 항상 정리, 데이터 보존.
    renameProfileId('haejun', 'a')
    renameProfileId('soyeon', 'b')
    const v = Number(localStorage.getItem(K_VERSION) || '1')
    if (v < CURRENT_VERSION) {
      const stored = readJSON<Profile[]>(K_PROFILES, DEFAULT_PROFILES)
      const merged = stored.map((s) => {
        const def = DEFAULT_PROFILES.find((d) => d.id === s.id)
        return def ? { ...def, ...s, modules: { ...def.modules, ...s.modules } } : s
      })
      localStorage.setItem(K_PROFILES, JSON.stringify(merged))
      localStorage.setItem(K_VERSION, String(CURRENT_VERSION))
    }
    return
  }

  const profiles: Profile[] = DEFAULT_PROFILES.map((p) => ({ ...p }))
  const hid = PROFILE_HAEJUN.id

  // 기존(단일 사용자) 데이터를 첫 프로필 네임스페이스로 이전
  const oldProfile = localStorage.getItem('hdc.profile')
  if (oldProfile) {
    try {
      const op = JSON.parse(oldProfile)
      profiles[0] = {
        ...PROFILE_HAEJUN,
        heightCm: op.heightCm ?? PROFILE_HAEJUN.heightCm,
        weightKg: op.weightKg ?? PROFILE_HAEJUN.weightKg,
        proteinTargetG: op.proteinTargetG ?? PROFILE_HAEJUN.proteinTargetG,
        sodiumLimitMg: op.sodiumLimitMg ?? PROFILE_HAEJUN.sodiumLimitMg,
        fishPerWeek: op.fishPerWeek ?? PROFILE_HAEJUN.fishPerWeek,
        antiScoreTarget: op.antiScoreTarget ?? PROFILE_HAEJUN.antiScoreTarget,
      }
    } catch {
      /* ignore */
    }
  }
  const oldIndex = localStorage.getItem('hdc.dayIndex')
  if (oldIndex) {
    try {
      const idx: string[] = JSON.parse(oldIndex)
      for (const date of idx) {
        const raw = localStorage.getItem('hdc.day.' + date)
        if (raw) localStorage.setItem(kDay(hid, date), raw)
      }
      localStorage.setItem(kIndex(hid), JSON.stringify(idx))
    } catch {
      /* ignore */
    }
  }
  const oldCustom = localStorage.getItem('hdc.customFoods')
  if (oldCustom) localStorage.setItem(kCustom(hid), oldCustom)
  const oldRem = localStorage.getItem('hdc.reminder')
  if (oldRem) localStorage.setItem(`hdc.p.${hid}.reminder`, oldRem)

  localStorage.setItem(K_PROFILES, JSON.stringify(profiles))
  localStorage.setItem(K_ACTIVE, hid)
  localStorage.setItem(K_VERSION, String(CURRENT_VERSION))
}

// ── 프로필 ───────────────────────────────────────────────────
export function loadProfiles(): Profile[] {
  ensureInit()
  return readJSON<Profile[]>(K_PROFILES, DEFAULT_PROFILES)
}

export function saveProfiles(list: Profile[]): void {
  localStorage.setItem(K_PROFILES, JSON.stringify(list))
}

export function getActiveId(): string {
  ensureInit()
  return localStorage.getItem(K_ACTIVE) || DEFAULT_PROFILE.id
}

export function setActiveProfile(pid: string): void {
  localStorage.setItem(K_ACTIVE, pid)
}

export function loadProfile(): Profile {
  const id = getActiveId()
  return loadProfiles().find((p) => p.id === id) ?? DEFAULT_PROFILE
}

export function saveProfile(p: Profile): void {
  const list = loadProfiles().map((x) => (x.id === p.id ? p : x))
  saveProfiles(list)
}

// ── 일자 기록 (활성 프로필 기준) ──────────────────────────────
export function emptyDay(date: string): DayLog {
  return { date, meals: [], habits: { ...EMPTY_HABITS } }
}

export function loadDay(date: string): DayLog {
  const pid = getActiveId()
  return readJSON<DayLog>(kDay(pid, date), emptyDay(date))
}

export function saveDay(day: DayLog): void {
  const pid = getActiveId()
  localStorage.setItem(kDay(pid, day.date), JSON.stringify(day))
  const idx = loadDayIndex()
  if (!idx.includes(day.date)) {
    idx.push(day.date)
    idx.sort()
    localStorage.setItem(kIndex(pid), JSON.stringify(idx))
  }
}

export function loadDayIndex(): string[] {
  const pid = getActiveId()
  return readJSON<string[]>(kIndex(pid), [])
}

export function loadRecentDays(n: number): DayLog[] {
  return loadDayIndex()
    .slice(-n)
    .map(loadDay)
}

// ── 직접 추가 음식 (활성 프로필 기준) ─────────────────────────
export function loadCustomFoods(): Food[] {
  const pid = getActiveId()
  return readJSON<Food[]>(kCustom(pid), [])
}

export function addCustomFood(food: Food): void {
  const pid = getActiveId()
  const list = loadCustomFoods()
  list.push(food)
  localStorage.setItem(kCustom(pid), JSON.stringify(list))
}

export function deleteCustomFood(id: string): void {
  const pid = getActiveId()
  const list = loadCustomFoods().filter((f) => f.id !== id)
  localStorage.setItem(kCustom(pid), JSON.stringify(list))
}

export function allFoods(): Food[] {
  return [...FOODS, ...loadCustomFoods()]
}

export function resolveFood(id: string): Food | undefined {
  return FOOD_MAP[id] ?? loadCustomFoods().find((f) => f.id === id)
}

// ── 끼니에 음식 추가 (추천 → 원탭 기록) ───────────────────────
export function addItemsToMeal(date: string, meal: MealType, items: LoggedItem[]): void {
  const day = loadDay(date)
  const meals = [...day.meals]
  let m = meals.find((x) => x.meal === meal)
  if (!m) {
    m = { meal, items: [] }
    meals.push(m)
  }
  m.items = [...m.items, ...items]
  saveDay({ ...day, meals })
}

// ── 체중·허리둘레 기록 ───────────────────────────────────────
export function loadBodyEntries(): BodyEntry[] {
  return loadDayIndex()
    .map((date) => {
      const d = loadDay(date)
      return { date, weightKg: d.weightKg, waistCm: d.waistCm }
    })
    .filter((e) => e.weightKg != null || e.waistCm != null)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** 값이 주어진 항목만 갱신 — 빈 입력이 기존값을 지우지 않음 */
export function setBody(date: string, weightKg?: number, waistCm?: number): void {
  const day = loadDay(date)
  if (weightKg !== undefined) day.weightKg = weightKg
  if (waistCm !== undefined) day.waistCm = waistCm
  saveDay(day)
}

/** 활성 프로필의 검진 시드(체중·허리 시작점) */
export function getCheckupSeed(): BodyEntry[] {
  return loadProfile().checkupSeed ?? []
}

export function seedCheckups(): void {
  for (const e of getCheckupSeed()) setBody(e.date, e.weightKg, e.waistCm)
}

// ── 백업 (전체 hdc.* 네임스페이스) ────────────────────────────
export function exportAll(): string {
  ensureInit()
  const store: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('hdc.')) store[k] = localStorage.getItem(k) ?? ''
  }
  return JSON.stringify({ version: 2, store }, null, 2)
}

export function importAll(json: string): { days: number } {
  const parsed = JSON.parse(json)
  if (parsed.store && typeof parsed.store === 'object') {
    // v2: 전체 네임스페이스 복원
    for (const k of Object.keys(parsed.store)) localStorage.setItem(k, parsed.store[k])
  } else if (parsed.days && typeof parsed.days === 'object') {
    // v1 백업: 활성 프로필로 복원
    ensureInit()
    if (parsed.profile) saveProfile({ ...loadProfile(), ...parsed.profile })
    for (const date of Object.keys(parsed.days)) saveDay(parsed.days[date])
  }
  // 복원된 일자 수 집계
  let days = 0
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && /^hdc\.p\..+\.day\./.test(k)) days++
  }
  return { days }
}
