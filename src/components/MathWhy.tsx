// 홈 상단 '왜 고교 선택에 수학이 핵심인가' — 이 설명회가 고등학교를 수학 관점으로 보는 이유를 세 가지 근거로 짧게 밝힌다.
// 첫 수치는 이 사이트 데이터(2026학년도 NEIS 시간표)에서 바로 계산하고, 나머지는 원문을 확인한 기사로 출처를 단다.
import { ArrowDown, BookOpen, ChartColumn, GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';
import { SCHOOLS } from '../data';
import type { RefId } from '../data/references';
import { mathCompetitiveness } from '../engine';
import { Cites } from './SourceLinks';
import { Button } from '@/components/ui/button';

// 고양시 일반고·자율형 공립고의 2026학년도 1·2학년 시간표에서 확인된 선택·심화 수학 과목군 (수학 경쟁력과 같은 8개 군)
const GENERAL = SCHOOLS.filter(s => s.city === '고양시' && (s.kind === '일반고' || s.kind === '자율형 공립고'))
  .map(mathCompetitiveness)
  .filter(m => m.score != null);
const COUNTS = GENERAL.map(m => m.offered.length);
const RANGE = Math.min(...COUNTS) === Math.max(...COUNTS) ? `${COUNTS[0]}개` : `${Math.min(...COUNTS)}~${Math.max(...COUNTS)}개`;
const schoolsWith = (family: string) => GENERAL.filter(m => m.offered.includes(family)).length;

interface Reason { icon: ReactNode; title: string; figure: string; figureLabel: string; body: ReactNode; refs?: RefId[]; note?: string }

const REASONS: Reason[] = [
  {
    icon: <BookOpen />,
    title: '배울 수 있는 수학이 학교마다 다릅니다',
    figure: RANGE,
    figureLabel: `고양 일반고·자공고 ${GENERAL.length}곳의 선택·심화 수학 과목군 (8개 중)`,
    body: <>2학년부터는 학교가 짠 편제(학교 지정 + 학생 선택)에 따라 일반·진로선택 수학을 배웁니다. 2026학년도 1·2학년 시간표에서 인공지능 수학은 {schoolsWith('인공지능 수학')}곳, 경제 수학은 {schoolsWith('경제 수학')}곳, 수학과제 탐구는 {schoolsWith('수학과제 탐구')}곳에서만 확인됐습니다.</>,
    note: '이 사이트 집계(NEIS 시간표). 시간표에 보이지 않는다고 미개설이 확정되지는 않습니다.',
  },
  {
    icon: <GraduationCap />,
    title: '대입에서 수학의 무게가 커집니다',
    figure: '33.3%',
    figureLabel: '연세대 상경계열 2027학년도 정시 수학 반영 비율 (전년 25%)',
    body: <>2028학년도 수능 수학은 선택과목 없이 대수·미적분Ⅰ·확률과 통계에서 나옵니다. 수능 밖인 기하·미적분Ⅱ는 서울대 이공계열과 연세대 자연·의치약 모집단위가 이수를 권장하고 학생부 평가에 반영합니다.</>,
    refs: ['yonseiJeongsi', 'snu2028', 'yonsei2028'],
  },
  {
    icon: <ChartColumn />,
    title: '내신 수학은 차이가 크게 납니다',
    figure: '17.2%',
    figureLabel: '전국 일반고 고1 수학 성취도 A 비율 (2024년 1학기)',
    body: <>같은 시기 국어 19.7%·영어 20.6%보다 낮았습니다(5등급제 도입 전). 5등급제 1등급은 상위 10%이고, 2학년부터 선택과목마다 수강생이 나뉘어 같은 실력도 학교·과목의 수강 인원과 상위권 밀도에 따라 등급이 달라질 수 있습니다.</>,
    refs: ['gradeVsA', 'scienceFocus'],
  },
];

export function MathWhy({ onGuide }: { onGuide: () => void }) {
  return (
    <section id="why-math" aria-labelledby="why-math-title" className="rounded-2xl border bg-card p-5 shadow-card sm:p-8">
      <p className="text-sm font-semibold text-primary-deep">설명회 핵심 · 5A 수학 관점</p>
      <h2 id="why-math-title" className="mt-1 text-2xl font-bold tracking-tight text-navy">왜 고교 선택에 ‘수학’이 핵심인가</h2>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        고교학점제에서는 학교마다 여는 수학 과목, 내신 시험의 난이도와 평가 방식, 진학 지도가 다릅니다.
        그래서 <b className="font-semibold text-foreground/80">‘어느 학교에 가느냐’가 아이의 수학 공부 환경</b>을 크게 좌우합니다.
      </p>

      <ol className="mt-5 flex flex-col gap-3">
        {REASONS.map((r, i) => (
          <li key={r.title} className="grid grid-cols-1 gap-2 rounded-xl border bg-muted/40 p-4 sm:grid-cols-[10.5rem_1fr] sm:gap-5">
            <div className="flex items-baseline gap-2 sm:flex-col sm:gap-1">
              <b className="shrink-0 text-2xl font-extrabold text-primary tnum">{r.figure}</b>
              <span className="text-xs leading-snug text-muted-foreground">{r.figureLabel}</span>
            </div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 text-[0.9375rem] font-bold text-navy [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-primary-deep">
                {r.icon}
                <span>{i + 1}. {r.title}</span>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{r.body}</p>
              <div className="mt-1.5">
                {r.refs ? <Cites ids={r.refs} /> : <span className="text-xs text-muted-foreground">{r.note}</span>}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-navy-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-relaxed text-foreground/85">
          그래서 이 설명회는 고등학교를 <b className="font-semibold text-navy">수학 공부 환경</b>으로 봅니다. 어떤 수학 과목을 열고, 내신 경쟁은 어떤지,
          진학으로 어떻게 이어지는지를 학교 추천 결과의 ‘5A 수학 관점’과 아래 가이드에서 이어서 확인하세요.
        </p>
        <Button variant="outline" size="sm" className="h-10 shrink-0 rounded-lg bg-card" onClick={onGuide}>
          계열별 수학 과목 가이드 <ArrowDown aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
