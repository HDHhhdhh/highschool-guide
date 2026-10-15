import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

export function Disclosure({ title, children, defaultOpen = false, mountOnOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean; mountOnOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="min-w-0 rounded-xl border bg-card">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-4 text-left font-semibold text-navy outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
          {title}<ChevronDown aria-hidden="true" className={`size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="min-w-0 px-4 pb-4">
        {(!mountOnOpen || open) && children}
      </div>
    </section>
  );
}
