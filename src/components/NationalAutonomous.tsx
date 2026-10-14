import { ExternalLink } from 'lucide-react';
import { NATIONAL_SCHOOLS } from '../data/nationalAutonomous';
import { Badge } from '@/components/ui/badge';

export function NationalAutonomous() {
  return (
    <section id="national" className="rounded-2xl border bg-card p-5 shadow-card sm:p-6">
      <p className="text-sm font-semibold text-primary-deep">참고 · 전국단위 모집 학교</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy">전국단위 자사고 비교</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        고양·일산 평준화 배정과 별개로 <b className="font-semibold text-foreground/80">전국에서 지원·선발</b>하는 학교입니다.
        수학·이과나 의치한 진학을 고려한다면 함께 살펴볼 만합니다. 입결과 전형은 해마다 달라지니 각 학교 공식 입학요강으로 확인하세요.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NATIONAL_SCHOOLS.map(s => (
          <article key={s.name} className="flex flex-col gap-2 rounded-xl border bg-secondary/30 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-navy">{s.name}</h3>
              <Badge variant={s.type === '전국단위 자사고' ? 'secondary' : 'outline'} className="shrink-0">{s.type}</Badge>
            </div>
            <p className="flex flex-wrap gap-x-2 text-[0.8125rem] text-muted-foreground">
              <span>{s.region}</span><span>· {s.gender}</span>{s.boarding && <span>· 기숙사</span>}
            </p>
            {s.founder && <p className="text-xs text-muted-foreground">설립·운영: {s.founder}</p>}
            <p className="text-sm leading-relaxed">{s.note}</p>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(s.q)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex w-fit items-center gap-1 pt-1 text-xs text-primary-deep underline-offset-4 hover:underline"
            >
              더 알아보기 <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        ※ 전국단위 자사고 10곳과 전국모집 공립 한민고를 모았습니다. 참고용 정보이며 이 사이트의 추천 점수·배정 계산과는 무관합니다.
      </p>
    </section>
  );
}
