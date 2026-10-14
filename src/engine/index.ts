// 엔진 진입점 — 입력(Profile) → 후보 선정 → 점수 → 정렬된 결과. 브라우저 안에서만 실행되며 네트워크를 쓰지 않는다.
import { buildPool } from './pool';
import { scorePool } from './score';
import type { CompKey, Point, Profile, Result, School } from './types';

export interface Analysis {
  results: Result[];
  origin: Point | null;
  rankOf: Map<string, Partial<Record<CompKey, number>>>;
}

export function analyze(all: School[], p: Profile): Analysis {
  const { pool, origin, dist } = buildPool(all, p);
  const results = scorePool(pool, p, dist);
  // 관점별 순위 (점수 근거 표시용)
  const rankOf = new Map<string, Partial<Record<CompKey, number>>>();
  const keys = [...new Set(results.flatMap(r => Object.keys(r.comps) as CompKey[]))];
  keys.forEach(k => {
    const sorted = results.filter(r => r.comps[k] != null).sort((a, b) => (b.comps[k] ?? 0) - (a.comps[k] ?? 0));
    sorted.forEach((r, i) => { const o = rankOf.get(r.school.id) || {}; o[k] = i + 1; rankOf.set(r.school.id, o); });
  });
  return { results, origin, rankOf };
}

export * from './types';
export * from './constants';
export { explain, scoreBasis, fmt } from './explain';
export { distanceKm } from './pool';
export { assignRoute, zoneOfSgg, ZONE_NAME } from './admission';
export { groupOf, careerAvg } from './score';
export { currentCourses, COURSE_CAVEAT, enrollmentTrend, mathCompetitiveness, mathCurriculum, type MathCourse, type MathTier } from './derive';
export { NAESIN_MAX, NAESIN_PARTS, STANDING_NOTE, estimateStanding, gradeLetter, parseNaesinTotal, standingRange, GRADE_LETTERS } from './standing';
