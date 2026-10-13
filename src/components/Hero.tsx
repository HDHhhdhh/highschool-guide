import { ArrowRight, CalendarCheck } from 'lucide-react';
import { META } from '../data';
import { BlurFade } from '@/components/magicui/blur-fade';
import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';

const STATS = [
  { label: '비교 대상 고등학교', value: META.count },
  { label: '졸업생 진로 데이터', value: META.withCareer },
  { label: '과목별 성취도 확보', value: META.withAchievement },
];

export function Hero({ onStart, onBook }: { onStart: () => void; onBook: () => void }) {
  return (
    <section className="bg-gradient-to-b from-muted to-background">
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
        <BlurFade delay={0.05}>
          <p className="text-sm font-semibold tracking-wide text-primary-deep">일산·고양 학부모를 위한 고교 선택 가이드</p>
        </BlurFade>
        <BlurFade delay={0.12}>
          <h1 className="mt-3 text-[1.9rem] leading-[1.22] font-extrabold tracking-[-0.02em] text-navy sm:text-5xl sm:leading-[1.15]">
            우리 아이에게 맞는 고등학교,
            <br />
            <span className="text-primary">공시 데이터</span>로 차분하게 비교해 보세요
          </h1>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            고양시 고등학교 {META.count}곳의 학생 수·졸업생 진로·개설 과목·교육 여건·학업중단율과 2027학년도 배정 규칙을 아이의 성적대와 희망 계열,
            통학 거리에 맞춰 여섯 관점으로 정리합니다. 입력한 정보는 이 화면 안에서만 계산되고 어디에도 저장되지 않습니다.
          </p>
        </BlurFade>
        <BlurFade delay={0.28}>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-13 rounded-xl px-6 text-base sm:h-12" onClick={onStart}>
              학교 추천 시작하기 <ArrowRight aria-hidden="true" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 rounded-xl px-6 text-base sm:h-12" onClick={onBook}>
              <CalendarCheck aria-hidden="true" /> 진단평가 예약하기
            </Button>
          </div>
        </BlurFade>
        <dl className="mt-9 grid grid-cols-3 gap-2 sm:gap-3">
          {STATS.map((s, i) => (
            <BlurFade key={s.label} delay={0.34 + i * 0.07}>
              <div className="rounded-xl border bg-card px-3 py-3 shadow-card sm:px-4">
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 text-xl font-bold text-primary tnum sm:text-2xl">
                  <NumberTicker value={s.value} className="text-primary" />교
                </dd>
              </div>
            </BlurFade>
          ))}
        </dl>
      </div>
    </section>
  );
}
