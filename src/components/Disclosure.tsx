import { ChevronDown } from 'lucide-react';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

const DisclosureContext = createContext<{
  openCards: Record<string, boolean>;
  setOpen: (id: string, open: boolean) => void;
  jump: (id: string) => void;
} | null>(null);

export function DisclosureProvider({ children }: { children: ReactNode }) {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});
  const setOpen = (id: string, open: boolean) => setOpenCards(cards => ({ ...cards, [id]: open }));
  const jump = (id: string) => {
    const target = document.getElementById(id);
    const cardId = target?.closest<HTMLElement>('[data-disclosure-id]')?.dataset.disclosureId;
    if (cardId) flushSync(() => setOpen(cardId, true));
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (!element) return;
      element.tabIndex = -1;
      element.focus({ preventScroll: true });
      element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  };
  return <DisclosureContext.Provider value={{ openCards, setOpen, jump }}>{children}</DisclosureContext.Provider>;
}

export function useCardJump() {
  return useContext(DisclosureContext)!.jump;
}

export function CardShortcut({ target, children }: { target: string; children: ReactNode }) {
  const jump = useCardJump();
  return <a href={`#${target}`} onClick={e => { e.preventDefault(); jump(target); }} className="mt-3 inline-block text-sm font-semibold text-primary-deep underline underline-offset-4">{children} 바로가기 →</a>;
}

export function Disclosure({ id: cardId, title, children, defaultOpen = false, mountOnOpen = false }: { id?: string; title: string; children: ReactNode; defaultOpen?: boolean; mountOnOpen?: boolean }) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const generatedId = useId();
  const id = cardId ?? generatedId;
  const shared = useContext(DisclosureContext);
  const open = shared?.openCards[id] ?? localOpen;
  const toggle = () => shared ? shared.setOpen(id, !open) : setLocalOpen(!open);
  return (
    <section id={cardId} data-disclosure-id={id} className="min-w-0 self-start rounded-xl border bg-card shadow-card transition-shadow hover:shadow-float">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={`${id}-content`} onClick={toggle} className="flex min-h-24 w-full items-center justify-between gap-3 rounded-xl px-5 py-5 text-left font-semibold text-navy outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
          {title}<ChevronDown aria-hidden="true" className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={`${id}-content`} hidden={!open} className="min-w-0 px-5 pb-5">
        {(!mountOnOpen || open) && children}
      </div>
    </section>
  );
}
