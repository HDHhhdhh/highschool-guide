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
import { CardShortcut, Disclosure, DisclosureProvider, useCardJump } from './components/Disclosure';
import { SchoolInfo } from './components/SchoolInfo';
import { SCHOOLS } from './data';
import { analyze, type Analysis } from './engine';
import { DEFAULT_FINDER, toProfile, type FinderState } from './lib/finder';

export default function App() {
  return <DisclosureProvider><Page /></DisclosureProvider>;
}

function Page() {
  const reveal = useCardJump();
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-8 sm:gap-8 sm:px-6">
          <MathWhy onGuide={() => reveal('math-guide')} />
          <MathCourseGuide />
        </div>
        <Hero
          onStart={() => document.getElementById('school-info')?.scrollIntoView({ behavior: 'smooth' })}
          onReviews={() => reveal('reviews')}
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-14 sm:gap-8 sm:px-6">
          <SchoolInfo />
          <section aria-labelledby="recommend-title" className="rounded-2xl border bg-muted/40 p-5">
            <h2 id="recommend-title" className="text-xl font-bold text-navy">보조 도구 · 조건별 후보 추천</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">학교 정보를 확인한 뒤 후보를 넓히는 참고용 도구입니다. 순위는 정밀한 예측이 아니며 입력 조건과 확보된 지표에 따른 대략적인 비교입니다. 성취도 비율은 학교 실력이 아니고, 자료 미확보 학교는 추정이 포함됩니다.</p>
          </section>
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <Disclosure id="recommend-form" title="조건을 입력하고 참고용 추천 보기">
            <FinderForm initial={DEFAULT_FINDER} onSubmit={runAnalysis} />
          </Disclosure>
          <Disclosure id="all-reviews" title="전체 학교 리뷰 195건 모아보기">
            <ParentReviews />
            <CardShortcut target="school-reviews">선택한 학교 리뷰</CardShortcut>
          </Disclosure>
          <Disclosure title="전국 자율형 사립고 참고 정보"><NationalAutonomous /></Disclosure>
          <Disclosure id="sources" title="자료·분석 방법과 전체 출처"><Method /></Disclosure>
          </div>
          {analysis && <Results profile={analysis.profile} analysis={analysis.result} onEdit={() => reveal('finder')} />}
        </div>
      </main>
      <Footer />
    </>
  );
}
