// 후보군 선정 — 참조 buildPool 을 고양시(평준화, 2개 학군) 기준으로 이식.
// 2027 배정 규칙상 일반고는 거주 학군(구역) 안에서만 지망할 수 있으므로 기본 후보는 같은 구역의 일반고로 둔다.
import { zoneOfSgg } from './admission';
import { CITY, RADIUS_KM, SCHOOL_TYPES } from './constants';
import type { Point, Profile, School } from './types';

export function distanceKm(a: Point | null, b: { lat: number | null; lng: number | null } | null): number | null {
  if (!a || !b || a.lat == null || b.lat == null || b.lng == null) return null;
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function centroid(list: School[]): Point | null {
  const ok = list.filter(s => s.lat != null && s.lng != null);
  if (!ok.length) return null;
  return { lat: ok.reduce((a, s) => a + (s.lat as number), 0) / ok.length, lng: ok.reduce((a, s) => a + (s.lng as number), 0) / ok.length };
}

export interface PoolResult { pool: School[]; origin: Point | null; dist: Map<string, number | null> }

export function buildPool(all: School[], p: Profile): PoolResult {
  const home = all.filter(s => s.city === CITY);
  const origin = p.origin || centroid(home.filter(s => s.sgg === p.sgg)) || centroid(home);
  const dist = new Map<string, number | null>();
  all.forEach(s => dist.set(s.id, distanceKm(origin, s)));
  const d = (s: School) => dist.get(s.id) ?? null;
  const byDist = (list: School[]) => [...list].sort((a, b) => (d(a) ?? 1e9) - (d(b) ?? 1e9));

  // 지망할 수 있는 구역: 거주 학군(1단계) + 출신 중학교 소재 구역(2단계)
  const zones = new Set([zoneOfSgg(p.sgg), zoneOfSgg(p.middleSgg)].filter((z): z is 1 | 2 => z != null));
  const inZone = (s: School) => (s.admission?.equalized ? zones.has(s.admission.zone as 1 | 2) : true);

  // 통학권 학교: 지망 가능 구역 안에서 같은 구 또는 반경 R km, 너무 적으면 가까운 순으로 채움
  const nearby = (kinds: string[], min: number, max: number) => {
    const cand = home.filter(s => kinds.includes(s.kind) && inZone(s));
    let out = cand.filter(s => s.sgg === p.sgg || (d(s) != null && (d(s) as number) <= RADIUS_KM));
    if (out.length < min) out = byDist(cand).slice(0, min);
    return byDist(out).slice(0, max);
  };

  // 기본: 일반고
  const near = nearby(['일반고'], 10, 30);

  // 사용자가 고른 유형만 추가
  const extra: School[] = [];
  p.types.forEach(key => {
    const t = SCHOOL_TYPES[key];
    if (!t) return;
    if (t.scope === 'near') extra.push(...nearby(t.kinds, 1, 10));
    else if (t.scope === 'far') extra.push(...byDist(home.filter(s => t.kinds.includes(s.kind) && d(s) != null && (d(s) as number) <= RADIUS_KM * 2)).slice(0, 10));
    else extra.push(...byDist(home.filter(s => t.kinds.includes(s.kind))).slice(0, 12));
  });

  const picked = new Map<string, School>();
  [...near, ...extra].forEach(s => picked.set(s.id, s));
  // 관심 학교는 지역·구역·유형과 상관없이 후보에 추가한다 (배정 가능 여부는 카드에 표시).
  p.interest.forEach(id => {
    const s = all.find(x => x.id === id);
    if (!s) return;
    picked.set(id, s);
  });
  return { pool: [...picked.values()], origin, dist };
}
