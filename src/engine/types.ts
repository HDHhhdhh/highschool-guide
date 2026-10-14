// 엔진 공용 타입. 학교 데이터는 scripts/build-data.mjs 가 만든 src/data/schools.json 구조를 따른다.

export type Kind = '일반고' | '자율형 공립고' | '외고' | '국제고' | '예술고' | '특성화고';
export type Group = 'general' | 'selective' | 'arts' | 'vocational';

export interface CareerYear {
  univ: number | null; // 4년제 진학 %
  college: number | null; // 전문대 %
  etc: number | null; // 기타(재수·미진학 등) %
  job: number | null; // 취업 %
  abroad: number | null; // 해외 진학 %
  n: number | null; // 졸업생 수
}

/** [과목명, 평균, [A,B,C,D,E] 비율] — A~C 3단계 과목은 배열 길이 3 */
export type AchRow = [string, number, number[]];
/** { '2026-1': { '1': AchRow[], '2': AchRow[] } } */
export type AchData = Record<string, Record<string, AchRow[]>>;

export interface School {
  id: string;
  name: string;
  short: string;
  city: string; // '고양시' | '파주시'
  sgg: string; // '일산서구' | '일산동구' | '덕양구' | '파주시'
  address: string;
  foundation: string; // 공립 | 사립
  kind: Kind;
  homepage: string | null;
  total: number | null;
  stu: number[] | null; // 학년별 학생 수 [1,2,3]
  classes: number | null;
  perClass: number | null;
  perTeacher: number | null;
  tempRatio: number | null; // 기간제 교원 비율 %
  clubs: number | null;
  subjRoom: boolean;
  levelClass: boolean;
  autonomous: boolean;
  career: Record<string, CareerYear> | null;
  mvin: number | null;
  mvout: number | null;
  lat: number | null;
  lng: number | null;
  subjects: Record<string, string[]> | null; // 학년별 개설 과목
  achData: AchData | null; // 교과별 성취도(A~E) — 확보된 학교만
  // ---- 보충 공시(학교알리미 2026) ----
  autonomousSource?: string; // 'schoolinfo-official' | 'secondary'
  scienceFocus: boolean | null; // 과학중점 공시 표 (null = 미확인)
  designations: Designation[]; // 중점·특색 지정 근거
  officialType: string | null; // 학교알리미 학교 특성 (일반고등학교 등)
  dropoutRate: number | null; // 학업중단율 % (전출 제외)
  dropoutYear: number | null;
  dropoutRows: { grade: number; pct: number; n: number }[] | null;
  admission: AdmissionInfo | null;
  // 이후 추가 공시 항목은 여기에 선택 필드로 늘린다 (src/data/extra.json 으로 id별 병합 가능)
  [extra: string]: unknown;
}

export interface Designation { kind: string; label: string; status: string; year: number | null; evidence: string | null; url: string | null }
export interface AdmissionInfo { policy: 'goyang' | 'paju'; equalized: boolean; zone: 1 | 2 | null; stages: string[]; note: string | null; source: string | null; year: number | null }

export type CommuteWeight = 'low' | 'mid' | 'high';
export type Strategy = 'susi' | 'jeongsi' | 'mix';
export type Subject = '국어' | '수학' | '영어' | '사회' | '과학';
export type BandId = 1 | 2 | 3 | 4 | 5;
export type SubjectGrade = 1 | 2 | 3 | 4 | 5; // A~E
export interface ParentReview {
  schoolId: string;
  category: '수학' | '비수학';
  source: string;
  date: string; // YYYY-MM-DD
  text: string;
  url?: string; // 출처 원문 링크 (네이버 카페·블로그·티스토리·studyholic 등)
}

export interface Point { lat: number; lng: number }

/** 내신 점수 입력(총점·과목별 성취도)으로 추정한 학생의 위치 — standing.ts */
export interface Standing {
  top: number; // 추정 상위 %
  band: BandId; // 추정 위치가 속한 성적대 (선발형 학교 도전 여부·분석 비중에 사용)
  level: number; // 합친 성취도 평균 (A=5 … E=1)
  fromTotal: number | null; // 총점에서 환산한 성취도 평균 (A=5)
  fromSubjects: number | null; // 입력한 과목 성취도 평균 (A=5)
  subjectCount: number;
}

