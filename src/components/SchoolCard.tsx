import { ChevronDown, ExternalLink, MessageSquareQuote, Navigation } from 'lucide-react';
import { useState } from 'react';
import { REVIEWS } from '../data';
import { COMPONENT_LABEL, COURSE_CAVEAT, explain, fmt, gradeLetter, mathCurriculum, scoreBasis, type CompKey, type MathCourse, type Profile, type Result } from '../engine';
import { kakaoDirectionsUrl, naverMapUrl } from '../lib/directions';
import { ReviewList } from './ReviewList';
import { ScoreBars } from './ScoreBars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const tone = {
  good: 'bg-good-soft text-good border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  bad: 'bg-bad-soft text-bad border-transparent',
  info: 'bg-info-soft text-info border-transparent',
  brand: 'bg-brand-soft text-brand border-transparent',
};

// 수학 과목 칩: 진로·융합·심화 선택 과목을 도드라지게
function CourseChips({ list }: { list: MathCourse[] }) {
  const shown = list.filter(c => c.tier !== 'common');
  if (!shown.length) return <span className="text-muted-foreground">시간표에서 확인된 선택 과목 없음</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map(c => (
        <li key={c.name} className={cn('rounded-full border px-2.5 py-0.5 text-[0.8125rem]', c.tier === 'advanced' ? 'border-primary/40 bg-primary/10 font-semibold text-primary-deep' : 'bg-card text-foreground/80')}>{c.name}</li>
      ))}
    </ul>
  );
}

