import { META } from '../data';
import { SITE } from '../config';

export function Footer() {
  return (
    <footer className="border-t bg-muted/60 py-8 pb-14">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {SITE.name}의 모든 분석과 추천은 공공데이터를 가공한 <b className="font-semibold text-foreground/80">단순 참고용 정보</b>이며 정확성·완전성을 보장하지 않습니다.
          학교별 교육과정, 배정·입학 전형, 입시 결과 등 정확한 정보는 해당 학교와 관할 교육청에 직접 문의하시기 바랍니다. 이 서비스의 정보를 근거로 한 결정에 대해 책임지지 않습니다.
        </p>
        <p className="mt-3 text-xs text-muted-foreground/80">
          데이터 출처: 학교알리미(교육부·한국교육학술정보원), NEIS 교육정보 개방 포털, 경기도교육청 · 수집 {META.capturedAt.slice(0, 10)} · AI를 쓰지 않는 규칙 기반 계산 · UI: shadcn/ui · Magic UI · Pretendard
        </p>
      </div>
    </footer>
  );
}
