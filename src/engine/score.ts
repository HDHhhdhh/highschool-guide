// 점수 — 참조 scorePool 이식. 모든 점수는 "같은 후보군 안에서의 상대 비교"이며 절대적인 학력 서열이 아니다.
import { achProfile, compActual, subjectFit } from './achievement';
import { assignRoute } from './admission';
import { BANDS, CITY, SELECT_PROFILE, STRATEGIES, TRACKS, selectedTracks, type Track } from './constants';
import { currentCourses, mathCompetitiveness } from './derive';
import type { AchProfile, CompKey, Group, Metrics, Persona, Profile, Result, School, TrackPart } from './types';

export function groupOf(s: School): Group {
  if (s.kind === '특성화고') return 'vocational';
  if (s.kind === '예술고') return 'arts';
  if (SELECT_PROFILE[s.kind]) return 'selective';
  return 'general';
}

export function careerAvg(s: School) {
  const ys = Object.values(s.career || {});
  if (!ys.length) return null;
  const avg = (k: 'univ' | 'college' | 'etc' | 'job' | 'abroad') => ys.reduce((a, y) => a + (y[k] || 0), 0) / ys.length;
  return { univ: avg('univ'), college: avg('college'), etc: avg('etc'), job: avg('job'), abroad: avg('abroad'), years: ys.length };
}

export function metrics(s: School): Metrics {
  const c = careerAvg(s);
  const g1 = s.stu?.[0], g3 = s.stu?.[2];
  return {
    univ: c?.univ ?? null,
    etc: c?.etc ?? null,
    // 대학 지향도 = 4년제 진학 + 재도전(기타). 4년제 진학률만 보면 재수생이 많은 상위권 학교가 오히려 낮게 나온다
    aim: c ? c.univ + c.etc : null,
    college: c?.college ?? null,
    seats1: g1 ? Math.round(g1 * 0.1) : null,
    netIn: s.total && s.mvin != null && s.mvout != null ? ((s.mvin - s.mvout) / s.total) * 100 : null,
    trend: g1 && g3 ? g1 / g3 : null,
    perClass: s.perClass,
    perTeacher: s.perTeacher,
    clubs: s.clubs,
    tempRatio: s.tempRatio,
    dropout: s.dropoutRate ?? null,
  };
}

// 값 배열에서의 백분위 (0~1). 값이 없으면 중간값 0.5
function pctFn(values: (number | null)[]) {
  const v = values.filter((x): x is number => x != null && !Number.isNaN(x)).sort((a, b) => a - b);
  return (x: number | null) => {
    if (x == null || !v.length) return 0.5;
    let lo = 0;
    while (lo < v.length && v[lo] < x) lo++;
    let hi = lo;
    while (hi < v.length && v[hi] === x) hi++;
    if (v.length === 1) return 0.5;
    return Math.max(0, Math.min(1, (lo + hi - 1) / 2 / (v.length - 1)));
  };
}

const toGrade = (r: number) => (r <= 10 ? 1 : r <= 34 ? 2 : r <= 66 ? 3 : r <= 90 ? 4 : 5);
const clamp = (x: number) => Math.max(0, Math.min(100, x));
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

export type Pct = Record<'univ' | 'etc' | 'aim' | 'netIn' | 'trend' | 'perClass' | 'perTeacher' | 'clubs' | 'tempRatio' | 'seats1' | 'dropout', (x: number | null) => number>;

