import { ArrowRight, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { GEO, SCHOOLS } from '../data';
import { BANDS, SCHOOL_TYPES, STRATEGIES, SUBJECTS, TRACKS, TYPES_NOT_IN_DATA, type BandId, type CommuteWeight, type Strategy, type Subject, type SubjectGrade } from '../engine';
import { toggleIn, type FinderState } from '../lib/finder';
import { Chip, FieldBlock, RadioCards } from './form-blocks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const NONE = '__none';

export function FinderForm({ initial, onSubmit }: { initial: FinderState; onSubmit: (f: FinderState) => void }) {
  const [f, setF] = useState<FinderState>(initial);
  const set = <K extends keyof FinderState>(k: K, v: FinderState[K]) => setF(s => ({ ...s, [k]: v }));

  const dongs = GEO.dongs.filter(d => d.sgg === f.sgg);
  const middles = GEO.middle.filter(m => m.sgg === f.sgg);
  const interestOptions = SCHOOLS.filter(s => !f.interest.includes(s.id));

  const setTrack = (t: string) => {
    const auto = t === 'art' ? 'arts' : t === 'job' ? 'vocational' : null;
    setF(s => ({ ...s, track: t, types: auto && !s.types.includes(auto) ? [...s.types, auto] : s.types }));
  };

  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(f); };

  return (
    <Card id="finder" className="gap-0 rounded-2xl py-0 shadow-card">
      <CardHeader className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
        <p className="text-sm font-semibold text-primary-deep">1단계 · 학교 추천</p>
        <CardTitle className="text-2xl font-bold tracking-tight text-navy">학생 정보 입력</CardTitle>
        <CardDescription className="text-[0.9375rem] leading-relaxed">입력한 정보는 이 브라우저 안에서만 계산에 쓰이고 저장되지 않습니다.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-8 sm:pb-8">
        <form onSubmit={submit} autoComplete="off" className="flex flex-col gap-7">
          <FieldBlock num={1} label="사는 지역" required hint="고양시 3개 구만 지원합니다. 동을 고르면 통학 거리를 더 정확히 계산합니다.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Select value={f.sgg} onValueChange={v => setF(s => ({ ...s, sgg: v, dong: '', middle: '' }))}>
                <SelectTrigger aria-label="구" className="h-12! w-full rounded-lg text-[0.9375rem]"><SelectValue placeholder="구" /></SelectTrigger>
                <SelectContent>{GEO.sggs.map(g => <SelectItem key={g} value={g}>고양시 {g}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={f.dong || NONE} onValueChange={v => set('dong', v === NONE ? '' : v)}>
                <SelectTrigger aria-label="사는 동네" className="h-12! w-full rounded-lg text-[0.9375rem]"><SelectValue placeholder="사는 동네 (선택)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>사는 동네 (선택)</SelectItem>
                  {dongs.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </FieldBlock>

          <FieldBlock num={2} label="다니는 중학교" tag="선택" hint="동네를 고르지 않았을 때 통학 기준으로 쓰고, 2단계 구역내배정의 기준(출신 중학교 소재 구역)에도 씁니다.">
            <Select value={f.middle || NONE} onValueChange={v => set('middle', v === NONE ? '' : v)}>
              <SelectTrigger aria-label="다니는 중학교" className="h-12! w-full rounded-lg text-[0.9375rem]"><SelectValue placeholder="중학교 (선택)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>중학교 (선택)</SelectItem>
                {middles.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldBlock>

          <FieldBlock num={3} label="통학 거리 중요도">
            <RadioCards<CommuteWeight> label="통학 거리 중요도" compact value={f.commute} onChange={v => set('commute', v)} options={[{ value: 'low', title: '낮음' }, { value: 'mid', title: '보통' }, { value: 'high', title: '높음', desc: '가까운 학교 우대' }]} />
          </FieldBlock>

          <FieldBlock num={4} label="현재 성적대" tag="중학교 내신 기준">
            <RadioCards<BandId> label="현재 성적대" columns={2} value={f.band} onChange={v => set('band', v)}
              options={BANDS.map(b => ({ value: b.id, title: b.label, desc: b.desc, hint: b.hint }))} />
            <div className="mt-4 rounded-xl border bg-muted/40 p-4">
              <label htmlFor="detailed-grades" className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
                <Checkbox id="detailed-grades" checked={f.detailed} onCheckedChange={v => set('detailed', v === true)} />
                더 정확하게 · 과목별 성취도 입력 (선택)
              </label>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">최근 성적표의 국어·수학·영어·사회·과학 A~E를 입력하세요. 켜면 내신 경쟁력은 아래 5과목 기준으로 계산하고, 입학 도전 여부·분석 비중은 위 성적대를 기준으로 판단합니다.</p>
              {f.detailed && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {SUBJECTS.map(subject => (
                      <div key={subject}>
                        <label id={`grade-${subject}`} className="mb-1.5 block text-sm font-medium">{subject}</label>
                        <Select value={String(f.subjectGrades[subject])} onValueChange={v => setF(s => ({ ...s, subjectGrades: { ...s.subjectGrades, [subject]: Number(v) as SubjectGrade } }))}>
                          <SelectTrigger aria-labelledby={`grade-${subject}`} className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>{['A', 'B', 'C', 'D', 'E'].map((grade, i) => <SelectItem key={grade} value={String(i + 1)}>{grade}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">A~E를 1~5로 바꿔 동일 비중으로 평균한 뒤 기존 성적대 기준값 사이를 보간합니다. 실제 석차·고교 내신을 환산한 값이 아닌 참고용 추정입니다.</p>
                </div>
              )}
            </div>
          </FieldBlock>

          <FieldBlock num={5} label="강한 과목 · 약한 과목" tag="선택" hint="과목별 성적분포(A~E)가 확보된 학교(현재 운정고 1곳)에서만 궁합을 계산하고, 나머지 학교는 중립 점수로 둡니다.">
            <div className="flex flex-col gap-3">
              {(['strong', 'weak'] as const).map(kind => (
                <div key={kind} className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">{kind === 'strong' ? '강한 과목' : '약한 과목'}</span>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={kind === 'strong' ? '강한 과목' : '약한 과목'}>
                    {SUBJECTS.map(s => (
                      <Chip key={s} on={f[kind].includes(s)} disabled={f[kind === 'strong' ? 'weak' : 'strong'].includes(s)} onClick={() => set(kind, toggleIn(f[kind], s) as Subject[])}>{s}</Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FieldBlock>

          <FieldBlock num={6} label="희망 계열·학과">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="희망 계열">
              {Object.entries(TRACKS).map(([k, t]) => <Chip key={k} role="radio" on={f.track === k} onClick={() => setTrack(k)}>{t.label}</Chip>)}
            </div>
          </FieldBlock>

          <FieldBlock num={7} label="생각하는 입시 전략">
            <RadioCards<Strategy> label="입시 전략" columns={3} value={f.strategy} onChange={v => set('strategy', v)}
              options={(Object.keys(STRATEGIES) as Strategy[]).map(k => ({ value: k, title: STRATEGIES[k].label, desc: STRATEGIES[k].desc }))} />
          </FieldBlock>

          <FieldBlock num={8} label="함께 고려할 학교 유형" tag="선택 · 여러 개" hint={<>일반고는 기본으로 포함됩니다. {TYPES_NOT_IN_DATA}</>}>
            <div className="flex flex-wrap gap-2" role="group" aria-label="학교 유형">
              <Chip on disabled onClick={() => {}}>일반고 (기본)</Chip>
              {Object.entries(SCHOOL_TYPES).map(([k, t]) => <Chip key={k} on={f.types.includes(k)} hint={t.note} onClick={() => set('types', toggleIn(f.types, k))}>{t.label}</Chip>)}
            </div>
          </FieldBlock>

          <FieldBlock num={9} label="관심 있는 학교" tag="선택 · 여러 개" hint="지역·구역·유형과 상관없이 후보에 넣어 함께 비교합니다. 배정 가능 여부는 결과 카드에 표시됩니다.">
            <Select value={NONE} onValueChange={v => { if (v !== NONE) set('interest', [...f.interest, v]); }}>
              <SelectTrigger aria-label="관심 학교 추가" className="h-12! w-full rounded-lg text-[0.9375rem]"><SelectValue placeholder="학교를 골라 추가" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>학교를 골라 추가</SelectItem>
                {interestOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.sgg} · {s.kind})</SelectItem>)}
              </SelectContent>
            </Select>
            {f.interest.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {f.interest.map(id => { const s = SCHOOLS.find(x => x.id === id); return s ? (
                  <Button key={id} type="button" variant="secondary" size="sm" className="h-9 rounded-full" onClick={() => set('interest', f.interest.filter(x => x !== id))} aria-label={`${s.name} 제거`}>
                    {s.name} <X aria-hidden="true" />
                  </Button>
                ) : null; })}
              </div>
            )}
          </FieldBlock>

          <div className="mt-2 flex flex-col gap-4 border-t pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <Badge className="mr-1.5 bg-warn-soft text-warn border-transparent">참고용</Badge>
              분석 결과는 공시 자료를 바탕으로 한 참고 정보이며, 입학·배정 결과를 보장하지 않습니다.
            </p>
            <Button type="submit" size="lg" className="h-14 w-full rounded-xl text-base">추천 결과 보기 <ArrowRight aria-hidden="true" /></Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
