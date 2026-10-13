// 2027학년도 배정·전형 경로 — 경기도교육청 공식 발표(고양 평준화)와 운정고 모집요항(파주 비평준화)을 그대로 요약한다.
// 고양: 1단계 학군내배정(거주 학군 내 일반고 5개 지망, 지망 순위 반영 추첨) → 2단계 구역내배정(미배정자, 출신 중학교 소재 구역 내 일반고 지망 추첨)
import type { AssignInfo, Profile, School } from './types';

export const ZONE_NAME: Record<number, string> = { 1: '덕양구', 2: '일산동구·일산서구' };
export const zoneOfSgg = (sgg: string | null | undefined): 1 | 2 | null => (sgg === '덕양구' ? 1 : sgg === '일산동구' || sgg === '일산서구' ? 2 : null);

export function assignRoute(s: School, p: Profile): AssignInfo {
  const a = s.admission;
  if (!a) return { kind: 'unknown', zone: null, route: '배정 정보 없음', detail: '학교·교육청에 확인하세요.', assignable: true };
  if (a.policy === 'paju') {
    return {
      kind: 'paju-school', zone: null, route: '파주 비평준화 · 운정고 자체 전형',
      detail: '중학교 내신성적 200점 만점으로 선발 · 360명(일반전형 180 · 지역인재 180) · 경기도 소재 중학교 졸업예정자 등 지원 가능(세부 자격·일정은 2027 모집요항 확인). 고양 학군의 지망·추첨 방식은 적용되지 않습니다.',
      assignable: true,
    };
  }
  if (!a.equalized) {
    const special = s.kind === '외고' || s.kind === '국제고';
    return {
      kind: 'school-selection', zone: null, route: '학교별 전형 (평준화 추첨 대상 아님)',
      detail: special
        ? '학교 모집요항으로 지원. 일반고에 동시 지원하려면 1지망을 이 학교로 쓰고 2지망부터 일반고를 지망합니다(불합격 시 2지망부터 반영해 추첨).'
        : '학교 모집요항(학과·전형)으로 지원합니다. 평준화 지망·추첨 대상이 아닙니다.',
      assignable: true,
    };
  }
  const homeZone = zoneOfSgg(p.sgg);
  const middleZone = zoneOfSgg(p.middleSgg) ?? homeZone;
  const zone = a.zone;
  const zoneLabel = zone ? `${zone}구역(${ZONE_NAME[zone]})` : '구역 미확인';
  const stage1Only = a.stages.length === 1 && a.stages[0] === '학군내배정';
  if (zone != null && zone === homeZone) {
    const stage2 = !stage1Only && middleZone === zone;
    return {
      kind: 'stage1', zone, assignable: true,
      route: `${zoneLabel} · 1단계 학군내배정 지망 가능`,
      detail: `거주 학군 안의 일반고라 1단계에서 5개 지망 중 하나로 쓸 수 있습니다(지망 순위 반영 추첨).${stage2 ? ' 미배정 시 2단계 구역내배정 대상에도 들어갑니다.' : stage1Only ? ' 이 학교는 한시적으로 학군내배정만 실시합니다.' : ''}`,
    };
  }
  if (zone != null && zone === middleZone && !stage1Only) {
    return {
      kind: 'stage2-only', zone, assignable: true,
      route: `${zoneLabel} · 2단계 구역내배정만 가능`,
      detail: '거주 학군 밖이지만 출신 중학교 소재 구역의 학교라, 1단계 미배정 시 2단계 구역내배정 지망으로만 갈 수 있습니다.',
    };
  }
  return {
    kind: 'out-of-zone', zone, assignable: false,
    route: `${zoneLabel} · 거주 학군 밖`,
    detail: `${homeZone ? `${homeZone}구역(${ZONE_NAME[homeZone]})` : '거주 학군'} 학생은 2027 평준화 배정(학군내·구역내)으로 이 학교에 갈 수 없습니다. 전입학 등 개별 사유는 교육지원청에 확인하세요.`,
  };
}