export function scorePool(pool: School[], p: Profile, dist: Map<string, number | null>): Result[] {
  const M = new Map(pool.map(s => [s.id, metrics(s)] as const));
  // 백분위 기준은 일반 그룹끼리만 (특성화·선발형이 일반고 비교를 흐리지 않게)
  const general = pool.filter(s => groupOf(s) === 'general');
  const comparable = general.length >= 2 ? general : pool;
  const col = (k: keyof Metrics) => comparable.map(s => M.get(s.id)![k]);
  const pct: Pct = {
    univ: pctFn(col('univ')), etc: pctFn(col('etc')), aim: pctFn(col('aim')), netIn: pctFn(col('netIn')), trend: pctFn(col('trend')),
    perClass: pctFn(col('perClass')), perTeacher: pctFn(col('perTeacher')), clubs: pctFn(col('clubs')),
    tempRatio: pctFn(col('tempRatio')), seats1: pctFn(col('seats1')), dropout: pctFn(col('dropout')),
  };
  const band = BANDS.find(b => b.id === p.band) || BANDS[2];
  // 내신 점수(총점·과목별 성취도)를 입력했으면 그 추정 위치(standing.ts), 성적대만 골랐으면 성적대 대표값.
  // 공식 석차 환산이 아니라 내신 경쟁력에만 쓰는 참고용 추정이다.
  const studentTop = p.standing ? p.standing.top : band.top;
  const tracks = selectedTracks(p.tracks);
  const w: Partial<Record<CompKey, number>> = { ...(STRATEGIES[p.strategy] || STRATEGIES.mix).w };
  w.commute! *= { low: 0.3, mid: 0.5, high: 2.0 }[p.commute || 'mid'];
  // 희망 계열을 정하지 않았으면 과목 연계를 판단할 근거가 없으므로 비중을 낮춘다
  if (!tracks.length) w.track! *= 0.35;
  // 강점·약점 과목을 고르면 성적분포와의 궁합을 반영 (자료 없는 학교는 중립 50점)
  const useSubj = p.strong.length + p.weak.length > 0;
  if (useSubj) w.subjFit = 0.12;
  if (band.id >= 4) { w.peer! *= 0.6; w.env! *= 1.3; w.adv! *= 1.2; }
  const wSum = Object.values(w).reduce((a, b) => a + (b || 0), 0);
  (Object.keys(w) as CompKey[]).forEach(k => (w[k] = (w[k] || 0) / wSum));

  return pool
    .map((s): Result => {
      const m = M.get(s.id)!;
      const group = groupOf(s);
      const selective = group === 'selective';
      const sp = selective ? SELECT_PROFILE[s.kind]! : null;
      const ach = achProfile(s);
      const d = dist.get(s.id) ?? null;

      // 경쟁 강도(면학 분위기)와 예상 교내 위치(상위 %)를 그룹별로
      let comp: number, rankTop: number | null;
      if (group === 'general') {
        // 성적분포가 있으면 실제 1학년 국영수 A 비율·평균, 없으면 대학 지향도·재도전 비율·순전입·학생 수 추이(+학업중단율은 작은 보조 신호)로 추정
        comp = ach ? compActual(ach)
          : m.dropout != null ? 0.5 * pct.aim(m.aim) + 0.14 * pct.etc(m.etc) + 0.16 * pct.netIn(m.netIn) + 0.1 * pct.trend(m.trend) + 0.1 * (1 - pct.dropout(m.dropout))
          : 0.55 * pct.aim(m.aim) + 0.15 * pct.etc(m.etc) + 0.18 * pct.netIn(m.netIn) + 0.12 * pct.trend(m.trend);
        rankTop = Math.min(99, studentTop * (0.55 + 0.9 * comp));
      } else if (selective && sp) {
        // 입학생이 상위 intake%라면, 상위 p% 학생의 교내 위치 ≈ p / intake (p는 성적대의 가운데 값)
        comp = sp.peer;
        rankTop = Math.max(1, Math.min(99, 100 * (p.standing ? studentTop : (band.best + band.top) / 2) / sp.intake));
      } else if (group === 'arts') {
        comp = 0.5;
        rankTop = null; // 실기 중심이라 내신 위치를 추정하지 않음
      } else {
        comp = 0.25; // 직업교육 중심: 일반 교과 경쟁은 약한 편
        rankTop = Math.min(99, studentTop * 0.45);
      }
      const grade = rankTop == null ? null : toGrade(rankTop);
      const gradeLo = rankTop == null ? null : toGrade(rankTop * 0.7);
      const gradeHi = rankTop == null ? null : toGrade(Math.min(99, rankTop * 1.35));

      const naesin = rankTop == null ? 50 : clamp(100 * Math.exp(-rankTop / 35) + Math.min(8, (m.seats1 || 0) / 4));
      const peer = 100 * Math.max(0, Math.min(1, comp));
      // 4년제 진학: 직업계는 취업 중심이라 중립, 그 밖은 실제 진학률을 일반고 분포에 비춰 본다
      const adv = group === 'vocational' ? 50 : m.univ != null ? 100 * (0.4 * pct.univ(m.univ) + 0.6 * pct.aim(m.aim)) : 50;
      const trackScore = trackFit(s, tracks);
      // 통학을 중요하게 고르지 않았으면 거리에 따른 감소를 완만하게
      const commute = d == null ? 50 : 100 * Math.exp(-d / (p.commute === 'high' ? 3.5 : 6));
      // 교육 여건: 학급당·교원 1인당 학생 수, 동아리, 기간제 비율 + 학업중단율(있으면 15% 비중의 보조 신호)
      const envCore = avg([1 - pct.perClass(m.perClass), 1 - pct.perTeacher(m.perTeacher), pct.clubs(m.clubs), 1 - pct.tempRatio(m.tempRatio)]);
      const env = 100 * (m.dropout != null ? 0.85 * envCore + 0.15 * (1 - pct.dropout(m.dropout)) : envCore);

      const comps: Partial<Record<CompKey, number>> = { naesin, peer, adv, track: trackScore.score, commute, env };
      const fit = ach && useSubj ? subjectFit(ach, p) : null;
      if (useSubj) comps.subjFit = fit ? fit.score : 50;
      let total = (Object.entries(comps) as [CompKey, number][]).reduce((a, [k, v]) => a + (w[k] || 0) * v, 0);
      // 선발형: 학생 성적대로 입학이 어려우면 적합도를 낮춘다
      const admit: Result['admit'] = !selective || !sp ? 'ok' : band.best >= sp.intake ? 'hard' : band.top > sp.intake ? 'tough' : 'ok';
      // 배정 경로: 거주 학군 밖 평준화 일반고는 2027 배정으로 갈 수 없으므로 크게 낮춘다
      const assign = assignRoute(s, p);
      const mult = (admit === 'hard' ? 0.7 : admit === 'tough' ? 0.9 : 1) * (assign.assignable ? 1 : 0.75);
      total *= mult;
      return {
        school: s, math: mathCompetitiveness(s), m, comps, total: Math.round(total), comp, rankTop, grade, gradeLo, gradeHi,
        selective, group, intake: sp?.intake ?? null, admit, trackHits: trackScore.hits, trackMissing: trackScore.missing, trackParts: trackScore.parts,
        persona: persona(s, m, comp, pct, group, ach, sp),
        ach: group === 'vocational' ? null : ach, fit,
        dist: d, weights: w, mult, assign,
        flags: { career: m.univ != null, achievement: !!ach, courses: !!s.subjects, otherCity: s.city !== CITY },
      };
    })
    .sort((a, b) => b.total - a.total);
}

