import { describe, it, expect } from 'vitest';
import { evaluateStartup } from './mock-data';
import { MENA_COHORT } from '@/data/menaCohort';
import { CALIBRATION, pursuitProbability, baseVerdictFromProbability } from './calibration';

// NOTE (2026-07 correction): this file previously hardcoded the exact a/b/
// looAuc values from a specific historical refit as "the correct answer"
// (e.g. `expect(CALIBRATION.a).toBeCloseTo(3.423, 2)`,
// `expect(looAuc).toBeLessThanOrEqual(0.90)`). That is backwards for a
// regression test: every honest future refit (as the cohort grows, as
// mislabeled records get fixed) will legitimately change these numbers, and
// a test that pins today's empirical fit as ground truth will fail on every
// improvement, training whoever maintains this to either ignore failing
// tests or hand-edit them without scrutiny - exactly the failure mode that
// let an inflated, data-leaked LOO AUC (0.85, from a grid search that
// selected weights on the full dataset before "validating" on it) sail
// through review looking test-covered. The checks below verify STRUCTURAL
// properties, and derive fitN directly from the cohort - so this test
// suite catches real regressions (wrong sign, fitN silently drifting out of
// sync with menaCohort.ts, an impossible AUC) without blocking legitimate,
// honestly-earned improvements.

const qualityDecidable = MENA_COHORT.filter(
  (r) => r.actual_outcome === 'pursued' || r.pass_kind === 'quality' || r.pass_kind === 'mixed'
);
const actualPositives = qualityDecidable.filter((r) => r.actual_outcome === 'pursued').length;
const actualNegatives = qualityDecidable.length - actualPositives;

describe('Calibration Integrity', () => {
  it('fitN matches the actual quality-decidable cohort (catches silent drift)', () => {
    expect(CALIBRATION.fitN.positives).toBe(actualPositives);
    expect(CALIBRATION.fitN.negatives).toBe(actualNegatives);
  });

  it('coefficients are sane (positive slope, no absurd magnitude)', () => {
    // a > 0: a higher composite score must mean a higher pursue-probability.
    // Bounds are generous on purpose - this checks for broken/runaway fits,
    // not a specific empirical value.
    expect(CALIBRATION.a).toBeGreaterThan(0);
    expect(CALIBRATION.a).toBeLessThan(20);
    expect(Math.abs(CALIBRATION.b)).toBeLessThan(20);
  });

  it('looAuc is a plausible AUC and clears a reasonable floor', () => {
    // Floor (not a ceiling): 0.55 is only slightly better than chance, so
    // this catches a broken/reverted fit without capping legitimate
    // improvement. Upper bound just guards against an impossible value.
    expect(CALIBRATION.looAuc).toBeGreaterThanOrEqual(0.55);
    expect(CALIBRATION.looAuc).toBeLessThanOrEqual(1.0);
  });

  it('pursuit probability is monotonic in quality score', () => {
    const scores = Array.from({ length: 96 }, (_, i) => i + 5);
    const probs = scores.map(s => pursuitProbability(s));
    for (let i = 1; i < probs.length; i++) {
      expect(probs[i]).toBeGreaterThanOrEqual(probs[i - 1]);
    }
  });

  it('verdict boundaries match reviewP and pursueP', () => {
    const { reviewP, pursueP } = CALIBRATION;
    expect(reviewP).toBeGreaterThan(0);
    expect(pursueP).toBeGreaterThan(reviewP);
    expect(baseVerdictFromProbability(reviewP - 0.01)).toBe('low');
    expect(baseVerdictFromProbability(reviewP)).toBe('moderate');
    expect(baseVerdictFromProbability(pursueP - 0.01)).toBe('moderate');
    expect(baseVerdictFromProbability(pursueP)).toBe('high');
  });
});

describe('Cohort Score Distribution', () => {
  const results = MENA_COHORT.map((rec, i) => {
    const e = evaluateStartup(rec.input, i);
    return { name: rec.input.name, score: e.score, verdict: e.verdict, actual: rec.actual_outcome, pass_kind: rec.pass_kind };
  });

  it('scores all cohort companies without error', () => {
    expect(results).toHaveLength(MENA_COHORT.length);
    results.forEach(r => {
      expect(r.score).toBeGreaterThanOrEqual(5);
      expect(r.score).toBeLessThanOrEqual(99);
    });
  });

  it('pursued companies have higher median score than passed', () => {
    const pursued = results.filter(r => r.actual === 'pursued').map(r => r.score).sort((a, b) => a - b);
    const passed = results.filter(r => r.actual === 'passed').map(r => r.score).sort((a, b) => a - b);
    expect(pursued.length).toBeGreaterThan(0);
    const mPursued = pursued[Math.floor(pursued.length / 2)];
    const mPassed = passed[Math.floor(passed.length / 2)];
    expect(mPursued).toBeGreaterThan(mPassed);
  });

  it('score distribution snapshot', () => {
    const scores = results.map(r => r.score).sort((a, b) => a - b);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const median = scores[Math.floor(scores.length / 2)];
    const sd = Math.sqrt(scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length);
    expect({ n: scores.length, min, max, mean: Math.round(mean * 10) / 10, median, sd: Math.round(sd * 10) / 10 }).toMatchSnapshot();
  });

  it('verdict distribution is sensible', () => {
    const counts = { high: 0, moderate: 0, low: 0 };
    results.forEach(r => counts[r.verdict]++);
    expect(counts.high).toBeLessThanOrEqual(counts.moderate + counts.low);
    expect(counts.low).toBeGreaterThan(0);
  });

  it('quality-passed companies score lower than pursued on average', () => {
    const pursued = results.filter(r => r.actual === 'pursued').map(r => r.score);
    const qualityPassed = results.filter(r => r.actual === 'passed' && (r.pass_kind === 'quality' || r.pass_kind === 'mixed')).map(r => r.score);
    if (qualityPassed.length > 0) {
      const avgP = pursued.reduce((a, b) => a + b, 0) / pursued.length;
      const avgQ = qualityPassed.reduce((a, b) => a + b, 0) / qualityPassed.length;
      expect(avgP).toBeGreaterThan(avgQ);
    }
  });
});

describe('Pillar-Level Signal', () => {
  const results = MENA_COHORT.map((rec, i) => {
    const e = evaluateStartup(rec.input, i);
    const traction = e.pillars.find(p => p.key === 'traction')!;
    const team = e.pillars.find(p => p.key === 'team')!;
    const market = e.pillars.find(p => p.key === 'market')!;
    return {
      name: rec.input.name,
      traction: traction.score / traction.max,
      team: team.score / team.max,
      market: market.score / market.max,
      pursued: rec.actual_outcome === 'pursued',
    };
  });

  it('traction pillar separates pursued from passed', () => {
    const pursued = results.filter(r => r.pursued).map(r => r.traction);
    const passed = results.filter(r => !r.pursued).map(r => r.traction);
    const aP = pursued.reduce((a, b) => a + b, 0) / pursued.length;
    const aQ = passed.reduce((a, b) => a + b, 0) / passed.length;
    expect(aP).toBeGreaterThan(aQ);
  });

  it('team pillar does not dominate traction for pursued companies', () => {
    const pursued = results.filter(r => r.pursued);
    const avgTeam = pursued.reduce((s, r) => s + r.team, 0) / pursued.length;
    const avgTraction = pursued.reduce((s, r) => s + r.traction, 0) / pursued.length;
    expect(avgTraction).toBeGreaterThan(avgTeam * 0.5);
  });
});
