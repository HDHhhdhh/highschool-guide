// 출처 표시 — 인용한 문장 끝에는 원문 링크(Cite·Cites), '어떻게 분석하나요?' 아래에는 전체 목록(SourceList).
// 외부 자료의 사실·수치는 src/data/references.ts 에 등록한 원문으로만 인용한다.
import { ExternalLink } from 'lucide-react';
import { LIBRARIES, REFS, type RefId } from '../data/references';
import { cn } from '@/lib/utils';

/** '2026-09-24' → '2026.9.24' */
const dotDate = (d: string) => d.replace(/^(\d{4})-0?(\d{1,2})-0?(\d{1,2})$/, '$1.$2.$3');
const LINK = 'inline-flex items-center gap-0.5 font-medium text-primary-deep underline-offset-4 hover:underline';

/** 문장 끝 출처 링크 '교육을 비추다 2026.9.24 ↗' — 원문 제목은 툴팁·스크린리더로 전한다 */
export function Cite({ id, className }: { id: RefId; className?: string }) {
  const r = REFS[id];
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noreferrer"
      title={`${r.publisher} 「${r.title}」${r.date ? ` ${dotDate(r.date)}` : ''}`}
      aria-label={`출처: ${r.publisher} 「${r.title}」 (새 창)`}
      className={cn(LINK, 'text-xs whitespace-nowrap', className)}
    >
      {r.publisher}{r.date && ` ${dotDate(r.date)}`}
      <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  );
}

/** 한 문장에 출처가 여럿일 때: '출처 A ↗ · B ↗' */
export function Cites({ ids, className }: { ids: RefId[]; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 align-baseline text-xs text-muted-foreground', className)}>
      <span>출처</span>
      {ids.map((id, i) => (
        <span key={id} className="inline-flex items-center gap-1.5">
          <Cite id={id} />
          {i < ids.length - 1 && <span aria-hidden="true">·</span>}
        </span>
      ))}
    </span>
  );
}

/** 전체 출처 목록 (원문 제목·날짜·링크) + 자료를 찾은 경로 */
export function SourceList({ ids, title = '참고 자료 (원문 링크)', className }: { ids: RefId[]; title?: string; className?: string }) {
  return (
    <section aria-label={title} className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      <h3 className="font-semibold text-foreground/80">{title}</h3>
      <ol className="mt-1.5 flex list-decimal flex-col gap-1 pl-4">
        {ids.map(id => {
          const r = REFS[id];
          return (
            <li key={id}>
              {r.publisher},{' '}
              <a href={r.url} target="_blank" rel="noreferrer" className="text-primary-deep underline-offset-4 hover:underline">「{r.title}」</a>
              {r.date && ` (${dotDate(r.date)})`}
            </li>
          );
        })}
      </ol>
      <p className="mt-2">
        기사·글은 운영자가 제공한 자료실{' '}
        {Object.values(LIBRARIES).map((l, i) => (
          <span key={l.url}>
            {i > 0 && ' · '}
            <a href={l.url} target="_blank" rel="noreferrer" className={cn(LINK, 'font-normal')}>
              {l.name}<ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </span>
        ))}
        에서 찾아 원문을 확인한 뒤 요약했습니다. 각 글의 권리는 원저작자에게 있으며, 입시 정보는 발행 시점 기준이니 지원 학년도의 공식 자료로 다시 확인하세요.
      </p>
    </section>
  );
}