// 희망 계열 적합. 계열을 여러 개 고르면 계열마다 핵심 과목 개설 비율을 구해 같은 비중으로 평균한다
// (공학+의약을 고르면 두 계열을 똑같이 본다 — 과목 목록이 긴 계열이 결과를 좌우하지 않게).
// 중점 지정·학교 유형 가감은 고른 계열 중 하나라도 맞으면 적용. 아무것도 고르지 않으면 예전 '아직 모름'과 같다.
export function trackFit(s: School, tracks: Track[]): { score: number; hits: string[]; missing: string[]; parts: TrackPart[] } {
  let score = 50;
  // 여러 계열에 겹치는 과목(미적분 등)은 목록에 한 번만
  const hits = new Set<string>(), missing = new Set<string>();
  const parts: TrackPart[] = [];
  // 2027 입학생 기준: 2022 개정 교육과정인 1·2학년 시간표 과목만 본다
  const courses = currentCourses(s.subjects);
  if (courses) {
    const all = courses.join(' ');
    tracks.filter(t => t.kw.length).forEach(t => {
      let hit = 0;
      t.kw.forEach(k => {
        const alts = k.split('|');
        const found = alts.find(x => all.includes(x));
        if (found) { hits.add(found); hit++; } else missing.add(alts[0]);
      });
      parts.push({ label: t.label, hit, total: t.kw.length });
    });
    // 과목 연계 차이가 점수 차이로 분명히 드러나도록 폭을 넓게 (0개 15점 ~ 전부 95점)
    if (parts.length) score = 15 + 80 * avg(parts.map(x => x.hit / x.total));
  }
  if (s.subjRoom) score += 6;
  if (s.levelClass) score += 3;
  if (s.autonomous) score += 3;
  // 중점·특색 지정(학교알리미 공시 문서 기준): 고른 계열 중 하나라도 맞을 때만 가산
  const any = (f: (t: Track) => boolean | undefined) => tracks.some(t => !!f(t));
  const kinds = (s.designations || []).map(x => x.kind);
  if (any(t => t.stem) && (s.scienceFocus === true || kinds.includes('과학중점학교'))) score += 8;
  if (any(t => t === TRACKS.it || t === TRACKS.eng) && kinds.some(k => /^AI/.test(k))) score += 6;
  const k = s.kind;
  if ((k === '외고' || k === '국제고') && any(t => t.lang || t === TRACKS.biz)) score += 30;
  if (k === '예술고' && tracks.length) score += any(t => t.arts) ? 40 : -40;
  if (k === '특성화고') score += any(t => t.job) ? 40 : -40;
  return { score: clamp(score), hits: [...hits], missing: [...missing], parts };
}

