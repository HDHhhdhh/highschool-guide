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
import { Disclosure } from './components/Disclosure';
import { SchoolInfo } from './components/SchoolInfo';
import { SCHOOLS } from './data';
import { analyze, type Analysis } from './engine';
import { DEFAULT_FINDER, toProfile, type FinderState } from './lib/finder';

function reveal(id: string) {
  const element = document.getElementById(id);
  const button = element?.closest('[hidden]')?.previousElementSibling?.querySelector('button');
  if (button?.getAttribute('aria-expanded') === 'false') button.click();
  requestAnimationFrame(() => element?.scrollIntoView({ behavior: 'smooth' }));
}

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
          onStart={() => document.getElementById('school-info')?.scrollIntoView({ behavior: 'smooth' })}
          onReviews={() => reveal('reviews')}
        />
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-14 sm:gap-8 sm:px-6">
          <SchoolInfo />
          <section aria-labelledby="recommend-title" className="rounded-2xl border bg-muted/40 p-5">
            <h2 id="recommend-title" className="text-xl font-bold text-navy">보조 도구 · 조건별 후보 추천</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">학교 정보를 확인한 뒤 후보를 넓히는 참고용 도구입니다. 순위는 정밀한 예측이 아니며 입력 조건과 확보된 지표에 따른 대략적인 비교입니다. 성취도 비율은 학교 실력이 아니고, 자료 미확보 학교는 추정이 포함됩니다.</p>
          </section>
          <Disclosure title="조건을 입력하고 참고용 추천 보기">
            <FinderForm initial={DEFAULT_FINDER} onSubmit={runAnalysis} />
          </Disclosure>
          {analysis && <Results profile={analysis.profile} analysis={analysis.result} onEdit={() => reveal('finder')} />}
          <Disclosure title="왜 고교 선택에 수학이 핵심인가">
            <MathWhy onGuide={() => reveal('math-guide')} />
          </Disclosure>
          <Disclosure title="고교학점제 수학 과목 선택 가이드"><MathCourseGuide /></Disclosure>
          <Disclosure title="전체 학교 리뷰 195건 모아보기"><ParentReviews /></Disclosure>
          <Disclosure title="전국 자율형 사립고 참고 정보"><NationalAutonomous /></Disclosure>
          <Disclosure title="자료·분석 방법과 전체 출처"><Method /></Disclosure>
        </div>
      </main>
      <Footer />
    </>
  );
}
