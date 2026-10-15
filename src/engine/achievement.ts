// 교과별 학업성취(성적분포) 분석 — 참조 achievement.js 이식.
// 기준: 1학년 공통과목. 32개 학교 모두 확보했으며, 학교별 시험 난이도·A 기준 차이를 고려할 참고 지표다.
import { SUBJECTS } from './constants';
import type { AchCore, AchProfile, AchRow, Profile, School, Subject, SubjectFit } from './types';

const hasBatchim = (w: string) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
export const ig = (w: string) => w + (hasBatchim(w) ? '이' : '가');

const G1: Record<Subject, RegExp> = {
  국어: /^(공통국어|국어)\s*\d?$/, 수학: /^(공통수학|수학)\s*\d?$/, 영어: /^(공통영어|영어)\s*\d?$/,
  사회: /^통합사회/, 과학: /^통합과학/,
};
const CORE3: Subject[] = ['국어', '수학', '영어'];

const row = (r: AchRow | undefined): AchCore | null =>
  r && r[2]?.length === 5 ? { name: r[0], avg: r[1], A: r[2][0], B: r[2][1], C: r[2][2], D: r[2][3], E: r[2][4], AB: r[2][0] + r[2][1] } : null;
const pick = (list: AchRow[] | undefined, re: RegExp) => row((list || []).find(r => re.test(r[0]) && r[2]?.length === 5));
const mean = (a: (number | null | undefined)[]) => { const v = a.filter((x): x is number => x != null); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; };
const r1 = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);

function coreOf(sem: Record<string, AchRow[]> | undefined): Partial<Record<Subject, AchCore>> | null {
  if (!sem?.['1']) return null;
  const core: Partial<Record<Subject, AchCore>> = {};
  SUBJECTS.forEach(k => { const x = pick(sem['1'], G1[k]); if (x) core[k] = x; });
  return Object.keys(core).length >= 3 ? core : null;
}

export const semLabel = (key: string) => { const [y, s] = key.split('-'); return `${y}학년도 ${s}학기`; };

// 학교 성적분포 요약. 자료가 없으면 null
export function achProfile(s: School): AchProfile | null {
  const d = s.achData;
  if (!d) return null;
  const keys = Object.keys(d).sort().reverse();
  const key = keys.find(k => coreOf(d[k]));
  if (!key) return null;
  const core = coreOf(d[key])!;
  const [y, sem] = key.split('-').map(Number);
  const prevKey = `${y - 1}-${sem}`;
  const prev = coreOf(d[prevKey]);
  const stabDiff = prev ? mean(CORE3.map(k => (core[k] && prev[k] ? Math.abs(core[k]!.A - prev[k]!.A) : null))) : null;
  return {
    key, label: semLabel(key), core,
    meanA: r1(mean(CORE3.map(k => core[k]?.A))), meanAvg: r1(mean(CORE3.map(k => core[k]?.avg))), meanE: r1(mean(CORE3.map(k => core[k]?.E))),
    prev, prevLabel: prev ? semLabel(prevKey) : null, stabDiff: r1(stabDiff),
  };
}

// 실제 경쟁 강도 (0~1): 국영수 A 비율 60% + 평균 40%
export function compActual(pr: AchProfile): number {
  const c = (x: number) => Math.max(0, Math.min(1, x));
  return c(0.6 * c(((pr.meanA ?? 0) - 5) / 35) + 0.4 * c(((pr.meanAvg ?? 0) - 55) / 25));
}

// 강점·약점 과목 궁합 (0~100, 50 = 중립)
export function subjectFit(pr: AchProfile, p: Profile): SubjectFit {
  let score = 50;
  const notes: SubjectFit['notes'] = [];
  p.strong.forEach(k => {
    const x = pr.core[k]; if (!x) return;
    if (x.A < 10) { score += 12; notes.push({ good: true, k, text: `강점인 ${k}: 1학년 ${x.name} A ${x.A}%로 상위 10%보다 적어, A만 받아도 1등급권에 들기 쉽습니다.` }); }
    else if (x.A <= 20) score += 4;
    else if (x.A > 30) { score -= 6; notes.push({ good: false, k, text: `강점인 ${k}: A ${x.A}%로 최상위권이 두꺼워, 강점 과목이라도 실수 하나로 등급이 갈릴 수 있습니다.` }); }
  });
  p.weak.forEach(k => {
    const x = pr.core[k]; if (!x) return;
    if (x.avg >= 72) { score -= 10; notes.push({ good: false, k, text: `약점인 ${k}: 평균 ${x.avg}점으로 높아 약점이 드러나기 쉽습니다.` }); }
    else if (x.E >= 40) { score += 6; notes.push({ good: true, k, text: `약점인 ${k}: E ${x.E}%로 하위권이 넓어 약점이 있어도 크게 밀리지 않는 편입니다.` }); }
  });
  return { score: Math.max(0, Math.min(100, score)), notes };
}

// 학교 상세·추천 이유에 붙일 문장
export function achSentences(pr: AchProfile): { pros: string[]; cons: string[] } {
  const pros: string[] = [], cons: string[] = [];
  if (pr.meanA != null) {
    if (pr.meanA < 12) pros.push(`${pr.label} 1학년 국영수 A 비율이 평균 ${pr.meanA}%로 상위 10% 안팎이라, 상위권 학생이 1등급을 노리기 좋은 구조입니다.`);
    if (pr.meanA >= 25) cons.push(`${pr.label} 1학년 국영수 A 비율이 평균 ${pr.meanA}%로 상위권이 두꺼워 1등급 경쟁이 치열합니다.`);
  }
  if (pr.meanE != null && pr.meanE >= 40) cons.push(`국영수 E 비율이 평균 ${pr.meanE}%로 하위권이 넓은 편(양극화)입니다.`);
  if (pr.stabDiff != null) {
    if (pr.stabDiff >= 12) cons.push(`작년 같은 학기와 비교해 A 비율이 평균 ${pr.stabDiff}%p 달라, 해마다 출제 영향이 큰 편입니다.`);
    else if (pr.stabDiff <= 5) pros.push(`작년 같은 학기와 A 비율 차이가 평균 ${pr.stabDiff}%p로 작아, 평가 경향이 안정적입니다.`);
  }
  return { pros, cons };
}
