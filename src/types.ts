// ── 도메인 타입 ──────────────────────────────────────────────
// 항염증 점수(DII 방향) + 사용자 맞춤 제약(위자극·단백질·나트륨)을 담는 모델

export type MealType = '아침' | '점심' | '저녁' | '간식'
export const MEAL_TYPES: MealType[] = ['아침', '점심', '저녁', '간식']

export type FoodCategory =
  | '단백질'
  | '생선'
  | '채소'
  | '과일'
  | '통곡물'
  | '콩류'
  | '견과'
  | '발효식품'
  | '건강지방'
  | '유제품'
  | '정제탄수'
  | '가공육'
  | '가공식품'
  | '단음료'
  | '튀김'
  | '음료'
  | '기타'

export type FoodTag =
  | '오메가3'
  | '고단백'
  | '고나트륨'
  | '정제당'
  | '위자극' // 위염·역류성 식도염 자극 (매운·기름진·카페인·산)
  | '간편'
  | '편의점'
  | '외식'

export interface Food {
  id: string
  name: string
  category: FoodCategory
  /** 항염증 점수: -3(강한 친염증) ~ +3(강한 항염증). DII 방향 기반. */
  anti: number
  /** 1회 제공량당 단백질(g) */
  protein: number
  /** 1회 제공량당 나트륨(mg) */
  sodium: number
  /** 1회 제공량당 식이섬유(g) — 변비 관리용 */
  fiber?: number
  /** 제공량 설명 */
  serving: string
  tags: FoodTag[]
}

export interface LoggedItem {
  foodId: string
  /** 제공량 배수 (1 = 1인분) */
  qty: number
}

export interface MealLog {
  meal: MealType
  items: LoggedItem[]
}

export interface DayLog {
  /** YYYY-MM-DD (KST) */
  date: string
  meals: MealLog[]
  habits: HabitCheck
  weightKg?: number
  waistCm?: number
  note?: string
  /** 수분 섭취(잔) — 변비 관리 */
  waterCups?: number
  /** 배변 있었는지 — 변비 관리 */
  bowel?: boolean
  /** 컨디션·스트레스 메모 */
  conditionNote?: string
}

export interface BodyEntry {
  date: string
  weightKg?: number
  waistCm?: number
}

/** 사용자 핵심 습관 체크 (위·식도·체중·염증 동시 효과) */
export interface HabitCheck {
  noLateNight: boolean // 취침 3시간 전 금식
  proteinEveryMeal: boolean // 매 끼니 단백질
  noProcessed: boolean // 가공식품·단 음료 안 먹음
  noAlcohol: boolean // 금주 (골유합·역류 보호)
}

export const EMPTY_HABITS: HabitCheck = {
  noLateNight: false,
  proteinEveryMeal: false,
  noProcessed: false,
  noAlcohol: true, // 기본값: 거의 안 마심
}

/** 사람별 맞춤 관리 모듈 on/off */
export interface ProfileModules {
  bone?: boolean // 골유합 회복 (프리셋 A)
  constipation?: boolean // 변비 관리: 식이섬유·수분·배변 (프리셋 B)
  digestion?: boolean // 안 맞는 음식 회피 경고 (프리셋 B)
  familyRisk?: boolean // 가족력 예방: 혈당·혈압 (프리셋 B)
  conditionMemo?: boolean // 컨디션·스트레스 메모 (프리셋 B)
}

/** 사용자(가족 구성원) 프로필 — 검진·연구 기반 개인화 */
export interface Profile {
  id: string
  name: string
  sex: 'M' | 'F'
  heightCm: number
  weightKg: number
  proteinTargetG: number // 일일 단백질 목표(g)
  sodiumLimitMg: number // 일일 나트륨 상한(mg)
  fishPerWeek: number // 주당 등푸른생선 목표 횟수
  antiScoreTarget: number // 일일 항염증 점수 목표(0~100)
  fiberTargetG?: number // 일일 식이섬유 목표(g) — 변비 모듈
  waterTargetCups?: number // 일일 수분 목표(잔) — 변비 모듈
  modules: ProfileModules
  avoidFoods?: string[] // 안 맞는 음식(이름) — 소화 모듈 경고
  checkupSeed?: BodyEntry[] // 검진 체중·허리 시작점
  constitution?: '금음' // 8체질 (가이드 표시용, 강제 아님)
}

/** 금음체질 음식 분류 (8체질 섭생표 기반, 가이드용) */
export type GeumeumClass = 'good' | 'avoid' | 'caution'
