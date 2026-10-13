// 추천 입력 폼 상태 ↔ 엔진 Profile 변환
import { GEO, SCHOOLS } from '../data';
import { BANDS, TRACKS, type BandId, type CommuteWeight, type Gender, type GenderPref, type Profile, type Strategy, type Subject } from '../engine';

export interface FinderState {
  sgg: string;
  dong: string; // 동 이름 ('' = 미입력)
  middle: string; // 중학교 이름 ('' = 미입력)
  gender: Gender;
  genderPref: GenderPref;
  commute: CommuteWeight;
  band: BandId;
  strong: Subject[];
  weak: Subject[];
  track: string;
  strategy: Strategy;
  types: string[];
  interest: string[];
}

export const DEFAULT_FINDER: FinderState = {
  sgg: '일산서구', dong: '', middle: '', gender: 'M', genderPref: 'any', commute: 'mid', band: 3,
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
    gender: f.gender, genderPref: f.genderPref, commute: f.commute, band: f.band,
    strong: f.strong, weak: f.weak, track: f.track, strategy: f.strategy, types: f.types, interest: f.interest,
  };
}

export const bandOf = (id: BandId) => BANDS.find(b => b.id === id) || BANDS[2];
export const trackLabel = (id: string) => (TRACKS[id] || TRACKS.none).label;
export const schoolName = (id: string) => SCHOOLS.find(s => s.id === id)?.name ?? id;

export const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
