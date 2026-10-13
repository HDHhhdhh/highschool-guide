import { COMPONENT_LABEL, MAIN_COMPS, type CompKey, type Result } from '../engine';
import { Progress } from '@/components/ui/progress';

// 좁은 막대 라벨 칸에 맞춘 짧은 이름 (나머지 화면은 COMPONENT_LABEL 그대로)
const BAR_LABEL: Record<CompKey, string> = { ...COMPONENT_LABEL, subjFit: '과목 궁합' };

export function ScoreBars({ r }: { r: Result }) {
  const keys: CompKey[] = [...MAIN_COMPS, ...(['subjFit'] as CompKey[]).filter(k => r.comps[k] != null)];
  return (
    <ul className="flex flex-col gap-2" aria-label="관점별 점수">
      {keys.map(k => {
        const v = Math.round(r.comps[k] ?? 0);
        const est = k === 'peer' && !r.flags.achievement;
        const neutral = k === 'subjFit' && !r.fit;
        const w = r.weights[k] ?? 0;
        return (
          <li key={k} className="grid grid-cols-[6.75rem_1fr_2rem_2.25rem] items-center gap-2 text-sm sm:grid-cols-[9rem_1fr_2.25rem_2.5rem]">
            <span className="flex flex-wrap items-center gap-1 font-medium text-foreground/80">
              {BAR_LABEL[k]}
              {est && <span className="rounded-full bg-warn-soft px-1.5 text-xs leading-5 whitespace-nowrap text-warn" title="직접 측정한 지표가 아니라 공시 지표로 추정한 값">추정</span>}
              {neutral && <span className="rounded-full bg-warn-soft px-1.5 text-xs leading-5 whitespace-nowrap text-warn" title="성적분포가 없어 중립값">중립</span>}
            </span>
            <Progress value={v} className="h-2.5 bg-muted" aria-label={`${COMPONENT_LABEL[k]} ${v}점`} />
            <span className="text-right font-semibold tnum">{v}</span>
            <span className="text-right text-xs text-muted-foreground tnum" title="이번 분석에서 이 관점이 차지하는 비중">{Math.round(w * 100)}%</span>
          </li>
        );
      })}
    </ul>
  );
}
