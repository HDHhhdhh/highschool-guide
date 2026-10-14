// 실제 도로 지도 — Leaflet + OpenStreetMap 타일(API 키 없음) 위에 비교 대상 학교와 '집' 위치를 표시한다.
// 결과 화면에서만 쓰이므로 Results 에서 지연 로드한다(leaflet 번들이 첫 화면에 실리지 않음).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, Maximize2, Navigation } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GEO, SCHOOLS } from '../data';
import { distanceKm, type Point, type Result } from '../engine';
import { kakaoDirectionsUrl, naverMapUrl } from '../lib/directions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ORIGIN = '__origin';
const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 기여자';
// lucide 'house' 아이콘 경로 (ISC) — divIcon 은 HTML 문자열이라 직접 넣는다
const HOUSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';

// Leaflet 은 색을 문자열로 받으므로 디자인 토큰(CSS 변수) 값을 읽어 쓴다
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function MiniMap({ results, origin, originLabel, homeIsDong }: { results: Result[]; origin: Point | null; originLabel: string; homeIsDong: boolean }) {
  const [homeKey, setHomeKey] = useState(ORIGIN);
  const [schoolId, setSchoolId] = useState(results[0]?.school.id ?? SCHOOLS[0].id);
  const homeDong = GEO.dongs.find(d => `${d.sgg}/${d.name}` === homeKey);
  const home: Point | null = homeDong ? { lat: homeDong.lat, lng: homeDong.lng } : origin;
  const isHome = homeDong != null || homeIsDong; // 동을 알 때만 '집'으로 표시 (구 중심·중학교는 '기준')
  const homeLabel = homeDong ? `${homeDong.sgg} ${homeDong.name}` : originLabel;
  const pts = useMemo(() => SCHOOLS.filter(s => s.lat != null && s.lng != null), []);
  const ranks = useMemo(() => new Map(results.map((r, i) => [r.school.id, i + 1])), [results]);
  const selected = pts.find(s => s.id === schoolId);
  const distance = selected ? distanceKm(home, selected) : null;

  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // only=추천 후보만(처음 화면), 아니면 비교 대상 전체
  const fitTo = (only: 'candidates' | 'all') => {
    const map = mapRef.current;
    if (!map) return;
    const list = only === 'candidates' ? pts.filter(s => ranks.has(s.id)) : pts;
    const b = L.latLngBounds((list.length ? list : pts).map(s => [s.lat!, s.lng!] as L.LatLngTuple));
    if (home) b.extend([home.lat, home.lng]);
    map.fitBounds(b, { padding: [28, 28] });
  };
  const fitAll = () => fitTo('all');

  // 지도는 한 번만 만든다
  useEffect(() => {
    if (!box.current) return;
    const map = L.map(box.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomSnap: 0.5 });
    L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
    // '집' 표시는 학교 이름표(tooltipPane 650)보다 위에 올려 항상 보이게 한다
    map.createPane('home').style.zIndex = '660';
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  // 처음, 그리고 집 위치가 바뀌면 집과 추천 후보가 모두 보이게 맞춘다 ('전체 보기'는 32교 전체)
  useEffect(() => fitTo('candidates'), [home?.lat, home?.lng]);

  // 학교·집 표시 다시 그리기
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const c = { primary: token('--primary'), navy: token('--navy'), muted: token('--muted-foreground'), card: token('--card') };
    if (home && selected) {
      L.polyline([[home.lat, home.lng], [selected.lat!, selected.lng!]], { color: c.navy, weight: 2, opacity: 0.75, dashArray: '6 6', interactive: false }).addTo(layer);
    }
    pts.forEach(s => {
      const rank = ranks.get(s.id);
      const top = rank != null && rank <= 3;
      const active = s.id === schoolId;
      const marker = L.circleMarker([s.lat!, s.lng!], {
        radius: active ? 10 : top ? 8 : 6,
        color: active ? c.navy : c.card,
        weight: active ? 3 : 2,
        fillColor: top ? c.primary : rank ? c.navy : c.muted,
        fillOpacity: rank ? 1 : 0.75,
      });
      marker.bindTooltip(`${rank ? `${rank}위 · ` : ''}${s.short}`, { permanent: active || top, direction: 'top', offset: [0, -8], className: cn('map-label', active && 'map-label--active') });
      marker.on('click', () => setSchoolId(s.id));
      marker.addTo(layer);
    });
    if (home) {
      L.marker([home.lat, home.lng], {
        icon: L.divIcon({ className: 'home-pin', html: `<span class="home-pin__badge">${HOUSE_SVG}<b>${isHome ? '집' : '기준'}</b></span>`, iconSize: [64, 40], iconAnchor: [32, 40] }),
        pane: 'home',
        keyboard: false,
        title: `${isHome ? '집' : '기준 위치'}: ${homeLabel}`,
      }).addTo(layer);
    }
  }, [home?.lat, home?.lng, isHome, homeLabel, selected, schoolId, ranks, pts]);

  // 학교를 고르면 집과 그 학교가 함께 보이게
  const pick = (id: string) => {
    setSchoolId(id);
    const s = pts.find(x => x.id === id);
    const map = mapRef.current;
    if (!s || !map) return;
    const b = L.latLngBounds([[s.lat!, s.lng!]]);
    if (home) b.extend([home.lat, home.lng]);
    map.flyToBounds(b, { padding: [56, 56], maxZoom: 15, duration: 0.6 });
  };

  return (
    <section aria-label="집과 학교 위치 지도" className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">지도에서 보는 우리 집과 {pts.length}개교</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">OpenStreetMap 도로 지도 · 직선거리는 동 중심 기준</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fitAll} className="h-8 shrink-0 rounded-lg">
          <Maximize2 aria-hidden="true" /> 전체 보기
        </Button>
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
        {/* isolate: Leaflet 내부 z-index(400~1000)가 고정 상단 바·선택 목록 위로 올라오지 않게 가둔다 */}
        <div className="isolate overflow-hidden rounded-xl border">
          <div ref={box} role="region" aria-label={`도로 지도: 비교 대상 ${pts.length}개교와 ${isHome ? '집' : '기준 위치'}`} className="h-88 w-full bg-muted sm:h-104" />
        </div>
        <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />추천 상위 3개교</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-navy" aria-hidden="true" />그 밖의 후보</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-muted-foreground/75" aria-hidden="true" />후보 외 학교</span>
          <span className="inline-flex items-center gap-1.5"><span className="rounded-full bg-navy px-1.5 text-[0.6875rem] font-bold text-primary-foreground" aria-hidden="true">집</span>{homeLabel}</span>
          <span className="sm:hidden">두 손가락으로 확대·이동</span>
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
        여기서 바꾼 집 위치는 지도에만 적용되므로, 추천 점수·배정 조건을 바꾸려면 학생 정보의 사는 지역을 수정하고 다시 분석하세요.
      </p>
    </section>
  );
}
