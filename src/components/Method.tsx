import { META } from '../data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = (m: typeof META) => [
  { t: '1. 후보 학교 선정', d: '사는 동네(또는 중학교) 기준으로 2027 배정 규칙상 지망할 수 있는 학군(구역)의 일반고를 기본으로 모으고, 함께 고려하겠다고 고른 유형(자율형 공립고·외고·국제고·예술고·특성화고)과 관심 학교만 더합니다.' },
  { t: '2. 여섯 가지 관점 점수', d: '내신 경쟁력, 면학 분위기, 대학 진학(4년제 진학과 재수 등 재도전을 함께 봄), 희망 계열 적합(개설 과목 연계 + 과학·AI 중점 지정), 통학, 교육 여건(학급당·교원당 학생 수, 동아리, 기간제 비율, 학업중단율)을 후보 학교끼리 상대 비교합니다.' },
  { t: '3. 전략별 가중치', d: '희망 계열과 개설 과목의 연계를 가장 크게 반영하고, 수시 중심이면 내신 경쟁력을, 정시 중심이면 면학 분위기를 더 반영합니다. 통학 거리는 \'높음\'으로 고른 경우에만 크게 반영합니다. 거주 학군 밖 평준화 일반고는 배정 대상이 아니라 크게 낮춥니다.' },
  { t: '4. 데이터의 한계를 그대로 표시', d: `과목별 성취도는 ${m.withAchievement}교만 확보되어 나머지는 '추정'으로 표시합니다. 졸업생 진로가 없는 학교(${m.count - m.withCareer}교, 특성화고)는 진학 점수를 중립으로 둡니다. 없는 데이터를 채워 넣지 않습니다.` },
];

export function Method() {
  return (
    <Card id="method" className="gap-0 rounded-2xl bg-muted/50 py-0 shadow-none">
      <CardHeader className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8">
        <CardTitle className="text-xl font-bold tracking-tight text-navy">어떻게 분석하나요?</CardTitle>
        <CardDescription className="leading-relaxed">AI나 서버 없이, 공개된 공시 지표를 정해진 규칙으로만 계산합니다. 같은 입력이면 언제나 같은 결과가 나옵니다.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {STEPS(META).map(s => (
            <div key={s.t} className="rounded-xl border bg-card p-4">
              <h3 className="mb-1 text-[0.9375rem] font-semibold text-primary-deep">{s.t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          데이터 출처: 학교알리미 공시정보(교육부·한국교육학술정보원) — 학생·교원 수, 교육운영 특색사업·자율학교 O/X, 학업중단(2025학년도) · NEIS 교육정보 개방 포털 · 경기도교육청 2027학년도 평준화학군 배정 방안 보도자료 · 운정고 2027 입학전형요항.
          학급·진로·개설 과목·동아리·전출입은 2차 가공 자료 기준. '경쟁 강도'와 '예상 내신 등급대'는 공시 지표로 추정한 참고값입니다. 수집 {META.capturedAt.slice(0, 10)}.
        </p>
      </CardContent>
    </Card>
  );
}
