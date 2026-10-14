// 홈 화면의 학교별 리뷰 모아보기 — 추천을 돌리지 않아도 학교별 리뷰를 바로 볼 수 있게 한다.
import { MessageSquareQuote } from 'lucide-react';
import { useState } from 'react';
import { REVIEWS, SCHOOLS } from '../data';
import { ReviewList, sourceLabel } from './ReviewList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUNT = new Map<string, number>();
REVIEWS.forEach(r => COUNT.set(r.schoolId, (COUNT.get(r.schoolId) ?? 0) + 1));
const OPTIONS = [...SCHOOLS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const MOST_REVIEWED = [...OPTIONS].sort((a, b) => (COUNT.get(b.id) ?? 0) - (COUNT.get(a.id) ?? 0))[0];
const MATH_COUNT = REVIEWS.filter(r => r.category === '수학').length;
// 가장 많이 모인 출처 3곳 (데이터에서 계산)
const TOP_SOURCES = [...REVIEWS.reduce((m, r) => m.set(sourceLabel(r.source), (m.get(sourceLabel(r.source)) ?? 0) + 1), new Map<string, number>())]
  .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([label]) => label);

export function ParentReviews() {
  const [id, setId] = useState(MOST_REVIEWED.id);
  const school = SCHOOLS.find(s => s.id === id) ?? MOST_REVIEWED;
  const list = REVIEWS.filter(r => r.schoolId === school.id);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="rounded-2xl border bg-card p-5 shadow-card sm:p-8">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
        <MessageSquareQuote className="size-4" aria-hidden="true" /> 학교별 리뷰 <span className="tnum">{REVIEWS.length}건</span>
      </p>
      <h2 id="reviews-title" className="mt-1 text-2xl font-bold tracking-tight text-navy">학교별 리뷰 모아보기</h2>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {TOP_SOURCES.join('·')} 등 공개 게시글에서 {COUNT.size}개 학교의 리뷰 {REVIEWS.length}건을 모아 <b className="font-semibold text-foreground/80">수학 {MATH_COUNT}건 · 비수학 {REVIEWS.length - MATH_COUNT}건</b>으로 나눴습니다.
        발췌이므로 ‘원문 보기’가 있는 글은 원문에서 맥락을 꼭 확인하세요.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label id="reviews-school-label" className="text-sm font-semibold text-foreground/80">학교 선택</label>
        <Select value={school.id} onValueChange={setId}>
          <SelectTrigger aria-labelledby="reviews-school-label" className="h-11! w-full rounded-lg bg-card text-[0.9375rem] sm:w-80"><SelectValue /></SelectTrigger>
          <SelectContent>
            {OPTIONS.map(s => <SelectItem key={s.id} value={s.id}>{s.short} ({s.sgg}) · 리뷰 {COUNT.get(s.id) ?? 0}건</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        <ReviewList key={school.id} reviews={list} label={school.name} initial={3} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">리뷰는 개인 경험으로 공시 자료와 구분하며 추천 점수에 넣지 않습니다. 학교·교육청의 공식 정보와 함께 보세요.</p>
    </section>
  );
}
