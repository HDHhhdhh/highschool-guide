# 일산 고교 선택 도와드려요

5A 수학학원의 고양시(일산서구·일산동구·덕양구, 파주 운정고 포함) 고등학교 32곳의 공시 데이터를 학생 조건에 맞춰 여섯 관점(내신 경쟁력·면학 분위기·대학 진학·희망 계열 적합·통학·교육 여건)과 **수학 관점**(수학 교과 편제·수학 경쟁력)으로 비교하는 **정적 웹 도구**입니다. AI·서버·DB·API 키가 없고, 모든 계산은 브라우저 안에서만 실행됩니다(외부 요청은 결과 화면 지도의 OpenStreetMap 타일뿐).

운영자 요청으로 경기영상과학고·고양예술고·고양일고·신원고·신일비즈니스고·일산고·일산국제컨벤션고 7교는 비교 대상에서 뺐다(`schools.json`·`reviews.json`에서 제거, `scripts/build-data.mjs`의 `EXCLUDED_IDS`로 재생성 시에도 제외).

두 기능:
1. **학교 추천** (`#finder`) — 입력 → 후보 선정 → 점수 → 순위·근거 표시
2. **진단평가 예약 · 상담 사전정보** (`#booking`) — 추천 결과를 넘겨받아 예약 폼 작성 → 폼 수신 서비스 전송 또는 요약 복사/메일

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # tsc + vite build → dist/ (정적 산출물)
npm run preview  # dist/ 미리 보기
```

## 폴더

```
scripts/build-data.mjs   ../highschool-data/*.json + supplement/ → src/data/schools.json, meta.json, admission.json  (npm run data)
src/data/                schools.json(32교), reviews.json(학부모 후기 268건), geo.json(고양 동 35·중학교 47 좌표), admission.json(2027 배정 규칙), meta.json, extra.json(id별 추가 필드 병합)
src/engine/              점수 엔진 (참조 사이트 engine.js 의 TypeScript 이식 + admission.ts 배정 경로)
src/components/          화면 (FinderForm, Results, SchoolCard, BookingForm, form-blocks ...)
src/components/ui/       shadcn/ui new-york-v4 레지스트리 원본 15개 (button, card, badge, input, textarea, label, select, radio-group, checkbox, tabs, table, progress, collapsible, alert, separator)
src/components/magicui/  Magic UI 레지스트리 원본 (blur-fade, number-ticker)
src/styles/globals.css   디자인 토큰 — shadcn 변수 규약(--primary 등)에 5A 브랜드(오렌지 #FF6611 주색, 네이비 #002060 보조, 작은 글자는 --primary-deep)를 입힘. Tailwind v4 @theme
src/assets/logo-5a-x.png 헤더 로고 '5A 수학학원 × …' (원본 10240×5760에서 여백을 잘라 투명 배경 583×120 PNG로 내보냄)
src/config.ts            운영자 설정 (폼 엔드포인트, 메일, 상호명)
```

UI 시스템: 21st.dev 커뮤니티 컴포넌트의 기반인 **shadcn/ui**(MIT) + **Magic UI**(MIT, 21st.dev @dillionverma/library/magic-ui) 공개 레지스트리 원본을 그대로 가져와 색·글꼴만 토큰으로 입혔다. 글꼴은 Pretendard Variable(OFL)을 npm 패키지에서 번들(런타임 CDN 없음).

## 예약 폼 전송 연결 (운영자)

`src/config.ts` 의 `BOOKING` 만 고치면 됩니다.

| 항목 | 설명 |
|---|---|
| `endpoint` | 폼 수신 URL. **Formspree**: formspree.io 에서 새 폼 → `https://formspree.io/f/xxxxxxxx` 를 넣음. JSON POST(`Accept: application/json`)로 보내므로 Getform·Basin·Web3Forms 등 같은 방식의 서비스도 그대로 사용 가능 |
| `mailto` | 담당자 메일. '메일로 보내기' 버튼이 요약문을 본문에 담아 메일 앱을 연다 |
| `googleFormUrl` | (선택) 구글 폼 링크. 넣으면 '구글 폼으로 열기' 버튼이 생김 (구글 폼은 CORS 때문에 직접 POST 불가) |
| `orgName`, `phone` | 화면에 보이는 운영 주체 이름·전화 |

`endpoint` 가 비어 있으면 '예약 요청 보내기' 버튼은 숨고, **요약 복사하기**(문자·카카오톡에 붙여넣기)와 메일 버튼만 보입니다. 전송 실패 시에도 같은 대체 경로를 안내합니다.

## 데이터 확장

- 원자료가 늘면 `../highschool-data` 에 추가하고 `npm run data` 로 `schools.json` 을 다시 만듭니다.
- 일부 학교에만 새 필드를 붙이려면 `src/data/extra.json` 에 `{ "<학교 id>": { "achData": {...}, "..." } }` 형태로 적으면 id별로 얕게 병합됩니다. (예: 새로 확보한 성취도)
- 성취도 형식: `{ "2026-1": { "1": [["공통국어1", 88, [50.6, 34.4, 12.4, 1.8, 0.8]], ...] } }` (과목, 평균, A~E 비율)

## Vercel 배포

1. 이 폴더를 Git 저장소로 올린다 (`dist/`, `node_modules/` 는 `.gitignore`).
2. Vercel → Add New Project → 저장소 선택. Framework Preset **Vite** 가 자동 감지됨 (Build `npm run build`, Output `dist`).
3. Deploy. 서버 런타임·환경 변수 불필요. 해시 라우팅(`#finder`, `#booking`)이라 리라이트 설정도 필요 없다.
4. 예약 폼 연결은 `src/config.ts` 수정 후 다시 배포.

## GitHub Pages 배포 (현재 운영 중)

라이브: https://hdhhhdhh.github.io/highschool-guide/ — `main` 브랜치는 소스(base `/`), `gh-pages` 브랜치는 빌드 결과물입니다.

```bash
npx tsc -b && npx vite build --base /highschool-guide/   # dist/ (경로 접두어만 다름)
# dist/ 내용을 gh-pages 브랜치 루트에 덮어쓰고 .nojekyll 을 둔 뒤 커밋·푸시
```

## 보충 공시 반영 (supplement/)

- 중점·특색 지정(과학중점 정발고·일산동고·주엽고, AI 중점 백마고, AI 융합학급·IB 후보 일산대진고, 자공고 2.0 백석고·운정고): 희망 계열이 맞을 때 계열 적합 +8(과학중점×이공계) / +6(AI×IT·공학). 카드 배지와 상세 '지정·운영'에 근거 문서 제목 표시.
- 자율학교 지정·운영 O/X(학교알리미 공시 표)가 기존 2차 자료 값을 대체.
- 2025학년도 학업중단율(32교): 교육 여건의 15% 보조 신호, 성취도 없는 학교의 면학 분위기 추정에 10% 보조 신호. 상세에 학년별 수치 표시.
- 2027 배정 규칙: 고양 평준화(1구역 덕양구 / 2구역 일산동·서구, 1단계 학군내배정 5지망 추첨 → 2단계 구역내배정, 향동고 학군내배정만). 기본 후보는 지망 가능 구역의 일반고만, 거주 학군 밖 평준화 일반고는 ×0.75 + 배지. 특목·특성화는 '학교별 전형', 운정고는 '파주 비평준화 자체 전형(내신 200점, 360명)'로 표시.
- 성취도(A~E)는 보충 조사에서도 추가 확보되지 않았다(나머지 학교 CAPTCHA). 운정고 1교 그대로.

## 데이터 한계 (화면에도 표시됨)

- 과목별 성취도(A~E)는 32교 중 **운정고 1교**만 확보. 나머지 학교의 '면학 분위기'는 졸업생 진학 지표로 **추정**(화면에 '추정' 표시), '강점·약점 과목 궁합'은 중립(50).
- 특성화고(고양고)는 졸업생 진로 공시가 없어 '대학 진학'을 중립(50)으로 둠.
- 중점·특색 지정은 학교알리미 공시 문서 제목·학교 공지 기준(지정 통지서 본문 미열람). 2027 단계별 배정 비율은 공식 발표에 없어 표시하지 않음.
- 운정고(파주시)는 관심 학교로 추가했을 때만 후보에 들어가며 파주 비평준화 자체 전형으로 표시.

## 내신 입력·지도·수학 지표·후기

- **내신 입력(기본)**: 내신 총점(200점 만점) + 과목별 성취도(국·수·영·사·과 A~E, 아는 과목만). 200점 = 교과활동 150 + 출결 20 + 봉사활동 20 + 학교활동 10 (경기도교육청 「고등학교 입학 내신성적 반영지침」 2026·2027학년도; 고양 등 9개 평준화학군은 이 점수로 배정예정자를 선발한 뒤 선지원·후추첨). 총점은 지침 산식(일반교과 학기별 기본점수 + 성취도 평균 + 원점수 평균, 체육·예술 30점)에 비교과 만점·원점수 구간 중간값(A 95·B 85…)·체육예술 같은 수준을 가정해 성취도 평균(A=5…E=1)으로 되돌린다: 총점 ≈ 121.3 + 15.3 × 성취도 평균. 고른 과목 평균과 같은 비중으로 합친 뒤 성적대 대표값(상위 4·11·28·55·82%) 사이를 선형 보간해 '추정 위치(상위 %)'를 만들고, 그 위치가 속한 성적대(5·15·40·70% 경계)로 선발형 도전 여부·분석 비중을 정한다 (`src/engine/standing.ts`). 공식 석차 환산이 아닌 참고용 추정이며 화면에 '참고용 추정'으로 표시한다.
- **대충 선택하기(보조)**: '점수를 몰라요'를 켜면 기존 5단계 성적대로 고른다(성적대 대표값 그대로 사용).
- **지도**: Leaflet + OpenStreetMap 도로 지도(API 키 없음, `src/components/MiniMap.tsx`, 결과 화면에서 지연 로드). 32교를 추천 상위 3(주황)·후보(네이비)·후보 외(회색)로 표시하고, 사는 동 중심에 집 모양 '집' 표시를 둔다(동을 모르면 '기준'). 동 선택·학교 선택(마커 클릭 포함)·직선거리·카카오맵 길찾기(`https://map.kakao.com/link/to/학교명,위도,경도`, 목적지만 지정 가능)·네이버 지도 검색 링크를 제공한다. 실제 경로·소요 시간은 카카오맵에서 확인한다.
- **수학 경쟁력**은 실제 수학 학력이 아니라 선택·심화 **과목 개설 폭의 추정**입니다. 2026학년도 1·2학년 시간표를 정제한 뒤 미적분 / 기하 / 확률과 통계 / 고급·심화 수학 / 고급 대수 / 인공지능 수학 / 수학과제 탐구 / 경제 수학의 8개 과목군을 동일 비중으로 셉니다. 점수 = 확인된 과목군 수 ÷ 8 × 100 (반올림). 공통수학·기본 대수는 공통 과정이라 가산하지 않으며, 동일 군의 과목·분반은 중복 가산하지 않습니다. 미확인은 미개설 확정이 아닙니다. 대학 진학률을 수학 성적으로 대체하지 않으며 추천 총점에는 넣지 않습니다. 수학 학업성취도는 별도 슬롯에 확보 자료만 표시하고, 없는 학교는 **수집 예정**으로 표시합니다(현재 운정고만 확보).
- **수학 교과 편제**: 학교별 2026학년도 시간표에서 수학 과목만 골라 2학년(2022 개정)·3학년(2015 개정, 참고) 편제를 보여 주고 진로·융합·심화 선택 과목을 강조한다(`mathCurriculum`, `src/engine/derive.ts`). 결과 화면 상단에 '후보 중 수학 선택·심화 과목이 넓은 학교' 상위 3곳을 보여 준다.
- **학부모 후기**는 `src/data/reviews.json`(268건, 공개 게시글 발췌 + 원문 URL)을 홈 화면 '학교별 학부모 후기 모아보기'(`#reviews`)와 각 학교 카드의 '학부모 후기'에 수학·비수학 탭으로 표시한다(`ReviewList.tsx`). 형식: `{ "schoolId", "category": "수학"|"비수학", "source", "date", "text": "제목 — 본문", "url" }`. 추천 점수에는 반영하지 않는다.
