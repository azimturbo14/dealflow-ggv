// Grid search over pillar weight combinations to maximize LOO AUC.
//
// Run: npx tsx scripts/grid-search-weights.ts
//
// Strategy: First, grid-search using fast rank-based AUC (no Platt fitting
// needed, since AUC is order-invariant). Then for the top candidate, run the
// full LOO Platt fit to report calibrated LOO AUC and refit coefficients.

import { evaluateStartup } from '../src/lib/mock-data';
import { MENA_COHORT } from '../src/data/menaCohort';
import type { PillarWeights } from '../src/lib/mock-data';

// ---- helpers ----

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function fitPlatt(scores: number[], labels: boolean[]): { a: number; b: number } {
  let a = 0, b = 0;
  const n = scores.length;
  const mean = scores.reduce((s, v) => s + v, 0) / n;
  const std = Math.sqrt(scores.reduce((s, v) => s + (v - mean) ** 2, 0) / n) || 1;
  const z = scores.map(v => (v - mean) / std);
  const lr = 0.5;
  const epochs = 5000;
  for (let ep = 0; ep < epochs; ep++) {
    let da = 0, db = 0;
    for (let i = 0; i < n; i++) {
      const p = sigmoid(a * z[i] + b);
      da += (p - (labels[i] ? 1 : 0)) * z[i];
      db += (p - (labels[i] ? 1 : 0));
    }
    a -= lr * (da / n);
    b -= lr * (db / n);
  }
  return { a, b };
}

/** AUC-ROC: probability a random positive scores higher than a random negative. */
function auc(scores: number[], labels: boolean[]): number {
  const posIdx = labels.map((l, i) => i).filter(i => labels[i]);
  const negIdx = labels.map((l, i) => i).filter(i => !labels[i]);
  const nPos = posIdx.length, nNeg = negIdx.length;
  if (nPos === 0 || nNeg === 0) return 0.5;
  let wins = 0;
  for (const p of posIdx) {
    for (const n of negIdx) {
      if (scores[p] > scores[n]) wins++;
      else if (scores[p] === scores[n]) wins += 0.5;
    }
  }
  return wins / (nPos * nNeg);
}

// ---- precompute pillar scores ----

console.log(`Cohort: ${MENA_COHORT.length} records`);

interface Record {
  name: string;
  label: boolean;
  team: number;
  traction: number;
  market: number;
  macro: number;
}

const records: Record[] = [];
for (let i = 0; i < MENA_COHORT.length; i++) {
  const rec = MENA_COHORT[i];
  if (rec.actual_outcome === 'pursued' || rec.pass_kind === 'quality' || rec.pass_kind === 'mixed') {
    const e = evaluateStartup(rec.input, i);
    const t = e.pillars.find(p => p.key === 'team')!;
    const r = e.pillars.find(p => p.key === 'traction')!;
    const m = e.pillars.find(p => p.key === 'market')!;
    const c = e.pillars.find(p => p.key === 'macro')!;
    records.push({
      name: rec.input.name,
      label: rec.actual_outcome === 'pursued',
      team: t.score,
      traction: r.score,
      market: m.score,
      macro: c.score,
    });
  }
}

const nPos = records.filter(r => r.label).length;
const nNeg = records.filter(r => !r.label).length;
console.log(`Quality-decidable: ${records.length} (${nPos} pursued + ${nNeg} quality-pass)`);

// ---- Phase 1: fast rank-AUC grid search (no Platt fitting) ----

const teamCandidates   = [0, 0.25, 0.50, 0.75, 1.0, 1.25, 1.50];
const tractionCandidates = [0.50, 0.75, 1.0, 1.25, 1.50, 2.0, 2.50];
const marketCandidates = [0, 0.25, 0.50, 0.75, 1.0, 1.25];
const macroCandidates  = [0, 0.25, 0.50, 0.75, 1.0];

let bestRankAuc = 0;
const topCandidates: { weights: PillarWeights; rankAuc: number }[] = [];

for (const tw of teamCandidates) {
  for (const rw of tractionCandidates) {
    for (const mw of marketCandidates) {
      for (const cw of macroCandidates) {
        const scores = records.map(r => r.team * tw + r.traction * rw + r.market * mw + r.macro * cw);
        const rankAuc = auc(scores, records.map(r => r.label));
        if (rankAuc > bestRankAuc) bestRankAuc = rankAuc;
        topCandidates.push({ weights: { team: tw, traction: rw, market: mw, macro: cw }, rankAuc });
      }
    }
  }
}

