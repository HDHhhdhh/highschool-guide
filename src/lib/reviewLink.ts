// 리뷰 '원문 보기' 링크 판별 — 특정 글로 바로 가는 주소만 원문으로 인정한다.
// 카페·블로그·SNS 첫 화면, 게시판 목록, 태그·검색 결과, 사이트 첫 화면은 해당 글을 찾을 수 없어 링크를 숨긴다.
export function articleUrl(url: string | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null; // 주소 형식이 아니면 링크로 쓰지 않는다
  }
  const host = u.hostname.replace(/^(www|m)\./, '');
  const segs = u.pathname.split('/').filter(Boolean);
  const q = u.searchParams;
  if (!segs.length && !u.search) return null; // 사이트 첫 화면
  if ((host === 'cafe.naver.com' || host === 'cafe.daum.net') && segs.length < 2 && !q.has('articleid')) return null; // 카페 첫 화면 (글 번호 없음)
  if (host === 'blog.naver.com' && segs.length < 2 && !q.has('logNo')) return null; // 블로그 첫 화면
  if (host === 'facebook.com' && !/\/(posts|permalink|videos|photos?)\/|story\.php/.test(u.pathname)) return null; // 페이스북 페이지 첫 화면
  if (host === 'instagram.com' && !/^\/(p|reel)\//.test(u.pathname)) return null; // 인스타그램 프로필
  if (host === 'youtube.com' && !(u.pathname === '/watch' && q.has('v')) && !u.pathname.startsWith('/shorts/')) return null; // 유튜브 채널
  if (/\/board\/lists\b|\/(tag|search)\//.test(u.pathname)) return null; // 게시판 목록·태그·검색 결과
  if (host === 'hogangnono.com' && segs[0] === 'community' && segs.length <= 3) return null; // 아파트 커뮤니티 첫 화면
  return url;
}
