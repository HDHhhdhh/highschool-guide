import { SITE } from '../config';
import logo from '@/assets/logo-5a-x.png';

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4 sm:px-6">
        <a href="./" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex min-w-0 items-center gap-2.5" aria-label={`5A 수학학원 ${SITE.name} 홈`}>
          {/* 여백을 잘라 투명 배경으로 만든 가로형 로고 (src/assets/logo-5a-x.png, 583×120) */}
          <img src={logo} alt="5A 수학학원" width={583} height={120} className="h-7 w-auto shrink-0 sm:h-9" />
          <span className="hidden items-center gap-2.5 text-[0.9375rem] font-bold text-navy sm:flex" aria-hidden="true">
            <span className="h-4 w-px bg-border" />
            {SITE.name}
          </span>
        </a>
      </div>
    </header>
  );
}
