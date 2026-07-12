import { describe, it, expect } from 'vitest';
import { evaluateStartup } from './mock-data';
import { MENA_COHORT } from '@/data/menaCohort';
import { CALIBRATION, pursuitProbability, baseVerdictFromProbability } from './calibration';

describe('Calibration Integrity', () => {
  it('coefficients match reweighing refit log', () => {
    expect(CALIBRATION.a).toBeCloseTo(3.423, 2);
    expect(CALIBRATION.b).toBeCloseTo(6.779, 2);
    expect(CALIBRATION.fitN.positives).toBe(13);
    expect(CALIBRATION.fitN.negatives).toBe(35);
    expect(CALIBRATION.looAuc).toBeGreaterThanOrEqual(0.80);
    expect(CALIBRATION.looAuc).toBeLessThanOrEqual(0.90);
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
