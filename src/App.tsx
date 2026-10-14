import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookingForm } from './components/BookingForm';
import { FinderForm } from './components/FinderForm';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Method } from './components/Method';
import { NationalAutonomous } from './components/NationalAutonomous';
import { ParentReviews } from './components/ParentReviews';
import { Results } from './components/Results';
import { TopBar } from './components/TopBar';
import { SCHOOLS } from './data';
import { analyze, type Analysis } from './engine';
import { DEFAULT_BOOKING, type BookingState } from './lib/booking';
import { DEFAULT_FINDER, bandOf, toProfile, type FinderState } from './lib/finder';

export type View = 'finder' | 'booking';

const viewFromHash = (): View => (location.hash.replace('#', '') === 'booking' ? 'booking' : 'finder');

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [finder, setFinder] = useState<FinderState>(DEFAULT_FINDER);
  const [analysis, setAnalysis] = useState<{ profile: ReturnType<typeof toProfile>; result: Analysis } | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<Partial<BookingState>>({});

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((v: View) => {
    if (location.hash !== `#${v}`) location.hash = v; else setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const runAnalysis = useCallback((f: FinderState) => {
    const profile = toProfile(f);
    const result = analyze(SCHOOLS, profile); // 브라우저 안에서만 계산
    setFinder(f);
    setAnalysis({ profile, result });
    requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  // 추천 결과 → 예약 폼으로 입력값 넘기기
  const bookWithResults = useCallback(() => {
    const top = analysis?.result.results.slice(0, 3).map(r => r.school.name) ?? [];
    // 내신 점수를 입력했으면 그 점수로 추정한 성적대를 넘긴다
    const b = bandOf(analysis?.profile.band ?? finder.band);
    setBookingPrefill({
      middleSchool: finder.middle,
      region: [finder.sgg, finder.dong].filter(Boolean).join(' '),
      wishSchools: top.join(', '),
      track: finder.track,
      band: b.id,
      strong: finder.strong,
      weak: finder.weak,
      recommended: top,
    });
    go('booking');
  }, [analysis, finder, go]);

  const prefill = useMemo<BookingState>(() => ({ ...DEFAULT_BOOKING, ...bookingPrefill }), [bookingPrefill]);

  return (
    <>
      <TopBar view={view} onNav={go} />
      <main>
        {view === 'finder' ? (
          <>
            <Hero
              onStart={() => document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth' })}
              onBook={() => go('booking')}
              onReviews={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-14 sm:gap-8 sm:px-6">
              <FinderForm initial={finder} onSubmit={runAnalysis} />
              {analysis && <Results profile={analysis.profile} analysis={analysis.result} onBook={bookWithResults} onEdit={() => document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth' })} />}
              <ParentReviews />
              <NationalAutonomous />
              <Method />
            </div>
          </>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6 pb-14 sm:gap-8 sm:px-6 sm:pt-8">
            <BookingForm key={JSON.stringify(bookingPrefill)} initial={prefill} hasResults={!!analysis} onBackToFinder={() => go('finder')} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
