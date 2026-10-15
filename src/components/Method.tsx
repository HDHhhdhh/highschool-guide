import { META } from '../data';
import { REF_IDS } from '../data/references';
import { INDICATOR_BODY, INDICATOR_TITLE } from './IndicatorNote';
import { SourceList } from './SourceLinks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = (m: typeof META) => [
  { t: '1. 후보 학교 선정', d: '사는 동네(또는 중학교) 기준으로 2027 배정 규칙상 지망할 수 있는 학군(구역)의 일반고를 기본으로 모으고, 함께 고려하겠다고 고른 유형(자율형 공립고·외고·국제고·특성화고)과 관심 학교만 더합니다.' },
  { t: '2. 여섯 가지 관점 점수', d: '내신 경쟁력, 면학 분위기, 대학 진학(4년제 진학과 재수 등 재도전을 함께 봄), 희망 계열 적합(개설 과목 연계 + 과학·AI 중점 지정, 계열을 여러 개 고르면 계열별 개설 비율을 같은 비중으로 평균), 통학, 교육 여건(학급당·교원당 학생 수, 동아리, 기간제 비율, 학업중단율)을 후보 학교끼리 상대 비교합니다.' },
  { t: '3. 전략별 가중치', d: '희망 계열과 개설 과목의 연계를 가장 크게 반영하고, 수시 중심이면 내신 경쟁력을, 정시 중심이면 면학 분위기를 더 반영합니다. 통학 거리는 \'높음\'으로 고른 경우에만 크게 반영합니다. 거주 학군 밖 평준화 일반고는 배정 대상이 아니라 크게 낮춥니다.' },
  { t: '4. 데이터의 한계를 그대로 표시', d: `과목별 성적분포(A~E)는 ${m.withAchievement}개 학교 모두 확보해 강·약 과목을 고르면 전 학교에 궁합을 반영합니다. 성취도 비율은 학교 실력이 아닌 참고 지표입니다. 졸업생 진로가 없는 학교(${m.count - m.withCareer}개 학교, 특성화고)는 진학 점수를 중립으로 둡니다. 없는 데이터를 채워 넣지 않습니다.` },
  { t: '5. 내신 점수로 대략적 위치 추정', d: '내신 총점(200점)은 경기도 고입 내신 산식(학기별 기본점수 + 성취도 평균 + 원점수 평균, 체육·예술 30점)에 비교과 만점·원점수 구간 중간값을 가정해 성취도 평균(A=5…E=1)으로 되돌리고, 고른 과목별 성취도 평균과 같은 비중으로 합칩니다. 중학교·지역마다 성취도 분포와 내신 산출이 달라 같은 점수라도 실제 위치가 다를 수 있어, 화면에는 ‘상위 X%’ 대신 다섯 성적대(최상위~기초 다지기) 가운데 대략적인 구간만 보여 줍니다. 석차·백분위가 아닌 참고용 추정입니다.' },
  { t: '6. 수학 관점 (5A 수학학원)', d: '학교별 2026학년도 시간표에서 수학 과목만 골라 학년별 편제를 보여 주고, 미적분·기하·확률과 통계·고급/심화 수학·고급 대수·인공지능 수학·수학과제 탐구·경제 수학 8개 과목군 중 1·2학년에 개설이 확인된 비율로 ‘수학 경쟁력’(0~100, 추정)을 계산합니다. 추천 총점에는 넣지 않습니다.' },
  { t: `7. ${INDICATOR_TITLE}`, d: INDICATOR_BODY },
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
            <div key={s.t} className="rounded-xl border bg-card p-4 sm:last:odd:col-span-2">
              <h3 className="mb-1 text-[0.9375rem] font-semibold text-primary-deep">{s.t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          데이터 출처: 학교알리미 공시정보(교육부·한국교육학술정보원) — 학생·교원 수, 교육운영 특색사업·자율학교 O/X, 학업중단(2025학년도) · NEIS 교육정보 개방 포털 · 경기도교육청 2027학년도 평준화학군 배정 방안 보도자료 · 경기도교육청 고등학교 입학 내신성적 반영지침(2026·2027학년도) · 운정고 2027 입학전형요항 · 학교별 리뷰는 공개 게시글 발췌(원문 링크) · 지도 © NAVER Corp.(네이버 지도).
          학급·진로·개설 과목·동아리·전출입은 2차 가공 자료 기준. '경쟁 강도'와 '예상 내신 등급대'는 공시 지표로 추정한 참고값입니다. 수집 {META.capturedAt.slice(0, 10)}.
        </p>
        <SourceList ids={REF_IDS} title="고교 선택·수학 과목 안내 참고 자료 (원문 링크)" className="mt-5 border-t pt-4" />
      </CardContent>
    </Card>
  );
}
