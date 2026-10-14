import { ArrowLeft, Check, Copy, ExternalLink, Mail, Phone, Send, TriangleAlert } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { BOOKING } from '../config';
import { GEO } from '../data';
import { BANDS, SUBJECTS, TRACKS, TRACK_IDS, type BandId, type Subject } from '../engine';
import { GRADES, TIMES, bookingSummary, formatPhone, mailtoHref, submitBooking, validateBooking, type BookingErrors, type BookingState } from '../lib/booking';
import { toggleIn } from '../lib/finder';
import { Chip } from './form-blocks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'failed'; reason: string } | { kind: 'copied' } | { kind: 'copyfail' };
const NONE = '__none';
const control = 'h-12! rounded-lg bg-card text-[0.9375rem]';

function Row({ label, htmlFor, required, error, hint, children }: { label: ReactNode; htmlFor?: string; required?: boolean; error?: string | null; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-2', error && 'has-error')}>
      <Label htmlFor={htmlFor} className="text-[0.9375rem] font-semibold">{label} {required && <em className="not-italic text-brand" aria-hidden="true">*</em>}</Label>
      {children}
      {error ? <p className="text-[0.8125rem] font-medium text-bad" role="alert">{error}</p> : hint ? <p className="text-[0.8125rem] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function BookingForm({ initial, hasResults, onBackToFinder }: { initial: BookingState; hasResults: boolean; onBackToFinder: () => void }) {
  const [b, setB] = useState<BookingState>(initial);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const set = <K extends keyof BookingState>(k: K, v: BookingState[K]) => {
    setB(s => { const next = { ...s, [k]: v }; if (touched) setErrors(validateBooking(next)); return next; });
  };
  const hasEndpoint = !!BOOKING.endpoint;
  const today = new Date().toISOString().slice(0, 10);
  const summary = bookingSummary(b);

  const check = () => {
    const e = validateBooking(b); setErrors(e); setTouched(true);
    if (Object.keys(e).length) { document.querySelector<HTMLElement>('.has-error input, .has-error textarea, .has-error button, #bk-consent')?.focus(); return false; }
    return true;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!check()) return;
    if (!hasEndpoint) { setStatus({ kind: 'failed', reason: 'no-endpoint' }); return; }
    setStatus({ kind: 'sending' });
    const res = await submitBooking(b);
    setStatus(res.ok ? { kind: 'sent' } : { kind: 'failed', reason: res.reason });
  };

  const copy = async () => {
    if (!check()) return;
    try { await navigator.clipboard.writeText(summary); setStatus({ kind: 'copied' }); }
    catch { setStatus({ kind: 'copyfail' }); setPreviewOpen(true); }
  };

  if (status.kind === 'sent') {
    return (
      <Card id="booking" className="gap-0 rounded-2xl border-primary py-0 shadow-float">
        <CardHeader className="px-5 pt-6 sm:px-8 sm:pt-8">
          <p className="text-sm font-semibold text-primary-deep">진단평가 예약</p>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-navy"><Check className="size-7 text-good" aria-hidden="true" /> 예약 요청을 보냈습니다</CardTitle>
          <CardDescription className="leading-relaxed">{BOOKING.orgName}에서 확인 후 보호자 연락처로 일정을 안내해 드립니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-5 pb-6 sm:px-8 sm:pb-8">
          <pre className="rounded-lg bg-muted p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">{summary}</pre>
          <Button variant="outline" className="h-11 rounded-lg" onClick={onBackToFinder}><ArrowLeft aria-hidden="true" /> 학교 추천으로 돌아가기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="booking" className="gap-0 rounded-2xl py-0 shadow-card">
      <CardHeader className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
        <p className="text-sm font-semibold text-primary-deep">진단평가 예약 · 상담 사전정보</p>
        <CardTitle className="text-2xl font-bold tracking-tight text-navy">진단평가를 예약하고 상담 준비 정보를 남겨 주세요</CardTitle>
        <CardDescription className="text-[0.9375rem] leading-relaxed">
          {hasResults ? '추천 결과의 성적대·희망 계열·상위 학교가 미리 채워졌습니다. 확인 후 나머지를 적어 주세요.' : '학교 추천을 먼저 돌리면 성적대·희망 계열이 자동으로 채워집니다.'} 필수 항목은 <em className="not-italic text-brand">*</em> 표시입니다.
        </CardDescription>
        {!hasResults && <Button variant="outline" size="sm" className="mt-2 w-fit rounded-lg" onClick={onBackToFinder}><ArrowLeft aria-hidden="true" /> 학교 추천 먼저 하기</Button>}
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-8 sm:pb-8">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Row label="학생 이름" htmlFor="bk-name" required error={errors.studentName}>
              <Input id="bk-name" className={control} value={b.studentName} onChange={e => set('studentName', e.target.value)} aria-invalid={!!errors.studentName} autoComplete="off" placeholder="예: 김하늘" />
            </Row>
            <Row label="학년" htmlFor="bk-grade" required error={errors.grade}>
              <Select value={b.grade} onValueChange={v => set('grade', v)}>
                <SelectTrigger id="bk-grade" className={cn(control, 'w-full')}><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </Row>
          </div>

          <Row label="현재 중학교" htmlFor="bk-middle" hint="목록에 없으면 직접 입력해도 됩니다.">
            <Input id="bk-middle" className={control} list="bk-middle-list" value={b.middleSchool} onChange={e => set('middleSchool', e.target.value)} placeholder="예: 정발중학교" />
            <datalist id="bk-middle-list">{GEO.middle.map(m => <option key={m.name} value={m.name} />)}</datalist>
          </Row>

          <Row label="보호자 연락처" htmlFor="bk-phone" required error={errors.guardianPhone} hint="예약 확인 연락에만 사용합니다.">
            <Input id="bk-phone" className={control} type="tel" inputMode="numeric" value={b.guardianPhone} onChange={e => set('guardianPhone', formatPhone(e.target.value))} aria-invalid={!!errors.guardianPhone} placeholder="010-0000-0000" autoComplete="tel" />
          </Row>

          <Row label="희망 고등학교 / 지역" htmlFor="bk-wish" hint={b.region ? `거주 지역: 고양시 ${b.region}` : undefined}>
            <Input id="bk-wish" className={control} value={b.wishSchools} onChange={e => set('wishSchools', e.target.value)} placeholder="예: 정발고, 백석고 / 일산동구" />
          </Row>

          <Row label="희망 계열·학과" hint="여러 개 고를 수 있습니다. 다시 누르면 빠지고, ‘아직 모름’을 누르면 모두 해제됩니다.">
            <div className="flex flex-wrap gap-2" role="group" aria-label="희망 계열 (여러 개 선택)">
              {TRACK_IDS.map(k => <Chip key={k} on={b.tracks.includes(k)} onClick={() => set('tracks', toggleIn(b.tracks, k))}>{TRACKS[k].label}</Chip>)}
              <Chip on={!b.tracks.length} onClick={() => set('tracks', [])}>{TRACKS.none.label}</Chip>
            </div>
          </Row>

          <Row label="현재 성적대" htmlFor="bk-band">
            <Select value={b.band ? String(b.band) : NONE} onValueChange={v => set('band', v === NONE ? 0 : (Number(v) as BandId))}>
              <SelectTrigger id="bk-band" className={cn(control, 'w-full')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>선택 안 함</SelectItem>
                {BANDS.map(x => <SelectItem key={x.id} value={String(x.id)}>{x.label} ({x.desc})</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>

          <Row label="강한 과목 · 약한 과목">
            <div className="flex flex-col gap-3">
              {(['strong', 'weak'] as const).map(kind => (
                <div key={kind} className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">{kind === 'strong' ? '강한 과목' : '약한 과목'}</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={kind === 'strong' ? '강한 과목' : '약한 과목'}>
                    {SUBJECTS.map(s => <Chip key={s} on={b[kind].includes(s)} disabled={b[kind === 'strong' ? 'weak' : 'strong'].includes(s)} onClick={() => set(kind, toggleIn(b[kind], s) as Subject[])}>{s}</Chip>)}
                  </div>
                </div>
              ))}
            </div>
          </Row>

          <Row label="상담에서 묻고 싶은 것" htmlFor="bk-q" error={errors.question} hint="자유롭게 적어 주세요. (1000자 이내)">
            <Textarea id="bk-q" className="min-h-28 rounded-lg bg-card text-[0.9375rem] leading-relaxed" value={b.question} onChange={e => set('question', e.target.value)} aria-invalid={!!errors.question} placeholder="예: 내신 2등급대 유지가 가능한 학교인지, 수시와 정시 중 어느 쪽이 맞을지 궁금합니다." maxLength={1000} />
          </Row>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Row label="희망 상담·진단 날짜" htmlFor="bk-date" error={errors.preferredDate} hint="선택 사항입니다.">
              <Input id="bk-date" className={control} type="date" min={today} value={b.preferredDate} onChange={e => set('preferredDate', e.target.value)} aria-invalid={!!errors.preferredDate} />
            </Row>
            <Row label="희망 시간대" htmlFor="bk-time">
              <Select value={b.preferredTime || NONE} onValueChange={v => set('preferredTime', v === NONE ? '' : v)}>
                <SelectTrigger id="bk-time" className={cn(control, 'w-full')}><SelectValue placeholder="선택 안 함" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>선택 안 함</SelectItem>
                  {TIMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Row>
          </div>

          {b.recommended.length > 0 && (
            <Alert className="border-transparent bg-info-soft">
              <AlertTitle className="font-semibold">추천 결과에서 가져온 정보</AlertTitle>
              <AlertDescription className="text-[0.8125rem]">상위 추천 {b.recommended.join(', ')} · 이 내용이 상담 참고용으로 함께 전달됩니다.</AlertDescription>
            </Alert>
          )}

          <label htmlFor="bk-consent" className={cn('grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border bg-muted/50 p-4 text-[0.8125rem] leading-relaxed', errors.consent && 'border-bad')}>
            <Checkbox id="bk-consent" className="mt-0.5 size-5.5" checked={b.consent} onCheckedChange={v => set('consent', v === true)} aria-invalid={!!errors.consent} />
            <span>
              <b className="font-semibold">개인정보 수집·이용 동의 <em className="not-italic text-brand">*</em></b><br />
              수집 항목: 학생 이름·학년·학교, 보호자 연락처, 상담 내용 · 목적: 진단평가 예약 확인과 상담 준비 · 보유 기간: 상담 종료 후 6개월 이내 파기. 동의를 거부할 수 있으나 이 경우 예약 접수가 어렵습니다.
            </span>
          </label>
          {errors.consent && <p className="-mt-3 text-[0.8125rem] font-medium text-bad" role="alert">{errors.consent}</p>}

          {status.kind === 'failed' && status.reason !== 'no-endpoint' && (
            <Alert className="border-transparent bg-bad-soft [&>svg]:text-bad"><TriangleAlert aria-hidden="true" /><AlertTitle className="font-semibold">전송하지 못했습니다</AlertTitle><AlertDescription className="text-[0.8125rem]">{status.reason} — 아래 '요약 복사하기'나 '메일로 보내기'로 대신 접수해 주세요.</AlertDescription></Alert>
          )}
          {status.kind === 'failed' && status.reason === 'no-endpoint' && (
            <Alert className="border-transparent bg-warn-soft [&>svg]:text-warn"><TriangleAlert aria-hidden="true" /><AlertTitle className="font-semibold">온라인 접수가 아직 연결되지 않았습니다</AlertTitle><AlertDescription className="text-[0.8125rem]">'요약 복사하기'로 내용을 복사해 문자·카카오톡으로 보내거나, '메일로 보내기'를 눌러 접수해 주세요.</AlertDescription></Alert>
          )}
          {status.kind === 'copied' && (
            <Alert className="border-transparent bg-good-soft [&>svg]:text-good"><Check aria-hidden="true" /><AlertTitle className="font-semibold">요약을 복사했습니다</AlertTitle><AlertDescription className="text-[0.8125rem]">문자·카카오톡·메일에 붙여 넣어 보내 주세요.</AlertDescription></Alert>
          )}
          {status.kind === 'copyfail' && (
            <Alert className="border-transparent bg-warn-soft [&>svg]:text-warn"><TriangleAlert aria-hidden="true" /><AlertTitle className="font-semibold">자동 복사가 막혔습니다</AlertTitle><AlertDescription className="text-[0.8125rem]">아래 '보낼 내용 미리 보기'를 열어 두었으니 글을 길게 눌러 선택한 뒤 복사해 주세요.</AlertDescription></Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {hasEndpoint && <Button type="submit" size="lg" className="h-12 rounded-xl" disabled={status.kind === 'sending'}><Send aria-hidden="true" /> {status.kind === 'sending' ? '보내는 중…' : '예약 요청 보내기'}</Button>}
            <Button type="button" size="lg" variant={hasEndpoint ? 'outline' : 'default'} className="h-12 rounded-xl" onClick={copy}><Copy aria-hidden="true" /> 요약 복사하기</Button>
            {BOOKING.mailto && <Button asChild size="lg" variant="outline" className="h-12 rounded-xl"><a href={mailtoHref(b)} onClick={e => { if (!check()) e.preventDefault(); }}><Mail aria-hidden="true" /> 메일로 보내기</a></Button>}
            {BOOKING.googleFormUrl && <Button asChild size="lg" variant="ghost" className="h-12 rounded-xl"><a href={BOOKING.googleFormUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> 구글 폼으로 열기</a></Button>}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <Badge variant="secondary" className="mr-1">{BOOKING.orgName}</Badge>
            {BOOKING.phone && <> 전화 문의 <a className="inline-flex items-center gap-0.5 text-primary-deep" href={`tel:${BOOKING.phone}`}><Phone className="size-3" aria-hidden="true" />{BOOKING.phone}</a> ·</>} 입력 내용은 전송 버튼을 누르기 전까지 이 화면에만 있습니다.
          </p>

          <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
            <CollapsibleTrigger asChild><Button type="button" variant="link" className="h-auto p-0 text-sm">보낼 내용 미리 보기</Button></CollapsibleTrigger>
            <CollapsibleContent><pre className="mt-3 rounded-lg bg-muted p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">{summary}</pre></CollapsibleContent>
          </Collapsible>
        </form>
      </CardContent>
    </Card>
  );
}
