// 학생의 학업 위치(상위 %) 추정 — 기본 입력 "내신 총점(200점) + 과목별 성취도"와 보조 입력 "성적대 대충 선택"을 같은 축으로 맞춘다.
// 공식 석차 환산이 아니라 내신 경쟁력·예상 교내 위치에만 쓰는 참고용 추정이다.
import { BANDS } from './constants';
import type { BandId, Standing, Subject, SubjectGrade } from './types';

/** 경기도 고입 내신 200점 구성 — 경기도교육청 「고등학교 입학 내신성적 반영지침」(2026·2027학년도 동일) */
export const NAESIN_PARTS = [
  { key: 'subject', label: '교과활동', max: 150 },
  { key: 'attendance', label: '출결', max: 20 },
  { key: 'volunteer', label: '봉사활동', max: 20 },
  { key: 'school', label: '학교활동', max: 10 },
] as const;
export const NAESIN_MAX = NAESIN_PARTS.reduce((a, p) => a + p.max, 0); // 200

/** 입력 문자열 → 내신 총점 (0~200 밖이거나 숫자가 아니면 null) */
export function parseNaesinTotal(raw: string): number | null {
  const t = raw.trim().replace(',', '.');
  if (!t) return null;
  const v = Number(t);
  return Number.isFinite(v) && v >= 0 && v <= NAESIN_MAX ? v : null;
}

// 총점 → 교과 성취도 평균(A=5 … E=1) 환산.
// 지침 산식: 일반교과 120점 = 학기별 [기본점수 + 성취도 평균 × k + 원점수 평균 × k/50] (세 부분이 1/3씩),
//           체육·예술 30점 = 10 + 20 × (A·B·C 가중 합 / (과목 수 × 3)).
// 가정: 비교과(출결·봉사·학교활동) 만점 50점, 원점수는 성취도 구간의 가운데(A 95 · B 85 · C 75 · D 65 · E 55),
//       체육·예술도 같은 수준(A~E 평균 a → A·B·C (a+1)/2).
// → 총점 ≈ 364/3 + 46/3 × a  (a = 5 이면 약 198점, a = 3 이면 약 167점)
const TOTAL_BASE = 364 / 3;
const TOTAL_PER_LEVEL = 46 / 3;
export const achievementFromTotal = (total: number) => Math.max(1, Math.min(5, (total - TOTAL_BASE) / TOTAL_PER_LEVEL));

/** A~E 평균(1=A … 5=E) → 상위 % : 성적대 대표값(상위 4·11·28·55·82%) 사이 선형 보간 */
export function topFromGradeMean(gradeMean: number): number {
  const g = Math.max(1, Math.min(5, gradeMean));
  const lower = Math.floor(g) - 1;
  const upper = Math.min(4, lower + 1);
  return BANDS[lower].top + (BANDS[upper].top - BANDS[lower].top) * (g - Math.floor(g));
}

/** 추정 상위 % 가 속한 성적대 (성적대 설명의 경계 5·15·40·70%) */
export const bandOfTop = (top: number): BandId => (top < 5 ? 1 : top < 15 ? 2 : top < 40 ? 3 : top < 70 ? 4 : 5);

/** 총점과 과목별 성취도 중 입력된 것만 같은 비중으로 평균한다. 둘 다 없으면 null */
export function estimateStanding(total: number | null, grades: Partial<Record<Subject, SubjectGrade>>): Standing | null {
  const picked = Object.values(grades).filter((g): g is SubjectGrade => g != null);
  const fromSubjects = picked.length ? 6 - picked.reduce((a, b) => a + b, 0) / picked.length : null;
  const fromTotal = total == null ? null : achievementFromTotal(total);
  const parts = [fromTotal, fromSubjects].filter((x): x is number => x != null);
  if (!parts.length) return null;
  const level = parts.reduce((a, b) => a + b, 0) / parts.length;
  const top = topFromGradeMean(6 - level);
  return { top, band: bandOfTop(top), level, fromTotal, fromSubjects, subjectCount: picked.length };
}

export const GRADE_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
export const gradeLetter = (g: SubjectGrade) => GRADE_LETTERS[g - 1];
