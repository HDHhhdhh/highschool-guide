// 진단평가 예약·상담 사전정보 — 상태, 검증, 요약문, 전송
import { BOOKING } from '../config';
import { BANDS, TRACKS, type BandId, type Subject } from '../engine';

export interface BookingState {
  studentName: string;
  grade: string; // 중1 | 중2 | 중3 | 기타
  middleSchool: string;
  guardianPhone: string;
  wishSchools: string; // 희망 고등학교/지역 (자유 입력)
  track: string; // TRACKS key
  band: BandId | 0; // 0 = 미선택
  strong: Subject[];
  weak: Subject[];
  question: string;
  preferredDate: string; // YYYY-MM-DD or ''
  preferredTime: string; // '' | 오전 | 오후 | 저녁 | 상관없음
  consent: boolean;
  // 추천 결과에서 넘어온 참고 정보 (있으면 함께 전송)
  recommended: string[];
  region: string;
}

export const DEFAULT_BOOKING: BookingState = {
  studentName: '', grade: '중3', middleSchool: '', guardianPhone: '', wishSchools: '', track: 'none', band: 0,
  strong: [], weak: [], question: '', preferredDate: '', preferredTime: '', consent: false, recommended: [], region: '',
};

export const GRADES = ['중1', '중2', '중3', '기타'];
export const TIMES = ['상관없음', '오전', '오후', '저녁'];

export type BookingErrors = Partial<Record<keyof BookingState, string>>;

const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

export function validateBooking(b: BookingState): BookingErrors {
  const e: BookingErrors = {};
  if (b.studentName.trim().length < 2) e.studentName = '학생 이름을 2자 이상 입력해 주세요.';
  if (!b.grade) e.grade = '학년을 골라 주세요.';
  if (!PHONE_RE.test(b.guardianPhone.replace(/\s/g, ''))) e.guardianPhone = '연락처를 010-0000-0000 형식으로 입력해 주세요.';
  if (b.preferredDate) {
    const d = new Date(b.preferredDate + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime()) || d < today) e.preferredDate = '오늘 이후 날짜를 골라 주세요.';
  }
  if (b.question.length > 1000) e.question = '1000자 이내로 적어 주세요.';
  if (!b.consent) e.consent = '예약을 위해 개인정보 수집·이용에 동의해 주세요.';
  return e;
}

export const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
};

const bandLabel = (id: BandId | 0) => { if (!id) return '미선택'; const b = BANDS.find(x => x.id === id); return b ? `${b.label} (${b.desc})` : '미선택'; };
const trackLabel = (k: string) => (TRACKS[k] || TRACKS.none).label;
const dateLabel = (b: BookingState) => [b.preferredDate, b.preferredTime].filter(Boolean).join(' ') || '미정';

/** 사람이 읽는 요약문 (복사·메일·전송 본문 공용) */
export function bookingSummary(b: BookingState): string {
  const lines = [
    '[진단평가 예약 · 상담 사전정보]',
    `학생 이름: ${b.studentName.trim()}`,
    `학년: ${b.grade}`,
    `현재 중학교: ${b.middleSchool.trim() || '미입력'}`,
    `보호자 연락처: ${b.guardianPhone.trim()}`,
    `희망 고등학교/지역: ${b.wishSchools.trim() || '미입력'}${b.region ? ` (거주: ${b.region})` : ''}`,
    `희망 계열·학과: ${trackLabel(b.track)}`,
    `현재 성적대: ${bandLabel(b.band)}`,
    `강한 과목: ${b.strong.join(', ') || '-'} / 약한 과목: ${b.weak.join(', ') || '-'}`,
    `희망 상담·진단 일시: ${dateLabel(b)}`,
    `상담에서 묻고 싶은 것: ${b.question.trim() || '-'}`,
  ];
  if (b.recommended.length) lines.push(`도구 추천 상위 학교(참고): ${b.recommended.join(', ')}`);
  return lines.join('\n');
}

/** 폼 수신 서비스에 보내는 평평한 JSON (필드명은 수신함에서 열 이름으로 보임) */
export function bookingPayload(b: BookingState) {
  return {
    _subject: `[진단평가 예약] ${b.studentName.trim()} (${b.grade})`,
    학생이름: b.studentName.trim(),
    학년: b.grade,
    현재중학교: b.middleSchool.trim(),
    보호자연락처: b.guardianPhone.trim(),
    희망고등학교지역: b.wishSchools.trim(),
    거주지역: b.region,
    희망계열: trackLabel(b.track),
    현재성적대: bandLabel(b.band),
    강한과목: b.strong.join(', '),
    약한과목: b.weak.join(', '),
    희망일시: dateLabel(b),
    질문: b.question.trim(),
    추천상위학교: b.recommended.join(', '),
    개인정보동의: b.consent ? '동의' : '미동의',
    요약: bookingSummary(b),
  };
}

export type SubmitResult = { ok: true } | { ok: false; reason: string };

export async function submitBooking(b: BookingState): Promise<SubmitResult> {
  if (!BOOKING.endpoint) return { ok: false, reason: 'no-endpoint' };
  try {
    const res = await fetch(BOOKING.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(bookingPayload(b)),
    });
    if (res.ok) return { ok: true };
    return { ok: false, reason: `서버 응답 ${res.status}` };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : '네트워크 오류' };
  }
}

export const mailtoHref = (b: BookingState) =>
  BOOKING.mailto ? `mailto:${BOOKING.mailto}?subject=${encodeURIComponent(`[진단평가 예약] ${b.studentName.trim()} (${b.grade})`)}&body=${encodeURIComponent(bookingSummary(b))}` : '';
