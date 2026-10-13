// 공시 데이터에서 만드는 파생 지표 — 개설 과목 정제 (참조 derive.js 이식)
import type { MathCompetitiveness, School } from './types';

// NEIS 시간표 과목명에는 분반 표기(기하a1, 물리학ⅡB, 정보(2), 3반)와 시험·행사 항목(기말고사)이 섞여 있다.
const NON_COURSE = /(중간고사|기말고사|고사$|시험|자율활동|자치활동|동아리|봉사|진로활동|창체|창의적\s*체험|스포츠클럽|방과\s*후|자습)/;
const SUFFIXES = [/\s*_.+$/, /(?<=[가-힣ⅠⅡⅢ)])\s*\d?[A-Za-z]{1,2}\d{0,2}$/, /\s*\(\d{1,2}\)$/, /\s*\d{1,2}반$/, /\s*-[A-Za-z0-9]+$/];

export function normalizeCourse(raw: string): string | null {
  let s = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!s || NON_COURSE.test(s)) return null;
  for (let prev: string | null = null; prev !== s; ) {
    prev = s;
    for (const re of SUFFIXES) s = s.replace(re, '').trim();
  }
  return s || null;
}

export function cleanCourses(subjects: Record<string, string[]> | null): Record<string, string[]> | null {
  if (!subjects) return null;
  const out: Record<string, string[]> = {};
  for (const [g, list] of Object.entries(subjects)) out[g] = [...new Set(list.map(normalizeCourse).filter((x): x is string => !!x))];
  return out;
}

// 2027 입학생에게 맞는 근거는 2022 개정 교육과정을 따르는 1·2학년 과목 (3학년은 2015 개정이라 참고만)
export function currentCourses(subjects: Record<string, string[]> | null): string[] | null {
  const c = cleanCourses(subjects);
  if (!c) return null;
  const now = [...new Set([...(c['1'] || []), ...(c['2'] || [])])];
  return c['2']?.length ? now : [...new Set(Object.values(c).flat())];
}

export const COURSE_CAVEAT = '2026학년도 시간표 기준이며, 내년·후년에도 같은 과목이 개설된다는 보장은 없습니다. 학교 교육과정 편성표로 확인하세요.';

// 동등한 8개 과목군 중 1·2학년 시간표에서 확인된 군의 비율.
// 학교의 실제 수학 성적·수업 질이나 학생의 선행 수준을 뜻하지 않으며 총점에는 넣지 않는다.
export function mathCompetitiveness(s: School): MathCompetitiveness {
  const courses = currentCourses(s.subjects);
  const families = [
    { label: '미적분', prefixes: ['미적분'] },
    { label: '기하', prefixes: ['기하'] },
    { label: '확률과 통계', prefixes: ['확률과통계'] },
    { label: '고급·심화 수학', prefixes: ['고급수학', '심화수학'] },
    { label: '고급 대수', prefixes: ['고급대수'] },
    { label: '인공지능 수학', prefixes: ['인공지능수학'] },
    { label: '수학과제 탐구', prefixes: ['수학과제탐구'] },
    { label: '경제 수학', prefixes: ['경제수학'] },
  ];
  const offered: string[] = [], unconfirmed: string[] = [];
  for (const family of families) {
    const found = courses?.some(c => family.prefixes.some(prefix => c.replace(/\s+/g, '').startsWith(prefix)));
    (found ? offered : unconfirmed).push(family.label);
  }
  return { score: courses?.length ? Math.round(100 * offered.length / families.length) : null, offered, unconfirmed };
}

// 학년별 학생 수 → 신입생 추세 (1학년 vs 3학년, ±5%)
export function enrollmentTrend(stu: number[] | null): string | null {
  const [g1, , g3] = stu || [];
  if (!g1 || !g3) return null;
  const r = (g1 - g3) / g3;
  return r >= 0.05 ? '신입생 증가' : r <= -0.05 ? '신입생 감소' : '유지';
}
