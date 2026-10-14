// 수집된 공시 데이터(../highschool-data/*.json)를 앱이 쓰는 형태로 정규화해 src/data/에 번들한다.
// 실행: npm run data   (생성물은 저장소에 포함되므로 Vercel 빌드 때는 다시 실행할 필요 없음)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.env.HS_DATA_DIR || path.resolve(here, '../../highschool-data');
const OUT = path.resolve(here, '../src/data');

const index = JSON.parse(await readFile(path.join(SRC, 'index.json'), 'utf8'));

// 보충 자료(supplement/): 중점·특색 지정, 자율학교 O/X, 학업중단율, 배정 규칙. 없으면 해당 필드는 null.
const supplementIndexPath = path.join(SRC, 'supplement-index.json');
const supplementIndex = await readFile(supplementIndexPath, 'utf8').then(JSON.parse).catch(() => null);
const supplementById = new Map();
if (supplementIndex) {
  for (const e of supplementIndex.schools) {
    const j = JSON.parse(await readFile(path.join(SRC, e.file), 'utf8'));
    supplementById.set(e.ids.site, j.normalized);
  }
}
const admissionRules = await readFile(path.join(SRC, 'supplement', 'admission-rules.json'), 'utf8').then(JSON.parse).catch(() => null);

// 지정 근거 → 짧은 표시 이름
const DESIGNATION_LABEL = { '과학중점학교': '과학중점', 'AI 중점학교': 'AI 중점', 'AI 융합교육학급': 'AI 융합학급', 'IB 후보학교': 'IB 후보', '자율형 공립고 2.0': '자공고 2.0' };

// 운영자 요청으로 비교 대상에서 빼는 학교 (경기영상과학고·고양예술고·고양일고·신원고·신일비즈니스고·일산고·일산국제컨벤션고).
// 다시 생성해도 돌아오지 않도록 여기서 걸러낸다. src/data/reviews.json 에서도 이 id 의 후기는 두지 않는다.
const EXCLUDED_IDS = new Set(['S090000798', 'S090005418', 'S090005599', 'S090007444', 'S090000665', 'S090000771', 'S090000775']);

const KIND = { 일반고: '일반고', '자율형 공립고': '자율형 공립고', 외고: '외고', 국제고: '국제고', 예술고: '예술고', 특성화고: '특성화고' };
const sggOf = region => region.replace(/^고양시\s*/, '');
const cityOf = region => (region.startsWith('고양시') ? '고양시' : region);
const r1 = v => (v == null ? null : Math.round(v * 10) / 10);

// 성취도: [{term, grade, subject, mean, distributionPercent}] → { '2026-1': { '1': [[과목, 평균, [A,B,C,D,E]]] } }
function achData(list) {
  if (!Array.isArray(list) || !list.length) return null;
  const out = {};
  for (const a of list) {
    const d = a.distributionPercent || {};
    const dist = ['A', 'B', 'C', 'D', 'E'].map(k => d[k]).filter(v => v != null);
    ((out[a.term] ||= {})[String(a.grade)] ||= []).push([a.subject, a.mean, dist]);
  }
  return out;
}

