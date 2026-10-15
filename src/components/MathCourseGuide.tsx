// 고교학점제 수학 과목 선택 가이드 (2022 개정) — 과목 체계 → 계열별 흐름(탭) → 고르기 전 확인할 것.
// 내용은 src/data/mathGuide.ts, 출처는 src/data/references.ts. 학교별 편제는 결과 카드의 '5A 수학 관점'에 있다.
import { ListChecks } from 'lucide-react';
import { COURSE_MAP, GUIDE_CHECKS, GUIDE_TRACKS, type CourseTier } from '../data/mathGuide';
import { Cites } from './SourceLinks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// 과목 칩 — 학교 카드의 수학 편제 칩과 같은 규칙(주황 = 강조)으로 맞춘다
const TIER_CHIP: Record<CourseTier, string> = {
  base: 'bg-card text-foreground/80',
  rec: 'border-primary/40 bg-primary/10 font-semibold text-primary-deep',
  opt: 'border-dashed border-input bg-card text-muted-foreground',
};
const TIER_LEGEND: { tier: CourseTier; label: string; desc: string }[] = [
  { tier: 'base', label: '기본', desc: '공통·수능 범위' },
  { tier: 'rec', label: '권장', desc: '대학 권장 사례가 있는 과목' },
  { tier: 'opt', label: '선택', desc: '관심·학교 개설에 따라' },
];
const chip = (tier: CourseTier) => cn('rounded-full border px-2.5 py-0.5 text-[0.8125rem]', TIER_CHIP[tier]);

export function MathCourseGuide() {
  return (
    <section id="math-guide" aria-labelledby="math-guide-title" className="rounded-2xl border bg-card p-5 shadow-card sm:p-8">
      <p className="text-sm font-semibold text-primary-deep">고교학점제 · 2022 개정 교육과정</p>
      <h2 id="math-guide-title" className="mt-1 text-2xl font-bold tracking-tight text-navy">수학 과목 선택 가이드</h2>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        2025년 고1부터 적용된 2022 개정 교육과정 기준입니다. 공통수학 → 일반선택 → 진로·융합선택 순서로 쌓이며,
        어떤 과목을 몇 학년에 여는지는 학교 편제마다 다릅니다. 특정 학교가 아니라 계열별로 일반적인 흐름을 정리했습니다.
      </p>

      <ol aria-label="2022 개정 고등학교 수학 과목 체계" className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
        {COURSE_MAP.map(g => (
          <li key={g.group} className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-3.5">
            <p className="flex flex-col">
              <b className="text-sm font-bold whitespace-nowrap text-navy">{g.group}</b>
              <span className="text-xs text-muted-foreground">{g.when}</span>
            </p>
            <ul className="flex flex-wrap gap-1">
              {g.courses.map(c => <li key={c} className={chip('base')}>{c}</li>)}
            </ul>
            <p className="mt-auto text-xs leading-snug text-muted-foreground">{g.note}</p>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        과학계열 선택 과목(전문 수학·이산 수학·고급 기하·고급 대수·고급 미적분)은 과학고 등에서 주로 열고, 일반고는 일부 학교만 엽니다.{' '}
        <Cites ids={['goeCourses', 'goeScience', 'kicePlan']} />
      </p>

      <h3 className="mt-7 text-lg font-bold tracking-tight text-navy">계열별로 이렇게 이어 가세요</h3>
      <Tabs defaultValue={GUIDE_TRACKS[0].id} className="mt-3">
        <TabsList aria-label="희망 계열" className="w-full group-data-[orientation=horizontal]/tabs:h-auto sm:w-auto">
          {GUIDE_TRACKS.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="h-auto flex-col gap-0 px-3 py-1.5 sm:flex-row sm:gap-1.5">
              <span className="font-semibold">{t.label}</span>
              <span className="text-xs font-normal text-muted-foreground">{t.sub}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {GUIDE_TRACKS.map(t => (
          <TabsContent key={t.id} value={t.id} className="mt-2 flex flex-col gap-4">
            <p className="text-[0.9375rem] font-medium leading-relaxed text-foreground/85">{t.summary}</p>
            <ol aria-label={`${t.label} 수학 과목 순서`} className="flex flex-col gap-2.5">
              {t.stages.map((s, i) => (
                <li key={s.stage} className="grid grid-cols-[6.25rem_1fr] items-start gap-3 sm:grid-cols-[8rem_1fr]">
                  <span className="flex items-center gap-1.5 pt-0.5 text-xs font-semibold text-muted-foreground">
                    <span className="inline-grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.6875rem] font-bold text-secondary-foreground">{i + 1}</span>
                    {s.stage}
                  </span>
                  <ul className="flex flex-wrap gap-1.5">
                    {s.courses.map(c => (
                      <li key={c.name} className={chip(c.tier)}>
                        {c.name}{c.hint && <span className="font-normal opacity-80"> · {c.hint}</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <ul aria-label="과목 칩 범례" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {TIER_LEGEND.map(l => (
                <li key={l.tier} className="flex items-center gap-1.5">
                  <span className={cn(chip(l.tier), 'px-2 text-xs')}>{l.label}</span>{l.desc}
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-2">
              {t.points.map(pt => (
                <li key={pt.text} className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground/85">
                  {pt.text}
                  <Cites ids={pt.refs} className="mt-1 flex" />
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 rounded-xl border border-primary/25 bg-secondary/40 p-4 sm:p-5">
        <h3 className="flex items-center gap-1.5 font-bold text-navy">
          <ListChecks className="size-4 shrink-0 text-primary-deep" aria-hidden="true" /> 어느 계열이든, 고르기 전에 확인할 네 가지
        </h3>
        <ol className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {GUIDE_CHECKS.map((c, i) => (
            <li key={c.title} className="flex flex-col rounded-lg border bg-card p-3.5">
              <p className="text-sm font-semibold text-primary-deep">{i + 1}. {c.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{c.text}</p>
              <Cites ids={c.refs} className="mt-auto flex pt-1.5" />
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        학교별 2026학년도 수학 편제는 위 ‘궁금한 학교 정보를 한눈에’에서 학교를 골라 확인하세요. 이 가이드는 일반적인 흐름이며,
        대학별 권장 과목과 반영 방식은 해마다 바뀔 수 있어 지원 학년도의 공식 안내로 다시 확인하세요.
      </p>
    </section>
  );
}
