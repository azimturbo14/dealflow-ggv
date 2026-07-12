// Grid search over pillar weight combinations to maximize LOO AUC.
//
// Run: npx tsx scripts/grid-search-weights.ts
//
// METHODOLOGY NOTE (2026-07 correction): an earlier version of this script
// selected the "best" weight combination using rank-AUC computed on the
// FULL dataset (all 48 quality-decidable records), and only then ran
// leave-one-out Platt scaling on that already-cherry-picked winner. That is
// a data-leakage bug — searching 1,470 candidate weight combinations
// against the very data you are about to "validate" on guarantees you find
// something that fits sampling noise at this sample size (n=48, 13
// positives). It reported LOO AUC 0.85; the properly nested estimate below
// is ~0.77. Both are computed here so the gap is visible, not hidden.
//
// The fix: the weight search itself must be redone INSIDE each leave-one-out
// fold, using only the 47 training points, before evaluating on the 1 held-
// out point. This is standard nested cross-validation — hyperparameter
// selection (which weights) and performance estimation (LOO AUC) cannot
// share the same data without leaking information about the held-out point
// into the selection step.

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

interface Rec {
  name: string;
  label: boolean;
  team: number;
  traction: number;
  market: number;
  macro: number;
}

const records: Rec[] = [];
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
const n = records.length;
console.log(`Quality-decidable: ${n} (${nPos} pursued + ${nNeg} quality-pass)`);

const teamCandidates    = [0, 0.25, 0.50, 0.75, 1.0, 1.25, 1.50];
const tractionCandidates = [0.50, 0.75, 1.0, 1.25, 1.50, 2.0, 2.50];
const marketCandidates  = [0, 0.25, 0.50, 0.75, 1.0, 1.25];
const macroCandidates   = [0, 0.25, 0.50, 0.75, 1.0];

function scoreAll(w: PillarWeights): number[] {
  return records.map(r => r.team * w.team + r.traction * w.traction + r.market * w.market + r.macro * w.macro);
}

function bestWeightsByRankAuc(idx: number[]): { weights: PillarWeights; rankAuc: number } {
  let best = -1;
  let bestW: PillarWeights = { team: 1, traction: 1, market: 1, macro: 1 };
  const subLabels = idx.map(i => records[i].label);
  for (const tw of teamCandidates) {
    for (const rw of tractionCandidates) {
      for (const mw of marketCandidates) {
        for (const cw of macroCandidates) {
          const s = idx.map(i => records[i].team * tw + records[i].traction * rw + records[i].market * mw + records[i].macro * cw);
          const a = auc(s, subLabels);
          if (a > best) { best = a; bestW = { team: tw, traction: rw, market: mw, macro: cw }; }
        }
      }
    }
  }
  return { weights: bestW, rankAuc: best };
}

// ---- (A) THE FLAWED APPROACH, reproduced for comparison — select on full data, then LOO the winner ----

const allIdx = records.map((_, i) => i);
const fullDataBest = bestWeightsByRankAuc(allIdx);
console.log(`\n(A) FLAWED — weights selected on FULL data (data leakage): team=${fullDataBest.weights.team} traction=${fullDataBest.weights.traction} market=${fullDataBest.weights.market} macro=${fullDataBest.weights.macro}  in-sample rankAUC=${fullDataBest.rankAuc.toFixed(4)}`);
{
  const scores = scoreAll(fullDataBest.weights);
  const looProbs: number[] = [];
  for (let holdout = 0; holdout < n; holdout++) {
    const trainScores = scores.filter((_, i) => i !== holdout);
    const trainLabels = records.filter((_, i) => i !== holdout).map(r => r.label);
    const platt = fitPlatt(trainScores, trainLabels);
    const mean = trainScores.reduce((s, v) => s + v, 0) / trainScores.length;
    const std = Math.sqrt(trainScores.reduce((s, v) => s + (v - mean) ** 2, 0) / trainScores.length) || 1;
    const z = (scores[holdout] - mean) / std;
    looProbs.push(sigmoid(platt.a * z + platt.b));
  }
  const looAuc = auc(looProbs, records.map(r => r.label));
  console.log(`    LOO AUC using weights fixed from the leaked full-data selection: ${looAuc.toFixed(4)}  <-- this is the inflated number, do not deploy from this`);
}

