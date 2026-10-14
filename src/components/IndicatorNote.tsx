// '성취도 비율·지표 ≠ 학교 실력' 안내 (운영자 요청) — 성취도·수학 경쟁력·추천 점수가 보이는 곳마다 같은 문장을 붙인다.
// 근거: A 비율에는 입학생 수준·평가 조건이 함께 반영되고(교육을 비추다 2026.9.11), A 기준(분할점수)은 학교·과목마다 다르며
// (2026.5.3), 해마다 출제가 달라질 수 있다(2025.12.7).
import { Info } from 'lucide-react';
import type { RefId } from '../data/references';
import { cn } from '@/lib/utils';

export const INDICATOR_TITLE = '성취도 비율·지표 ≠ 학교 실력';
export const INDICATOR_BODY = '성취도 A 비율, 수학 경쟁력, 추천 점수는 학교의 실력이나 교육의 질을 그대로 나타내지 않습니다. A 비율에는 입학생 수준과 시험 난이도, 학교·과목마다 다른 A 기준(분할점수)이 함께 반영되고 해마다 달라질 수 있어, 여러 요인 중 하나로 참고만 하세요.';
export const INDICATOR_REFS: RefId[] = ['gradeVsA', 'schoolinfoGuide', 'schoolinfoA'];

/** 한 줄짜리 주의 문구 (카드·표 아래) */
export function IndicatorNote({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground', className)}>
      <Info className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden="true" />
      <span>
        <b className="font-semibold text-foreground/80">{INDICATOR_TITLE}.</b> 점수·성취도·수학 경쟁력은 입학생 수준, 시험 난이도와 A 기준, 수강 인원 등이 섞인 참고 지표입니다.
      </span>
    </p>
  );
}
