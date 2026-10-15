// 고교학점제 수학 과목 선택 가이드 (2022 개정 교육과정, 2025년 고1부터 적용) — 계열별 일반적인 흐름.
// 학교별 실제 편제는 결과 카드의 '5A 수학 관점'(2026학년도 시간표)에서 본다. 특정 학교를 추천하는 자료가 아니다.
// 과목 체계: 경기고교학점제 지원센터 과목 안내. 계열별 내용: 원문을 확인한 기사 (출처 id → src/data/references.ts)
import type { RefId } from './references';

/** 2022 개정 고등학교 수학 과목 체계 (보통교과) */
export const COURSE_MAP: { group: string; when: string; courses: string[]; note: string }[] = [
  { group: '공통', when: '1학년', courses: ['공통수학1', '공통수학2'], note: '기본수학1·2로 대신 이수할 수 있음' },
  { group: '일반선택', when: '2학년~3학년 1학기', courses: ['대수', '미적분Ⅰ', '확률과 통계'], note: '2028학년도 수능 수학 출제 범위' },
  { group: '진로선택', when: '2~3학년', courses: ['기하', '미적분Ⅱ', '경제 수학', '인공지능 수학', '직무 수학'], note: '수능 범위 밖 · 기하·미적분Ⅱ는 대학 권장이 많음' },
  { group: '융합선택', when: '2~3학년', courses: ['수학과 문화', '실용 통계', '수학과제 탐구'], note: '실생활·교과 융합' },
];

/** base = 공통·수능 범위, rec = 대학 권장 사례가 있는 과목, opt = 관심·학교 개설에 따라 */
export type CourseTier = 'base' | 'rec' | 'opt';
export interface GuideStage { stage: string; courses: { name: string; tier: CourseTier; hint?: string }[] }
export interface GuidePoint { text: string; refs: RefId[] }
export interface GuideTrack { id: string; label: string; sub: string; summary: string; stages: GuideStage[]; points: GuidePoint[] }

const COMMON: GuideStage = { stage: '1학년 공통', courses: [{ name: '공통수학1', tier: 'base' }, { name: '공통수학2', tier: 'base' }] };
const GENERAL: GuideStage = { stage: '일반선택', courses: [{ name: '대수', tier: 'base' }, { name: '미적분Ⅰ', tier: 'base' }, { name: '확률과 통계', tier: 'base' }] };

