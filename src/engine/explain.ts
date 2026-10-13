// 추천 이유·점수 근거 문장 — 참조 explain/scoreBasis 이식 + 데이터 공백을 솔직하게 표시
import { achSentences } from './achievement';
import { BANDS, COMPONENT_LABEL, TRACKS } from './constants';
import type { CompKey, Profile, Result } from './types';

export const fmt = (v: number | null | undefined) => (v == null ? '-' : Number.isInteger(v) ? String(v) : v.toFixed(1));
const gradeRange = (r: Result) => (r.gradeLo === r.gradeHi ? `${r.gradeLo}` : `${r.gradeLo}~${r.gradeHi}`);

export function explain(r: Result, p: Profile): { pros: string[]; cons: string[] } {
  const s = r.school, m = r.m;
  const pros: string[] = [], cons: string[] = [];
  const band = BANDS.find(b => b.id === p.band) || BANDS[2];
  const tr0 = TRACKS[p.track] || TRACKS.none;
  if ((r.comps.naesin ?? 0) >= 60 && r.group === 'general') pros.push(`${band.label}권 학생 기준 예상 내신 ${gradeRange(r)}등급대로, 내신 관리에 유리한 편입니다.`);
  // 중점·특색 지정 (학교알리미 공시 문서 제목·학교 공지 기준)
  const kinds = (s.designations || []).map(x => x.kind);
  if (tr0.stem && (s.scienceFocus === true || kinds.includes('과학중점학교'))) pros.push('과학중점학교로 운영 중(2026 운영계획 공시)이라 수학·과학 심화·실험 과정이 두터운 편입니다.');
  if ((p.track === 'it' || p.track === 'eng') && kinds.some(k => /^AI/.test(k))) pros.push(`${s.designations.filter(x => /^AI/.test(x.kind)).map(x => x.kind).join('·')}으로 지정되어 희망 계열(${tr0.label})과 연결되는 과정이 있습니다.`);
  if (kinds.includes('자율형 공립고 2.0')) pros.push('교육부 지정 자율형 공립고 2.0으로 고교학점제와 연계한 특색 교육과정을 운영합니다.');
  if (m.dropout != null && m.dropout <= 1.6 && r.group === 'general') pros.push(`${s.dropoutYear}학년도 학업중단율 ${fmt(m.dropout)}%로 낮은 편이라 학교 생활이 안정적인 것으로 보입니다.`);
  if (r.fit) r.fit.notes.forEach(n => (n.good ? pros : cons).push(n.text));
  if (r.ach) { const a = achSentences(r.ach); pros.push(...a.pros); cons.push(...a.cons); }
  else if ((r.comps.peer ?? 0) >= 70 && r.group === 'general') pros.push(`졸업생 4년제 진학 ${fmt(m.univ)}%에 재도전(재수 등) ${fmt(m.etc)}%로, 대학 진학 지향과 면학 분위기가 강한 학교로 추정됩니다.`);
  if ((r.comps.adv ?? 0) >= 70 && m.univ != null) pros.push(`최근 졸업생 4년제 진학 ${fmt(m.univ)}%·재도전 ${fmt(m.etc)}%로 대학 진학 지향이 후보군 상위권입니다.`);
  const trackTotal = r.trackHits.length + r.trackMissing.length;
  if (trackTotal && r.trackHits.length >= Math.ceil(trackTotal / 2)) pros.push(`희망 계열 핵심 과목 ${trackTotal}개 중 ${r.trackHits.length}개(${r.trackHits.slice(0, 4).join(', ')}${r.trackHits.length > 4 ? ' 등' : ''})가 2026학년도 시간표에 개설되어 있습니다 (이후 학년도 개설은 학교에 확인).`);
  if (r.dist != null && r.dist <= 2) pros.push(`통학 거리 약 ${r.dist.toFixed(1)}km로 가깝습니다.`);
  if (m.seats1 != null && m.seats1 >= 25) pros.push(`1학년이 ${s.stu?.[0]}명이라 내신 1등급(상위 10%) 자리가 약 ${m.seats1}명으로 넉넉합니다.`);
  if ((r.comps.env ?? 0) >= 70 && r.group !== 'arts') pros.push(`학급당 ${fmt(m.perClass)}명, 교원 1인당 학생 ${fmt(m.perTeacher)}명으로 교육 여건이 좋은 편입니다.`);
  if (r.selective) pros.push(`${s.kind}로, 비슷한 목표를 가진 학생들과 공부할 수 있습니다.`);
  if (r.selective && r.intake != null && band.top <= r.intake) pros.push(`입학생이 대략 상위 ${r.intake}% 수준이라 현재 성적대(${band.desc})로 도전해 볼 만합니다. 입학 후 예상 내신은 ${gradeRange(r)}등급대입니다.`);
  const ys = Object.keys(s.career || {}).sort();
  if (ys.length >= 2 && s.career) {
    const a = s.career[ys[0]], b = s.career[ys[ys.length - 1]];
    if (a.univ != null && b.univ != null) {
      if (b.univ - a.univ >= 5) pros.push(`4년제 진학률이 ${ys[0]}년 ${fmt(a.univ)}% → ${ys[ys.length - 1]}년 ${fmt(b.univ)}%로 오르는 추세입니다.`);
      if (a.univ - b.univ >= 5) cons.push(`4년제 진학률이 ${fmt(a.univ)}% → ${fmt(b.univ)}%로 낮아지는 추세입니다.`);
    }
    if (a.etc != null && b.etc != null && b.etc - a.etc >= 5 && (m.aim ?? 0) >= 75) (p.strategy === 'jeongsi' ? pros : cons).push(`재도전(기타) 비율이 ${fmt(a.etc)}% → ${fmt(b.etc)}%로 늘어 정시 중심 분위기가 강해지고 있습니다.`);
  }

  if (!r.assign.assignable) cons.unshift(`거주 학군 밖 학교입니다. ${r.assign.detail}`);
  else if (r.assign.kind === 'stage2-only') cons.unshift(`2단계 구역내배정으로만 갈 수 있습니다. ${r.assign.detail}`);
  if (r.selective) cons.push('입학 전형(선발)을 거쳐야 하며, 우수 학생이 모여 내신 경쟁이 매우 치열합니다.');
  const tr = TRACKS[p.track] || TRACKS.none;
  if (r.admit === 'hard') cons.push(`입학생이 대략 상위 ${r.intake}% 수준이라 현재 성적대(${band.desc})로는 선발이 어렵고, 입학해도 내신은 ${gradeRange(r)}등급대가 될 수 있어 적합도를 낮췄습니다.`);
  else if (r.admit === 'tough') cons.push(`입학생이 대략 상위 ${r.intake}% 수준이라 현재 성적대(${band.desc})에서는 상단이어야 도전할 수 있습니다. 입학 후 예상 내신은 ${gradeRange(r)}등급대입니다.`);
  if (r.group === 'arts') cons.push('실기 중심 학교라 내신·면학 분위기 점수는 중립으로 두었습니다. 실기 준비 정도가 더 중요합니다.');
  if (r.group === 'vocational') cons.push('직업교육 중심 학교라 면학 분위기·4년제 진학은 일반고와 같은 기준으로 비교하지 않았습니다. 취업률과 학과는 학교에 확인하세요.');
  if ((s.kind === '외고' || s.kind === '국제고') && tr.stem) cons.push(`어문·국제 계열 중심이라 이공계(${tr.label}) 과목 선택이 제한적일 수 있습니다.`);
  if (s.kind === '예술고' && p.track !== 'none' && !tr.arts) cons.push(`예체능 전문 학교라 희망 계열(${tr.label})과 성격이 다릅니다.`);
  if (!r.ach && r.group === 'general' && r.comp >= 0.75 && (p.strategy === 'susi' || p.strategy === 'mix')) cons.push('경쟁 강도가 높은 것으로 추정되어 같은 성적이라도 내신 등급이 낮게 나올 수 있습니다.');
  if (m.seats1 != null && m.seats1 < 15) cons.push(`1학년 ${s.stu?.[0] ?? '-'}명으로 1등급 자리가 약 ${m.seats1}명뿐이라 한두 문제에 등급이 갈릴 수 있습니다.`);
  if (r.assign.kind === 'paju-school') cons.push(`${s.city} 소재 비평준화 학교로 고양 배정과 별도의 자체 전형입니다. ${r.assign.detail}`);
  if (m.dropout != null && m.dropout >= 3.5 && r.group !== 'vocational') cons.push(`${s.dropoutYear}학년도 학업중단율이 ${fmt(m.dropout)}%로 후보군에서 높은 편입니다(전출 제외). 사유는 학교에 확인하세요.`);
  if (r.dist != null && r.dist > 6) cons.push(`통학 거리가 약 ${r.dist.toFixed(1)}km로 멀어 통학 시간을 확인해야 합니다.`);
  if (m.netIn != null && m.netIn < -2) cons.push(`전출 학생이 전입보다 많습니다 (재학생 대비 ${fmt(-m.netIn)}%).`);
  const gp = p.genderPref || 'any';
  if (gp === 'single' && s.gender === '공학') cons.push('남녀공학으로, 남고·여고 선호와 다릅니다.');
  if (s.subjects && r.trackMissing.length && r.trackHits.length < r.trackMissing.length) cons.push(`희망 계열 관련 과목 중 ${r.trackMissing.slice(0, 3).join(', ')} 등이 이번 학년도 시간표에 보이지 않습니다.`);
  if (m.univ == null) cons.push('졸업생 진로 데이터가 없어 진학 지표는 중간값으로 계산했습니다.');
  if (!s.subjects && p.track !== 'none' && p.track !== 'job') cons.push('개설 과목 데이터가 없어 계열 적합도는 학교 운영 방식으로만 추정했습니다.');
  if (!r.ach && (p.strong.length || p.weak.length) && (r.group === 'general' || r.selective)) cons.push('과목별 성적분포(A~E)가 확보되지 않아 강점·약점 과목 궁합은 중립(50점)으로 두었습니다.');
  return { pros: pros.slice(0, 5), cons: cons.slice(0, 5) };
}