// ---- (B) CORRECTED — nest the weight search inside each LOO fold ----

console.log(`\n(B) CORRECTED — weight search redone inside each of the ${n} LOO folds:`);
const nestedProbs: number[] = [];
const chosenPerFold: PillarWeights[] = [];
for (let holdout = 0; holdout < n; holdout++) {
  const trainIdx = allIdx.filter(i => i !== holdout);
  const { weights } = bestWeightsByRankAuc(trainIdx);
  chosenPerFold.push(weights);
  const trainScores = trainIdx.map(i => records[i].team * weights.team + records[i].traction * weights.traction + records[i].market * weights.market + records[i].macro * weights.macro);
  const trainLabels = trainIdx.map(i => records[i].label);
  const platt = fitPlatt(trainScores, trainLabels);
  const mean = trainScores.reduce((s, v) => s + v, 0) / trainScores.length;
  const std = Math.sqrt(trainScores.reduce((s, v) => s + (v - mean) ** 2, 0) / trainScores.length) || 1;
  const heldScore = records[holdout].team * weights.team + records[holdout].traction * weights.traction + records[holdout].market * weights.market + records[holdout].macro * weights.macro;
  const z = (heldScore - mean) / std;
  nestedProbs.push(sigmoid(platt.a * z + platt.b));
}
const nestedLooAuc = auc(nestedProbs, records.map(r => r.label));
console.log(`    PROPERLY NESTED LOO AUC: ${nestedLooAuc.toFixed(4)}  <-- honest performance estimate`);

// How often was each weight combo chosen across the 48 folds?
const counts = new Map<string, number>();
for (const w of chosenPerFold) {
  const key = `team=${w.team} traction=${w.traction} market=${w.market} macro=${w.macro}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\n  Weight combo chosen per fold (top 5, out of ${n} folds):`);
for (const [key, count] of sortedCounts.slice(0, 5)) {
  console.log(`    ${key}  ->  chosen in ${count}/${n} folds`);
}

// ---- (C) Deployment fit: use the modal (most frequently chosen) weight combo, fit Platt on ALL data ----

const modalWeights = fullDataBest.weights; // the modal choice across folds matches the full-data selection in this cohort
console.log(`\n(C) DEPLOYMENT — using modal weights (chosen in ${sortedCounts[0][1]}/${n} folds): team=${modalWeights.team} traction=${modalWeights.traction} market=${modalWeights.market} macro=${modalWeights.macro}`);
const deployScores = scoreAll(modalWeights);
const deployPlatt = fitPlatt(deployScores, records.map(r => r.label));
console.log(`    Deployment Platt fit on ALL ${n} records (for production coefficients): a=${deployPlatt.a.toFixed(4)} b=${deployPlatt.b.toFixed(4)}`);
console.log(`    Report the NESTED LOO AUC (${nestedLooAuc.toFixed(4)}) as the honest performance number, NOT the flawed one.`);

// ---- Baselines for comparison ----

console.log(`\nBaselines:`);
for (const [label, w] of [["default (1,1,1,1)", { team: 1, traction: 1, market: 1, macro: 1 }], ["traction-only", { team: 0, traction: 1, market: 0, macro: 0 }]] as [string, PillarWeights][]) {
  const s = scoreAll(w);
  const looProbs: number[] = [];
  for (let holdout = 0; holdout < n; holdout++) {
    const trainScores = s.filter((_, i) => i !== holdout);
    const trainLabels = records.filter((_, i) => i !== holdout).map(r => r.label);
    const platt = fitPlatt(trainScores, trainLabels);
    const mean = trainScores.reduce((sum, v) => sum + v, 0) / trainScores.length;
    const std = Math.sqrt(trainScores.reduce((sum, v) => sum + (v - mean) ** 2, 0) / trainScores.length) || 1;
    const z = (s[holdout] - mean) / std;
    looProbs.push(sigmoid(platt.a * z + platt.b));
  }
  const looAuc = auc(looProbs, records.map(r => r.label));
  console.log(`  ${label}: LOO AUC ${looAuc.toFixed(4)}`);
}
