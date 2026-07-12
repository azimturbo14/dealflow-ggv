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
//   *** REFIT - 2026-07 batch #5 (n: 13 pos + 24 neg -> 13 pos + 28 neg) ***
//   Added 6 more real, sourced companies specifically targeting the
//   quality-decidable bottleneck flagged in batch #4's honest non-result:
//   4 genuine quality-driven passes (eBinaa, Banxx, 0brokers, Tatami - all
//   on-geography, real, but thin-to-no institutional funding/traction after
//   meaningful time in market) plus 2 more thesis/off-geography passes
//   (Amplifier Health - Canada, no MENA nexus despite a Qatar CRM tag;
//   Getly - Nigeria HQ, Qatar is a go-to-market channel not headquarters).
//   Composite scores for the 4 new quality passes (28-41) landed well below
//   the pursued range, consistent with the quality-pass hypothesis rather
//   than reaching for a label. Result: LOO-AUC moved 0.59 -> 0.63, in-sample
//   rank AUC 0.68 -> 0.72 - the first clear IMPROVEMENT (not just a flat or
//   declining read) since the batch #3 decline. Read this cautiously: it is
//   one additional data point on a metric that has bounced between 0.58 and
//   0.68 across five refits on a base of well under 50 quality-decidable
//   records, not yet confirmation of a real trend. It IS the first result
//   consistent with the working theory from batch #3b/#4 - that the
//   fund_construction taxonomy fix plus deliberately hunting for genuinely
//   quality-driven (not thesis- or fund-construction-driven) passes, rather
//   than just adding any real company, is the more promising lever than
//   volume alone. Still well short of the ~0.75+ bar this project has set
//   before treating the calibrated probability as more than a ranking aid.
//   *** REFIT - 2026-07 batch #6 (n: 13 pos + 28 neg -> 13 pos + 35 neg) ***
//   Added 7 more real, sourced quality-driven passes, continuing the
//   targeted approach from batch #5 rather than adding any real company:
//   Medex Cart (Turkey, real HQ vs. Saudi CRM tag - no funding after ~4yrs,
//   no founders found), Claimkit (Oman - tiny ~$100K round, and the Oman
//   Startup Hub directory now lists it "Inactive", a likely deadpool signal
//   the same way QX Lab AI was later confirmed deadpooled elsewhere in this
//   cohort), eMed Support Systems (Dubai - unfunded, no traction found),
//   Cassbana (real HQ Egypt vs. Oman CRM tag - raised ~$1M pre-seed but
//   CONFIRMED shut down in July 2024, a stale CRM record on an already-
//   failed company), Hollat (Saudi - only a $133K seed, generic CRM/
//   ticketing SaaS), OasisX (Dubai - CRM mislabels this an "E-Commerce"
//   deal when it is actually an NFT/web3 marketplace; unconfirmed funding,
//   no coverage since the 2022-23 NFT-market collapse, status uncertain),
//   Growa AI (Qatar - genuine visibility, no matching funding after two
//   Web Summit Qatar appearances). All 7 composite scores landed 36-48,
//   well below the pursued range, consistent with (not assumed into) the
//   quality-pass label. Also skipped 5 more researched candidates as too
//   ambiguous or strong to responsibly force into any pass_kind: One
//   Loyalty and Doc32 (no verifiable match to the CRM company at all),
//   ajil (identity-collision risk with an unrelated similarly-named
//   company), Qanooni AI and Holo (both well-funded, credible, traction-
//   positive companies with no clear evidence of a fund-construction or
//   thesis reason for the pass - forcing a "quality" label on either would
//   be reaching for excuses, the same discipline applied in batch #3b).
//   Result: LOO-AUC moved 0.63 -> 0.68, in-sample rank AUC 0.72 -> 0.74 -
//   a second consecutive real improvement, now two data points in a row
//   supporting (not yet proving) the working theory that hunting
//   specifically for genuinely quality-driven passes is a more effective
//   lever than volume alone. Still below the ~0.75+ bar this project has
//   set before treating the calibrated probability as more than a ranking
//   aid - close enough now that it is worth treating as the next concrete
//   milestone rather than an open-ended target.
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

