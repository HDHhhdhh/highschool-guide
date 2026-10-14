// 학교별 리뷰 목록 — 수학/비수학 탭, 원문 출처 링크, 처음 몇 건 + 더 보기.
// 리뷰는 공개 게시글 발췌이며 공시 자료와 구분하고 추천 점수에 넣지 않는다.
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { ParentReview } from '../engine';
import { articleUrl } from '../lib/reviewLink';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export const REVIEW_CATEGORIES = ['수학', '비수학'] as const;
type Category = (typeof REVIEW_CATEGORIES)[number];

const SOURCE_LABEL: Record<string, string> = {
  'cafe.naver.com': '네이버 카페', 'blog.naver.com': '네이버 블로그', 'm.blog.naver.com': '네이버 블로그', 'kin.naver.com': '네이버 지식iN',
  'namu.wiki': '나무위키', 'studyholic.com': '스터디홀릭', 'manager.studyholic.com': '스터디홀릭', 'instagram.com': '인스타그램',
  'youtube.com': '유튜브', 'facebook.com': '페이스북', 'jobplanet.co.kr': '잡플래닛', 'gall.dcinside.com': '디시인사이드', 'dcinside.com': '디시인사이드',
  'realty.daangn.com': '당근', 'localnaeil.com': '내일신문',
};
export const sourceLabel = (source: string) => SOURCE_LABEL[source] ?? source;

/** "제목 — 본문" 형태로 모은 발췌를 제목과 본문으로 나눈다 */
function splitText(text: string): { title: string | null; body: string } {
  const i = text.indexOf(' — ');
  return i > 0 ? { title: text.slice(0, i), body: text.slice(i + 3) } : { title: null, body: text };
}

export function ReviewCard({ review }: { review: ParentReview }) {
  const { title, body } = splitText(review.text);
  const link = articleUrl(review.url); // 카페 첫 화면 등 특정 글이 아닌 주소는 '원문 보기'를 숨긴다
  return (
    <li className="rounded-lg border bg-card px-4 py-3">
      <figure>
        {title && <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>}
        <blockquote className={cn('break-words text-sm leading-relaxed text-foreground/80', title && 'mt-1')}>{body}</blockquote>
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">{sourceLabel(review.source)}</span>
          {review.date && <time dateTime={review.date}>{review.date}</time>}
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-0.5 font-medium text-primary-deep underline-offset-4 hover:underline">
              원문 보기 <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </figcaption>
      </figure>
    </li>
  );
}

export function ReviewList({ reviews, label, initial = 3 }: { reviews: ParentReview[]; label: string; initial?: number }) {
  const count = (c: Category) => reviews.filter(r => r.category === c).length;
  const [tab, setTab] = useState<Category>(count('수학') ? '수학' : '비수학');
  const [expanded, setExpanded] = useState(false);
  if (!reviews.length) return <p className="rounded-lg bg-muted/60 px-4 py-4 text-sm text-muted-foreground">아직 모은 학교별 리뷰가 없습니다.</p>;

  return (
    <Tabs value={tab} onValueChange={v => { setTab(v as Category); setExpanded(false); }}>
      <TabsList aria-label={`${label} 리뷰 분류`} className="w-full sm:w-auto">
        {REVIEW_CATEGORIES.map(c => (
          <TabsTrigger key={c} value={c} className="px-3">
            {c} 리뷰 <span className="tnum text-muted-foreground">{count(c)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {REVIEW_CATEGORIES.map(c => {
        const entries = reviews.filter(r => r.category === c);
        const shown = expanded ? entries : entries.slice(0, initial);
        return (
          <TabsContent key={c} value={c} className="mt-1">
            {entries.length ? (
              <>
                <ul className="flex flex-col gap-2">
                  {shown.map((r, i) => <ReviewCard key={`${r.url ?? r.source}-${i}`} review={r} />)}
                </ul>
                {entries.length > initial && (
                  <Button type="button" variant="ghost" size="sm" className="mt-1.5 h-9 w-full text-primary-deep" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
                    {expanded ? `${c} 리뷰 접기` : `${c} 리뷰 ${entries.length - initial}건 더 보기`}
                    <ChevronDown className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
                  </Button>
                )}
              </>
            ) : (
              <p className="rounded-lg bg-muted/60 px-4 py-4 text-sm text-muted-foreground">아직 모은 {c} 리뷰가 없습니다.</p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
