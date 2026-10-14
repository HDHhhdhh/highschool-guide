// 네이버 지도 JS API v3(Web Dynamic Map) 로더 — 결과 화면 지도가 처음 열릴 때 <script> 를 한 번만 붙인다.
// ncpKeyId(Client ID)는 공개 값이며 NCP 콘솔에 등록한 Web 서비스 URL(허용 도메인)에서만 인증된다.
// Client Secret 은 서버 전용 값이라 프런트엔드에 두지 않는다(웹 지도 표시에는 필요 없다).
const SCRIPT_SRC = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=u4frvlkp58';

declare global {
  interface Window {
    naver?: typeof naver;
    /** 네이버 지도 API 가 Client ID 인증에 실패하면 부르는 전역 콜백 (API 규약) */
    navermap_authFailure?: () => void;
  }
}

let loading: Promise<typeof naver.maps> | null = null;
let authFailed = false;
const authListeners = new Set<() => void>();

/** 인증 실패(허용 도메인 밖·잘못된 키 등)를 알려 준다. 이미 실패했으면 바로 부른다. 해제 함수를 돌려준다. */
export function onNaverAuthFailure(listener: () => void) {
  if (authFailed) listener();
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

/** 스크립트를 한 번만 불러 naver.maps 를 돌려준다. 불러오지 못하면 다음 호출 때 다시 시도한다. */
export function loadNaverMaps(): Promise<typeof naver.maps> {
  loading ??= new Promise<typeof naver.maps>((resolve, reject) => {
    window.navermap_authFailure = () => {
      authFailed = true;
      authListeners.forEach(fn => fn());
    };
    const script = document.createElement('script');
    const fail = () => {
      loading = null;
      script.remove();
      reject(new Error('네이버 지도 스크립트를 불러오지 못했습니다'));
    };
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.naver?.maps ? resolve(window.naver.maps) : fail());
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
