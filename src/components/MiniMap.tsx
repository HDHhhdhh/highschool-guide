import { useState } from 'react';
import { GEO, SCHOOLS } from '../data';
import { distanceKm, type Point, type Result } from '../engine';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 번들 좌표만 쓰는 위치 개요도. 도로·타일·외부 API 없이 모든 학교를 비교한다.
export function MiniMap({ results, origin, originLabel }: { results: Result[]; origin: Point | null; originLabel: string }) {
  const [homeKey, setHomeKey] = useState('__origin');
  const [schoolId, setSchoolId] = useState(results[0]?.school.id ?? SCHOOLS[0].id);
  const homeDong = GEO.dongs.find(d => `${d.sgg}/${d.name}` === homeKey);
  const home = homeDong ?? origin;
  const homeLabel = homeDong ? `${homeDong.sgg} ${homeDong.name}` : originLabel;
  const pts = SCHOOLS.filter(s => s.lat != null && s.lng != null);
  const selected = pts.find(s => s.id === schoolId);
  const ranks = new Map(results.map((r, i) => [r.school.id, i + 1]));
  const lats = pts.map(s => s.lat as number), lngs = pts.map(s => s.lng as number);
  if (home) { lats.push(home.lat); lngs.push(home.lng); }
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const W = 520, H = 320, PAD = 32;
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanLng = Math.max((maxLng - minLng) * kx, 0.01), spanLat = Math.max(maxLat - minLat, 0.01);
  const scale = Math.min((W - PAD * 2) / spanLng, (H - PAD * 2) / spanLat);
  const ox = (W - spanLng * scale) / 2, oy = (H - spanLat * scale) / 2;
  const X = (lng: number) => ox + (lng - minLng) * kx * scale;
  const Y = (lat: number) => H - (oy + (lat - minLat) * scale);
  const distance = selected ? distanceKm(home, selected) : null;

  return (
    <section aria-label="집과 전체 학교 위치 비교" className="rounded-xl border p-4">
      <h3 className="font-semibold text-navy">우리 집과 전체 {SCHOOLS.length}개교 위치 비교</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">도로 지도가 아닌 좌표 개요도입니다. 동 중심 기준 직선거리이며 실제 통학 시간과 다릅니다.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label id="map-home-label" className="mb-1.5 block text-sm font-medium">집 위치 · 사는 동</label>
          <Select value={homeKey} onValueChange={setHomeKey}>
            <SelectTrigger aria-labelledby="map-home-label" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__origin">입력한 거리 기준: {originLabel}</SelectItem>
              {GEO.sggs.map(sgg => GEO.dongs.filter(d => d.sgg === sgg).map(d => <SelectItem key={`${sgg}/${d.name}`} value={`${sgg}/${d.name}`}>{sgg} {d.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label id="map-school-label" className="mb-1.5 block text-sm font-medium">비교할 학교 · 지도에서 선택 가능</label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger aria-labelledby="map-school-label" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{pts.map(s => <SelectItem key={s.id} value={s.id}>{s.short} ({s.sgg})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <figure className="mt-3 flex flex-col gap-2">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`전체 ${pts.length}개교 위치 개요도`} className="mx-auto block h-auto w-full max-w-[640px]">
          <rect width={W} height={H} rx="14" className="fill-muted" />
          <text x={W - 20} y="25" textAnchor="end" className="fill-muted-foreground text-[12px]">북 ↑</text>
          {home && selected && <line x1={X(home.lng)} y1={Y(home.lat)} x2={X(selected.lng!)} y2={Y(selected.lat!)} className="stroke-navy/40" strokeDasharray="5 4" />}
          {pts.map(s => {
            const rank = ranks.get(s.id), top = rank != null && rank <= 3;
            const x = X(s.lng!), y = Y(s.lat!), active = s.id === schoolId;
            return (
              <g key={s.id} role="button" tabIndex={0} aria-label={`${s.name}, ${s.sgg}, 위치 선택`} aria-pressed={active}
                onClick={() => setSchoolId(s.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSchoolId(s.id); } }}
                className="cursor-pointer outline-none focus:[&>circle]:stroke-navy focus:[&>circle]:stroke-[3px]">
                <title>{s.name} · {s.sgg}{rank ? ` · 추천 ${rank}위` : ' · 추천 후보 외'}</title>
                <circle cx={x} cy={y} r="12" fill="transparent" />
                <circle cx={x} cy={y} r={active ? 8 : 5} className={top ? 'fill-primary' : rank ? 'fill-navy/70' : 'fill-muted-foreground/50'} stroke={active ? '#002060' : 'white'} strokeWidth={active ? 3 : 1} />
              </g>
            );
          })}
          {selected && <text x={Math.min(W - 100, Math.max(12, X(selected.lng!) + 12))} y={Y(selected.lat!) - 12} className="fill-navy text-[13px] font-semibold [paint-order:stroke] [stroke:var(--muted)] [stroke-width:4px]">{selected.short}</text>}
          {home && (
            <g>
              <path className="fill-navy stroke-white" transform={`translate(${X(home.lng)} ${Y(home.lat)})`} d="M0-10 10-1 7-1 7 9-7 9-7-1-10-1Z" />
              <title>집 위치: {homeLabel}</title>
            </g>
          )}
        </svg>
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>주황: 추천 상위 3개교</span><span>네이비: 그 밖의 후보</span><span>회색: 후보 외 학교</span><span>집 모양: {homeLabel}</span>
        </figcaption>
      </figure>
      {selected && <p aria-live="polite" className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm"><b>{homeLabel} → {selected.name}</b> · {distance == null ? '거리 정보 없음' : `직선거리 약 ${distance.toFixed(1)}km`}<span className="mt-1 block text-xs text-muted-foreground">{selected.address}</span></p>}
      <p className="mt-2 text-xs text-muted-foreground">여기서 바꾼 집 위치는 지도 비교에만 적용됩니다. 추천 점수·배정 조건을 바꾸려면 학생 정보의 사는 지역을 수정하고 다시 분석하세요.</p>
    </section>
  );
}