// 각 점수가 "무슨 데이터로" 나왔는지 한 줄로. 직접 측정하지 않은 점수는 (추정)으로 밝힌다.
export function scoreBasis(r: Result, p: Profile, rankOf: Partial<Record<CompKey, number>>, n: number): Partial<Record<CompKey, { value: number; basis: string }>> {
  const band = BANDS.find(b => b.id === p.band) || BANDS[2];
  const s = r.school, m = r.m, a = r.ach;
  const pos = (k: CompKey) => (rankOf[k] ? ` (후보 ${n}곳 중 ${rankOf[k]}위)` : '');
  const compSrc = r.group === 'selective' ? `선발형 학교 입학생 수준(상위 약 ${r.intake}%)`
    : r.group !== 'general' ? `${r.group === 'arts' ? '예체능' : '직업계'} 학교 기준값`
    : a ? `${a.label} 1학년 국영수 A 비율 평균 ${a.meanA}%·평균 ${a.meanAvg}점 (실제 성적분포)`
    : `졸업생 4년제+재도전 비율 ${fmt(m.aim)}%·전출입·학생 수 추이 (성적분포 미확보 — 공시 지표 추정)`;
  const b: Record<CompKey, string> = {
    naesin: r.rankTop == null ? '실기 중심 학교라 내신 위치를 추정하지 않음'
      : `중학교 성적대(${band.desc})와 경쟁 강도(${compSrc})로 본 예상 교내 위치 상위 약 ${Math.round(r.rankTop)}%, 1학년 ${s.stu?.[0] ?? '-'}명` + pos('naesin'),
    peer: (a ? '' : '(추정) 직접 측정한 지표가 아님. 추정 근거: ') + compSrc + (!a && m.dropout != null && r.group === 'general' ? ` + 학업중단율 ${fmt(m.dropout)}%(보조)` : '') + pos('peer'),
    adv: r.group === 'vocational' ? '직업계 학교라 중립값' : m.univ == null ? '졸업생 진로 데이터 없음(중간값)'
      : `최근 ${Object.keys(s.career || {}).length}년 평균 4년제 진학 ${fmt(m.univ)}%, 4년제+재도전 ${fmt(m.aim)}%` + pos('adv'),
    track: r.trackHits.length + r.trackMissing.length
      ? `희망 계열 핵심 과목 ${r.trackHits.length + r.trackMissing.length}개 중 ${r.trackHits.length}개 개설 (2026학년도 1·2학년 시간표, 이후 개설 보장 없음)` + pos('track')
      : '개설 과목 데이터 없음 또는 계열 미정 — 학교 운영 방식으로만 추정',
    commute: r.dist == null ? '거리 정보 없음' : `직선거리 ${r.dist.toFixed(1)}km` + pos('commute'),
    env: `학급당 ${fmt(m.perClass)}명, 교원 1인당 ${fmt(m.perTeacher)}명, 동아리 ${m.clubs ?? '-'}개, 기간제 교원 ${fmt(m.tempRatio)}%${m.dropout != null ? `, 학업중단율 ${fmt(m.dropout)}%(15% 비중)` : ''}` + pos('env'),
    subjFit: r.fit ? (r.fit.notes.map(x => x.text).join(' ') || '강점·약점 과목에 두드러진 유불리 없음(중립)') + pos('subjFit') : '성적분포가 없어 중립값(50)',
    genderPref: `${s.gender === '공학' ? '남녀공학' : s.gender}`,
  };
  const out: Partial<Record<CompKey, { value: number; basis: string }>> = {};
  (Object.keys(r.comps) as CompKey[]).forEach(k => { out[k] = { value: Math.round(r.comps[k] ?? 0), basis: b[k] }; });
  return out;
}

export const compLabel = (k: CompKey) => COMPONENT_LABEL[k];
