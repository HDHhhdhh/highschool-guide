import type { View } from '../App';
import { SITE } from '../config';
import logo from '@/assets/5a-logo.png';
import { cn } from '@/lib/utils';

const NAV: { v: View; label: string }[] = [
  { v: 'finder', label: '학교 추천' },
  { v: 'booking', label: '진단평가 예약' },
];

export function TopBar({ view, onNav }: { view: View; onNav: (v: View) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#finder" onClick={e => { e.preventDefault(); onNav('finder'); }} className="flex min-w-0 items-center gap-2.5" aria-label={`5A 수학학원 ${SITE.name} 홈`}>
          {/* 흰 배경의 검정 로고: multiply 블렌드로 바탕색에 자연스럽게 얹힘 */}
          <img src={logo} alt="5A 수학학원" width={495} height={179} className="h-7 w-auto shrink-0 mix-blend-multiply sm:h-8" />
          <span className="hidden items-center gap-2.5 text-[0.9375rem] font-bold text-navy sm:flex" aria-hidden="true">
            <span className="h-4 w-px bg-border" />
            {SITE.name}
          </span>
        </a>
        <nav aria-label="주요 메뉴" className="flex shrink-0 items-center gap-1 rounded-full bg-muted p-1">
          {NAV.map(n => (
            <a
              key={n.v}
              href={`#${n.v}`}
              aria-current={view === n.v ? 'page' : undefined}
              onClick={e => { e.preventDefault(); onNav(n.v); }}
              className={cn(
                'inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors',
                view === n.v ? 'bg-card text-primary-deep shadow-card' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
