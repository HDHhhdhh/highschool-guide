// 학업 성적 입력 — 기본은 "내신 총점(200점) + 과목별 성취도", 보조로 "성적대 대충 선택하기".
import { BANDS, NAESIN_MAX, NAESIN_PARTS, SUBJECTS, estimateStanding, fmt, parseNaesinTotal, type BandId, type Subject, type SubjectGrade } from '../engine';
import type { FinderState } from '../lib/finder';
import { GradePicker, RadioCards } from './form-blocks';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// 200점 구성 막대 — 데이터 시각화 토큰(chart-1~4)
const PART_COLOR: Record<(typeof NAESIN_PARTS)[number]['key'], string> = {
  subject: 'bg-chart-1', attendance: 'bg-chart-2', volunteer: 'bg-chart-3', school: 'bg-chart-4',
};
const one = (v: number) => (Math.round(v * 10) / 10).toFixed(1);

export function AcademicInput({ f, setF, error }: { f: FinderState; setF: (fn: (s: FinderState) => FinderState) => void; error: string | null }) {
  const rough = f.gradeMode === 'band';
  const total = parseNaesinTotal(f.naesinTotal);
  const standing = estimateStanding(total, f.subjectGrades);
  const band = standing ? BANDS.find(b => b.id === standing.band) : undefined;
  const setGrade = (subject: Subject, g: SubjectGrade | undefined) => setF(s => {
    const next = { ...s.subjectGrades };
    if (g) next[subject] = g; else delete next[subject];
    return { ...s, subjectGrades: next };
  });

  return (
    <div className="flex flex-col gap-4">
      {rough ? (
        <RadioCards<BandId> label="현재 성적대" columns={2} value={f.band} onChange={v => setF(s => ({ ...s, band: v }))}
          options={BANDS.map(b => ({ value: b.id, title: b.label, desc: b.desc, hint: b.hint }))} />
      ) : (
        <>
          <div className="rounded-xl border bg-card p-4 sm:p-5">
            <label htmlFor="naesin-total" className="text-[0.9375rem] font-semibold text-navy">
              내신 총점 <span className="text-sm font-normal text-muted-foreground">({NAESIN_MAX}점 만점)</span>
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="naesin-total"
                inputMode="decimal"
                autoComplete="off"
                placeholder="예: 186.5"
                value={f.naesinTotal}
                onChange={e => { const v = e.target.value; setF(s => ({ ...s, naesinTotal: v })); }}
                aria-invalid={error ? true : undefined}
                aria-describedby="naesin-total-help"
                className="h-12 w-36 rounded-lg bg-card text-lg font-semibold tnum md:text-lg"
              />
              <span className="text-sm text-muted-foreground">/ {NAESIN_MAX}점</span>
            </div>
            {error && <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-bad">{error}</p>}
            <div id="naesin-total-help" className="mt-4">
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{NAESIN_MAX}점은 이렇게 구성돼요</p>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                {NAESIN_PARTS.map(p => <span key={p.key} className={PART_COLOR[p.key]} style={{ flexGrow: p.max }} />)}
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-foreground/80 sm:grid-cols-4">
                {NAESIN_PARTS.map(p => (
                  <li key={p.key} className="flex items-center gap-1.5">
                    <span className={cn('size-2 shrink-0 rounded-full', PART_COLOR[p.key])} aria-hidden="true" />
                    {p.label} <b className="font-semibold text-foreground tnum">{p.max}점</b>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                경기도교육청 「고등학교 입학 내신성적 반영지침」(2026·2027학년도) 기준 교과활동 150 + 출결 20 + 봉사활동 20 + 학교활동 10 = {NAESIN_MAX}점.
                고양 등 9개 평준화학군은 이 점수로 배정예정자를 선발한 뒤 선지원·후추첨으로 학교를 배정합니다.
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex flex-wrap items-baseline gap-x-2 text-[0.9375rem] font-semibold text-navy">
              과목별 성취도 <span className="text-xs font-normal text-muted-foreground">최근 학기 · 아는 과목만 (다시 누르면 해제)</span>
            </p>
            <div className="flex flex-col gap-1.5">
              {SUBJECTS.map(s => <GradePicker key={s} subject={s} value={f.subjectGrades[s]} onChange={g => setGrade(s, g)} emphasize={s === '수학'} />)}
            </div>
          </div>

          <div aria-live="polite" className="rounded-xl bg-navy-soft px-4 py-3 text-sm">
            {standing && band ? (
              <>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <b className="font-semibold text-navy">추정 위치 상위 약 {Math.round(standing.top)}%</b>
                  <span className="text-foreground/80">· {band.label} ({band.desc})</span>
                  <Badge className="border-transparent bg-warn-soft text-warn">참고용 추정</Badge>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {[
                    standing.fromTotal != null ? `총점 ${fmt(total)}점 → 성취도 평균 약 ${one(standing.fromTotal)}` : null,
                    standing.fromSubjects != null ? `고른 ${standing.subjectCount}과목 평균 ${one(standing.fromSubjects)}` : null,
                  ].filter(Boolean).join(' · ')}{' '}
                  (A=5 … E=1){standing.fromTotal != null && standing.fromSubjects != null ? ', 두 값을 같은 비중으로 평균' : ''}.
                  {standing.fromTotal != null && ' 총점 환산은 지침 산식에 비교과 만점·원점수 구간 중간값을 가정한 값입니다.'} 성적대 대표값(상위 4·11·28·55·82%) 사이를 보간한 참고값이며 실제 석차가 아닙니다.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">내신 총점이나 과목별 성취도를 입력하면 추정 위치를 바로 보여 드립니다.</p>
            )}
          </div>
        </>
      )}

      <label htmlFor="rough-mode" className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-dashed bg-muted/40 px-4 py-3">
        <Checkbox id="rough-mode" className="mt-0.5" checked={rough} onCheckedChange={v => setF(s => ({ ...s, gradeMode: v === true ? 'band' : 'score' }))} />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground/80">점수를 몰라요 · 성적대로 대충 선택하기</span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            {rough ? '끄면 내신 총점·과목별 성취도 입력으로 돌아갑니다.' : '내신 총점을 모르면 켜고 다섯 단계 성적대 중 하나를 고르세요. 점수 입력보다 덜 정밀합니다.'}
          </span>
        </span>
      </label>
    </div>
  );
}
