// Verdict calibration.
//
// The raw 0-100 quality score is a good RANKER but its absolute value compresses
// (most early-stage deals land 35-65 because revenue/runway are often unknown),
// so fixed "70=pursue / 45=review" cutoffs mislabel deals. This module converts
// the score into a calibrated probability of being pursue-worthy and derives the
// verdict from that.
//
// HOW IT WAS FIT (see src/data/menaCohort.ts):
//   - Platt scaling (1-feature L2-regularized logistic) on the client's OWN
//     labeled deals: positives = pursued, negatives = QUALITY passes.
//     Thesis/mandate passes are deliberately EXCLUDED here — they are handled by
//     the thesis gate, not by company quality.
//   - Coefficients below are the deployment fit on all quality-decidable deals.
//   - HONEST PERFORMANCE is the leave-one-out estimate, NOT the in-sample fit:
//       * quality-score rank separation (AUC), in-sample:        0.81
//       * leave-one-out AUC on the fitted probabilities:         ~0.68
//     The gap is small-sample shrinkage (only 13 positives + 6 quality-negatives).
//     Re-fit these constants whenever the labeled cohort grows — do NOT hand-tune
//     them to the validation set.
//   - Thresholds give a high-precision PURSUE band (LOO pursue precision ~0.88).

export interface Calibration {
  a: number;        // logistic slope on z = (score-50)/10
  b: number;        // logistic intercept
  reviewP: number;  // P >= reviewP  → at least REVIEW
  pursueP: number;  // P >= pursueP  → PURSUE
  fitN: { positives: number; negatives: number };
  looAuc: number;   // honest leave-one-out AUC
}

export const CALIBRATION: Calibration = {
  a: 1.088,
  b: 1.204,
  reviewP: 0.50,
  pursueP: 0.80,
  fitN: { positives: 13, negatives: 6 },
  looAuc: 0.68,
};

/** Calibrated probability (0-1) that a deal is pursue-worthy on quality grounds. */
export function pursuitProbability(score: number, cal: Calibration = CALIBRATION): number {
  const z = (score - 50) / 10;
  return 1 / (1 + Math.exp(-(cal.a * z + cal.b)));
}

/** Quality-only verdict from the calibrated probability (before thesis gating). */
export function baseVerdictFromProbability(p: number, cal: Calibration = CALIBRATION): 'high' | 'moderate' | 'low' {
  return p >= cal.pursueP ? 'high' : p >= cal.reviewP ? 'moderate' : 'low';
}
