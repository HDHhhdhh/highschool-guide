import { ArrowRight, ExternalLink, Info, Pencil, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { ADMISSION, META } from '../data';
import { BANDS, COMPONENT_LABEL, MAIN_COMPS, SCHOOL_TYPES, STRATEGIES, TRACKS, ZONE_NAME, zoneOfSgg, type Analysis, type Profile } from '../engine';
import { MiniMap } from './MiniMap';
import { SchoolCard } from './SchoolCard';
import { BlurFade } from '@/components/magicui/blur-fade';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const PAGE = 8;
const SHORT: Record<string, string> = { naesin: '내신', peer: '면학', adv: '진학', track: '계열', commute: '통학', env: '여건' };

export function Results({ profile: p, analysis, onBook, onEdit }: { profile: Profile; analysis: Analysis; onBook: () => void; onEdit: () => void }) {
  const [shown, setShown] = useState(PAGE);
  const { results, origin, rankOf } = analysis;
  const band = BANDS.find(b => b.id === p.band) || BANDS[2];
  const w = results[0]?.weights ?? {};
  const homeZone = zoneOfSgg(p.sgg);
  const g = ADMISSION.goyang;
  const compare = results.slice(0, Math.min(8, results.length));

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
          <Badge variant="secondary">성적대 {band.label} ({band.desc})</Badge>
          {p.subjectGrades && <Badge variant="secondary">상세 성취도 {Object.entries(p.subjectGrades).map(([s, g]) => `${s} ${'ABCDE'[g - 1]}`).join(' · ')}</Badge>}
          <Badge variant="secondary">희망 {TRACKS[p.track]?.label ?? '아직 모름'}</Badge>
          <Badge variant="secondary">{STRATEGIES[p.strategy].label}</Badge>
          <Badge variant="secondary">일반고{p.types.map(k => ' · ' + (SCHOOL_TYPES[k]?.label ?? k)).join('')}</Badge>
          {p.strong.length > 0 && <Badge variant="secondary">강한 과목 {p.strong.join('·')}</Badge>}
          {p.weak.length > 0 && <Badge variant="secondary">약한 과목 {p.weak.join('·')}</Badge>}
        </div>

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
              {Object.values(g.exceptionSchools).join(' · ')} · 외고·국제고·예술고·특성화고는 학교별 전형, 운정고(파주)는 비평준화 자체 전형 · {g.limitations[0]}.{' '}
              <a href={g.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary-deep underline-offset-4 hover:underline">출처 <ExternalLink className="size-3" aria-hidden="true" /></a>
            </p>
          </AlertDescription>
        </Alert>

        <Alert className="border-transparent bg-warn-soft [&>svg]:text-warn">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="line-clamp-none font-semibold">읽기 전에 꼭 확인하세요</AlertTitle>
          <AlertDescription className="text-[0.8125rem] leading-relaxed text-foreground/85">
            <p>과목별 성취도(A~E)는 {META.count}교 중 {META.withAchievement}교(운정고)만 확보했습니다(나머지 38교는 학교알리미 CAPTCHA로 조회 불가). 그 학교들의 '면학 분위기'는 졸업생 진학 지표로 <b>추정</b>한 값이고 '강점·약점 과목 궁합'은 중립입니다.</p>
            <p>중점·특색 지정은 학교알리미 공시 문서 제목과 학교 공지 기준이며(지정 통지서 본문은 미열람), 개설 과목은 2026학년도 시간표 기준이라 이후 학년도 개설을 보장하지 않습니다.</p>
          </AlertDescription>
        </Alert>

        <MiniMap results={results} origin={origin} originLabel={p.originLabel} />

        <section aria-label="상위 학교 한눈에 비교" className="rounded-xl border">
          <div className="flex items-baseline justify-between gap-2 px-4 pt-3 pb-2">
            <h3 className="text-sm font-semibold">상위 {compare.length}개교 한눈에 비교</h3>
            <span className="text-xs text-muted-foreground">가로로 밀어 보세요</span>
          </div>
          <div className="overflow-x-auto">
            <Table className="text-xs tnum">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky left-0 z-10 bg-card pl-4">학교</TableHead>
                  <TableHead className="text-right">총점</TableHead>
                  {MAIN_COMPS.map(k => <TableHead key={k} className="text-right">{SHORT[k]}</TableHead>)}
                  <TableHead className="text-right whitespace-nowrap">수학 경쟁력<br /><span className="text-[10px] font-normal">과목 폭 · 추정</span></TableHead>
                  <TableHead className="text-right whitespace-nowrap">예상 내신</TableHead>
                  <TableHead className="text-right pr-4">거리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compare.map((r, i) => (
                  <TableRow key={r.school.id} className={cn(i < 3 && 'bg-secondary/40')}>
                    <TableCell className="sticky left-0 z-10 bg-card pl-4 font-semibold whitespace-nowrap">
                      <span className={cn('mr-1.5 inline-grid size-5 place-items-center rounded-md text-[0.6875rem] font-bold', i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{i + 1}</span>{r.school.short}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary-deep">{r.total}</TableCell>
                    {MAIN_COMPS.map(k => <TableCell key={k} className="text-right">{Math.round(r.comps[k] ?? 0)}</TableCell>)}
                    <TableCell className="text-right" title="8개 수학 선택·심화 과목군 중 확인된 비율. 추천 총점과 별도.">{r.math.score ?? '-'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{r.gradeLo == null ? '-' : r.gradeLo === r.gradeHi ? `${r.gradeLo}등급` : `${r.gradeLo}~${r.gradeHi}등급`}</TableCell>
                    <TableCell className="text-right pr-4 whitespace-nowrap">{r.dist == null ? '-' : `${r.dist.toFixed(1)}km`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

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
            <h3 className="text-lg font-bold text-navy">이 결과를 가지고 상담해 보시겠어요?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">입력한 성적대·희망 계열·강약 과목과 추천 상위 3개교가 예약 폼에 그대로 담깁니다. 성취도 자료가 없는 학교는 상담에서 실제 성적분포를 함께 확인하는 것을 권합니다.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="h-12 rounded-xl" onClick={onBook}>이 결과로 진단평가 예약하기 <ArrowRight aria-hidden="true" /></Button>
            <Button size="lg" variant="outline" className="h-12 rounded-xl" onClick={onEdit}><Pencil aria-hidden="true" /> 조건 다시 입력</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
