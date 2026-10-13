import type { Point, Result } from '../engine';

// 네트워크 타일 없이 후보 학교의 상대 위치만 보여 주는 개요도 (위경도를 평면에 단순 투영)
export function MiniMap({ results, origin, originLabel }: { results: Result[]; origin: Point | null; originLabel: string }) {
  const pts = results.filter(r => r.school.lat != null && r.school.lng != null && !r.flags.otherCity).slice(0, 14);
  if (!pts.length) return null;
  const lats = pts.map(r => r.school.lat as number), lngs = pts.map(r => r.school.lng as number);
  if (origin) { lats.push(origin.lat); lngs.push(origin.lng); }
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const W = 360, H = 220, PAD = 30;
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanLng = Math.max((maxLng - minLng) * kx, 0.01), spanLat = Math.max(maxLat - minLat, 0.01);
  const scale = Math.min((W - PAD * 2) / spanLng, (H - PAD * 2) / spanLat);
  const ox = (W - spanLng * scale) / 2, oy = (H - spanLat * scale) / 2;
  const X = (lng: number) => ox + (lng - minLng) * kx * scale;
  const Y = (lat: number) => H - (oy + (lat - minLat) * scale);
  const homeLabel = originLabel.replace(/\s*\(.*\)$/, '');
  return (
    <figure className="m-0 flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="후보 학교 위치 개요도" className="mx-auto block h-auto w-full max-w-[520px]">
        <rect x="0" y="0" width={W} height={H} rx="14" className="fill-muted" />
        {pts.map((r, i) => {
          const top = i < 3;
          const x = X(r.school.lng as number), y = Y(r.school.lat as number);
          return (
            <g key={r.school.id}>
              <circle cx={x} cy={y} r={top ? 7 : 4.5} className={top ? 'fill-primary' : 'fill-muted-foreground/70'} />
              {top && <text x={x + 10} y={y - 6} className="fill-foreground text-[12px] font-semibold [paint-order:stroke] [stroke:var(--muted)] [stroke-width:3px]">{i + 1}. {r.school.short}</text>}
            </g>
          );
        })}
        {origin && (
          <g>
            <path className="fill-navy" transform={`translate(${X(origin.lng)} ${Y(origin.lat)}) scale(1.1)`} d="M0-9 2.6-3 9-2.4 4.2 2 5.5 8.6 0 5.4-5.5 8.6-4.2 2-9-2.4-2.6-3Z" />
            <text x={X(origin.lng)} y={Y(origin.lat) + 22} textAnchor="middle" className="fill-navy text-[11px] font-semibold [paint-order:stroke] [stroke:var(--muted)] [stroke-width:3px]">{homeLabel}</text>
          </g>
        )}
      </svg>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2.5 rounded-full bg-primary" />추천 상위 3개교</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2.5 rounded-full bg-muted-foreground/70" />그 밖의 후보 (가까운 14곳)</span>
        {origin && <span className="inline-flex items-center gap-1"><i className="inline-block size-2.5 rounded-sm bg-navy" />{originLabel}</span>}
      </figcaption>
    </figure>
  );
}