export const GUIDE_TRACKS: GuideTrack[] = [
  {
    id: 'stem',
    label: '이과',
    sub: '자연·공학·의약',
    summary: '대수·미적분Ⅰ·확률과 통계를 다진 뒤 미적분Ⅱ·기하까지 이어 가는 흐름이 기본입니다.',
    stages: [
      COMMON,
      GENERAL,
      {
        stage: '진로선택·심화',
        courses: [
          { name: '미적분Ⅱ', tier: 'rec', hint: '미적분Ⅰ 다음' },
          { name: '기하', tier: 'rec' },
          { name: '인공지능 수학', tier: 'opt', hint: 'IT·AI 관심' },
          { name: '고급 대수·고급 미적분', tier: 'opt', hint: '개설 학교만' },
        ],
      },
    ],
    points: [
      { text: '서울대는 자연과학·공과·의과대학 등 이공계열 모집단위(유형Ⅱ)에 기하·미적분Ⅱ 이수를 권장합니다(간호대·치의학과는 둘 중 하나). 지원자격은 아니지만 수시 서류평가와 정시 교과평가에 반영합니다.', refs: ['snu2028', 'faqGeometry'] },
      { text: '연세대는 자연계열·의치약 30여 개 모집단위 모두에 기하·미적분Ⅱ를 권장하고, 학교에 과목이 없어 듣지 못한 경우는 개설됐는데 듣지 않은 경우와 구분해 평가합니다.', refs: ['yonsei2028'] },
      { text: 'IT·AI 진로도 ‘AI’ 이름의 과목보다 수학 기초가 먼저입니다. 연세대 인공지능학과는 기하·미적분Ⅱ를, 경희대 인공지능학과는 대수부터 기하까지 다섯 과목을 핵심으로 두고 인공지능 수학을 그다음 권장 과목으로 제시했습니다.', refs: ['aiCourses'] },
      { text: '미적분Ⅱ는 미적분Ⅰ을 먼저 배워야 하므로, 학교가 두 과목을 어느 학기에 여는지 순서까지 확인하세요.', refs: ['faqGeometry'] },
    ],
  },
  {
    id: 'biz',
    label: '상경',
    sub: '경영·경제·금융',
    summary: '확률과 통계·미적분Ⅰ을 탄탄히 하고, 목표 대학과 수학 성취에 따라 경제 수학·미적분Ⅱ를 더합니다.',
    stages: [
      COMMON,
      GENERAL,
      {
        stage: '진로·융합선택',
        courses: [
          { name: '경제 수학', tier: 'rec' },
          { name: '미적분Ⅱ', tier: 'rec', hint: '경제·금융 상위권' },
          { name: '실용 통계', tier: 'opt', hint: '데이터·경영 분석 관심' },
        ],
      },
    ],
    points: [
      { text: '동국대 경영대학은 진로선택 미적분Ⅱ와 경제수학을 명시했고, 부산대 경제학부는 확률과 통계·미적분Ⅰ·미적분Ⅱ 가운데 1과목 이상을 권합니다.', refs: ['bizCalculusUnis'] },
      { text: '최상위권 경제학·금융 진로라면 미적분Ⅱ의 의미가 커집니다. 반대로 수학 기초가 불안정하다면 미적분Ⅰ·확률과 통계를 다지고 다른 과목 성취를 지키는 편이 나을 수 있습니다.', refs: ['bizCalculus'] },
      { text: '연세대는 상경·경영을 포함한 인문계열에 권장 과목을 따로 정하지 않았습니다. 대학마다 다르니 목표 대학의 안내를 확인하세요.', refs: ['yonsei2028', 'bizCalculus'] },
      { text: '정시에서도 수학 비중이 커지는 흐름입니다. 연세대 상경계열은 2027학년도 정시 수학 반영을 25%에서 33.3%로 높였습니다.', refs: ['yonseiJeongsi'] },
    ],
  },
  {
    id: 'hum',
    label: '인문',
    sub: '인문·사회·교육',
    summary: '2028 수능 범위인 대수·미적분Ⅰ·확률과 통계까지는 문·이과 구분 없이 필요합니다. 그 위는 진로에 맞춰 고릅니다.',
    stages: [
      COMMON,
      GENERAL,
      {
        stage: '융합선택 등',
        courses: [
          { name: '실용 통계', tier: 'opt', hint: '사회과학·교육·심리' },
          { name: '수학과 문화', tier: 'opt' },
        ],
      },
    ],
    points: [
      { text: '2028학년도 수능 수학은 문·이과 구분 없이 대수·미적분Ⅰ·확률과 통계에서 출제됩니다.', refs: ['faqGeometry'] },
      { text: '서울대 인문대학·사회과학대학·경영대학 등(유형Ⅰ)은 수학이 아니라 제2외국어/한문 교과에서 1과목 이상을 권장합니다.', refs: ['snu2028'] },
      { text: '수학 부담이 큰 학생은 2~3학년 과목 선택 폭이 넓은 학교가 맞을 수 있다는 분석도 있습니다. 다만 과목을 바꿀 때는 빠지는 학습과 새로 얻는 학습을 함께 적어 보세요.', refs: ['schoolinfoA', 'faqChoice'] },
    ],
  },
];

/** 계열과 관계없이 과목을 고르기 전에 확인할 것 */
export const GUIDE_CHECKS: { title: string; text: string; refs: RefId[] }[] = [
  { title: '3개년 편제표', text: '학교알리미에 공시된 3개년 교육과정 편제표에서 수학 과목이 몇 학년·학기에 열리고, 학교 지정인지 선택인지 보세요. 전국 68개 일반고 분석에서 대수를 학교 지정으로 둔 곳은 80.9%, 확률과 통계는 60.3%였습니다.', refs: ['kicePlan', 'faqGeometry'] },
  { title: '실제로 열리는지', text: '편제표에 있어도 신청자가 적으면 폐강될 수 있습니다. 학교에 최근 2~3년 과목별 신청자 수, 실제 개설 학급 수, 폐강된 과목을 물어보세요.', refs: [] },
  { title: '학교에 없을 때', text: '공동교육과정·온라인학교는 학생부에 정식 이수로 남지만 혼자 공부한 것은 이수로 남지 않습니다. 고양은 지역 대학과 함께 여는 ‘고양공유학교 학점인정형’도 운영합니다(2026학년도 1학기 ‘데이터 과학과 인공지능’ 등).', refs: ['jointCurriculum', 'faqGeometry', 'goyangShared'] },
  { title: '지원 학년도 기준', text: '2027년 고1은 2030학년도 대입을 치릅니다. 지금 공개된 대학 안내는 대부분 2028학년도 기준이니 방향만 참고하고, 지원 학년도 발표를 다시 확인하세요.', refs: ['gradeVsA'] },
];
