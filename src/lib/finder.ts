// 추천 입력 폼 상태 ↔ 엔진 Profile 변환
import { GEO, SCHOOLS } from '../data';
import { TRACKS, estimateStanding, parseNaesinTotal, type BandId, type CommuteWeight, type Profile, type Strategy, type Subject, type SubjectGrade } from '../engine';

/** 학업 성적 입력 방식: 내신 점수(기본) 또는 성적대 대충 선택(보조) */
export type GradeMode = 'score' | 'band';

export interface FinderState {
  sgg: string;
  dong: string; // 동 이름 ('' = 미입력)
  middle: string; // 중학교 이름 ('' = 미입력)
  commute: CommuteWeight;
  gradeMode: GradeMode;
  naesinTotal: string; // 내신 총점 입력칸 그대로 ('' = 미입력)
  subjectGrades: Partial<Record<Subject, SubjectGrade>>; // 고른 과목만
  band: BandId; // '간단히 선택하기'에서 고른 성적대
  strong: Subject[];
  weak: Subject[];
  tracks: string[]; // 희망 계열 TRACKS key (여러 개, [] = 아직 모름)
  strategy: Strategy;
  types: string[];
  interest: string[];
}

export const DEFAULT_FINDER: FinderState = {
  sgg: '일산서구', dong: '', middle: '', commute: 'mid',
  gradeMode: 'score', naesinTotal: '', subjectGrades: {}, band: 3,
  strong: [], weak: [], tracks: [], strategy: 'mix', types: ['autonomous'], interest: [],
};

export function toProfile(f: FinderState): Profile {
  const dong = f.dong ? GEO.dongs.find(d => d.sgg === f.sgg && d.name === f.dong) : undefined;
  const middle = f.middle ? GEO.middle.find(m => m.name === f.middle) : undefined;
  // 통학 기준: 사는 동네 > 다니는 중학교 > 구 중심
  const base = dong || middle;
  // 내신 점수 입력이면 총점·과목별 성취도로 위치를 추정하고, 그 위치의 성적대를 선발형 도전 여부·비중에 쓴다
  const total = parseNaesinTotal(f.naesinTotal);
  const standing = f.gradeMode === 'score' ? estimateStanding(total, f.subjectGrades) : null;
  return {
    sgg: f.sgg,
    origin: base ? { lat: base.lat, lng: base.lng } : null,
    originLabel: dong ? `${dong.name} (사는 동네)` : middle ? `${middle.name} (다니는 중학교)` : `${f.sgg} 중심`,
    dongName: dong?.name ?? null,
    middleName: middle?.name ?? null,
    middleSgg: middle?.sgg ?? null,
    commute: f.commute,
    band: standing ? standing.band : f.band,
    naesinTotal: standing ? total : null,
    subjectGrades: standing && standing.subjectCount ? { ...f.subjectGrades } : null,
    standing,
    strong: f.strong, weak: f.weak, tracks: f.tracks, strategy: f.strategy, types: f.types, interest: f.interest,
  };
}

export const trackLabel = (id: string) => (TRACKS[id] || TRACKS.none).label;
export const schoolName = (id: string) => SCHOOLS.find(s => s.id === id)?.name ?? id;

export const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
