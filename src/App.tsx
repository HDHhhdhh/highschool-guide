import { useCallback, useState } from 'react';
import { FinderForm } from './components/FinderForm';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { MathCourseGuide } from './components/MathCourseGuide';
import { MathWhy } from './components/MathWhy';
import { Method } from './components/Method';
import { NationalAutonomous } from './components/NationalAutonomous';
import { ParentReviews } from './components/ParentReviews';
import { Results } from './components/Results';
import { TopBar } from './components/TopBar';
import { SCHOOLS } from './data';
import { analyze, type Analysis } from './engine';
import { DEFAULT_FINDER, toProfile, type FinderState } from './lib/finder';

export default function App() {
  const [analysis, setAnalysis] = useState<{ profile: ReturnType<typeof toProfile>; result: Analysis } | null>(null);

  const runAnalysis = useCallback((f: FinderState) => {
    const profile = toProfile(f);
    const result = analyze(SCHOOLS, profile); // 브라우저 안에서만 계산
    setAnalysis({ profile, result });
    requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  return (
    <>
      <TopBar />
      <main>
        <Hero
          onStart={() => document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth' })}
          onReviews={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-14 sm:gap-8 sm:px-6">
          <MathWhy onGuide={() => document.getElementById('math-guide')?.scrollIntoView({ behavior: 'smooth' })} />
          <FinderForm initial={DEFAULT_FINDER} onSubmit={runAnalysis} />
          {analysis && <Results profile={analysis.profile} analysis={analysis.result} onEdit={() => document.getElementById('finder')?.scrollIntoView({ behavior: 'smooth' })} />}
          <MathCourseGuide />
          <ParentReviews />
          <NationalAutonomous />
          <Method />
        </div>
      </main>
      <Footer />
    </>
  );
}
