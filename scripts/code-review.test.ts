import { expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchoolCard } from '../src/components/SchoolCard';
import { GEO, SCHOOLS } from '../src/data';
import { analyze } from '../src/engine';
import { achProfile } from '../src/engine/achievement';
import { DEFAULT_FINDER, toProfile } from '../src/lib/finder';

test('HG-F1: another district middle school retains its stage-two assignment path', () => {
  const middle = GEO.middle.find(m => m.sgg === '덕양구')!;
  const profile = toProfile({
    ...DEFAULT_FINDER, sgg: '일산서구', middle: middle.name, gradeMode: 'band',
  });
  expect(profile.middleSgg).toBe('덕양구');
  const { results } = analyze(SCHOOLS, profile);
  const stageTwo = results.filter(r => r.school.admission?.zone === 1 && r.school.admission.stages.includes('구역내배정'));
  expect(stageTwo.length).toBeGreaterThan(0);
  for (const r of stageTwo) {
    expect(r.assign.kind).toBe('stage2-only');
    expect(r.assign.assignable).toBe(true);
    expect(r.mult).toBe(1);
  }
});

test('HG-F2: vocational card renders secured math data without changing neutral scoring', () => {
  const profile = toProfile({ ...DEFAULT_FINDER, gradeMode: 'band', types: ['vocational'] });
  const { results } = analyze(SCHOOLS, profile);
  const r = results.find(r => r.group === 'vocational')!;
  const math = achProfile(r.school)!.core.수학!;
  expect(r.flags.achievement).toBe(true);
  expect(r.ach).toBeNull();
  expect(r.comps.adv).toBe(50);
  const html = renderToStaticMarkup(createElement(SchoolCard, {
    r, rank: 1, profile, rankOf: {}, n: results.length,
  }));
  expect(html).toContain(math.name);
  expect(html).toContain(`${math.avg}점`);
  expect(html).toContain(`${math.A}%`);
});
