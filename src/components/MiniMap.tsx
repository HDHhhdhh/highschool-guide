// 실제 도로 지도 — 네이버 지도 JS API v3(Web Dynamic Map) 위에 비교 대상 학교와 '집' 위치를 표시한다.
// 결과 화면에서만 쓰이므로 Results 에서 지연 로드하고, 지도 스크립트도 이 지도가 처음 열릴 때 불러온다.
// 스크립트를 못 불러오거나 인증에 실패하면(허용 도메인 밖 등) 번들 좌표로 그린 위치 개요도로 대신 보여 준다.
import { ExternalLink, Maximize2, Navigation } from 'lucide-react';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { GEO, SCHOOLS } from '../data';
import { distanceKm, type Point, type Result, type School } from '../engine';
import { kakaoDirectionsUrl, naverMapUrl } from '../lib/directions';
import { loadNaverMaps, onNaverAuthFailure } from '../lib/naverMaps';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ORIGIN = '__origin';
// lucide 'house' 아이콘 경로 (ISC) — 지도 마커는 HTML 문자열이라 직접 넣는다
const HOUSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';

// 선 색은 문자열로 넘겨야 하므로 디자인 토큰(CSS 변수) 값을 읽어 쓴다
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
// 지도 스크립트를 불러온 뒤에만 부른다
const latLng = (p: { lat: number | null; lng: number | null }) => new naver.maps.LatLng(p.lat!, p.lng!);

type MiniMapProps = { results: Result[]; origin: Point | null; originLabel: string; homeIsDong: boolean; initialSchoolId?: string };

// 외부 지도 스크립트에서 예상 못 한 오류가 나도 결과 화면 전체가 멈추지 않게 이 영역만 안내 문구로 바꾼다
class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="status" className="rounded-xl border bg-warn-soft px-4 py-3 text-sm leading-relaxed text-foreground/85">
        지도를 표시하지 못했습니다. 학교별 직선거리와 길찾기는 아래 학교 카드에서 볼 수 있습니다.
      </p>
    ) : this.props.children;
  }
}

export default function MiniMap(props: MiniMapProps) {
  return (
    <MapBoundary>
      <MapSection {...props} />
    </MapBoundary>
  );
}

