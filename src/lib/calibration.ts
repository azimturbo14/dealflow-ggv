// Verdict calibration.
//
// The raw 0-100 quality score is a good RANKER but its absolute value compresses
// (most early-stage deals land 35-65 because revenue/runway are often unknown),
// so fixed "70=pursue / 45=review" cutoffs mislabel deals. This module converts
// the score into a calibrated probability of being pursue-worthy and derives the
// verdict from that.
//
// HOW IT WAS FIT (see src/data/menaCohort.ts):
//   - Platt scaling (1-feature logistic regression, gradient descent) on the
//     client's OWN labeled deals: positives = pursued, negatives = QUALITY
//     passes (+ 1 'mixed'). Thesis/mandate passes are deliberately EXCLUDED
//     here - they are handled by the thesis gate, not by company quality.
//   - Coefficients below are the deployment fit on all quality-decidable deals.
//   - HONEST PERFORMANCE is the leave-one-out estimate, NOT the in-sample fit:
//       * quality-score rank separation (AUC), in-sample:        0.73
//       * leave-one-out AUC on the fitted probabilities:         0.62
//
//   *** REFIT LOG - 2026-07 batch (n: 13 pos + 6 neg -> 13 pos + 13 neg) ***
//   Adding 7 more researched quality-passed companies (Eighty6, Tweeq, CWallet,
//   Kingpin, The F* Word, PIPRA, Droobi Smit) moved LOO-AUC from ~0.68 to 0.62 -
//   DOWN, not up. Reporting this plainly rather than only keeping the better-
//   looking number: it means the earlier 0.68 was itself an optimistic small-
//   sample estimate that regressed toward a more honest value once more real
//   negatives were added, and/or several new records mix a company's CURRENT
//   (2026) team size / funding with what the fund actually saw at decision
//   time (e.g. FairMoney's team_size=600 reflects today, not the deal-review
//   moment) - noise a stricter "field must reflect state AT TIME OF CRM ENTRY"
//   rule would likely remove. Do not revert to the old numbers just because
//   they were higher - re-fit again as the cohort grows, and prioritize fixing
//   the temporal-consistency issue over adding more volume with the same flaw.
//   - Thresholds are unchanged from the original convention (0.50/0.80); LOO
//     precision at P>=0.80 is now only 0.5 on n=2 selected - too thin to trust
//     the PURSUE band's precision claim right now. Treat the calibrated
//     probability as a RANKING aid, not a high-precision gate, until the
//     cohort is materially larger.
export interface Calibration {
  a: number;        // logistic slope on z = (score-50)/10
  b: number;        // logistic intercept
  reviewP: number;  // P >= reviewP  → at least REVIEW
  pursueP: number;  // P >= pursueP  → PURSUE
  fitN: { positives: number; negatives: number };
  looAuc: number;   // honest leave-one-out AUC
}

export const CALIBRATION: Calibration = {
  a: 1.009,
  b: 0.273,
  reviewP: 0.50,
  pursueP: 0.80,
  fitN: { positives: 13, negatives: 13 },
  looAuc: 0.62,
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
