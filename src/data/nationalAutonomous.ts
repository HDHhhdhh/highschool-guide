// 전국단위 모집 자사고(+전국모집 공립) — 고양/일산 평준화 배정과 무관하게
// 전국에서 지원·선발하는 학교. 수학 관점 고교선택 설명회 보조 자료.
// 입결·특징은 연도별 변동하므로 각 학교 공식 입학요강으로 확인해야 함.

export interface NationalSchool {
  name: string;
  region: string;              // 시도 + 시군구
  type: '전국단위 자사고' | '전국모집 공립고';
  gender: '남녀공학' | '남고' | '여고';
  boarding: boolean;           // 기숙사 운영
  founder?: string;            // 설립·운영 주체
  note: string;                // 한 줄 특징(수학·이과 관점 포함)
  q: string;                   // 더 알아보기(구글 검색어)
}

export const NATIONAL_SCHOOLS: NationalSchool[] = [
  { name: '외대부고', region: '경기 용인시', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '한국외국어대학교', note: '전국 최상위권 입결. 인문·자연 과정 분리 운영으로 이과·의치한 진학이 특히 강함.', q: '용인한국외국어대학교부설고등학교 입학' },
  { name: '하나고', region: '서울 은평구', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '하나금융그룹', note: '서울 소재 전국단위 자사고. 자기주도·인성 교육과 균형 잡힌 문·이과 진학.', q: '하나고등학교 입학' },
  { name: '민족사관고', region: '강원 횡성군', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '파스퇴르(최명재)', note: '조기·심화 교육과 해외대 진학 전통. 영재형 자기주도 학습 중심.', q: '민족사관고등학교 입학' },
  { name: '상산고', region: '전북 전주시', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '홍성대(「수학의 정석」 저자)', note: '의대 진학 강세로 유명. 설립자가 수학 참고서 「수학의 정석」 저자로 수학 교육 전통이 깊음.', q: '상산고등학교 입학' },
  { name: '포항제철고', region: '경북 포항시', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '포스코교육재단', note: '이공계·과학 중점 강세. 포스코 지원 기반의 탄탄한 이수과정.', q: '포항제철고등학교 입학' },
  { name: '광양제철고', region: '전남 광양시', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '포스코교육재단', note: '이공계 강세. 포스코 지원 기반 기숙형 교육.', q: '광양제철고등학교 입학' },
  { name: '현대청운고', region: '울산 동구', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '현대중공업', note: '이공계 전통이 강한 기숙형 자사고.', q: '현대청운고등학교 입학' },
  { name: '북일고', region: '충남 천안시', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '한화', note: '문·이과 균형 진학. 오랜 전통의 기숙형 자사고.', q: '천안북일고등학교 입학' },
  { name: '김천고', region: '경북 김천시', type: '전국단위 자사고', gender: '남고', boarding: true, founder: '송설당교육재단', note: '100년 전통의 지역 명문. 전국단위로 선발하는 남고.', q: '김천고등학교 입학' },
  { name: '인천하늘고', region: '인천 중구(영종)', type: '전국단위 자사고', gender: '남녀공학', boarding: true, founder: '인천국제공항공사', note: '사회통합전형 비중이 큰 기숙형 자사고. 이공계 강점.', q: '인천하늘고등학교 입학' },
  { name: '한민고', region: '경기 파주시', type: '전국모집 공립고', gender: '남녀공학', boarding: true, founder: '국방부·경기도교육청', note: '군인 자녀 특별전형과 일반전형을 전국에서 선발하는 공립 기숙학교(자사고 아님).', q: '한민고등학교 입학' },
];
