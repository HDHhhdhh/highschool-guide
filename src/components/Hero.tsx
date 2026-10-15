import { ArrowRight } from 'lucide-react';
import { SITE } from '../config';
import { META, REVIEWS } from '../data';
import { BlurFade } from '@/components/magicui/blur-fade';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Hero({ onStart, onReviews }: { onStart: () => void; onReviews: () => void }) {
  const stats = [
    { label: '비교 대상 고등학교', value: META.count, unit: '개 학교' },
    { label: '수학 교과 편제 확인', value: META.withCourses, unit: '개 학교' },
    { label: '학교별 리뷰', value: REVIEWS.length, unit: '건', onClick: onReviews },
  ];
  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
        <BlurFade delay={0.05}>
          <p className="text-sm font-semibold tracking-wide text-primary-deep">5A 수학학원 · {SITE.name}</p>
        </BlurFade>
        <BlurFade delay={0.12}>
          <h1 className="mt-3 text-[1.9rem] leading-[1.22] font-extrabold tracking-[-0.02em] text-navy sm:text-5xl sm:leading-[1.15]">
            궁금한 고등학교,
            <span className="block text-balance"><span className="text-primary">학교 정보를 한눈에</span> 확인하세요</span>
          </h1>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            고양시 고등학교 {META.count}곳의 수학 선택·심화 과목 편제와 졸업생 진로, 교육 여건, 2027학년도 배정 규칙, 학교별 리뷰를
            학교별로 모았습니다. 먼저 궁금한 학교를 찾아보고, 교빛 기사로 정보를 해석해 보세요. 조건별 추천은 참고용 보조 도구입니다.
          </p>
        </BlurFade>
        <BlurFade delay={0.28}>
          <div className="mt-7 flex flex-col sm:flex-row">
            <Button size="lg" className="h-13 rounded-xl px-6 text-base sm:h-12" onClick={onStart}>
              학교 정보 찾아보기 <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </BlurFade>
        <ul className="mt-9 grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map((s, i) => {
            const body = (
              <>
                <span className="block text-xs text-muted-foreground">{s.label}</span>
                <span className="mt-1 block text-xl font-bold text-primary tnum sm:text-2xl">
                  <NumberTicker value={s.value} className="text-primary" />
                  <span className="ml-0.5 text-sm font-semibold whitespace-nowrap sm:text-base">{s.unit}</span>
                </span>
                {s.onClick && <span className="mt-0.5 block text-xs font-medium text-primary-deep">모아보기 →</span>}
              </>
            );
            const card = 'block h-full w-full rounded-xl border bg-card px-3 py-3 text-left shadow-card sm:px-4';
            return (
              <li key={s.label}>
                <BlurFade delay={0.34 + i * 0.07} className="h-full">
                  {s.onClick ? (
                    <button type="button" onClick={s.onClick} className={cn(card, 'transition-colors outline-none hover:border-primary/50 hover:bg-secondary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50')}>
                      {body}
                    </button>
                  ) : (
                    <div className={card}>{body}</div>
                  )}
                </BlurFade>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