const schools = [];
for (const e of index.schools) {
  if (EXCLUDED_IDS.has(e.id)) continue;
  const raw = JSON.parse(await readFile(path.join(SRC, e.file), 'utf8'));
  const n = raw.normalized;
  const kind = KIND[n.schoolType?.site] || n.schoolType?.neis || '일반고';
  const career = {};
  for (const g of n.graduates || []) {
    career[String(g.year)] = { univ: g.university4YearPercent, college: g.collegePercent, etc: g.otherPercent, job: g.employmentPercent, abroad: g.abroadPercent, n: g.total };
  }
  const total = n.students?.total ?? null;
  const classes = n.classes?.total ?? null;
  const sup = supplementById.get(e.id) || null;
  const sp = sup?.programs || null;
  const designations = (sp?.designationEvidence || []).map(d => ({
    kind: d.kind,
    label: DESIGNATION_LABEL[d.kind] || d.kind,
    status: d.status,
    year: d.schoolYear ?? null,
    evidence: d.quote || null,
    url: d.url || null,
  }));
  const adm = sup?.admissionRules || null;
  schools.push({
    id: e.id,
    name: n.name,
    short: n.name.replace(/고등학교$/, '고'),
    city: cityOf(n.region),
    sgg: sggOf(n.region),
    address: n.address,
    foundation: n.foundation,
    kind,
    homepage: n.homepage || null,
    total,
    stu: n.students?.byGrade || null,
    classes,
    perClass: total && classes ? r1(total / classes) : null,
    perTeacher: n.teachers?.studentsPerTeacherSecondary ?? null,
    tempRatio: n.teachers?.temporaryRatioSecondary ?? null,
    clubs: n.programs?.clubs ?? null,
    subjRoom: sp ? !!sp.subjectClassroom : !!n.programs?.subjectClassroom,
    levelClass: sp ? !!sp.levelClasses : !!n.programs?.levelClasses,
    // 자율학교 지정·운영 O/X: 보충 자료(학교알리미 공시 표)가 있으면 그 값을 우선
    autonomous: sp ? !!sp.autonomousSchool : !!n.programs?.autonomousSchool,
    autonomousSource: sp ? 'schoolinfo-official' : 'secondary',
    scienceFocus: sp ? (sp.scienceFocus ?? null) : null,
    designations,
    officialType: sup?.officialSchoolCharacteristics ?? null,
    dropoutRate: sup?.dropout?.total?.discontinuedPercent ?? null,
    dropoutYear: sup?.dropout?.schoolYear ?? null,
    dropoutRows: sup?.dropout?.rows?.filter(r => r.grade !== 'total').map(r => ({ grade: r.grade, pct: r.discontinuedPercent, n: r.discontinued })) ?? null,
    admission: adm
      ? { policy: adm.regionPolicy, equalized: !!adm.appliesToGeneralEqualizedAssignment, zone: adm.schoolZone ?? null, stages: adm.assignmentStages || [], note: adm.note || null, source: adm.source || null, year: adm.schoolYear ?? null }
      : null,
    career: Object.keys(career).length ? career : null,
    mvin: n.transfers?.in ?? null,
    mvout: n.transfers?.out ?? null,
    lat: n.coordinates?.lat ?? null,
    lng: n.coordinates?.lng ?? null,
    subjects: n.coursesByGrade || null,
    achData: achData(n.achievement),
  });
}
schools.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'schools.json'), JSON.stringify(schools), 'utf8');

// 지역 배정 규칙 (화면 안내용). 원문 인용은 버리고 정규화된 요약만 번들.
if (admissionRules) {
  const g = admissionRules.regions.goyang, pj = admissionRules.regions.paju;
  await writeFile(
    path.join(OUT, 'admission.json'),
    JSON.stringify({
      capturedAt: admissionRules.capturedAt,
      goyang: {
        schoolYear: g.schoolYear, equalized: g.equalized, zones: g.zoneDefinitions, selection: g.selection,
        stage1: g.stage1, stage2: g.stage2, exceptionSchools: g.exceptionSchools || {}, concurrent: g.concurrentSpecialApplications || null,
        source: g.source, limitations: g.limitations || [],
      },
      paju: {
        schoolYear: pj.schoolYear, equalized: pj.equalized, schoolId: pj.schoolId, admissionType: pj.admissionType, selection: pj.selection,
        capacity: pj.capacity, generalEligibility: pj.generalEligibilitySummary, localTalentEligibility: pj.localTalentEligibility,
        applicationDates: pj.applicationDates || null, source: pj.source, limitations: pj.limitations || [],
      },
    }),
    'utf8',
  );
}
await writeFile(
  path.join(OUT, 'meta.json'),
  JSON.stringify({
    capturedAt: index.capturedAt,
    count: schools.length,
    regions: schools.reduce((a, s) => { const k = s.city === s.sgg ? s.city : `${s.city} ${s.sgg}`; a[k] = (a[k] || 0) + 1; return a; }, {}),
    withCareer: schools.filter(s => s.career).length,
    withAchievement: schools.filter(s => s.achData).length,
    withCourses: schools.filter(s => s.subjects).length,
    withDropout: schools.filter(s => s.dropoutRate != null).length,
    withDesignation: schools.filter(s => s.designations?.length).length,
    supplementCapturedAt: supplementIndex?.capturedAt ?? null,
  }),
  'utf8',
);
console.log(`schools: ${schools.length}, career: ${schools.filter(s => s.career).length}, achievement: ${schools.filter(s => s.achData).length}`);
console.log('kinds:', Object.fromEntries([...new Set(schools.map(s => s.kind))].map(k => [k, schools.filter(s => s.kind === k).length])));
console.log(`supplement: dropout ${schools.filter(s => s.dropoutRate != null).length}, designations ${schools.filter(s => s.designations?.length).length}, admission ${schools.filter(s => s.admission).length}`);
