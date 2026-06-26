import type { Profile } from '../types'

// ── 프로필별 영양 보충 추천 ───────────────────────────────────
// 원칙: 음식으로 먼저 → 부족하면 보충 → 혈액검사로 확인.
// 용량은 일반적 가이드(OTC 범위)이며, 의사·검사 후 조정 권장.

export interface Supplement {
  key: string
  name: string
  dose?: string // 일반 가이드
  reason: string // 이 사람에게 필요한 이유
  food: string // 음식으로 채우는 법(우선)
  bloodTest?: string // 확인할 혈액검사 항목
}

export function recommendedSupplements(p: Profile): Supplement[] {
  const out: Supplement[] = []

  // 공통 — 비타민 D
  out.push({
    key: 'vitd',
    name: '비타민 D',
    dose: '1000~2000 IU/일',
    reason: '한국인 대부분 부족 · 실내생활',
    food: '연어·달걀노른자 + 햇볕 15분',
    bloodTest: '25-OH 비타민D',
  })

  // 금음체질 — B12 (고기·유제품·계란 제외)
  if (p.constitution === '금음') {
    out.push({
      key: 'b12',
      name: '비타민 B12',
      dose: '검사 후 보충',
      reason: '금음체질: 고기·유제품·계란 제외 → 생선만으론 부족',
      food: '등푸른생선·조개·김',
      bloodTest: '비타민 B12',
    })
  }

  // 칼슘 — 금음(유제품·콩 제외)/여성(폐경기)/골유합
  if (p.constitution === '금음' || p.sex === 'F' || p.modules.bone) {
    out.push({
      key: 'calcium',
      name: '칼슘 (+비타민D)',
      dose: '식사 부족분 보충',
      reason:
        p.constitution === '금음'
          ? '유제품·콩·견과 제외 + 폐경기 골손실'
          : p.modules.bone
            ? '골유합 회복 지원'
            : '폐경기 골손실 예방',
      food: '멸치·뼈째 먹는 생선·강화두유·잎채소',
    })
  }

  // 철분 — 금음 여성(고기·콩 제외, 혈색소 낮은 편)
  if (p.constitution === '금음' && p.sex === 'F') {
    out.push({
      key: 'iron',
      name: '철분',
      dose: '검사(페리틴) 후',
      reason: '고기·콩 제외 → 부족 위험, 혈색소 낮은 편',
      food: '해산물·잎채소 + 비타민C(흡수↑)',
      bloodTest: '페리틴',
    })
  }

  // 오메가3 — 생선 섭취 부족 보완(골유합·남성)
  if (p.modules.bone || p.sex === 'M') {
    out.push({
      key: 'omega3',
      name: '오메가3 (EPA/DHA)',
      dose: '주2회 생선 못 채우면',
      reason: '등푸른생선 섭취 부족 보완',
      food: '고등어·삼치·연어·들기름',
    })
  }

  // 식이섬유 — 변비(콩·견과·통곡물 제한)
  if (p.modules.constipation) {
    out.push({
      key: 'fiber',
      name: '식이섬유 (차전자피 등)',
      dose: '물과 함께 충분히',
      reason: '콩·견과·통곡물 제한 → 변비 완화',
      food: '자두·키위·해조류·잎채소',
    })
  }

  return out
}
