// 운영자 설정 — 이 파일만 고치면 된다.
//
// 진단평가 예약·상담 사전정보 폼의 전송 방식 (정적 사이트라 서버가 없다):
//  1) endpoint: 폼 수신 서비스 URL. 비어 있으면 '복사하기 / 메일로 보내기' 대체 경로만 보인다.
//     - Formspree: https://formspree.io 에서 폼을 만들고 'https://formspree.io/f/xxxxxxxx' 를 넣는다.
//       (JSON POST + Accept: application/json 방식으로 전송한다. 무료 플랜도 됨)
//     - 같은 방식(JSON POST, 2xx 응답)의 다른 서비스(Getform, Basin, Web3Forms 등)도 그대로 쓸 수 있다.
//     - Google Form 은 CORS 때문에 직접 POST 가 되지 않으므로, googleFormUrl 에 사전 작성 링크를 넣어
//       '구글 폼으로 열기' 버튼으로 쓰는 것을 권한다.
//  2) mailto: 담당자 메일. 대체 경로 '메일로 보내기' 버튼이 이 주소로 열린다.
//  3) googleFormUrl: (선택) 구글 폼 링크. 넣으면 대체 경로에 버튼이 하나 더 생긴다.
export const BOOKING = {
  // Formsubmit.co: 계정 가입 없이 아래 메일로 바로 전송(JSON POST, 첫 제출 시 메일로 1회 활성화 클릭 필요).
  endpoint: 'https://formsubmit.co/ajax/1130ehdgns@gmail.com',
  mailto: '1130ehdgns@gmail.com', // 대체 경로 '메일로 보내기' 버튼이 이 주소로 열린다.
  googleFormUrl: '', // 예: 'https://forms.gle/xxxxxxxx'
  orgName: '5A 수학학원', // 화면에 보이는 운영 주체 이름
  phone: '', // 예: '031-000-0000' (비우면 표시 안 함)
};

export const SITE = {
  name: '일산 고교 나침반',
  tagline: '고양시 고등학교, 공시 데이터로 차분하게 비교해 보세요',
};
