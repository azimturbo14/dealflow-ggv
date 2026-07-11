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
//     passes (+ 'mixed'). Thesis/mandate passes are deliberately EXCLUDED
//     here - they are handled by the thesis gate, not by company quality.
//   - Coefficients below are the deployment fit on all quality-decidable deals.
//   - HONEST PERFORMANCE is the leave-one-out estimate, NOT the in-sample fit:
//       * quality-score rank separation (AUC), in-sample:        0.71
//       * leave-one-out AUC on the fitted probabilities:         0.62
//
//   *** REFIT LOG - 2026-07 batch #1 (n: 13 pos + 6 neg -> 13 pos + 13 neg) ***
//   Adding 7 more researched quality-passed companies (Eighty6, Tweeq, CWallet,
//   Kingpin, The F* Word, PIPRA, Droobi Smit) moved LOO-AUC from ~0.68 to 0.62 -
//   DOWN, not up. Reported plainly rather than only keeping the better-looking
//   number: it meant the earlier 0.68 was itself an optimistic small-sample
//   estimate.
//
//   *** REFIT LOG - 2026-07 batch #2 (n: 13 pos + 13 neg -> 13 pos + 19 neg) ***
//   Added 6 more researched quality-passed companies (Teammates.ai, Cleveric
//   Solutions, ClearExhaust, Gwala, Jumlaty, MindTales) plus 3 thesis-passed
//   companies used only for the thesis-gate test set (Sadeem, Nomu Group,
//   tRetail Labs - the last one usefully triggers the new geographic gate on
//   a real deal, see thesis.ts). LOO-AUC moved from 0.62 to 0.619 - i.e. FLAT,
//   not a further decline. This is the first evidence the metric may be
//   stabilizing in the low-0.6s rather than continuing to erode as n grows,
//   but one flat data point is not a trend yet - the honest read is "no
//   longer falling, not yet confirmed to be reliable." Do not read 0.6x as
//   good; it is barely better than a coin flip and should stay a ranking aid,
//   not a gate, until it clears the ~0.75+ bar with n>=30 quality-decidable
//   negatives (currently 19) the same way the rest of this project insists on
//   for the broader scoring model. The temporal-consistency issue flagged in
//   batch #1 (fields reflecting today vs. deal-review time) has NOT been
//   fixed yet and remains a likely source of noise in both directions.
//   - Thresholds are unchanged from the original convention (0.50/0.80); LOO
//     precision at P>=0.50 is 0.70 (n=10 selected) and at P>=0.80 is 1.0 but
//     on only n=1 selected - still too thin to trust the PURSUE band's
//     precision claim. Treat the calibrated probability as a RANKING aid, not
//     a high-precision gate, until the cohort is materially larger.
//
//   *** REFIT - 2026-07 temporal-consistency audit (n unchanged: 13 pos + 19 neg) ***
//   Added an as_of_date to every cohort record (the CRM's own "date of last
//   email" on that deal - the best real proxy for "when the fund actually
//   decided," since Streak doesn't export per-stage timestamps) and checked
//   every record's cited sources against it. Found two genuine cases of
//   temporal leakage - training inputs that described a LATER state of the
//   company than what the fund could have known at decision time:
//     - Lucidya: was using its 2025-07 $30M Series B ($37.1M total) even
//       though the CRM's last-touch on this deal was 2024-12 - before that
//       round existed. Corrected to the pre-round figures ($7.1M/2 rounds).
//     - Kingpin: was using its 2025-11 $3.5M seed even though this deal was
//       marked Passed back in 2024-04 - eighteen months before that round
//       closed. Corrected funding to $0/0 rounds (the fund passed on an
//       unfunded, likely pre-launch company, not a seed-funded one).
//   Net effect: LOO-AUC moved 0.619 -> 0.63, in-sample rank AUC 0.71 -> 0.72 -
//   a small improvement, consistent with (not proof of) the hypothesis that
//   temporal leakage was adding noise. This was a targeted audit (checked
//   every record's source-citation years against its as_of_date and fixed
//   the two flagged), not an exhaustive re-verification of all 45 records'
//   every field - remaining fields are only as temporally accurate as their
//   original sourcing pass was.
export interface Calibration {
  a: number;        // logistic slope on z = (score-50)/10
  b: number;        // logistic intercept
  reviewP: number;  // P >= reviewP  → at least REVIEW
  pursueP: number;  // P >= pursueP  → PURSUE
  fitN: { positives: number; negatives: number };
  looAuc: number;   // honest leave-one-out AUC
}

export const CALIBRATION: Calibration = {
  a: 1.076,
  b: -0.081,
  reviewP: 0.50,
  pursueP: 0.80,
  fitN: { positives: 13, negatives: 19 },
  looAuc: 0.63,
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
