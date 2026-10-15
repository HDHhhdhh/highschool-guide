import { ExternalLink, Info, Pencil, TriangleAlert } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { ADMISSION, META, REVIEWS } from '../data';
import { BANDS, COMPONENT_LABEL, MAIN_COMPS, SCHOOL_TYPES, STANDING_NOTE, STRATEGIES, ZONE_NAME, fmt, gradeLetter, standingRange, tracksLabel, zoneOfSgg, type Analysis, type Profile, type SubjectGrade } from '../engine';
import { INDICATOR_BODY, INDICATOR_REFS, INDICATOR_TITLE, IndicatorNote } from './IndicatorNote';
import { SchoolCard } from './SchoolCard';
import { Disclosure } from './Disclosure';
import { Cites } from './SourceLinks';
import { BlurFade } from '@/components/magicui/blur-fade';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

// 도로 지도(네이버 지도)는 결과 화면에서만 필요하므로 따로 불러온다
const MiniMap = lazy(() => import('./MiniMap'));
const PAGE = 8;
const SHORT: Record<string, string> = { naesin: '내신', peer: '면학', adv: '진학', track: '계열', commute: '통학', env: '여건' };
const REVIEW_COUNT = REVIEWS.reduce((m, r) => m.set(r.schoolId, (m.get(r.schoolId) ?? 0) + 1), new Map<string, number>());