function persona(s: School, m: Metrics, comp: number, pct: Pct, group: Group, ach: AchProfile | null, sp: { intake: number } | null): Persona {
  if (group === 'selective' && sp) return { label: '선발형 학교', desc: `입학 전형을 거쳐 대략 상위 ${sp.intake}% 수준의 학생이 모이는 학교` };
  if (group === 'arts') return { label: '실기 중심 학교', desc: '예술 실기 비중이 큰 학교라 내신·면학 지표는 일반고와 같은 기준으로 비교하지 않음' };
  if (group === 'vocational') return { label: '취업·전공 중심', desc: '직업교육 중심 학교. 대학 진학은 특성화고 특별전형 등 별도 경로를 주로 이용' };
  if (ach && ach.meanA != null && ach.meanA >= 25) return { label: '상위권 밀집형', desc: `1학년 국영수 A 비율이 평균 ${ach.meanA}%로 상위권이 두꺼워 면학 분위기는 좋지만 1등급 경쟁이 치열함` };
  if (ach && ach.meanA != null && ach.meanA < 12) return { label: '내신 기회형', desc: `1학년 국영수 A 비율이 평균 ${ach.meanA}%로 상위권이 얇아, 상위권 학생이 1등급을 노리기 좋은 편` };
  if (comp >= 0.7) return { label: '정시·면학형', desc: '재도전(재수 등) 비율이 높고 선호도가 높아 학업 경쟁이 치열한 편으로 추정' };
  if (pct.univ(m.univ) >= 0.7 && comp < 0.5) return { label: '수시 친화형', desc: '졸업생 4년제 진학률이 높고 경쟁 강도는 상대적으로 낮은 편으로 추정' };
  if (s.total && s.total < 450) return { label: '소규모 밀착형', desc: '학생 수가 적어 관리가 촘촘하지만 내신 1등급 자리는 적음' };
  if (s.total && s.total >= 900) return { label: '대규모 선택형', desc: '학생이 많아 과목 선택 폭이 넓고 1등급 인원도 많은 편' };
  return { label: '균형형', desc: '지표가 후보군 평균 근처에 고르게 분포' };
}
