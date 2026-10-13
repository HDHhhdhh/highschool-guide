// 폼 조립 블록 — shadcn/ui 프리미티브(RadioGroup·Label·Button·Badge) 위의 얇은 패턴.
// "radio cards"(라벨 카드 안에 RadioGroupItem) 패턴과 aria-pressed 토글 칩만 정의한다.
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export function FieldBlock({ num, label, tag, required, hint, children }: { num?: number; label: ReactNode; tag?: ReactNode; required?: boolean; hint?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-3 flex items-center gap-2 text-[1.0625rem] font-semibold">
        {num != null && <span className="inline-grid size-6.5 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{num}</span>}
        <span>{label}</span>
        {required ? <Badge className="bg-brand-soft text-primary-deep border-transparent">필수</Badge> : tag ? <Badge variant="secondary" className="font-medium text-muted-foreground">{tag}</Badge> : null}
      </legend>
      <div className="min-w-0">{children}</div>
      {hint && <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{hint}</p>}
    </fieldset>
  );
}

/** 라디오 카드 그룹 (성별·통학 중요도·성적대·전략) */
export function RadioCards<T extends string | number>({ value, onChange, options, label, columns = 1, compact }: {
  value: T; onChange: (v: T) => void; label: string; columns?: 1 | 2 | 3; compact?: boolean;
  options: { value: T; title: ReactNode; desc?: ReactNode; hint?: ReactNode }[];
}) {
  const cols = columns === 3 ? 'sm:grid-cols-3' : columns === 2 ? 'sm:grid-cols-2' : '';
  return (
    <RadioGroup value={String(value)} onValueChange={v => onChange((typeof value === 'number' ? Number(v) : v) as T)} aria-label={label} className={cn('grid grid-cols-1 gap-2', compact && 'grid-cols-2 sm:grid-cols-3', cols)}>
      {options.map(o => {
        const id = `${label}-${String(o.value)}`;
        const on = o.value === value;
        return (
          <Label
            key={String(o.value)}
            htmlFor={id}
            className={cn(
              'flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors',
              'hover:border-primary/50 hover:bg-secondary/40',
              on && 'border-primary bg-secondary ring-1 ring-primary',
            )}
          >
            <RadioGroupItem id={id} value={String(o.value)} className="mt-0.5 shrink-0" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className={cn('text-[0.9375rem] font-semibold leading-tight', on && 'text-primary-deep')}>{o.title}</span>
              {o.desc && <span className="text-[0.8125rem] leading-snug text-muted-foreground">{o.desc}</span>}
              {o.hint && <span className="text-xs leading-snug text-muted-foreground/80">{o.hint}</span>}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

/** 토글 칩 (다중 선택: 강·약 과목, 학교 유형) 과 단일 선택 칩 (희망 계열) */
export function Chip({ on, disabled, onClick, children, hint, role = 'button' }: { on: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; hint?: ReactNode; role?: 'button' | 'radio' }) {
  return (
    <button
      type="button"
      role={role}
      aria-pressed={role === 'button' ? on : undefined}
      aria-checked={role === 'radio' ? on : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 flex-col items-center justify-center gap-0 rounded-full border bg-card px-4 py-1.5 text-[0.9375rem] font-medium text-foreground/80 transition-colors',
        'hover:border-primary/50 hover:bg-secondary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        on && 'border-primary bg-secondary text-primary-deep',
      )}
    >
      <span>{children}</span>
      {hint && <span className={cn('text-xs leading-none text-muted-foreground', on && 'text-primary-deep/80')}>{hint}</span>}
    </button>
  );
}