export function SchoolCard({ r, rank, profile, rankOf, n }: { r: Result; rank: number; profile: Profile; rankOf: Partial<Record<CompKey, number>>; n: number }) {
  const [open, setOpen] = useState(false);
  const s = r.school;
  const { pros, cons } = explain(r, profile);
  const basis = scoreBasis(r, profile, rankOf, n);
  const grade = r.gradeLo == null ? null : r.gradeLo === r.gradeHi ? `${r.gradeLo}등급` : `${r.gradeLo}~${r.gradeHi}등급`;
  const years = Object.keys(s.career || {}).sort();
  const top = rank <= 3;
  const reviews = REVIEWS.filter(review => review.schoolId === s.id);
  const curriculum = mathCurriculum(s);
  const myMath = profile.subjectGrades?.수학;
  const scrollToReviews = () => document.getElementById(`reviews-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <article
      aria-label={`${rank}위 ${s.name}`}
      className={cn(
        'flex flex-col gap-3.5 rounded-xl border bg-card p-4 transition-shadow sm:p-5',
        top && 'border-border shadow-float',
        rank === 1 && 'border-navy/50',
        !r.assign.assignable && 'opacity-90',
      )}
    >
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className={cn('grid size-10 place-items-center rounded-lg text-base font-bold tnum', top ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70', rank === 1 && 'bg-navy')} aria-hidden="true">{rank}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-navy">{s.name}</h3>
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-[0.8125rem] text-muted-foreground">
            <span>{s.sgg}</span><span>· {s.kind}</span><span>· {s.foundation}</span>
            {r.dist != null && <span className="tnum">· 직선 약 {r.dist.toFixed(1)}km</span>}
            <a href={kakaoDirectionsUrl(s)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary-deep underline-offset-4 hover:underline" aria-label={`${s.name} 카카오맵 길찾기 (새 창)`}>
              <Navigation className="size-3" aria-hidden="true" />길찾기
            </a>
          </p>
        </div>
        <div className="text-right leading-none">
          <b className={cn('text-2xl font-extrabold tnum', rank === 1 ? 'text-navy' : 'text-primary')}>{r.total}</b>
          <small className="ml-0.5 text-xs text-muted-foreground">점</small>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{r.persona.label}</Badge>
        {grade && <Badge variant="outline">예상 내신 {grade}대</Badge>}
        {reviews.length > 0 && (
          <Badge asChild className="border-transparent bg-navy text-primary-foreground">
            <button type="button" onClick={scrollToReviews} title="이 카드의 학교별 리뷰로 이동">
              <MessageSquareQuote aria-hidden="true" /> 학교별 리뷰 {reviews.length}
            </button>
          </Badge>
        )}
        {s.designations.map(d => <Badge key={d.kind} className={tone.info} title={`${d.kind} · 근거: ${d.evidence ?? '공시 문서'}`}>{d.label}</Badge>)}
        {r.flags.achievement
          ? <Badge className={tone.good} title="학교알리미 교과별 학업성취 자료를 반영">성취도 확보 · {r.ach?.label}</Badge>
          : (r.group === 'general' || r.selective) && <Badge className={tone.warn} title="과목별 성취도(A~E)를 확보하지 못해 공시 지표로 추정">성적분포 미확보 · 공시 지표 추정</Badge>}
        {!r.flags.career && <Badge variant="outline">진로 데이터 없음</Badge>}
        {!r.assign.assignable && <Badge className={tone.bad}>거주 학군 밖 · 배정 대상 아님</Badge>}
        {r.assign.kind === 'stage2-only' && <Badge className={tone.warn}>2단계 구역내배정만</Badge>}
        {r.assign.kind === 'paju-school' && <Badge className={tone.bad}>파주 비평준화 · 자체 전형</Badge>}
        {r.admit !== 'ok' && <Badge className={tone.bad}>{r.admit === 'hard' ? '선발 어려움' : '선발 도전'}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{r.persona.desc}</p>
      <p className="rounded-md bg-muted px-3 py-2 text-[0.8125rem] leading-snug"><b className="font-semibold">배정·전형</b> <span className="text-foreground/80">{r.assign.route}</span></p>

      <ScoreBars r={r} />

      <section className="rounded-xl border border-primary/25 bg-secondary/40 p-4" aria-label={`${s.name} 수학 관점`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary-deep">5A 수학 관점</p>
            <h4 className="text-[0.9375rem] font-bold text-navy">수학 교과 편제와 수학 경쟁력</h4>
          </div>
          <div className="shrink-0 text-right">
            <p className="leading-none"><b className="text-2xl font-extrabold text-primary tnum">{r.math.score ?? '-'}</b><small className="ml-0.5 text-xs text-muted-foreground">/100</small></p>
            <p className="mt-1 text-xs text-muted-foreground">수학 경쟁력 · 추정</p>
          </div>
        </div>
        <Progress value={r.math.score ?? 0} className="mt-3 h-2 bg-card" aria-label={`수학 경쟁력 ${r.math.score ?? '자료 없음'}`} />
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">선택·심화 수학 과목군 8개 중 {r.math.offered.length}개를 2026학년도 1·2학년 시간표에서 확인{r.math.offered.length ? ` (${r.math.offered.join(' · ')})` : ''}</p>
        <dl className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2.5 text-sm sm:grid-cols-[7rem_1fr]">
          <dt className="font-semibold text-foreground/80">2학년 수학 <span className="block text-xs font-normal text-muted-foreground">2022 개정</span></dt>
          <dd>{curriculum ? <CourseChips list={curriculum['2']} /> : <span className="text-muted-foreground">시간표 자료 없음</span>}</dd>
          <dt className="font-semibold text-foreground/80">3학년 수학 <span className="block text-xs font-normal text-muted-foreground">2015 개정·참고</span></dt>
          <dd>{curriculum ? <CourseChips list={curriculum['3']} /> : <span className="text-muted-foreground">시간표 자료 없음</span>}</dd>
          <dt className="font-semibold text-foreground/80">수학 성취도</dt>
          <dd className="leading-relaxed">{r.ach?.core.수학
            ? <>{r.ach.label} 1학년 {r.ach.core.수학.name} 평균 <b className="tnum">{r.ach.core.수학.avg}점</b> · A 비율 <b className="tnum">{r.ach.core.수학.A}%</b> <span className="text-xs text-muted-foreground">(학교알리미 공시)</span></>
            : <span className="text-muted-foreground">미확보 — 학교알리미 교과별 성취도를 수집하지 못했습니다</span>}</dd>
          {myMath && <>
            <dt className="font-semibold text-foreground/80">우리 아이 수학</dt>
            <dd>최근 성취도 <b>{gradeLetter(myMath)}</b> · 이 학교 2학년 진로·심화 수학 {curriculum?.['2'].filter(c => c.tier === 'advanced').length ?? 0}과목 개설 확인</dd>
          </>}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-primary-deep">주황 칩</span> = 진로·융합·심화 선택 과목. 수학 경쟁력은 과목 개설 폭을 비교하는 추정치로 수학 성적·수업의 질을 뜻하지 않으며 추천 총점에 넣지 않습니다. 시간표에 없는 과목이 미개설을 확정하지는 않습니다.</p>
      </section>

      <section id={`reviews-${s.id}`} aria-label={`${s.name} 학교별 리뷰`} className="rounded-xl border border-navy/15 bg-navy-soft/50 p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-navy">
            <MessageSquareQuote className="size-4" aria-hidden="true" /> 학교별 리뷰 <span className="text-primary-deep tnum">{reviews.length}건</span>
          </h4>
          <span className="text-xs text-muted-foreground">공개 게시글 발췌 · 원문 링크</span>
        </div>
        <ReviewList reviews={reviews} label={s.name} initial={2} />
        <p className="mt-2 text-xs text-muted-foreground">리뷰는 개인 경험으로 공시 자료와 구분하며, 추천 점수에 반영하지 않습니다.</p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pros.length > 0 && (
          <div className="rounded-lg bg-good-soft px-4 py-3 text-sm leading-relaxed">
            <h4 className="mb-1 text-sm font-semibold text-good">이런 점이 좋아요</h4>
            <ul className="flex list-disc flex-col gap-1 pl-4">{pros.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
        {cons.length > 0 && (
          <div className="rounded-lg bg-warn-soft px-4 py-3 text-sm leading-relaxed">
            <h4 className="mb-1 text-sm font-semibold text-warn">이런 점은 확인하세요</h4>
            <ul className="flex list-disc flex-col gap-1 pl-4">{cons.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 w-full rounded-lg" aria-controls={`detail-${s.id}`}>
            {open ? '자세한 근거 접기' : '점수 근거·학교 정보 보기'} <ChevronDown className={cn('transition-transform', open && 'rotate-180')} aria-hidden="true" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent id={`detail-${s.id}`} className="mt-3 flex flex-col gap-5 border-t border-dashed pt-4 text-sm">
          <section>
            <h4 className="mb-2 text-sm font-semibold text-primary-deep">점수 근거</h4>
            <dl className="divide-y">
              {(Object.keys(basis) as CompKey[]).map(k => (
                <div key={k} className="py-2">
                  <dt className="flex justify-between gap-2 font-semibold">{COMPONENT_LABEL[k]} <span className="tnum">{basis[k]?.value}</span></dt>
                  <dd className="mt-0.5 leading-relaxed text-muted-foreground">{basis[k]?.basis}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-primary-deep">수학 경쟁력 산식 (추정)</h4>
            <p className="leading-relaxed">미적분, 기하, 확률과 통계, 고급·심화 수학, 고급 대수, 인공지능 수학, 수학과제 탐구, 경제 수학의 8개 과목군을 각각 동일 비중으로 봅니다. 점수 = 확인된 과목군 수 ÷ 8 × 100 (반올림). 같은 군의 여러 과목·분반은 한 번만 셉니다.</p>
            <p className="mt-1 text-muted-foreground">미확인: {r.math.unconfirmed.join(' · ') || '없음'}. 시간표에서 보이지 않는 것이 미개설을 확정하지는 않습니다. 대학 진학률·전체 면학 점수를 수학 성적의 대용으로 사용하지 않습니다.</p>
            <p className="mt-1 text-xs text-muted-foreground">{COURSE_CAVEAT}</p>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-primary-deep">배정·전형 (2027학년도)</h4>
            <p className="leading-relaxed"><b>{r.assign.route}</b> — {r.assign.detail}</p>
            {s.admission?.source && <a className="mt-1 inline-flex items-center gap-1 text-xs text-primary-deep underline-offset-4 hover:underline" href={s.admission.source} target="_blank" rel="noreferrer">공식 출처 <ExternalLink className="size-3" aria-hidden="true" /></a>}
          </section>

          {(r.trackHits.length > 0 || r.trackMissing.length > 0) && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-primary-deep">희망 계열 핵심 과목</h4>
              <p className="leading-relaxed">
                {r.trackHits.length > 0 && <>개설: {r.trackHits.join(', ')}</>}
                {r.trackMissing.length > 0 && <span className="text-muted-foreground"> · 미확인: {r.trackMissing.join(', ')}</span>}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{COURSE_CAVEAT}</p>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-sm font-semibold text-primary-deep">졸업생 진로 (공시)</h4>
            {years.length ? (
              <Table className="text-xs tnum">
                <TableHeader><TableRow><TableHead>연도</TableHead><TableHead className="text-right">졸업생</TableHead><TableHead className="text-right">4년제</TableHead><TableHead className="text-right">전문대</TableHead><TableHead className="text-right">취업</TableHead><TableHead className="text-right">기타(재수 등)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {years.map(y => { const c = s.career![y]; return (
                    <TableRow key={y}><TableCell>{y}</TableCell><TableCell className="text-right">{c.n ?? '-'}</TableCell><TableCell className="text-right">{fmt(c.univ)}%</TableCell><TableCell className="text-right">{fmt(c.college)}%</TableCell><TableCell className="text-right">{fmt(c.job)}%</TableCell><TableCell className="text-right">{fmt(c.etc)}%</TableCell></TableRow>
                  ); })}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground">졸업생 진로 공시 자료를 확보하지 못했습니다.</p>}
            <p className="mt-1 text-xs text-muted-foreground">'기타'에는 재수와 미진학이 섞여 있어 재수율로 해석하면 안 됩니다.</p>
          </section>

          {r.ach && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-primary-deep">1학년 주요 과목 성취도 ({r.ach.label})</h4>
              <Table className="text-xs tnum">
                <TableHeader><TableRow><TableHead>과목</TableHead><TableHead className="text-right">평균</TableHead>{['A', 'B', 'C', 'D', 'E'].map(g => <TableHead key={g} className="text-right">{g}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                  {Object.entries(r.ach.core).map(([k, x]) => x && (
                    <TableRow key={k}><TableCell>{k} <span className="text-muted-foreground">({x.name})</span></TableCell><TableCell className="text-right">{x.avg}</TableCell><TableCell className="text-right">{x.A}%</TableCell><TableCell className="text-right">{x.B}%</TableCell><TableCell className="text-right">{x.C}%</TableCell><TableCell className="text-right">{x.D}%</TableCell><TableCell className="text-right">{x.E}%</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          <section>
            <h4 className="mb-2 text-sm font-semibold text-primary-deep">기본 정보</h4>
            <dl className="grid grid-cols-[5rem_1fr] gap-x-2 gap-y-1.5">
              <dt className="text-muted-foreground">주소</dt>
              <dd>
                {s.address}
                <span className="mt-1 flex flex-wrap gap-x-3 text-xs">
                  <a href={kakaoDirectionsUrl(s)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary-deep underline-offset-4 hover:underline">카카오맵 길찾기 <ExternalLink className="size-3" aria-hidden="true" /></a>
                  <a href={naverMapUrl(s)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary-deep underline-offset-4 hover:underline">네이버 지도 <ExternalLink className="size-3" aria-hidden="true" /></a>
                </span>
              </dd>
              <dt className="text-muted-foreground">학생 수</dt><dd className="tnum">{s.total ?? '-'}명 (1학년 {s.stu?.[0] ?? '-'} · 2학년 {s.stu?.[1] ?? '-'} · 3학년 {s.stu?.[2] ?? '-'}) · {s.classes ?? '-'}학급</dd>
              <dt className="text-muted-foreground">교육 여건</dt><dd className="tnum">학급당 {fmt(s.perClass)}명 · 교원 1인당 {fmt(s.perTeacher)}명 · 동아리 {s.clubs ?? '-'}개 · 기간제 교원 {fmt(s.tempRatio)}%</dd>
              <dt className="text-muted-foreground">학업중단</dt><dd className="tnum">{s.dropoutRate != null ? <>{s.dropoutYear}학년도 {fmt(s.dropoutRate)}% {s.dropoutRows && <span className="text-muted-foreground">(학년별 {s.dropoutRows.map(x => `${x.grade}학년 ${fmt(x.pct)}%`).join(' · ')}) · 전출 제외</span>}</> : '공시 미확보'}</dd>
              <dt className="text-muted-foreground">지정·운영</dt>
              <dd>
                {[
                  s.autonomous && `자율학교 지정·운영 O${s.autonomousSource === 'schoolinfo-official' ? '(공시)' : ''}`,
                  s.subjRoom && '교과교실제',
                  s.levelClass && '수준별 수업',
                  ...s.designations.map(d => `${d.kind}${d.evidence ? ` — ${d.evidence}` : ''}`),
                ].filter(Boolean).join(' · ') || '특이 사항 없음 (학교알리미 공시 표 기준)'}
                {s.officialType && <span className="text-muted-foreground"> · 공시 학교 특성: {s.officialType}</span>}
              </dd>
              {s.homepage && <><dt className="text-muted-foreground">홈페이지</dt><dd><a href={s.homepage} target="_blank" rel="noreferrer" className="text-primary-deep underline-offset-4 hover:underline">{s.homepage.replace(/^https?:\/\//, '')}</a></dd></>}
            </dl>
          </section>
        </CollapsibleContent>
      </Collapsible>
    </article>
  );
}
