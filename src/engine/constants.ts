// 참조 엔진(highschool-guide.vercel.app/engine.js)의 성적대·계열·전략 가중치를 그대로 옮긴 상수.
import type { BandId, CompKey, Kind, Strategy, Subject } from './types';

export interface Band { id: BandId; label: string; desc: string; hint: string; top: number; best: number }
export const BANDS: Band[] = [
  { id: 1, label: '최상위', desc: '상위 5% 이내', hint: '주요 과목 모두 A, 전교 최상위권', top: 4, best: 0 },
  { id: 2, label: '상위', desc: '상위 5~15%', hint: '주요 과목 대부분 A', top: 11, best: 5 },
  { id: 3, label: '중상위', desc: '상위 15~40%', hint: 'A와 B가 섞여 있음', top: 28, best: 15 },
  { id: 4, label: '중위', desc: '상위 40~70%', hint: 'B 중심', top: 55, best: 40 },
  { id: 5, label: '기초 다지기', desc: '상위 70% 이하', hint: 'C 이하 과목이 있음', top: 82, best: 70 },
];

export interface Track { label: string; kw: string[]; stem?: boolean; lang?: boolean; arts?: boolean; job?: boolean }
// 'A|B' = 2015·2022 개정 교육과정에서 같은 역할을 하는 과목 묶음 (하나만 있어도 개설로 봄)
export const TRACKS: Record<string, Track> = {
  med: { label: '의약·보건', stem: true, kw: ['화학', '생명과학', '화학Ⅱ|화학 반응의 세계|물질과 에너지', '생명과학Ⅱ|세포와 물질대사|생물의 유전', '미적분', '확률과 통계', '보건'] },
  eng: { label: '공학', stem: true, kw: ['물리학', '물리학Ⅱ|역학과 에너지|전자기와 양자', '미적분', '기하', '정보', '공학|인공지능 수학'] },
  sci: { label: '자연과학', stem: true, kw: ['물리학', '화학', '생명과학', '지구과학|지구시스템', '미적분', '기하', '과학 탐구|과학과제|실험|융합과학'] },
  it: { label: 'IT·소프트웨어', stem: true, kw: ['정보', '인공지능', '프로그래밍|소프트웨어', '데이터', '미적분', '확률과 통계'] },
  biz: { label: '경영·경제', kw: ['경제', '경제 수학', '확률과 통계', '미적분', '금융|국제 경제', '사회문제'] },
  hum: { label: '인문·어문', lang: true, kw: ['문학', '고전', '언어와 매체', '화법', '한문', '철학', '중국어', '일본어', '독일어', '프랑스어', '스페인어', '세계사'] },
  soc: { label: '사회·법·행정', lang: true, kw: ['정치', '법과 사회', '사회와 문화', '사회·문화', '윤리', '지리', '국제 관계', '세계사'] },
  edu: { label: '교육', kw: ['교육', '심리', '윤리', '사회·문화', '사회와 문화'] },
  art: { label: '예체능', arts: true, kw: ['미술', '음악', '체육', '스포츠', '연극', '무용'] },
  job: { label: '취업·기술', job: true, kw: [] },
  none: { label: '아직 모름', kw: [] },
};
// 희망 계열은 여러 개 고를 수 있다 (TRACKS key 배열). 빈 배열 = '아직 모름'
export const TRACK_IDS = Object.keys(TRACKS).filter(k => k !== 'none');
/** 고른 계열 — 클릭 순서와 상관없이 TRACKS 순서로 */
export const selectedTracks = (ids: string[]): Track[] => TRACK_IDS.filter(k => ids.includes(k)).map(k => TRACKS[k]);
/** 화면·예약 요약용 이름: '공학, 의약·보건' (없으면 '아직 모름') */
export const tracksLabel = (ids: string[]) => selectedTracks(ids).map(t => t.label).join(', ') || TRACKS.none.label;

export interface StrategyDef { label: string; desc: string; w: Record<'naesin' | 'peer' | 'adv' | 'track' | 'commute' | 'env', number> }
// 희망 계열 적합(개설 과목 연계)을 가장 크게, 통학은 '보통'일 때 작게 반영
export const STRATEGIES: Record<Strategy, StrategyDef> = {
  susi: { label: '수시 (내신·학생부)', desc: '내신 경쟁력을 더 크게 봅니다', w: { naesin: 0.3, peer: 0.07, adv: 0.15, track: 0.28, commute: 0.1, env: 0.1 } },
  jeongsi: { label: '정시 (수능)', desc: '면학 분위기를 더 크게 봅니다', w: { naesin: 0.07, peer: 0.3, adv: 0.07, track: 0.28, commute: 0.13, env: 0.15 } },
  mix: { label: '아직 모르겠음 (균형)', desc: '여섯 관점을 고르게 봅니다', w: { naesin: 0.2, peer: 0.18, adv: 0.11, track: 0.28, commute: 0.11, env: 0.12 } },
};

export interface SchoolTypeDef { label: string; kinds: Kind[]; scope: 'near' | 'sido' | 'far'; note: string }
// 일반고 외에 사용자가 골라야 후보에 들어가는 학교 유형. 이 데이터(32교)에 실제로 있는 유형만 둔다.
// (운영자 요청으로 경기영상과학고·고양예술고·고양일고·신원고·신일비즈니스고·일산고·일산국제컨벤션고 7교는 비교 대상에서 제외)
export const SCHOOL_TYPES: Record<string, SchoolTypeDef> = {
  autonomous: { label: '자율형 공립고', kinds: ['자율형 공립고'], scope: 'near', note: '백석고 · 저현고' },
  foreign: { label: '외고·국제고', kinds: ['외고', '국제고'], scope: 'sido', note: '고양외고 · 고양국제고' },
  vocational: { label: '특성화고', kinds: ['특성화고'], scope: 'far', note: '고양고' },
};
export const TYPES_NOT_IN_DATA = '자사고·과학고·영재학교·마이스터고는 고양시 안에 없어 이 도구의 비교 대상이 아닙니다.';

export const COMPONENT_LABEL: Record<CompKey, string> = {
  naesin: '내신 경쟁력',
  peer: '면학 분위기',
  adv: '대학 진학',
  track: '희망 계열 적합',
  commute: '통학',
  env: '교육 여건',
  subjFit: '강점·약점 과목 궁합',
};

export const COMPONENT_HINT: Record<CompKey, string> = {
  naesin: '중학교 성적대와 학교의 경쟁 강도로 본 예상 교내 위치',
  peer: '졸업생 진학 지향·전출입·학생 수 추이로 추정 (성취도 확보 학교는 실제 분포)',
  adv: '최근 졸업생 4년제 진학률과 재도전 비율',
  track: '희망 계열 핵심 과목의 1·2학년 개설 여부',
  commute: '사는 동네(또는 중학교)에서의 직선거리',
  env: '학급당 학생 수, 교원 1인당 학생 수, 동아리 수, 기간제 비율',
  subjFit: '강점·약점 과목과 성적분포의 궁합 (성취도 확보 학교만)',
};

export const SUBJECTS: Subject[] = ['국어', '수학', '영어', '사회', '과학'];

// 선발형 학교: 입학생 수준(대략 상위 intake%)과 면학 분위기 기본값(peer)
export const SELECT_PROFILE: Partial<Record<Kind, { intake: number; peer: number }>> = {
  외고: { intake: 8, peer: 0.9 },
  국제고: { intake: 8, peer: 0.9 },
};

export const CITY = '고양시';
export const RADIUS_KM = 14; // 도 지역 통학권 반경 (참조 엔진과 동일)