function MapSection({ results, origin, originLabel, homeIsDong, initialSchoolId }: MiniMapProps) {
  const [homeKey, setHomeKey] = useState(ORIGIN);
  const [schoolId, setSchoolId] = useState(initialSchoolId ?? results[0]?.school.id ?? SCHOOLS[0].id);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const homeDong = GEO.dongs.find(d => `${d.sgg}/${d.name}` === homeKey);
  const home: Point | null = homeDong ? { lat: homeDong.lat, lng: homeDong.lng } : origin;
  const isHome = homeDong != null || homeIsDong; // 동을 알 때만 '집'으로 표시 (구 중심·중학교는 '기준')
  const homeTag = isHome ? '집' : '기준';
  const homeLabel = homeDong ? `${homeDong.sgg} ${homeDong.name}` : originLabel;
  const pts = useMemo(() => SCHOOLS.filter(s => s.lat != null && s.lng != null), []);
  const ranks = useMemo(() => new Map(results.map((r, i) => [r.school.id, i + 1])), [results]);
  const selected = pts.find(s => s.id === schoolId);
  const distance = selected ? distanceKm(home, selected) : null;

  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

  // only=추천 후보만(처음 화면), 아니면 비교 대상 전체
  const fitTo = (only: 'candidates' | 'all') => {
    const map = mapRef.current;
    if (!map) return;
    const list = only === 'candidates' ? pts.filter(s => ranks.has(s.id)) : pts;
    const coords = (list.length ? list : pts).map(latLng);
    if (home) coords.push(latLng(home));
    map.fitBounds(coords, { top: 48, right: 28, bottom: 28, left: 28 });
  };

  // 지도는 한 번만 만든다. 스크립트를 못 불러오거나 인증에 실패하면 개요도로 바꾼다.
  useEffect(() => {
    let active = true;
    let failed = false;
    // 인증에 실패하면 네이버 지도가 스스로 내부를 정리해 destroy() 가 예외를 던지므로 참조만 놓고 개요도로 바꾼다
    const fail = () => {
      failed = true;
      mapRef.current = null;
      if (active) setStatus('failed');
    };
    const offAuth = onNaverAuthFailure(fail);
    loadNaverMaps().then(nm => {
      if (!active || failed || !box.current) return;
      mapRef.current = new nm.Map(box.current, {
        center: new nm.LatLng(37.66, 126.79),
        zoom: 12,
        scrollWheel: false, // 페이지를 스크롤하다 지도가 확대·축소되지 않게
        draggable: !matchMedia('(pointer: coarse)').matches, // 휴대폰: 한 손가락은 페이지 스크롤, 두 손가락으로 확대
        zoomControl: true,
        zoomControlOptions: { position: nm.Position.TOP_RIGHT, style: nm.ZoomControlStyle.SMALL },
        scaleControl: false,
      });
      setStatus('ready');
    }, fail);
    return () => {
      active = false;
      offAuth();
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  // 처음, 그리고 집 위치가 바뀌면 집과 추천 후보가 모두 보이게 맞춘다 ('전체 보기'는 비교 대상 전체)
  useEffect(() => {
    if (status === 'ready') {
      if (initialSchoolId) pick(initialSchoolId);
      else fitTo('candidates');
    }
  }, [status, home?.lat, home?.lng]);

  // 학교·집 표시 다시 그리기 — HTML 마커라 색·글꼴은 globals.css 의 토큰 클래스로 입힌다
  useEffect(() => {
    const map = mapRef.current;
    if (status !== 'ready' || !map) return;
    const nm = naver.maps;
    const overlays: (naver.maps.Marker | naver.maps.Polyline)[] = [];
    if (home && selected) {
      overlays.push(new nm.Polyline({ map, path: [latLng(home), latLng(selected)], strokeColor: token('--navy'), strokeWeight: 2, strokeOpacity: 0.75, strokeStyle: 'shortdash', clickable: false }));
    }
    pts.forEach(s => {
      const rank = ranks.get(s.id);
      const top = rank != null && rank <= 3;
      const active = s.id === schoolId;
      const cls = cn('school-pin', top ? 'school-pin--top' : rank ? 'school-pin--candidate' : 'school-pin--other', active && 'school-pin--active', (active || top) && 'school-pin--labeled');
      const marker = new nm.Marker({
        map,
        position: latLng(s),
        clickable: true,
        zIndex: active ? 40 : top ? 30 : rank ? 20 : 10,
        icon: {
          content: `<div class="${cls}"><span class="school-pin__label">${rank ? `${rank}위 · ` : ''}${s.short}</span><span class="school-pin__dot"></span></div>`,
          size: new nm.Size(24, 24),
          anchor: new nm.Point(12, 12),
        },
      });
      nm.Event.addListener(marker, 'click', () => setSchoolId(s.id));
      overlays.push(marker);
    });
    if (home) {
      // '집' 표시는 학교 이름표보다 위에 올려 항상 보이게 한다
      overlays.push(new nm.Marker({
        map,
        position: latLng(home),
        title: `${isHome ? '집' : '기준 위치'}: ${homeLabel}`,
        zIndex: 100,
        icon: { content: `<div class="home-pin"><span class="home-pin__badge">${HOUSE_SVG}<b>${homeTag}</b></span></div>`, size: new nm.Size(80, 40), anchor: new nm.Point(40, 40) },
      }));
    }
    // 지도가 이미 정리됐으면(언마운트·인증 실패) 네이버 객체를 건드리지 않는다 — 정리된 지도의 마커는 예외를 던진다
    return () => {
      if (mapRef.current === map) overlays.forEach(o => o.setMap(null));
    };
  }, [status, home?.lat, home?.lng, isHome, homeTag, homeLabel, selected, schoolId, ranks, pts]);

  // 학교를 고르면 집과 그 학교가 함께 보이게
  const pick = (id: string) => {
    setSchoolId(id);
    const s = pts.find(x => x.id === id);
    const map = mapRef.current;
    if (!s || !map) return;
    map.fitBounds(home ? [latLng(s), latLng(home)] : [latLng(s)], { top: 64, right: 56, bottom: 56, left: 56, maxZoom: 15 });
  };

  return (
    <section aria-label="집과 학교 위치 지도" className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">지도에서 보는 우리 집과 {pts.length}개 학교</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{status === 'failed' ? '위치 개요도' : '네이버 지도'} · 직선거리는 동 중심 기준</p>
        </div>
        {status !== 'failed' && (
          <Button type="button" variant="outline" size="sm" onClick={() => fitTo('all')} disabled={status !== 'ready'} className="h-8 shrink-0 rounded-lg">
            <Maximize2 aria-hidden="true" /> 전체 보기
          </Button>
        )}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label id="map-home-label" className="mb-1.5 block text-sm font-medium">집 위치 · 사는 동</label>
          <Select value={homeKey} onValueChange={setHomeKey}>
            <SelectTrigger aria-labelledby="map-home-label" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ORIGIN}>입력한 위치: {originLabel}</SelectItem>
              {GEO.sggs.map(sgg => GEO.dongs.filter(d => d.sgg === sgg).map(d => <SelectItem key={`${sgg}/${d.name}`} value={`${sgg}/${d.name}`}>{sgg} {d.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label id="map-school-label" className="mb-1.5 block text-sm font-medium">학교 선택 · 지도에서 눌러도 됩니다</label>
          <Select value={schoolId} onValueChange={pick}>
            <SelectTrigger aria-labelledby="map-school-label" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[...pts].sort((a, b) => (ranks.get(a.id) ?? 999) - (ranks.get(b.id) ?? 999) || a.name.localeCompare(b.name, 'ko')).map(s => (
                <SelectItem key={s.id} value={s.id}>{ranks.get(s.id) ? `${ranks.get(s.id)}위 · ` : ''}{s.short} ({s.sgg})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <figure className="mt-3 flex flex-col gap-2">
        {status === 'failed' && (
          <p role="status" className="rounded-lg bg-warn-soft px-3 py-2 text-xs leading-relaxed text-foreground/85">
            네이버 지도를 불러오지 못해 좌표로 그린 위치 개요도로 보여 드립니다. 학교 선택·직선거리·길찾기는 그대로 쓸 수 있습니다.
          </p>
        )}
        {/* isolate: 지도 내부 z-index 가 고정 상단 바·선택 목록 위로 올라오지 않게 가둔다 */}
        <div className="relative isolate overflow-hidden rounded-xl border">
          {status === 'failed' ? (
            <DotOverview pts={pts} ranks={ranks} schoolId={schoolId} onPick={pick} home={home} homeTag={homeTag} />
          ) : (
            <div ref={box} role="region" aria-label={`도로 지도: 비교 대상 ${pts.length}개 학교와 ${isHome ? '집' : '기준 위치'}`} className="h-88 w-full bg-muted sm:h-104" />
          )}
          {status === 'loading' && <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">지도를 불러오는 중…</p>}
        </div>
        <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {!initialSchoolId && <>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />추천 상위 3개 학교</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-navy" aria-hidden="true" />그 밖의 후보</span>
          </>}
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-muted-foreground/75" aria-hidden="true" />{initialSchoolId ? '학교 위치 · 선택한 학교는 이름 표시' : '후보 외 학교'}</span>
          <span className="inline-flex items-center gap-1.5"><span className="rounded-full bg-navy px-1.5 text-[0.6875rem] font-bold text-primary-foreground" aria-hidden="true">{homeTag}</span>{homeLabel}</span>
          {status === 'ready' && <span className="sm:hidden">두 손가락으로 확대·축소</span>}
        </figcaption>
      </figure>

      {selected && (
        <div aria-live="polite" className="mt-3 flex flex-col gap-2.5 rounded-lg bg-secondary px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p><b>{isHome ? `집(${homeLabel})` : homeLabel} → {selected.name}</b> · {distance == null ? '거리 정보 없음' : `직선거리 약 ${distance.toFixed(1)}km`}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{selected.address}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild size="sm" className="h-9 rounded-lg">
              <a href={kakaoDirectionsUrl(selected)} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" /> 카카오맵 길찾기</a>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-lg bg-card">
              <a href={naverMapUrl(selected)} target="_blank" rel="noreferrer">네이버 지도 <ExternalLink aria-hidden="true" /></a>
            </Button>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        길찾기는 카카오맵에서 도착지(학교)가 정해진 채로 열리고, 출발지(현재 위치 또는 직접 입력)를 정하면 대중교통·자동차 경로와 소요 시간을 볼 수 있습니다.
        {!initialSchoolId && '여기서 바꾼 집 위치는 지도에만 적용되므로, 추천 점수·배정 조건을 바꾸려면 학생 정보의 사는 지역을 수정하고 다시 분석하세요.'}
      </p>
    </section>
  );
}

// 네이버 지도를 쓸 수 없을 때의 위치 개요도 — 번들 좌표만으로 학교와 집 위치를 그린다(도로·타일 없음).
function DotOverview({ pts, ranks, schoolId, onPick, home, homeTag }: { pts: School[]; ranks: Map<string, number>; schoolId: string; onPick: (id: string) => void; home: Point | null; homeTag: string }) {
  const W = 520, H = 320, PAD = 32;
  const all = [...pts.map(s => ({ lat: s.lat!, lng: s.lng! })), ...(home ? [home] : [])];
  const lats = all.map(p => p.lat), lngs = all.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanLng = Math.max((maxLng - minLng) * kx, 0.01), spanLat = Math.max(maxLat - minLat, 0.01);
  const scale = Math.min((W - PAD * 2) / spanLng, (H - PAD * 2) / spanLat);
  const ox = (W - spanLng * scale) / 2, oy = (H - spanLat * scale) / 2;
  const X = (lng: number) => ox + (lng - minLng) * kx * scale;
  const Y = (lat: number) => H - (oy + (lat - minLat) * scale);
  const selected = pts.find(s => s.id === schoolId);
  const selectedRank = selected && ranks.get(selected.id);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`위치 개요도: 비교 대상 ${pts.length}개 학교와 ${homeTag === '집' ? '집' : '기준 위치'}`} className="block h-auto w-full bg-muted">
      <text x={W - 16} y={24} textAnchor="end" className="fill-muted-foreground text-xs">북 ↑</text>
      {home && selected && <line x1={X(home.lng)} y1={Y(home.lat)} x2={X(selected.lng!)} y2={Y(selected.lat!)} className="stroke-navy/75" strokeWidth={2} strokeDasharray="6 6" />}
      {pts.map(s => {
        const rank = ranks.get(s.id), top = rank != null && rank <= 3, active = s.id === schoolId;
        const x = X(s.lng!), y = Y(s.lat!);
        return (
          <g key={s.id} role="button" tabIndex={0} aria-label={`${s.name}, ${s.sgg}${rank ? `, 추천 ${rank}위` : ', 추천 후보 외'}`} aria-pressed={active}
            onClick={() => onPick(s.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id); } }}
            className="cursor-pointer outline-none focus-visible:[&>circle:last-child]:stroke-ring">
            <circle cx={x} cy={y} r="12" fill="transparent" />
            <circle cx={x} cy={y} r={active ? 10 : top ? 8 : 6} strokeWidth={active ? 3 : 2} className={cn(top ? 'fill-primary' : rank ? 'fill-navy' : 'fill-muted-foreground/75', active ? 'stroke-navy' : 'stroke-card')} />
          </g>
        );
      })}
      {selected && (
        <text x={X(selected.lng!)} y={Y(selected.lat!) - 16} textAnchor="middle" className="fill-navy stroke-muted text-sm font-semibold [paint-order:stroke] [stroke-width:4px]">
          {selectedRank ? `${selectedRank}위 · ` : ''}{selected.short}
        </text>
      )}
      {home && (
        <g transform={`translate(${X(home.lng)} ${Y(home.lat)})`}>
          <path d="M0-11 11-1 8-1 8 9-8 9-8-1-11-1Z" strokeWidth={1.5} className="fill-navy stroke-card" />
          <text y={-16} textAnchor="middle" className="fill-navy stroke-muted text-xs font-bold [paint-order:stroke] [stroke-width:4px]">{homeTag}</text>
        </g>
      )}
    </svg>
  );
}
