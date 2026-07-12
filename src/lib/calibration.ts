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
//   *** REFIT - 2026-07 batch #3b: added 'fund_construction' pass_kind ***
//   Reclassified 3 of batch #3's ambiguous "quality" companies (Qlub, Pemo,
//   NymCard) to a new fund_construction pass_kind - see PassKind in
//   menaCohort.ts - on the theory that their real pass reasons (check-size
//   mismatch, portfolio overlap with EdfaPay, timing) aren't company-quality
//   failures and shouldn't be trained against as if they were. Result: LOO-
//   AUC moved 0.58 -> 0.59 - a small improvement, NOT the fix hoped for.
//   Honest read: the reclassification hypothesis was partially right (three
//   mislabeled records did hurt slightly) but does not explain most of the
//   batch #3 decline - Rayyan Systems (score 57), Koniku (57), and Seez (44)
//   are still labeled quality and still overlap heavily with pursued-deal
//   scores, and reclassifying them too would be reaching for excuses rather
//   than following evidence, since none of their notes cite a clear
//   fund-construction reason the way Qlub/Pemo/NymCard's did. Net conclusion
//   for this project: LOO-AUC in the 0.58-0.63 range across the last three
//   refits should be read as "not yet distinguishable from noise around a
//   mediocre value," not as a metric that is converging anywhere as n grows.
//   The taxonomy fix helps a little; it is not a substitute for either (a)
//   much more volume before re-testing this conclusion, or (b) accepting
//   that composite_score's separation of quality-passes from pursued deals
//   may genuinely be weak and re-examining which sub-scores carry any signal
//   at all (see the FULL_EVALUATION_PLAN's per-sub-score AUC step - not yet
//   run at meaningful scale).
//
//   *** REFIT - 2026-07 batch #3 (n: 13 pos + 19 neg -> 13 pos + 27 neg) ***
//   Added 8 more quality-decidable companies (Qlub, Seez, Pemo, Finanshels,
//   DarDoc, Rayyan Systems, NymCard, Koniku) plus 4 thesis-passed companies
//   (Carry1st, Homzmart, Algbra, Dojah - all correctly triggered the
//   geographic/consumer thesis gates). THIS TIME THE ANSWER IS CLEARER AND
//   LESS GOOD: LOO-AUC dropped from 0.63 to 0.58 - a real decline, not noise
//   around a stable value. In-sample rank AUC also fell, 0.72 -> 0.66.
//   The likely cause is visible in the new records themselves: several of
//   this batch's "quality" pass companies (Qlub, Rayyan Systems, NymCard,
//   Koniku) score as high or higher on the composite than several PURSUED
//   deals, despite being labeled negatives - and their own sourcing notes
//   say why: the most plausible pass reasons for several of them are
//   stage/check-size mismatch, portfolio/competitive overlap with an
//   existing position (e.g. Qlub/Pemo vs. this fund's EdfaPay), or timing -
//   none of which are inputs this scoring model has ANY feature for. This is
//   a more fundamental finding than the temporal-consistency issue: growing
//   n is not obviously converging AUC toward a usable number, because a real
//   share of this fund's "quality" passes may not be explained by company
//   quality at all. Two honest paths forward: (a) keep growing n and see if
//   this is itself noise that damps out, or (b) accept that "quality" vs
//   "thesis" is an incomplete taxonomy and add a third inferred pass_kind
//   for "fund-construction reasons" (check size, existing portfolio overlap,
//   timing) that gets EXCLUDED from the quality-vs-pursued training contrast
//   entirely, the same way thesis passes already are - option (b) has not
//   been implemented, it is flagged here as the more promising fix to try
//   before assuming more volume alone will help.
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
//   *** REFIT - 2026-07 batch #4 (n unchanged: 13 pos + 24 neg, cohort grew 57->63) ***
//   Added 6 more real, individually-sourced companies (Pixxel Space, Regent
//   Craft, Atmo Biosciences, Vispera, Celligenics, Basma) to broaden the
//   thesis-gate and fund_construction test coverage (three are off-geography
//   per MENA_CLIENT_THESIS.core_regions - India, Australia x2, Singapore;
//   one is a B2C mismatch - Basma; two are check-size-driven fund_construction
//   passes - Regent Craft, Vispera). None of the 6 are pass_kind 'quality' or
//   'mixed', so the quality-vs-pursued training contrast this calibration is
//   fit on is UNCHANGED (still 13 pos + 24 neg) - a,b, and LOO-AUC below are
//   not refit because there is nothing new for them to fit against. This is
//   an honest non-result, not an oversight: growing thesis-gate/geography
//   coverage and growing the quality-decidable cohort are two different
//   axes of "more data," and this batch only advanced the former. The
//   quality-decidable cohort (still 37) remains the bottleneck for moving
//   LOO-AUC off its current 0.58-0.63 plateau - see task "grow negative-
//   class cohort toward n=60-80 quality-decidable" for next steps.
export interface Calibration {
  a: number;        // logistic slope on z = (score-50)/10
  b: number;        // logistic intercept
  reviewP: number;  // P >= reviewP  → at least REVIEW
  pursueP: number;  // P >= pursueP  → PURSUE
  fitN: { positives: number; negatives: number };
  looAuc: number;   // honest leave-one-out AUC
}

