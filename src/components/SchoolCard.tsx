import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { COMPONENT_LABEL, COURSE_CAVEAT, explain, fmt, scoreBasis, type CompKey, type Profile, type Result } from '../engine';
import { ScoreBars } from './ScoreBars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const tone = {
  good: 'bg-good-soft text-good border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  bad: 'bg-bad-soft text-bad border-transparent',
  info: 'bg-info-soft text-info border-transparent',
  brand: 'bg-brand-soft text-brand border-transparent',
};

export function SchoolCard({ r, rank, profile, rankOf, n }: { r: Result; rank: number; profile: Profile; rankOf: Partial<Record<CompKey, number>>; n: number }) {
  const [open, setOpen] = useState(false);
  const s = r.school;
  const { pros, cons } = explain(r, profile);
  const basis = scoreBasis(r, profile, rankOf, n);
  const grade = r.gradeLo == null ? null : r.gradeLo === r.gradeHi ? `${r.gradeLo}등급` : `${r.gradeLo}~${r.gradeHi}등급`;
  const years = Object.keys(s.career || {}).sort();
  const top = rank <= 3;

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
            <span>{s.sgg}</span><span>· {s.kind}</span><span>· {s.foundation}</span><span>· 남녀공학</span>
            {r.dist != null && <span className="tnum">· 약 {r.dist.toFixed(1)}km</span>}
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
              <dt className="text-muted-foreground">주소</dt><dd>{s.address}</dd>
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
