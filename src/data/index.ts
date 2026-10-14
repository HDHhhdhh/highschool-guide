// 데이터 진입점. 학교 데이터는 빌드 시점에 JSON으로 번들되며 런타임 네트워크 요청이 없다.
//
// 확장 방법
//  1) 원자료가 늘면 ../highschool-data 에 넣고 `npm run data` 로 schools.json 을 다시 만든다.
//  2) 일부 학교에만 새 필드를 덧붙이려면 extra.json 에 { "<학교 id>": { "필드": 값 } } 형태로 적는다.
//     (예: 새로 확보한 성취도 achData, 중점학교 지정 등) — id 별로 얕게 병합된다.
import type { ParentReview, School } from '../engine/types';
import schoolsJson from './schools.json';
import extraJson from './extra.json';
import geoJson from './geo.json';
import metaJson from './meta.json';
import admissionJson from './admission.json';
import reviewsJson from './reviews.json';

export interface Geo {
  source: string;
  sggs: string[];
  dongs: { sgg: string; name: string; lat: number; lng: number }[];
  middle: { sgg: string; name: string; lat: number; lng: number }[];
}

export interface Meta {
  capturedAt: string;
  count: number;
  regions: Record<string, number>;
  withCareer: number;
  withAchievement: number;
  withCourses: number;
  withDropout: number;
  withDesignation: number;
  supplementCapturedAt: string | null;
}

export interface AdmissionRules {
  capturedAt: string;
  goyang: {
    schoolYear: number; equalized: boolean; zones: Record<string, string>; selection: string;
    stage1: { name: string; preferences: number; eligibleSchools: string; method: string };
    stage2: { name: string; eligibleStudents: string; preferences: string; method: string };
    exceptionSchools: Record<string, string>; concurrent: string | null; source: string; limitations: string[];
  };
  paju: {
    schoolYear: number; equalized: boolean; schoolId: string; admissionType: string; selection: string;
    capacity: { total: number; classes: number; studentsPerClass: number; general: number; localTalent: number };
    generalEligibility: string; localTalentEligibility: string;
    applicationDates: { start: string; end: string; selection: string; announcement: string } | null; source: string; limitations: string[];
  };
}

const extra = extraJson as Record<string, Partial<School>>;

export const SCHOOLS: School[] = (schoolsJson as unknown as School[]).map(s => (extra[s.id] ? { ...s, ...extra[s.id] } : s));
export const GEO: Geo = geoJson as Geo;
export const REVIEWS: ParentReview[] = reviewsJson as ParentReview[];
export const ADMISSION: AdmissionRules = admissionJson as AdmissionRules;
// 개수는 실제 번들된 학교 목록에서 다시 센다 (제외 학교가 있어도 화면 숫자가 어긋나지 않게)
export const META: Meta = {
  ...(metaJson as Meta),
  count: SCHOOLS.length,
  regions: SCHOOLS.reduce<Record<string, number>>((a, s) => { const k = s.city === s.sgg ? s.city : `${s.city} ${s.sgg}`; a[k] = (a[k] || 0) + 1; return a; }, {}),
  withAchievement: SCHOOLS.filter(s => s.achData).length,
  withCareer: SCHOOLS.filter(s => s.career).length,
  withCourses: SCHOOLS.filter(s => s.subjects).length,
  withDropout: SCHOOLS.filter(s => s.dropoutRate != null).length,
  withDesignation: SCHOOLS.filter(s => s.designations?.length).length,
};

export const schoolById = (id: string) => SCHOOLS.find(s => s.id === id);