// *** PER-PILLAR EVALUATION - 2026-07 (n=37: 13 pursued + 24 quality-passed) ***
// Ran the FULL_EVALUATION_PLAN's per-sub-score step (see the Python
// enrichment project's evaluate.py for the original plan this mirrors) on
// DealFlow's own 4 pillars, using each pillar's normalized (score/max) value
// against the same pursued-vs-quality-passed label used above. Bootstrapped
// 95% CIs (2000 resamples) to show how much these numbers should be trusted
// at this sample size:
//   Traction & Financials:  AUC 0.83  [0.68, 0.94] - the ONLY pillar whose
//                            CI clears 0.50. This pillar is carrying almost
//                            all of the composite's real signal.
//   Market:                  AUC 0.60  [0.39, 0.78] - CI includes 0.50, not
//                            distinguishable from random yet.
//   Team & Founder:          AUC 0.53  [0.36, 0.68] - same as a coin flip.
//   Macro & Capital Env.:    AUC 0.43  [0.24, 0.61] - POINT ESTIMATE BELOW
//                            0.50 (inversely correlated), though the CI still
//                            straddles 0.50 so this is not yet a confident
//                            "this pillar actively hurts" claim - but it is
//                            certainly not helping, and deserves a skeptical
//                            eye rather than the benefit of the doubt.
// Composite AUC-ROC 0.68, PR-AUC 0.57 (base rate 0.35). A 5-quintile
// calibration check shows a rough but NOT monotonic relationship between
// score and advance-rate (Q1-Q3: 0.25/0.25/0.14, Q4-Q5: 0.57/0.57) - the top
// two quintiles separate cleanly from the bottom three, but there is no
// reliable ordering within either group yet.
// Confidence-stratified check could NOT be run meaningfully: all but one of
// the 37 records fall in a narrow 52-66 confidence band - the cohort simply
// doesn't have enough high-confidence (well-enriched) records yet to compare
// high vs low confidence subgroups. This is itself a finding: enrichment
// DEPTH (not just company count) is a real gap - see task "run enrichment
// pipeline at full CRM scale."
// Practical takeaway: Team & Macro pillars currently get 25% and 15% of the
// composite's weight respectively despite showing no demonstrated predictive
// value at this sample size, while Traction (30% weight) is the pillar
// actually doing the work. This is evidence a reweighting proposal is worth
// drafting - but n=37 is a small base for that CI on Traction, and DealFlow's
// pillar weights are presently fixed point values in mock-data.ts, not a
// live-reweightable config, so no weight change has been made here. Treat
// this block as the evidence base for a future, explicit reweighting
// decision - not an automatic one.

export const CALIBRATION: Calibration = {
  a: 0.877,
  b: -0.430,
  reviewP: 0.50,
  pursueP: 0.80,
  fitN: { positives: 13, negatives: 24 },
  looAuc: 0.59,
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
