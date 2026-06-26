import type { Profile } from '../types'

// 가족 프로필 프리셋 — 개인 식별정보(실명·실측치·검진수치)는 포함하지 않는다.
// 실제 이름·키·체중·검진기록은 각 사용자가 앱에서 입력 → localStorage(로컬)에만 저장.
// (공개 저장소/Pages 배포 정책: 개인정보 git 커밋 금지)

// 프리셋 A — 회복·근력 중심(골유합 모듈)
export const PROFILE_A: Profile = {
  id: 'a',
  name: '프로필 1',
  sex: 'M',
  heightCm: 170,
  weightKg: 70,
  proteinTargetG: 125,
  sodiumLimitMg: 2000,
  fishPerWeek: 2,
  antiScoreTarget: 65,
  modules: { bone: true },
}

// 프리셋 B — 변비·소화·가족력 예방 중심 + 금음체질 가이드
export const PROFILE_B: Profile = {
  id: 'b',
  name: '프로필 2',
  sex: 'F',
  heightCm: 160,
  weightKg: 58,
  proteinTargetG: 80,
  sodiumLimitMg: 1800,
  fishPerWeek: 2,
  antiScoreTarget: 65,
  fiberTargetG: 25,
  waterTargetCups: 8,
  modules: { constipation: true, digestion: true, familyRisk: true, conditionMemo: true },
  avoidFoods: [],
  constitution: '금음',
}

export const DEFAULT_PROFILES: Profile[] = [PROFILE_A, PROFILE_B]

/** 첫 프로필(기존 단일 사용자 데이터 마이그레이션 대상) */
export const DEFAULT_PROFILE: Profile = PROFILE_A

// 하위호환 alias
export const PROFILE_HAEJUN = PROFILE_A
export const PROFILE_SOYEON = PROFILE_B