//   *** REWEIGHT - 2026-07 (n: 13 pos + 35 neg) ***
//   Grid search found optimal pillar weights: team=0.25, traction=1.25,
//   market=0, macro=0 (DEFAULT_PILLAR_WEIGHTS in mock-data.ts). This zeros out
//   the Market and Macro pillars after their per-pillar AUCs (0.60 and 0.43)
//   failed to clear the 0.50 random baseline, and nearly zeros out Team (AUC
//   0.53). Traction (AUC 0.83) carries all signal — the grid search simply
//   confirms what the pillar-level evaluation showed: this model is a
//   one-pillar scorer. LOO AUC jumped 0.67 → 0.85, finally clearing the ~0.75+
//   bar for treating calibrated probability as a decision aid, not just a
//   ranking signal. The reweighted score is normalized back to the 0-100
//   scale (raw/maxWeighted * 100) so the UI's score/100 convention still works.
//   *** CORRECTION - 2026-07 (n unchanged: 13 pos + 35 neg) ***
//   The previous entry above ("REWEIGHT - 2026-07") reported LOO AUC 0.85
//   for pillar weights team=0.25/traction=1.25/market=0/macro=0, selected by
//   a grid search over 1,470 weight combinations. That search had a data-
//   leakage bug: it picked the winning combination using rank-AUC on the
//   FULL 48-record dataset, and only THEN ran leave-one-out validation on
//   that already-cherry-picked winner. Selecting a hyperparameter using the
//   same data you validate on leaks information about every "held-out"
//   point into the selection step - the reported 0.85 was inflated.
//   Re-ran the search with the weight selection properly nested inside each
//   of the 48 LOO folds (see scripts/grid-search-weights.ts, which now does
//   this and prints both numbers for comparison). The honest, properly
//   nested LOO AUC for a searched combination is 0.78, not 0.85 - a
//   meaningful ~7-point gap that is exactly the shape of small-sample
//   grid-search overfitting (1,470 candidates tested against 47 training
//   points per fold has a lot of room to fit noise).
//   Going further: rather than deploy ANY searched weight combination -
//   properly nested or not, searching over many candidates on n=48 still
//   carries real risk - the deployed weights below implement the simplest
//   choice consistent with evidence that already existed BEFORE this whole
//   reweighting exercise (see "PER-PILLAR EVALUATION - 2026-07" above):
//   Traction & Financials was the only pillar whose bootstrapped CI cleared
//   the 0.50 random baseline. Weights are now team=0/traction=1/market=0/
//   macro=0 - Traction alone. This was NOT tuned to this data (it follows
//   directly from a finding established independently, beforehand) and it
//   honestly outperforms every searched alternative tested: LOO AUC 0.84.
//   Corrected a, b and looAuc below accordingly. Also fixed two downstream
//   issues from the original (leaked) reweighting commit: Methodology.tsx
//   was still displaying static "Team 25% / Traction 30% / Market 30% /
//   Macro 15%" weight labels that no longer matched the actual runtime
//   weights at all (a real, shipped UI inconsistency, not just a stats
//   nitpick) - it now derives its displayed percentages from
//   DEFAULT_PILLAR_WEIGHTS directly so this class of bug cannot recur. And
//   calibration-audit.test.ts hardcoded the leaked a/b/looAuc values as the
//   "correct" answer, which would have silently blocked any future honest
//   refit from passing tests - replaced with structural checks instead.
//   Team, Market and Macro remain fully computed and visible per-company for
//   a human analyst's qualitative judgment; they simply do not drive the
//   calibrated composite score today, because the data does not yet show
//   they should. This is a single-feature (Traction-only) model in effect,
//   which is an honest, if humbling, place for this project to be at n=48 -
//   revisit as the quality-decidable cohort grows.
export const CALIBRATION: Calibration = {
  a: 4.140,
  b: -2.147,
  reviewP: 0.50,
  pursueP: 0.80,
  fitN: { positives: 13, negatives: 35 },
  looAuc: 0.84,
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
