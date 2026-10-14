// 길찾기 링크 — API 키 없이 쓰는 지도 서비스 URL.
// 카카오맵 공식 길찾기 URL(https://apis.map.kakao.com/web/guide/#routeurl)은 목적지만 지정할 수 있고,
// 출발지는 카카오맵에서 현재 위치(또는 직접 입력)로 정해진다. 네이버 지도는 장소 검색 화면으로 연다.
import type { School } from '../engine';

export const kakaoDirectionsUrl = (s: Pick<School, 'name' | 'lat' | 'lng'>) =>
  s.lat != null && s.lng != null
    ? `https://map.kakao.com/link/to/${encodeURIComponent(s.name)},${s.lat},${s.lng}`
    : `https://map.kakao.com/link/search/${encodeURIComponent(s.name)}`;

export const naverMapUrl = (s: Pick<School, 'name'>) => `https://map.naver.com/p/search/${encodeURIComponent(s.name)}`;
