// 고교 선택·수학 과목 안내에 인용한 외부 자료.
// 운영자가 준 두 자료실(교육을 비추다 입시 지식서재 · 퀴트린 지식서재)에서 찾은 글은 원문을 직접 열어 내용을 확인한 것만 두고,
// 화면에는 원문 링크로 출처를 밝힌다 (Cite·Cites·SourceList — src/components/SourceLinks.tsx).
// 과목 체계처럼 공식 자료로 확인한 내용은 경기도교육청 경기고교학점제 지원센터를 출처로 단다.

export interface Reference {
  publisher: string; // 화면에 짧게 보이는 매체·작성자
  title: string; // 원문 제목 (발행된 그대로)
  date: string; // 게시일 YYYY-MM-DD ('' = 상시 안내 페이지)
  url: string; // 원문 주소
  via?: keyof typeof LIBRARIES; // 찾은 자료실
}

/** 운영자가 제공한 자료실 — 기사를 찾은 경로. 인용은 항상 원문(url)으로 한다 */
export const LIBRARIES = {
  kyobit: { name: '교육을 비추다 입시 지식서재', url: 'https://kyobit-education-wiki-1953.brainy-mink-9937.chatgpt.site' },
  quitrin: { name: '퀴트린 지식서재', url: 'https://quitrin-knowledge-library.brainy-mink-9937.chatgpt.site' },
} as const;

const kyobit = (idxno: number) => `https://www.kyobit.com/news/articleView.html?idxno=${idxno}`;
const K = '교육을 비추다';

export const REFS = {
  // 고교학점제 편제·수능 범위·대학 권장 과목
  kicePlan: { publisher: K, title: '고교학점제 첫 적용 학년 68개교 편제표…수능 출제 8과목 모두 학교 지정 60% 이상', date: '2026-01-07', url: kyobit(3270), via: 'kyobit' },
  faqGeometry: { publisher: K, title: '[고교학점제 실전 FAQ②] 수능에 없는 기하·미적분Ⅱ, 학교에서는 왜 배워야 할까', date: '2026-09-24', url: kyobit(7265), via: 'kyobit' },
  faqChoice: { publisher: K, title: '[고교학점제 실전 FAQ①] 내신 잘 나오는 과목과 전공에 필요한 과목, 무엇을 고를까', date: '2026-09-23', url: kyobit(7196), via: 'kyobit' },
  snu2028: { publisher: K, title: '서울대학교, 2028학년도 대입 전공 연계 과목 선택 안내 발표', date: '2025-06-30', url: kyobit(921), via: 'kyobit' },
  yonsei2028: { publisher: K, title: "연세대, '기하·미적분Ⅱ 전면 권장'... 수능서 빠진 심화수학, 자연·의치약 학생부서 부활", date: '2026-05-03', url: kyobit(5240), via: 'kyobit' },
  yonseiJeongsi: { publisher: K, title: '연세대 2027 정시 1515명…상경대 수학 25%→33.3%, 첨단약과학과 첫 선발', date: '2026-09-19', url: kyobit(7182), via: 'kyobit' },
  aiCourses: { publisher: K, title: '‘AI’ 붙은 과목부터 고르면 될까…연세대 인공지능학과는 기하·미적분Ⅱ, 경희대는 ‘인공지능수학’ 권장', date: '2026-09-19', url: kyobit(7159), via: 'kyobit' },
  bizCalculus: { publisher: K, title: '2028 대입 경제·경영 진로 학생, 미적분Ⅱ를 선택해야 할까', date: '2026-08-16', url: kyobit(6678), via: 'kyobit' },
  bizCalculusUnis: { publisher: K, title: '"문과니까 확통만?"... 2028 대입, 상경계열 합격 가를 \'미적분Ⅱ\'의 역습', date: '2026-02-13', url: kyobit(4095), via: 'kyobit' },
  // 내신·성취도 읽는 법
  gradeVsA: { publisher: K, title: '[칼럼]일반고는 석차등급, 자사고는 성취도 A… 2028 대입 고교 선택 셈법이 갈린다', date: '2026-09-11', url: kyobit(6962), via: 'kyobit' },
  schoolinfoA: { publisher: K, title: "2028 대입, 일반고 선택의 나침반 '학교알리미' ... 수학 A비율 5%의 의미는?", date: '2025-12-07', url: kyobit(2868), via: 'kyobit' },
  schoolinfoGuide: { publisher: K, title: "한국교육개발원, '학교알리미' 활용법 공개... 내신 5등급제 학부모 정보 격차 해법 제", date: '2026-05-03', url: kyobit(5243), via: 'kyobit' },
  scienceFocus: { publisher: K, title: '과학중점고, 내신 불리할까…2028 대입서 달라진 손익계산', date: '2026-08-20', url: kyobit(6684), via: 'kyobit' },
  // 과목 개설·공동교육과정
  jointCurriculum: { publisher: K, title: "고교학점제 '공동교육과정', 우리 학교에 없는 과목도 정식 이수한다", date: '2026-06-28', url: kyobit(5948), via: 'kyobit' },
  goyangShared: { publisher: K, title: "고양교육지원청, '고양공유학교 학점인정형' 제도 확대... 학생 맞춤형 진로 설계 돕는다", date: '2026-03-24', url: kyobit(4696), via: 'kyobit' },
  // 퀴트린(고등 내신강사) — 원문 확인: '중학교 A ≠ 고교 1등급'을 이야기해 왔다는 글
  quitrinGrade5: { publisher: '퀴트린 블로그', title: '고교내신 5등급제 뚜껑 열림', date: '2025-05-18', url: 'https://blog.naver.com/hwaspc22/223869715458', via: 'quitrin' },
  // 공식 안내 (과목 체계)
  goeCourses: { publisher: '경기고교학점제 지원센터', title: '고등학교 과목 안내 (2022 개정 교육과정)', date: '', url: 'https://more.goe.go.kr/hagjeomje/subList/30300002205' },
  goeScience: { publisher: '경기고교학점제 지원센터', title: '계열별 권장 선택 과목 안내 (특수 목적 고등학교 선택 과목)', date: '', url: 'https://more.goe.go.kr/hagjeomje/subList/30300002206' },
} satisfies Record<string, Reference>;

export type RefId = keyof typeof REFS;
export const REF_IDS = Object.keys(REFS) as RefId[];
