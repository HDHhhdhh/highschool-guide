// 추천 입력 폼 상태 ↔ 엔진 Profile 변환
import { GEO, SCHOOLS } from '../data';
import { BANDS, TRACKS, type BandId, type CommuteWeight, type Profile, type Strategy, type Subject, type SubjectGrade } from '../engine';

export interface FinderState {
  sgg: string;
  dong: string; // 동 이름 ('' = 미입력)
  middle: string; // 중학교 이름 ('' = 미입력)
  commute: CommuteWeight;
  band: BandId;
  detailed: boolean;
  subjectGrades: Record<Subject, SubjectGrade>;
  strong: Subject[];
  weak: Subject[];
  track: string;
  strategy: Strategy;
  types: string[];
  interest: string[];
}

export const DEFAULT_FINDER: FinderState = {
  sgg: '일산서구', dong: '', middle: '', commute: 'mid', band: 3,
  detailed: false, subjectGrades: { 국어: 3, 수학: 3, 영어: 3, 사회: 3, 과학: 3 },
  strong: [], weak: [], track: 'none', strategy: 'mix', types: ['autonomous'], interest: [],
};

export function toProfile(f: FinderState): Profile {
  const dong = f.dong ? GEO.dongs.find(d => d.sgg === f.sgg && d.name === f.dong) : undefined;
  const middle = f.middle ? GEO.middle.find(m => m.name === f.middle) : undefined;
  // 통학 기준: 사는 동네 > 다니는 중학교 > 구 중심
  const base = dong || middle;
  return {
    sgg: f.sgg,
    origin: base ? { lat: base.lat, lng: base.lng } : null,
    originLabel: dong ? `${dong.name} (사는 동네)` : middle ? `${middle.name} (다니는 중학교)` : `${f.sgg} 중심`,
    dongName: dong?.name ?? null,
    middleName: middle?.name ?? null,
    middleSgg: middle?.sgg ?? null,
    commute: f.commute, band: f.band,
    subjectGrades: f.detailed ? { ...f.subjectGrades } : null,
    strong: f.strong, weak: f.weak, track: f.track, strategy: f.strategy, types: f.types, interest: f.interest,
  };
}

export const bandOf = (id: BandId) => BANDS.find(b => b.id === id) || BANDS[2];
export const trackLabel = (id: string) => (TRACKS[id] || TRACKS.none).label;
export const schoolName = (id: string) => SCHOOLS.find(s => s.id === id)?.name ?? id;

export const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
