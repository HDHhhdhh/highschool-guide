# 일산 고교 나침반

고양시(일산서구·일산동구·덕양구) 고등학교 39곳의 공시 데이터를 학생 조건에 맞춰 여섯 관점(내신 경쟁력·면학 분위기·대학 진학·희망 계열 적합·통학·교육 여건)으로 비교하는 **정적 웹 도구**입니다. AI·서버·DB·API 키가 없고, 모든 계산은 브라우저 안에서만 실행됩니다.

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
src/data/                schools.json(39교), geo.json(고양 동 35·중학교 47 좌표), admission.json(2027 배정 규칙), meta.json, extra.json(id별 추가 필드 병합)
src/engine/              점수 엔진 (참조 사이트 engine.js 의 TypeScript 이식 + admission.ts 배정 경로)
src/components/          화면 (FinderForm, Results, SchoolCard, BookingForm, form-blocks ...)
src/components/ui/       shadcn/ui new-york-v4 레지스트리 원본 15개 (button, card, badge, input, textarea, label, select, radio-group, checkbox, tabs, table, progress, collapsible, alert, separator)
src/components/magicui/  Magic UI 레지스트리 원본 (blur-fade, number-ticker)
src/styles/globals.css   디자인 토큰 — shadcn 변수 규약(--primary 등)에 5A 브랜드(오렌지 #FF6611 주색, 네이비 #002060 보조, 작은 글자는 --primary-deep)를 입힘. Tailwind v4 @theme
src/assets/5a-logo.png   5A 로고(번들, 헤더에서 mix-blend-multiply로 흰 배경 제거)
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

## 보충 공시 반영 (supplement/)

- 중점·특색 지정(과학중점 정발고·일산동고·주엽고, AI 중점 백마고, AI 융합학급·IB 후보 일산대진고, 자공고 2.0 백석고·운정고): 희망 계열이 맞을 때 계열 적합 +8(과학중점×이공계) / +6(AI×IT·공학). 카드 배지와 상세 '지정·운영'에 근거 문서 제목 표시.
- 자율학교 지정·운영 O/X(학교알리미 공시 표)가 기존 2차 자료 값을 대체.
- 2025학년도 학업중단율(39교): 교육 여건의 15% 보조 신호, 성취도 없는 학교의 면학 분위기 추정에 10% 보조 신호. 상세에 학년별 수치 표시.
- 2027 배정 규칙: 고양 평준화(1구역 덕양구 / 2구역 일산동·서구, 1단계 학군내배정 5지망 추첨 → 2단계 구역내배정, 향동고 학군내배정만). 기본 후보는 지망 가능 구역의 일반고만, 거주 학군 밖 평준화 일반고는 ×0.75 + 배지. 특목·특성화는 '학교별 전형', 운정고는 '파주 비평준화 자체 전형(내신 200점, 360명)'로 표시.
- 성취도(A~E)는 보충 조사에서도 추가 확보되지 않았다(38교 CAPTCHA). 운정고 1교 그대로.

## 데이터 한계 (화면에도 표시됨)

- 과목별 성취도(A~E)는 39교 중 **운정고 1교**만 확보. 나머지 학교의 '면학 분위기'는 졸업생 진학 지표로 **추정**(화면에 '추정' 표시), '강점·약점 과목 궁합'은 중립(50).
- 특성화고 5교는 졸업생 진로 공시가 없어 '대학 진학'을 중립(50)으로 둠.
- 중점·특색 지정은 학교알리미 공시 문서 제목·학교 공지 기준(지정 통지서 본문 미열람). 2027 단계별 배정 비율은 공식 발표에 없어 표시하지 않음.
- 운정고(파주시)는 관심 학교로 추가했을 때만 후보에 들어가며 파주 비평준화 자체 전형으로 표시.
