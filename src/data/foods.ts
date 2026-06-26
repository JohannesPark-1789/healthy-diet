import type { Food } from '../types'

// ── 한식 중심 음식 DB ────────────────────────────────────────
// anti: 항염증 점수 -3(친염증) ~ +3(항염증), DII(식이염증지수) 방향 기반
// protein(g) / sodium(mg) / fiber(g) 은 1회 제공량 기준 근사값

export const FOODS: Food[] = [
  // ── 등푸른생선·오메가3 ──
  { id: 'mackerel', name: '고등어구이', category: '생선', anti: 3, protein: 24, sodium: 480, fiber: 0, serving: '1토막(~100g)', tags: ['오메가3', '고단백'] },
  { id: 'samchi', name: '삼치구이', category: '생선', anti: 3, protein: 22, sodium: 350, fiber: 0, serving: '1토막(~100g)', tags: ['오메가3', '고단백'] },
  { id: 'kkongchi', name: '꽁치구이', category: '생선', anti: 3, protein: 21, sodium: 400, fiber: 0, serving: '1마리', tags: ['오메가3', '고단백'] },
  { id: 'salmon', name: '연어', category: '생선', anti: 3, protein: 23, sodium: 90, fiber: 0, serving: '1토막(~100g)', tags: ['오메가3', '고단백'] },
  { id: 'tuna-can', name: '참치캔(라이트)', category: '생선', anti: 1, protein: 18, sodium: 320, fiber: 0, serving: '1캔(85g)', tags: ['오메가3', '고단백', '간편', '편의점'] },
  { id: 'perilla-oil', name: '들기름', category: '건강지방', anti: 3, protein: 0, sodium: 0, fiber: 0, serving: '1큰술', tags: ['오메가3'] },

  // ── 단백질 ──
  { id: 'egg', name: '계란(삶은/반숙)', category: '단백질', anti: 1, protein: 6, sodium: 65, fiber: 0, serving: '1개', tags: ['고단백', '간편', '편의점'] },
  { id: 'chicken-breast', name: '닭가슴살', category: '단백질', anti: 1, protein: 23, sodium: 300, fiber: 0, serving: '1조각(100g)', tags: ['고단백', '간편', '편의점'] },
  { id: 'chicken-thigh', name: '닭다리살(구이)', category: '단백질', anti: 0, protein: 19, sodium: 280, fiber: 0, serving: '100g', tags: ['고단백'] },
  { id: 'lean-pork', name: '돼지 살코기(수육)', category: '단백질', anti: 0, protein: 22, sodium: 250, fiber: 0, serving: '100g', tags: ['고단백'] },
  { id: 'lean-beef', name: '소 살코기', category: '단백질', anti: 0, protein: 22, sodium: 60, fiber: 0, serving: '100g', tags: ['고단백'] },
  { id: 'tofu', name: '두부', category: '콩류', anti: 2, protein: 9, sodium: 10, fiber: 1, serving: '1/4모(80g)', tags: ['고단백', '간편'] },
  { id: 'soymilk', name: '두유(무가당)', category: '콩류', anti: 2, protein: 7, sodium: 60, fiber: 1, serving: '1팩(190ml)', tags: ['간편', '편의점'] },
  { id: 'greek-yogurt', name: '그릭요거트(무가당)', category: '유제품', anti: 1, protein: 10, sodium: 50, fiber: 0, serving: '1컵(100g)', tags: ['고단백', '간편', '편의점'] },
  { id: 'milk', name: '우유(저지방)', category: '유제품', anti: 0, protein: 6, sodium: 100, fiber: 0, serving: '1컵(200ml)', tags: ['간편'] },
  { id: 'beans', name: '콩자반/검은콩', category: '콩류', anti: 2, protein: 7, sodium: 200, fiber: 4, serving: '2큰술', tags: ['고단백'] },

  // ── 채소·발효 ──
  { id: 'spinach', name: '시금치나물', category: '채소', anti: 3, protein: 3, sodium: 220, fiber: 3, serving: '1접시', tags: [] },
  { id: 'broccoli', name: '브로콜리(데침)', category: '채소', anti: 3, protein: 3, sodium: 30, fiber: 4, serving: '1접시', tags: [] },
  { id: 'cabbage', name: '양배추찜', category: '채소', anti: 2, protein: 2, sodium: 15, fiber: 3, serving: '1접시', tags: [] },
  { id: 'kale-greens', name: '쌈채소(상추·깻잎)', category: '채소', anti: 2, protein: 1, sodium: 10, fiber: 1, serving: '여러 장', tags: [] },
  { id: 'mushroom', name: '버섯볶음', category: '채소', anti: 1, protein: 3, sodium: 200, fiber: 2, serving: '1접시', tags: [] },
  { id: 'seaweed', name: '미역국', category: '채소', anti: 1, protein: 2, sodium: 600, fiber: 3, serving: '1대접', tags: ['고나트륨'] },
  { id: 'gim', name: '김(구운)', category: '채소', anti: 1, protein: 1, sodium: 80, fiber: 1, serving: '1봉', tags: ['편의점'] },
  { id: 'kimchi', name: '김치', category: '발효식품', anti: 1, protein: 1, sodium: 450, fiber: 2, serving: '5조각', tags: ['고나트륨'] },
  { id: 'doenjang-jjigae', name: '된장찌개', category: '발효식품', anti: 1, protein: 8, sodium: 900, fiber: 3, serving: '1뚝배기', tags: ['고나트륨'] },
  { id: 'tomato', name: '토마토', category: '채소', anti: 2, protein: 1, sodium: 5, fiber: 2, serving: '1개', tags: ['간편'] },
  { id: 'garlic', name: '마늘', category: '채소', anti: 2, protein: 0, sodium: 2, fiber: 0, serving: '2~3쪽', tags: [] },

  // ── 과일·견과 (변비 완화 포함) ──
  { id: 'prune', name: '말린 자두(푸룬)', category: '과일', anti: 2, protein: 1, sodium: 2, fiber: 6, serving: '5~6알', tags: ['간편'] },
  { id: 'kiwi', name: '키위', category: '과일', anti: 2, protein: 1, sodium: 3, fiber: 3, serving: '1개', tags: ['간편'] },
  { id: 'blueberry', name: '블루베리', category: '과일', anti: 3, protein: 1, sodium: 1, fiber: 3, serving: '1줌(80g)', tags: ['간편'] },
  { id: 'banana', name: '바나나', category: '과일', anti: 1, protein: 1, sodium: 1, fiber: 3, serving: '1개', tags: ['간편', '편의점'] },
  { id: 'apple', name: '사과', category: '과일', anti: 1, protein: 0, sodium: 1, fiber: 4, serving: '1개', tags: ['간편'] },
  { id: 'nuts', name: '견과 한 줌(아몬드·호두)', category: '견과', anti: 2, protein: 5, sodium: 5, fiber: 3, serving: '1줌(25g)', tags: ['오메가3', '간편', '편의점'] },
  { id: 'avocado', name: '아보카도', category: '건강지방', anti: 2, protein: 2, sodium: 7, fiber: 5, serving: '1/2개', tags: [] },
  { id: 'olive-oil', name: '올리브유', category: '건강지방', anti: 2, protein: 0, sodium: 0, fiber: 0, serving: '1큰술', tags: [] },

  // ── 통곡물 vs 정제탄수 ──
  { id: 'brown-rice', name: '현미·잡곡밥', category: '통곡물', anti: 1, protein: 5, sodium: 5, fiber: 3, serving: '1공기(210g)', tags: [] },
  { id: 'oats', name: '오트밀', category: '통곡물', anti: 2, protein: 6, sodium: 5, fiber: 4, serving: '1그릇(40g)', tags: ['간편'] },
  { id: 'sweet-potato', name: '고구마', category: '통곡물', anti: 1, protein: 2, sodium: 15, fiber: 4, serving: '1개(150g)', tags: ['간편', '편의점'] },
  { id: 'white-rice', name: '흰쌀밥', category: '정제탄수', anti: 0, protein: 4, sodium: 3, fiber: 1, serving: '1공기(210g)', tags: [] },
  { id: 'white-bread', name: '흰빵·식빵', category: '정제탄수', anti: -1, protein: 4, sodium: 230, fiber: 1, serving: '2쪽', tags: ['정제당'] },

  // ── 외식·면류 ──
  { id: 'baekban', name: '백반·생선구이정식', category: '기타', anti: 1, protein: 25, sodium: 1600, fiber: 3, serving: '1상', tags: ['외식', '고나트륨', '고단백'] },
  { id: 'bibimbap', name: '비빔밥', category: '기타', anti: 1, protein: 14, sodium: 900, fiber: 4, serving: '1그릇', tags: ['외식'] },
  { id: 'kimbap', name: '김밥', category: '기타', anti: 0, protein: 8, sodium: 700, fiber: 2, serving: '1줄', tags: ['외식', '편의점', '고나트륨'] },
  { id: 'noodle-soup', name: '국수·잔치국수', category: '정제탄수', anti: -1, protein: 9, sodium: 1500, fiber: 2, serving: '1그릇', tags: ['외식', '고나트륨'] },
  { id: 'jjajang', name: '짜장면', category: '정제탄수', anti: -1, protein: 14, sodium: 1300, fiber: 3, serving: '1그릇', tags: ['외식', '고나트륨'] },

  // ── 친염증·위자극 (줄일 것) ──
  { id: 'ramen', name: '라면', category: '가공식품', anti: -2, protein: 9, sodium: 1800, fiber: 2, serving: '1봉', tags: ['고나트륨', '위자극', '정제당'] },
  { id: 'sausage', name: '소시지·햄', category: '가공육', anti: -3, protein: 11, sodium: 900, fiber: 0, serving: '100g', tags: ['고나트륨'] },
  { id: 'bacon', name: '베이컨', category: '가공육', anti: -3, protein: 12, sodium: 800, fiber: 0, serving: '3줄', tags: ['고나트륨'] },
  { id: 'fried-chicken', name: '치킨(튀김)', category: '튀김', anti: -2, protein: 20, sodium: 900, fiber: 1, serving: '3조각', tags: ['외식', '위자극', '고나트륨'] },
  { id: 'burger', name: '햄버거', category: '가공식품', anti: -2, protein: 16, sodium: 1000, fiber: 2, serving: '1개', tags: ['외식', '고나트륨'] },
  { id: 'fries', name: '감자튀김', category: '튀김', anti: -2, protein: 3, sodium: 350, fiber: 3, serving: '1봉', tags: ['위자극'] },
  { id: 'spicy-stew', name: '매운 찌개·부대찌개', category: '가공식품', anti: -2, protein: 14, sodium: 1700, fiber: 3, serving: '1인분', tags: ['위자극', '고나트륨'] },
  { id: 'soda', name: '탄산음료', category: '단음료', anti: -3, protein: 0, sodium: 15, fiber: 0, serving: '1캔(250ml)', tags: ['정제당', '위자극'] },
  { id: 'mix-coffee', name: '믹스커피', category: '단음료', anti: -2, protein: 1, sodium: 30, fiber: 0, serving: '1봉', tags: ['정제당', '위자극'] },
  { id: 'snack-sweet', name: '과자·단 디저트', category: '단음료', anti: -2, protein: 2, sodium: 150, fiber: 1, serving: '1봉', tags: ['정제당'] },
  { id: 'cake-donut', name: '케이크·도넛', category: '단음료', anti: -3, protein: 4, sodium: 250, fiber: 1, serving: '1조각', tags: ['정제당'] },
  { id: 'alcohol', name: '술(소주·맥주)', category: '음료', anti: -3, protein: 0, sodium: 10, fiber: 0, serving: '1잔', tags: ['위자극'] },
  { id: 'coffee-black', name: '블랙커피', category: '음료', anti: 0, protein: 0, sodium: 5, fiber: 0, serving: '1잔', tags: ['위자극'] },
  { id: 'water', name: '물', category: '음료', anti: 0, protein: 0, sodium: 0, fiber: 0, serving: '1컵', tags: [] },
]

export const FOOD_MAP: Record<string, Food> = Object.fromEntries(
  FOODS.map((f) => [f.id, f]),
)

export function getFood(id: string): Food | undefined {
  return FOOD_MAP[id]
}