// Sort, keep top 10
topCandidates.sort((a, b) => b.rankAuc - a.rankAuc);

console.log(`\nTop 10 by rank AUC (before Platt):`);
for (let i = 0; i < 10 && i < topCandidates.length; i++) {
  const c = topCandidates[i];
  console.log(`  #${i+1}: team=${c.weights.team}  traction=${c.weights.traction}  market=${c.weights.market}  macro=${c.weights.macro}  rankAUC=${c.rankAuc.toFixed(4)}`);
}

// ---- Phase 2: full LOO Platt for top candidate ----

const bestW = topCandidates[0].weights;
console.log(`\nFull LOO Platt evaluation for best weights:`);
console.log(`  team=${bestW.team}  traction=${bestW.traction}  market=${bestW.market}  macro=${bestW.macro}`);

const scores = records.map(r => r.team * bestW.team + r.traction * bestW.traction + r.market * bestW.market + r.macro * bestW.macro);
const looProbs: number[] = [];
for (let holdout = 0; holdout < scores.length; holdout++) {
  const trainScores = scores.filter((_, i) => i !== holdout);
  const trainLabels = records.filter((_, i) => i !== holdout).map(r => r.label);
  const platt = fitPlatt(trainScores, trainLabels);
  const heldScore = scores[holdout];
  const mean = trainScores.reduce((s, v) => s + v, 0) / trainScores.length;
  const std = Math.sqrt(trainScores.reduce((s, v) => s + (v - mean) ** 2, 0) / trainScores.length) || 1;
  const z = (heldScore - mean) / std;
  looProbs.push(sigmoid(platt.a * z + platt.b));
}
const looAuc = auc(looProbs, records.map(r => r.label));

const fullPlatt = fitPlatt(scores, records.map(r => r.label));
console.log(`  LOO AUC:     ${looAuc.toFixed(4)}`);
console.log(`  Platt a (full fit): ${fullPlatt.a.toFixed(4)}`);
console.log(`  Platt b (full fit): ${fullPlatt.b.toFixed(4)}`);

// Default comparison
const defaultScores = records.map(r => r.team + r.traction + r.market + r.macro);
const looProbsDefault: number[] = [];
for (let holdout = 0; holdout < defaultScores.length; holdout++) {
  const trainScores = defaultScores.filter((_, i) => i !== holdout);
  const trainLabels = records.filter((_, i) => i !== holdout).map(r => r.label);
  const platt = fitPlatt(trainScores, trainLabels);
  const heldScore = defaultScores[holdout];
  const mean = trainScores.reduce((s, v) => s + v, 0) / trainScores.length;
  const std = Math.sqrt(trainScores.reduce((s, v) => s + (v - mean) ** 2, 0) / trainScores.length) || 1;
  const z = (heldScore - mean) / std;
  looProbsDefault.push(sigmoid(platt.a * z + platt.b));
}
const defaultLooAuc = auc(looProbsDefault, records.map(r => r.label));
console.log(`\nDefault weights (1,1,1,1):`);
console.log(`  LOO AUC:     ${defaultLooAuc.toFixed(4)}`);

// Also check top 3 candidates with LOO Platt
console.log(`\nLOO evaluation for top 3 candidates:`);
for (let ci = 0; ci < 3 && ci < topCandidates.length; ci++) {
  const c = topCandidates[ci];
  const s = records.map(r => r.team * c.weights.team + r.traction * c.weights.traction + r.market * c.weights.market + r.macro * c.weights.macro);
  const probs: number[] = [];
  for (let holdout = 0; holdout < s.length; holdout++) {
    const trainScores = s.filter((_, i) => i !== holdout);
    const trainLabels = records.filter((_, i) => i !== holdout).map(r => r.label);
    const platt = fitPlatt(trainScores, trainLabels);
    const heldScore = s[holdout];
    const mean = trainScores.reduce((s, v) => s + v, 0) / trainScores.length;
    const std = Math.sqrt(trainScores.reduce((s, v) => s + (v - mean) ** 2, 0) / trainScores.length) || 1;
    const z = (heldScore - mean) / std;
    probs.push(sigmoid(platt.a * z + platt.b));
  }
  const la = auc(probs, records.map(r => r.label));
  const fp = fitPlatt(s, records.map(r => r.label));
  console.log(`  #${ci+1}: team=${c.weights.team} traction=${c.weights.traction} market=${c.weights.market} macro=${c.weights.macro}  LOO AUC=${la.toFixed(4)}  a=${fp.a.toFixed(4)} b=${fp.b.toFixed(4)}`);
}