export function Results({ profile: p, analysis, onEdit }: { profile: Profile; analysis: Analysis; onEdit: () => void }) {
  const [shown, setShown] = useState(PAGE);
  const { results, origin, rankOf } = analysis;
  const band = BANDS.find(b => b.id === p.band) || BANDS[2];
  const w = results[0]?.weights ?? {};
  const homeZone = zoneOfSgg(p.sgg);
  const g = ADMISSION.goyang;
  const compare = results.slice(0, Math.min(8, results.length));
  // 수학 관점: 후보 중 선택·심화 수학 과목군이 넓은 학교 (같으면 추천 점수 순)
  const mathTop = results.filter(r => r.math.score != null).sort((a, b) => (b.math.score ?? 0) - (a.math.score ?? 0) || b.total - a.total).slice(0, 3);

  return (
    <Card id="results" className="gap-0 rounded-2xl py-0 shadow-card">
      <CardHeader className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8">
        <p className="text-sm font-semibold text-primary-deep">2단계 · 추천 결과</p>
        <CardTitle className="text-2xl font-bold tracking-tight text-navy">후보 {results.length}곳을 비교했습니다</CardTitle>
        <CardDescription className="text-[0.9375rem] leading-relaxed">같은 후보군 안에서의 상대 비교입니다. 절대적인 학교 서열이 아니며, 점수 차이가 2~3점이면 사실상 같은 수준으로 보세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-wrap gap-1.5" aria-label="입력 조건">
          <Badge variant="secondary">고양시 {p.sgg}</Badge>
          <Badge variant="secondary">거리 기준: {p.originLabel}</Badge>
          {p.standing ? (
            <>
              {p.naesinTotal != null && <Badge variant="secondary">내신 총점 {fmt(p.naesinTotal)}/200</Badge>}
              {p.subjectGrades && <Badge variant="secondary">성취도 {(Object.entries(p.subjectGrades) as [string, SubjectGrade][]).map(([s, g]) => `${s} ${gradeLetter(g)}`).join(' · ')}</Badge>}
              <Badge variant="secondary" title={STANDING_NOTE}>대략적 위치 {standingRange(p.standing).label} · 참고용 추정</Badge>
            </>
          ) : <Badge variant="secondary">성적대 {band.label} ({band.desc})</Badge>}
          <Badge variant="secondary">희망 {tracksLabel(p.tracks)}</Badge>
          <Badge variant="secondary">{STRATEGIES[p.strategy].label}</Badge>
          <Badge variant="secondary">일반고{p.types.map(k => ' · ' + (SCHOOL_TYPES[k]?.label ?? k)).join('')}</Badge>
          {p.strong.length > 0 && <Badge variant="secondary">강한 과목 {p.strong.join('·')}</Badge>}
          {p.weak.length > 0 && <Badge variant="secondary">약한 과목 {p.weak.join('·')}</Badge>}
        </div>

        <Disclosure title="추천 해석 · 가중치·배정 규칙·자료의 한계">
        <div className="rounded-lg border bg-muted/60 px-4 py-3 text-sm" aria-label="이번 분석의 가중치">
          <b className="font-semibold">이번 분석의 비중</b>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {MAIN_COMPS.map(k => <li key={k} className="text-muted-foreground">{COMPONENT_LABEL[k]} <b className="text-foreground tnum">{Math.round((w[k] ?? 0) * 100)}%</b></li>)}
            {w.subjFit != null && <li className="text-muted-foreground">{COMPONENT_LABEL.subjFit} <b className="text-foreground tnum">{Math.round(w.subjFit * 100)}%</b></li>}
          </ul>
        </div>

        <Alert className="border-transparent bg-info-soft [&>svg]:text-info">
          <Info aria-hidden="true" />
          <AlertTitle className="line-clamp-none font-semibold">2027학년도 고양 일반고 배정 방식 (경기도교육청 공식 발표)</AlertTitle>
          <AlertDescription className="text-[0.8125rem] leading-relaxed text-foreground/85">
            <p>평준화 지역입니다. {g.selection}. 학군은 1구역({g.zones['1']})·2구역({g.zones['2']}){homeZone ? ` — 지금 입력한 거주지는 ${homeZone}구역(${ZONE_NAME[homeZone]})` : ''}.</p>
            <p>1단계 {g.stage1.name}: {g.stage1.eligibleSchools} 중 {g.stage1.preferences}개 지망 → {g.stage1.method}. 2단계 {g.stage2.name}: {g.stage2.eligibleStudents}이 {g.stage2.preferences}를 적어 {g.stage2.method}.</p>
            {g.concurrent && <p>{g.concurrent}</p>}
            <p className="text-muted-foreground">
              {Object.values(g.exceptionSchools).join(' · ')} · 외고·국제고·특성화고는 학교별 전형, 운정고(파주)는 비평준화 자체 전형 · {g.limitations[0]}.{' '}
              <a href={g.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary-deep underline-offset-4 hover:underline">출처 <ExternalLink className="size-3" aria-hidden="true" /></a>
            </p>
          </AlertDescription>
        </Alert>

        <Alert className="border-transparent bg-warn-soft [&>svg]:text-warn">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="line-clamp-none font-semibold">읽기 전에 꼭 확인하세요</AlertTitle>
          <AlertDescription className="text-[0.8125rem] leading-relaxed text-foreground/85">
            <p>과목별 성취도(A~E)는 {META.count}개 학교 중 {META.withAchievement}개 학교(운정고)만 확보했습니다(나머지 {META.count - META.withAchievement}개 학교는 학교알리미 CAPTCHA로 조회 불가). 그 학교들의 '면학 분위기'는 졸업생 진학 지표로 <b>추정</b>한 값이고 '강점·약점 과목 궁합'은 중립입니다.</p>
            <p>중점·특색 지정은 학교알리미 공시 문서 제목과 학교 공지 기준이며(지정 통지서 본문은 미열람), 개설 과목은 2026학년도 시간표 기준이라 이후 학년도 개설을 보장하지 않습니다.</p>
            <p><b>{INDICATOR_TITLE}.</b> {INDICATOR_BODY} <Cites ids={INDICATOR_REFS} /></p>
          </AlertDescription>
        </Alert>

        <section aria-label="수학 관점 한눈에" className="rounded-xl border border-primary/25 bg-secondary/40 px-4 py-4">
          <p className="text-xs font-semibold text-primary-deep">5A 수학 관점</p>
          <h3 className="font-bold text-navy">후보 중 수학 선택·심화 과목이 넓은 학교</h3>
          <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {mathTop.map(r => (
              <li key={r.school.id} className="rounded-lg border bg-card px-3 py-2.5">
                <p className="flex items-baseline justify-between gap-2">
                  <b className="font-semibold text-navy">{r.school.short}</b>
                  <span><b className="text-lg font-extrabold text-primary tnum">{r.math.score}</b><small className="text-xs text-muted-foreground">/100</small></span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.math.offered.join(' · ')}</p>
              </li>
            ))}
          </ol>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">수학 경쟁력 = 2026학년도 1·2학년 시간표에서 확인된 선택·심화 수학 과목군(8개) 비율로 만든 추정치입니다. 추천 순위와 별개이며, 학년별 수학 편제는 각 학교 카드의 ‘5A 수학 관점’에 있습니다.</p>
          <IndicatorNote className="mt-1.5" />
        </section>

        </Disclosure>
        <Disclosure title="추천 후보 지도 · 집 기준 거리" mountOnOpen>
        <Suspense fallback={<div className="grid h-88 place-items-center rounded-xl border bg-muted/40 text-sm text-muted-foreground sm:h-104">지도를 불러오는 중…</div>}>
          <MiniMap results={results} origin={origin} originLabel={p.originLabel} homeIsDong={p.dongName != null} />
        </Suspense>
        </Disclosure>

        <Disclosure title="상위 후보 지표 비교표">
        <section aria-label="상위 학교 한눈에 비교" className="rounded-xl border">
          <div className="flex items-baseline justify-between gap-2 px-4 pt-3 pb-2">
            <h3 className="text-sm font-semibold">상위 {compare.length}개 학교 한눈에 비교</h3>
            <span className="text-xs text-muted-foreground">가로로 밀어 보세요</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="text-xs tnum">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky left-0 z-10 bg-card pl-4">학교</TableHead>
                  <TableHead className="text-right">총점</TableHead>
                  <TableHead className="text-right whitespace-nowrap text-primary-deep">수학<br /><span className="text-xs font-normal">경쟁력·추정</span></TableHead>
                  {MAIN_COMPS.map(k => <TableHead key={k} className="text-right">{SHORT[k]}</TableHead>)}
                  <TableHead className="text-right whitespace-nowrap">예상 내신</TableHead>
                  <TableHead className="text-right">거리</TableHead>
                  <TableHead className="text-right pr-4">리뷰</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compare.map((r, i) => (
                  <TableRow key={r.school.id} className={cn(i < 3 && 'bg-secondary/40')}>
                    <TableCell className="sticky left-0 z-10 bg-card pl-4 font-semibold whitespace-nowrap">
                      <span className={cn('mr-1.5 inline-grid size-5 place-items-center rounded-md text-[0.6875rem] font-bold', i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{i + 1}</span>{r.school.short}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary-deep">{r.total}</TableCell>
                    <TableCell className="text-right font-semibold text-primary-deep" title="8개 수학 선택·심화 과목군 중 확인된 비율(추정). 추천 총점과 별도.">{r.math.score ?? '-'}</TableCell>
                    {MAIN_COMPS.map(k => <TableCell key={k} className="text-right">{Math.round(r.comps[k] ?? 0)}</TableCell>)}
                    <TableCell className="text-right whitespace-nowrap">{r.gradeLo == null ? '-' : r.gradeLo === r.gradeHi ? `${r.gradeLo}등급` : `${r.gradeLo}~${r.gradeHi}등급`}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{r.dist == null ? '-' : `${r.dist.toFixed(1)}km`}</TableCell>
                    <TableCell className="text-right pr-4">{REVIEW_COUNT.get(r.school.id) ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <IndicatorNote className="border-t px-4 py-2.5" />
        </section>

        </Disclosure>
        <ol className="flex flex-col gap-4">
          {results.slice(0, shown).map((r, i) => (
            <li key={r.school.id}>
              <BlurFade delay={Math.min(i, 7) * 0.06} inView inViewMargin="-20px">
                <SchoolCard r={r} rank={i + 1} profile={p} rankOf={rankOf.get(r.school.id) ?? {}} n={results.length} />
              </BlurFade>
            </li>
          ))}
        </ol>
        {shown < results.length && (
          <Button variant="outline" className="h-11 w-full rounded-lg" onClick={() => setShown(s => s + PAGE)}>나머지 {results.length - shown}곳 더 보기</Button>
        )}

        <div className="mt-1 flex flex-col gap-4 rounded-xl bg-secondary p-5">
          <div>
            <h3 className="text-lg font-bold text-navy">조건을 바꿔 다시 비교해 보세요</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">희망 계열·입시 전략·통학 거리 중요도를 바꾸거나 관심 있는 학교를 더하면 후보와 순위가 달라집니다. 성취도 자료가 없는 학교는 실제 성적분포를 해당 학교에 직접 확인하는 것을 권합니다.</p>
          </div>
          <Button size="lg" variant="outline" className="h-12 rounded-xl sm:self-start" onClick={onEdit}><Pencil aria-hidden="true" /> 조건 다시 입력</Button>
        </div>
      </CardContent>
    </Card>
  );
}