export interface Profile {
  sgg: string; // 거주 구
  origin: Point | null; // 통학 기준점 (동 > 중학교 > 구 중심)
  originLabel: string;
  dongName: string | null;
  middleName: string | null;
  middleSgg: string | null; // 출신 중학교 소재 구 (2단계 구역내배정 기준)
  commute: CommuteWeight;
  band: BandId; // 성적대 (대충 선택한 값, 또는 내신 점수로 추정한 위치의 성적대)
  naesinTotal: number | null; // 입력한 내신 총점 (200점 만점)
  subjectGrades: Partial<Record<Subject, SubjectGrade>> | null; // 입력한 과목별 성취도 (고른 과목만)
  standing: Standing | null; // 내신 점수로 추정한 위치 (null = 성적대 대충 선택)
  strong: Subject[];
  weak: Subject[];
  tracks: string[]; // 희망 계열 TRACKS key (여러 개, 빈 배열 = 아직 모름)
  strategy: Strategy;
  types: string[];
  interest: string[]; // 관심 학교 id
}

export type CompKey = 'naesin' | 'peer' | 'adv' | 'track' | 'commute' | 'env' | 'subjFit';
export const MAIN_COMPS: CompKey[] = ['naesin', 'peer', 'adv', 'track', 'commute', 'env'];

export interface Metrics {
  univ: number | null;
  etc: number | null;
  aim: number | null;
  college: number | null;
  seats1: number | null;
  netIn: number | null;
  trend: number | null;
  perClass: number | null;
  perTeacher: number | null;
  clubs: number | null;
  tempRatio: number | null;
  dropout: number | null;
}

/** 2027 배정·전형 경로 (공식 발표 기준) */
export interface AssignInfo {
  kind: 'stage1' | 'stage2-only' | 'out-of-zone' | 'school-selection' | 'paju-school' | 'unknown';
  zone: number | null;
  route: string; // 한 줄 요약
  detail: string; // 보충 설명
  assignable: boolean; // 평준화 배정으로 갈 수 있는가 (선발형·타시는 true로 두고 문장으로 설명)
}

export interface AchCore { name: string; avg: number; A: number; B: number; C: number; D: number; E: number; AB: number }
export interface AchProfile {
  key: string;
  label: string;
  core: Partial<Record<Subject, AchCore>>;
  meanA: number | null;
  meanAvg: number | null;
  meanE: number | null;
  prev: Partial<Record<Subject, AchCore>> | null;
  prevLabel: string | null;
  stabDiff: number | null;
}

/** 고른 계열 하나의 핵심 과목 개설 수 (계열 적합 점수는 계열별 비율의 평균) */
export interface TrackPart { label: string; hit: number; total: number }

export interface FitNote { good: boolean; k: Subject; text: string }
export interface SubjectFit { score: number; notes: FitNote[] }

export interface Persona { label: string; desc: string }
export interface MathCompetitiveness {
  score: number | null; // 학력 점수가 아니라 선택·심화 과목 개설 폭의 추정 지표
  offered: string[];
  unconfirmed: string[];
}

export interface DataFlags {
  career: boolean; // 졸업생 진로 데이터 유무
  achievement: boolean; // 과목별 성취도 유무
  courses: boolean; // 개설 과목 유무
  otherCity: boolean; // 고양시 밖 학교
}

export interface Result {
  school: School;
  math: MathCompetitiveness;
  m: Metrics;
  comps: Partial<Record<CompKey, number>>;
  total: number;
  comp: number;
  rankTop: number | null;
  grade: number | null;
  gradeLo: number | null;
  gradeHi: number | null;
  selective: boolean;
  group: Group;
  intake: number | null;
  admit: 'ok' | 'tough' | 'hard';
  trackHits: string[];
  trackMissing: string[];
  trackParts: TrackPart[];
  persona: Persona;
  ach: AchProfile | null;
  fit: SubjectFit | null;
  dist: number | null;
  weights: Partial<Record<CompKey, number>>;
  mult: number;
  flags: DataFlags;
  assign: AssignInfo;
}
