import { lazy, Suspense, useState } from 'react';
import { ADMISSION, REVIEWS, SCHOOLS } from '../data';
import { REFS, type RefId } from '../data/references';
import { COURSE_CAVEAT, fmt, mathCurriculum, type Result } from '../engine';
import { kakaoDirectionsUrl } from '../lib/directions';
import { CardShortcut, Disclosure } from './Disclosure';
import { IndicatorNote } from './IndicatorNote';
import { ReviewList } from './ReviewList';

const MiniMap = lazy(() => import('./MiniMap'));
const ARTICLES: { topic: string; id: RefId }[] = [
  { topic: '성취도·내신 지표 해석', id: 'schoolinfoA' },
  { topic: '고교학점제 과목 선택', id: 'faqChoice' },
  { topic: '심화 수학을 확인할 때', id: 'faqGeometry' },
];
const EMPTY_RESULTS: Result[] = [];

export function SchoolInfo() {
  const [schoolId, setSchoolId] = useState(SCHOOLS[0].id);
  const s = SCHOOLS.find(school => school.id === schoolId)!;
  const curriculum = mathCurriculum(s);
  const reviews = REVIEWS.filter(r => r.schoolId === s.id);
  const g = ADMISSION.goyang;
  const source = s.admission?.source ?? (s.city === '파주시' ? ADMISSION.paju.source : g.source);

  return (
    <section id="school-info" aria-labelledby="school-info-title" className="min-w-0 rounded-2xl border bg-card p-5 shadow-card sm:p-8">
      <p className="text-sm font-semibold text-primary-deep">이제 학교별로 확인하세요</p>
      <h2 id="school-info-title" className="mt-1 text-2xl font-bold text-navy">궁금한 학교 정보를 한눈에</h2>
      <p className="mt-2 text-sm text-muted-foreground">성적 입력 없이 {SCHOOLS.length}개 학교를 찾아보세요. 공시 자료와 개인 경험을 구분해 읽고, 필요한 항목만 펼쳐 확인하세요.</p>
      <label htmlFor="school-picker" className="mt-5 mb-2 block text-sm font-semibold">학교 선택 · 전체 {SCHOOLS.length}개</label>
      <select id="school-picker" value={schoolId} onChange={e => setSchoolId(e.target.value)} className="h-12 w-full min-w-0 rounded-lg border bg-background px-3 text-base">
        {[...SCHOOLS].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(school => <option key={school.id} value={school.id}>{school.name} · {school.sgg}</option>)}
      </select>
      <article key={s.id} aria-label={`${s.name} 학교 정보`} className="mt-5 grid min-w-0 grid-cols-1 items-start gap-4">
        <Disclosure id="school-basic" title={`${s.name} · 학교 기본정보`}>
        <header className="rounded-xl bg-secondary/40 p-4">
          <h3 className="text-xl font-bold text-navy">{s.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{s.kind} · {s.foundation} · {s.sgg}</p>
          <p className="mt-2 text-sm">{s.address}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-primary-deep">
            {s.homepage && <a href={s.homepage} target="_blank" rel="noreferrer" className="underline">학교 홈페이지 ↗</a>}
            <a href={kakaoDirectionsUrl(s)} target="_blank" rel="noreferrer" className="underline">카카오맵 길찾기 ↗</a>
          </div>
          {s.designations.length > 0 && <p className="mt-2 text-sm">{s.designations.map(d => d.label).join(' · ')} <span className="text-xs text-muted-foreground">(공시 문서·학교 공지 기준, 지정 통지서 본문 미열람)</span></p>}
        </header>
          <CardShortcut target="school-map">교통·지도</CardShortcut>
        </Disclosure>

        <Disclosure id="school-math" title="수학 선택·심화 과목 편제">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold">2학년 수학 · 2022 개정</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">{curriculum ? curriculum['2'].map(c => <span key={c.name} className="rounded-full border bg-secondary/40 px-2 py-1">{c.name}</span>) : '시간표 자료 미확보'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{COURSE_CAVEAT} 과목 개설 폭은 수업의 질이나 수학 실력을 뜻하지 않습니다.</p>
          <div className="flex flex-col items-start">
            <CardShortcut target="math-guide">수학 선택 가이드</CardShortcut>
            <CardShortcut target="article-faqChoice">교빛 · 고교학점제 과목 선택</CardShortcut>
          </div>
        </Disclosure>

        <Disclosure id="school-indicators" title="성취도·교육 여건 지표">
          <IndicatorNote />
          <p className="mt-2 text-sm">학생 {s.total ?? '미확보'}명 · {s.classes ?? '미확보'}학급 · 학급당 {fmt(s.perClass)}명 · 교원 1인당 {fmt(s.perTeacher)}명 · 동아리 {s.clubs ?? '미확보'}개 · 기간제 교원 {fmt(s.tempRatio)}%</p>
          {s.stu && <p className="mt-2 text-sm">학년별 학생 수: {s.stu.map((n, i) => `${i + 1}학년 ${n}명`).join(' · ')}</p>}
          <p className="mt-2 text-sm">지정·운영: {[s.autonomous && '자율학교', s.subjRoom && '교과교실제', s.levelClass && '수준별 수업', ...s.designations.map(d => `${d.label}${d.evidence ? ` (${d.evidence})` : ''}`)].filter(Boolean).join(' · ') || '특이 사항 없음 (공시 표 기준)'}</p>
          <p className="mt-2 text-sm">학업중단율: {s.dropoutRate == null ? '공시 미확보' : `${s.dropoutYear}학년도 ${fmt(s.dropoutRate)}% (전출 제외)`}</p>
          {s.achData ? Object.entries(s.achData).map(([term, grades]) => <div key={term} className="mt-3">
            <h4 className="font-semibold">{term} 성취도</h4>
            {Object.entries(grades).map(([year, rows]) => <div key={year} className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs"><caption className="text-left">{year}학년 · 학교알리미 공시</caption><thead><tr><th className="p-2">과목</th><th>평균</th><th>A~E 비율 (3단계 과목은 A~C)</th></tr></thead><tbody>{rows.map(([name, avg, rates]) => <tr key={name} className="border-t"><td className="p-2">{name}</td><td>{avg}</td><td>{rates.map(v => `${v}%`).join(' / ')}</td></tr>)}</tbody></table>
            </div>)}
          </div>) : <p className="mt-3 rounded-lg bg-warn-soft p-3 text-sm">과목별 성취도 미확보 — 학교알리미 CAPTCHA로 수집하지 못했습니다. 실제 성적분포·시험 난이도는 학교에 확인하세요. 자료 없음은 낮은 실력을 뜻하지 않습니다.</p>}
          <CardShortcut target="article-schoolinfoA">교빛 · 성취도·내신 지표 해석</CardShortcut>
        </Disclosure>

        <Disclosure id="school-career" title="진학·졸업생 정보">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-xs"><caption className="mb-2 text-left">졸업생 진로 공시 · 비율(%)</caption><thead><tr>{['연도', '졸업생', '4년제', '전문대', '해외', '취업', '기타'].map(label => <th key={label} className="p-2 whitespace-nowrap">{label}</th>)}</tr></thead><tbody>{Object.entries(s.career ?? {}).sort().map(([year, c]) => <tr key={year} className="border-t">{[year, c.n, c.univ, c.college, c.abroad, c.job, c.etc].map((value, i) => <td key={i} className="p-2">{value ?? '-'}</td>)}</tr>)}</tbody></table>
          </div>
          {!s.career && <p className="text-sm">졸업생 진로 공시 자료 미확보</p>}
          <p className="mt-2 text-xs text-muted-foreground">‘기타’에는 재수와 미진학이 섞여 있어 재수율이 아닙니다. 진학률만으로 학교 실력을 판단할 수 없습니다.</p>
          <CardShortcut target="school-indicators">성취도·교육 여건 지표</CardShortcut>
        </Disclosure>

        <Disclosure id="school-map" title="교통·지도 · 집 기준 거리" mountOnOpen>
          <Suspense fallback={<p>지도를 불러오는 중…</p>}>
            <MiniMap results={EMPTY_RESULTS} origin={null} originLabel="집 위치를 선택하세요" homeIsDong={false} initialSchoolId={s.id} />
          </Suspense>
          <p className="mt-2 text-xs text-muted-foreground">사는 동을 선택하면 집 핀과 직선거리가 표시됩니다. 실제 통학 시간은 카카오맵 길찾기로 확인하세요.</p>
          <CardShortcut target="school-reviews">학교별 리뷰</CardShortcut>
        </Disclosure>

        <Disclosure id="school-reviews" title={`학교별 리뷰 · ${reviews.length}건`}>
          <ReviewList reviews={reviews} label={s.name} initial={2} />
          <p className="mt-2 text-xs text-muted-foreground">공개 게시글의 개인 경험이며 공시 자료와 구분합니다. 전체 학교 리뷰 {REVIEWS.length}건, 추천 점수에 반영하지 않습니다.</p>
          <div className="flex flex-col items-start">
            <CardShortcut target="school-map">교통·지도</CardShortcut>
            <CardShortcut target="all-reviews">전체 학교 리뷰</CardShortcut>
          </div>
        </Disclosure>

        <Disclosure id="school-admission" title="2027학년도 배정·전형 안내">
          <div className="space-y-2 text-sm leading-relaxed">
            <p>{s.admission?.note ?? '학교별 전형 요강을 확인하세요.'}</p>
            {s.admission?.equalized ? <>
              <p>{g.selection} · {s.admission.zone}구역 · {s.admission.stages.join(' · ')}</p>
              <p>1단계 {g.stage1.name}: {g.stage1.eligibleSchools} 중 {g.stage1.preferences}개 지망 → {g.stage1.method}</p>
              <p>2단계 {g.stage2.name}: {g.stage2.eligibleStudents}이 {g.stage2.preferences}를 적어 {g.stage2.method}</p>
              <p className="text-muted-foreground">{g.limitations.join(' · ')}</p>
            </> : <p>{s.city === '파주시' ? ADMISSION.paju.selection : '외고·국제고·예술고·특성화고 등은 학교별 전형입니다. 모집 요강을 별도로 확인하세요.'}</p>}
            <a href={source} target="_blank" rel="noreferrer" className="text-primary-deep underline">출처: 교육청 공식 배정·전형 안내 ↗</a>
          </div>
        </Disclosure>

        <Disclosure id="school-articles" title="함께 보면 좋은 교빛 기사">
          <p className="mt-1 text-xs text-muted-foreground">학교별 평가 기사가 아니라, 위 정보를 해석하는 데 도움이 되는 주제별 공통 읽을거리입니다.</p>
          <ul className="mt-3 space-y-3">{[...ARTICLES, ...(s.scienceFocus ? [{ topic: '과학중점학교를 볼 때', id: 'scienceFocus' as const }] : [])].map(({ topic, id }) => <li key={id} id={`article-${id}`}>
            <p className="text-xs font-semibold text-primary-deep">{topic}</p>
            <p className="mt-0.5 text-sm">{REFS[id].title}</p>
            <a href={REFS[id].url} target="_blank" rel="noreferrer" className="text-xs text-primary-deep underline">출처: {REFS[id].publisher} · {REFS[id].date} · 원문 보기 ↗</a>
          </li>)}</ul>
          <CardShortcut target="school-math">선택한 학교 수학 편제</CardShortcut>
        </Disclosure>
      </article>
      <p className="mt-4 text-xs text-muted-foreground">학교 정보: 학교알리미 공시·2026학년도 NEIS 시간표. 개설 과목은 이후 학년도 개설을 보장하지 않습니다. 원자료와 수집 범위는 아래 ‘자료·분석 방법과 전체 출처’에서 확인하세요.</p>
      <CardShortcut target="sources">자료·분석 방법과 전체 출처</CardShortcut>
    </section>
  );
}
