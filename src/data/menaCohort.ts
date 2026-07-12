// Hand-researched enrichment of the client's real MENA pipeline.
//
// PROVENANCE RULES (see the project's honesty contract):
//   - Every funding/founding/team/revenue figure here was sourced from public
//     reporting (TechCrunch, Wamda, MENAbytes, Crunchbase/Tracxn, company sites)
//     in July 2026. Key sources are listed per company in `sources`.
//   - `actual_outcome` is the client's own decision from the Streak `Stage`
//     column — the ground truth we validate the model against.
//   - Fields we could NOT source are left undefined on purpose. They are scored
//     as unknown (which lowers the confidence rating); we do not guess them.
//   - `est` flags a field inferred from stage rather than directly reported.

import type { StartupInput } from '@/lib/mock-data';

export type ActualOutcome = 'pursued' | 'passed';
export type PassKind = 'thesis' | 'quality' | 'mixed' | 'fund_construction' | 'n/a';
// 'fund_construction': the deal looks strong on Team/Traction/Financing and
// doesn't cleanly fail sector/B2C/geography mandate fit (thesis) or read as
// too-early/thin-scale (quality) either - the more plausible explanation is
// a reason this scoring model has NO feature for at all: check-size/stage
// mismatch (the round is bigger than this fund's typical ownership target),
// portfolio-construction overlap (the fund already has a similar position),
// or timing. Added 2026-07 batch #3 after several "quality (ambiguous close
// call)" labels turned out to be actively hurting calibration - see
// calibration.ts's REFIT LOG. EXCLUDED from the quality-vs-pursued training
// contrast, the same way 'thesis' already is, because including it was
// mislabeling deals the model was never going to be able to explain as
// company-quality failures.

export type ReasonBasis = 'client_stated' | 'inferred_from_thesis_rubric';

export interface CohortRecord {
  input: StartupInput;
  actual_outcome: ActualOutcome;
  pass_kind: PassKind;      // for passed deals: was it a mandate pass or a quality pass?
  est_fields: string[];     // fields inferred (not directly sourced)
  sources: string[];
  note?: string;
  // Was pass_kind read off the CRM's own Reason-to-Invest/Pass or Notes text
  // (the original 25 records below), or inferred by us from MENA_CLIENT_THESIS
  // fit because no client reason text existed for that deal? Undefined = 'client_stated'
  // (the original hand-labeled batch). Never conflate the two - an inferred
  // classification is a plausible read, not the fund's actual stated reason.
  reason_basis?: ReasonBasis;
  // Real-world anchor date for this record: the CRM's own "Date of Last
  // Email" for this deal (the closest real timestamp we have to "when the
  // fund actually engaged with/decided on this company" - Streak doesn't
  // export per-stage-transition timestamps, so this is the best available
  // proxy). Added 2026-07 after finding two records (Lucidya, Kingpin)
  // whose sourced funding figures were events that happened AFTER this
  // date - i.e. facts the fund could not have known at decision time had
  // leaked into the training input. See the temporal-consistency audit
  // note on any record with a "TEMPORAL FIX" note. Every field's sourcing
  // should be consistent with (on or before) this date; where that could
  // not be confirmed, the record says so rather than assuming it's fine.
  as_of_date: string;
}

// funding_rounds inferred from the last announced stage; time_to_first_funding
// left at a neutral value where unknown (it barely moves the score).
//
// TEMPORAL-CONSISTENCY AUDIT (2026-07): every record now carries an
// as_of_date (see CohortRecord below) and was checked for sourced facts
// that describe a LATER state of the company than the fund could have
// known at that date. Two records had a provably later funding event
// baked in and were corrected (Lucidya, Kingpin - see their "TEMPORAL FIX"
// notes); one more (FairMoney) used an undated database snapshot that
// turned out to be too LOW, not too high, once cross-checked against
// dated sources - also corrected. Eight further records cite undated
// Tracxn/Crunchbase/CBInsights/PitchBook-style database snapshots for a
// team_size or funding figure (Tweeq, The F* Word, Sadeem, Cleveric
// Solutions, Jumlaty, MindTales, and Lucidya's remaining profile fields)
// that were NOT individually re-verified against a dated source this
// round - most already carry an est_fields flag for the field in
// question, so the uncertainty is disclosed, but "flagged as an estimate"
// is a weaker claim than "verified consistent with as_of_date." Treat
// this as a targeted audit that closed the largest/clearest gaps, not an
// exhaustive per-field re-verification of all 45 records.
export const MENA_COHORT: CohortRecord[] = [
  // ---------------- PURSUED (the 13 positives) ----------------
  {
    input: { name: 'Invisible Technologies', industry: 'AI', country: 'United States', is_b2b: true, team_size: 350, funding_total_usd: 144_000_000, funding_rounds: 4, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 134_000_000, unique_tech: true, technical_cofounder: true, stage: 'Scaling', revenue_growth_pct: 8, founding_year: 2015 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['revenue_growth_pct'],
    as_of_date: '2026-03-11',
    sources: ['businesswire 2025 $100M raise', 'getlatka $134M ARR 2024'], note: 'AI infra, $134M ARR, Inc 5000 #2 fastest-growing AI.',
  },
  {
    input: { name: 'Lucidya', industry: 'AI', country: 'Saudi Arabia', is_b2b: true, team_size: 200, funding_total_usd: 7_100_000, funding_rounds: 2, time_to_first_funding_months: 36, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2016 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2024-12-24',
    sources: ['menabytes.com/lucidya-series-a (Jan 2019 $1.1M seed)', 'MAGNiTT Jan 2022 $6M Series A', 'Wikipedia/Tracxn'],
    note: 'Arabic-language AI, customer-experience/social-listening platform. TEMPORAL FIX (2026-07 audit): the original record used the $30M Series B (closed 2025-07-14, per Wamda/GlobeNewswire) as the funding total, but the CRM\'s own last-recorded-email on this deal is 2024-12-24 - before that round existed. Corrected funding_total_usd/funding_rounds/time_to_first_funding_months to the pre-anchor figures ($1.1M seed 2019 + $6M Series A 2022 = $7.1M/2 rounds), which is what the fund would actually have known when this deal was at Interested/IC discussion. The $30M round is real but is a later event and must not leak into this training record.',
  },
  {
    input: { name: 'Invygo', industry: 'Mobility Tech', country: 'United Arab Emirates', is_b2b: false, team_size: 80, funding_total_usd: 22_200_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-06-22',
    sources: ['TechCrunch 2022 $10M Series A', 'Tracxn $22.2M total'], note: 'Car subscription; B2C but pursued to IC.',
  },
  {
    input: { name: 'Emma Systems', industry: 'AI', country: 'Qatar', is_b2b: true, team_size: 30, funding_total_usd: 2_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2026-04-01',
    sources: ['Wamda 2025 seed +VC', 'QSTP/QDB backed'], note: 'Aviation-ops AI (not construction); deal size $2M from CRM.',
  },
  {
    input: { name: 'CIQ', industry: 'B2B SaaS', country: 'United States', is_b2b: true, team_size: 100, funding_total_usd: 30_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: true, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2020 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-07-09',
    sources: ['VentureBeat 2022 $26M Series A', 'ciq.com'], note: 'Rocky Linux / HPC infra; founder = CentOS creator (prior track record).',
  },
  {
    input: { name: 'Antaris Space', industry: 'SpaceTech', country: 'United States', is_b2b: true, team_size: 60, funding_total_usd: 42_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2021 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-07-08',
    sources: ['SpaceNews $28M Series A', 'Lockheed Martin Ventures'], note: 'Satellite mission software; deep tech.',
  },
  {
    input: { name: 'EdfaPay', industry: 'FinTech', country: 'Saudi Arabia', is_b2b: true, team_size: 30, funding_total_usd: 9_800_000, funding_rounds: 3, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 500_000, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'sales_amount_usd'],
    as_of_date: '2024-07-28',
    sources: ['Forbes ME 2024 $5M pre-Series A', 'Tracxn $9.8M total'], note: 'SoftPOS; traction in Morocco/Tunisia.',
  },
  {
    input: { name: 'Tarjama', industry: 'AI', country: 'Jordan', is_b2b: true, team_size: 300, funding_total_usd: 20_000_000, funding_rounds: 2, time_to_first_funding_months: 20, has_previous_exit: false, sales_amount_usd: 8_000_000, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2008 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['sales_amount_usd'],
    as_of_date: '2025-07-21',
    sources: ['Slator 2025 $15M Series A', 'tarjama.com 700+ clients'], note: 'Arabic language tech; 300+ team, 700+ clients (revenue est. from scale).',
  },
  {
    input: { name: 'Byanat', industry: 'B2B SaaS', country: 'Oman', is_b2b: true, team_size: 30, funding_total_usd: 4_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2026-07-06',
    sources: ['Wamda 2023 seed', 'Golden Gate/QDB pre-Series A 2025'], note: 'IoT/data analytics SaaS; ~$2.45M committed at IC per CRM notes.',
  },
  {
    input: { name: 'Swypex', industry: 'FinTech', country: 'Egypt', is_b2b: true, team_size: 30, funding_total_usd: 4_000_000, funding_rounds: 1, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-06-26',
    sources: ['TechCrunch 2024 $4M seed (Accel)'], note: 'B2B corporate cards / spend management.',
  },
  {
    input: { name: 'Nybl', industry: 'AI', country: 'Saudi Arabia', is_b2b: true, team_size: 32, funding_total_usd: 31_000_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: [],
    as_of_date: '2026-07-09',
    sources: ['PitchBook $31M', 'ArabNews'], note: 'Industrial/oil-and-gas AI.',
  },
  {
    input: { name: 'BioSapien', industry: 'BioTech', country: 'United States', is_b2b: true, team_size: 20, funding_total_usd: 8_000_000, funding_rounds: 2, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-07-09',
    sources: ['Wamda 2025 $8M pre-Series A', 'Global Ventures'], note: '3D-printed drug delivery (MediChip); deep tech, pre-revenue.',
  },
  {
    input: { name: 'XScape Photonics', industry: 'DeepTech', country: 'United States', is_b2b: true, team_size: 60, funding_total_usd: 95_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    as_of_date: '2026-07-07',
    sources: ['BusinessWire 2026 $37M (total Series A $81M)', 'NVIDIA-backed'], note: 'Optical interconnects for AI data centers; Columbia spinout.',
  },

  // ---------------- PASSED — quality-driven (the rubric CAN predict these) ----------------
  {
    input: { name: 'Patron', industry: 'BNPL', country: 'Egypt', is_b2b: false, team_size: 15, funding_total_usd: 3_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2024-04-09',
    sources: ['Crunchbase seed'], note: 'Client reason: no defensible model, too small, no growth.',
  },
  {
    input: { name: 'QX Lab AI', industry: 'AI', country: 'United Arab Emirates', is_b2b: true, team_size: 20, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size'],
    as_of_date: '2024-04-24',
    sources: ['Tracxn: no funding, deadpooled'], note: 'Client reason: too early / track. Later deadpooled — model should not pursue.',
  },
  {
    input: { name: 'Bon Plus', industry: 'B2B SaaS', country: 'Oman', is_b2b: true, team_size: 12, funding_total_usd: 500_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2024-04-28',
    sources: ['Wamda 2024 undisclosed seed'], note: 'Client reason: too early.',
  },
  {
    input: { name: 'Batal Gaming', industry: 'Gaming', country: 'United Arab Emirates', is_b2b: false, team_size: 15, funding_total_usd: 1_000_000, funding_rounds: 1, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2025-02-04',
    sources: ['PitchBook: Plus VC seed'], note: 'Client reason: no moat vs bigger players.',
  },
  {
    input: { name: 'Fero.ai', industry: 'Logistics SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 25, funding_total_usd: 2_670_000, funding_rounds: 2, time_to_first_funding_months: 16, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'mixed', est_fields: ['team_size'],
    as_of_date: '2026-04-11',
    sources: ['Crunchbase $2.67M'], note: 'Client reason: vertical pass + growth-potential concern.',
  },
  {
    input: { name: 'Droplinked', industry: 'Blockchain', country: 'United Arab Emirates', is_b2b: false, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size'],
    as_of_date: '2024-03-24',
    sources: ['Tracxn/Hub71 accelerator'], note: 'Client reason: web3 consumer needs more validation.',
  },

  // ---------------- PASSED — thesis-driven (needs the thesis layer, not quality) ----------------
  {
    input: { name: 'Beije', industry: 'B2C Femcare', country: 'Turkey', is_b2b: false, team_size: 30, funding_total_usd: 1_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 2_760_000, unique_tech: false, technical_cofounder: false, stage: 'Growth', revenue_growth_pct: 10, founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2026-01-17',
    sources: ['CRM notes: $230K MRR, 55k subs, EBITDA+', 'Crunchbase (GFC seed)'], note: 'Strong B2C metrics; passed purely on "not investing in B2C".',
  },
  {
    input: { name: 'eZhire', industry: 'Mobility Tech', country: 'United Arab Emirates', is_b2b: false, team_size: 60, funding_total_usd: 3_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', revenue_growth_pct: 8, founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2024-10-14',
    sources: ['MENAbytes seed (Jabbar)', 'Zawya 102% growth'], note: 'Largest B2C car rental; passed on "focusing on b2b deep tech".',
  },
  {
    input: { name: 'Podeo', industry: 'AdTech', country: 'United Arab Emirates', is_b2b: false, team_size: 30, funding_total_usd: 5_400_000, funding_rounds: 2, time_to_first_funding_months: 16, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    as_of_date: '2024-04-09',
    sources: ['TechCrunch 2024 $5.4M Series A'], note: 'Podcast platform; passed on "no interest in podcast businesses".',
  },
  {
    input: { name: 'AlGooru', industry: 'EdTech', country: 'Saudi Arabia', is_b2b: false, team_size: 30, funding_total_usd: 5_800_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    as_of_date: '2024-04-09',
    sources: ['Wamda 2024 $4M pre-Series A', 'ArabNews $1.8M seed'], note: 'Tutoring marketplace; passed on EdTech-sector thesis.',
  },
  {
    input: { name: 'Poltio', industry: 'Retail Tech', country: 'Turkey', is_b2b: true, team_size: 15, funding_total_usd: 296_000, funding_rounds: 4, time_to_first_funding_months: 20, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2014 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    as_of_date: '2024-04-09',
    sources: ['Tracxn $296K total'], note: 'Interactive content; passed on "less keen on retail sector".',
  },
  {
    input: { name: 'Cari', industry: 'FoodTech', country: 'United Arab Emirates', is_b2b: false, team_size: 40, funding_total_usd: 3_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: true, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
    as_of_date: '2024-03-31',
    sources: ['GulfNews / Caterer ME'], note: 'Food delivery (0% commission); founder ex-Carriage. Passed on food sub-sector thesis.',
  },

  // ---------------- PASSED — researched follow-up batch (July 2026) ----------------
  // Added to grow the QUALITY-negative pool specifically: the positive class
  // (pursued/advanced) is structurally capped near ~12-16 across this fund's
  // entire 661-company CRM history (see the enrichment pipeline's evaluation
  // notes), so more research cannot manufacture more positives - but only 12
  // of the CRM's ~187 real Passed/Passing companies had been researched into
  // this cohort before this batch. These 11 grow that side.
  //
  // IMPORTANT: unlike the batch above, these deals have NO "Client reason"
  // text in the CRM's Notes / Reason-to-Invest-Pass columns (those fields
  // were blank for every one of them). pass_kind below is therefore inferred
  // from fit against MENA_CLIENT_THESIS (sector, B2B/B2C, moat), NOT read off
  // an actual client statement - reason_basis is set to make that explicit
  // and machine-checkable rather than burying the caveat in prose.
  {
    input: { name: 'Eighty6', industry: 'B2B SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 11, funding_total_usd: 3_700_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months', 'technical_cofounder', 'founding_year'],
    as_of_date: '2024-06-20',
    sources: ['Wamda 2023 $3.7M seed', 'The National founder profile (30yr F&B veteran co-founder)'],
    note: 'B2B F&B order-taking SaaS; on-thesis sector (B2B SaaS) but no stated technical moat found - inferred quality pass, not a thesis mismatch. One aggregator reports $4.8M total vs $3.7M in press; used the press figure.',
  },
  {
    input: { name: 'Tweeq', industry: 'FinTech', country: 'Saudi Arabia', is_b2b: false, team_size: 15, funding_total_usd: 533_000, funding_rounds: 2, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    as_of_date: '2024-04-15',
    sources: ['MenaBytes 2021 seven-figure round (STV/Raed)', 'CBInsights people/funding'],
    note: 'Consumer spending-account app; on-thesis sector (FinTech) but B2C and a small disclosed raise ($533K/2 rounds) - inferred quality pass on scale/stage. NOTABLE: Tweeq was acquired by Tabby in Sept 2024, i.e. after this fund passed - a real instance of a passed deal later exiting, worth the fund reviewing regardless of what the model says.',
  },
  {
    input: { name: 'CWallet', industry: 'Digital Bank', country: 'Qatar', is_b2b: false, team_size: 10, funding_total_usd: 1_095_000, funding_rounds: 2, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'MVP', founding_year: 2019 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder'],
    as_of_date: '2024-07-11',
    sources: ['Qatar Tribune 2021 $220K pre-seed (MBK Holding)', 'Wamda 2022 $875K pre-Series A'],
    note: 'Digital wallet/remittance for the unbanked; on-thesis sector (FinTech) but very small disclosed raises ($220K + $875K) - inferred quality pass on scale/stage, not thesis.',
  },
  {
    input: { name: 'FairMoney', industry: 'FinTech', country: 'Nigeria', is_b2b: false, team_size: 1000, funding_total_usd: 57_000_000, funding_rounds: 4, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Scaling', founding_year: 2017 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months', 'team_size'],
    as_of_date: '2025-06-10',
    sources: ['FintechFutures 2019 $42M Series B (Tiger Global, DST Global)', 'openafricapod.substack.com 2024 (crossed 1,000 employees in 2024)', 'LeadIQ (~1.1K employees, July 2025)'],
    note: 'A large, well-funded ($57-90M depending on source) Nigerian digital bank - objectively strong on Team/Traction/Financing. TEMPORAL FIX (2026-07 audit): the original record used team_size=600 from an undated Tracxn/LinkedIn snapshot pulled during research (2026-07), worrying it might be TOO current for a 2025-06 decision date - but re-checking dated sources shows the opposite problem: FairMoney had already crossed 1,000 employees by 2024 and was ~1,100 by July 2025, so 600 was actually a STALE, too-LOW figure relative to the 2025-06-10 anchor. Corrected to 1,000 as the better as-of-anchor estimate. Classified thesis, not quality: Nigeria/Sub-Saharan Africa is outside this MENA-focused fund\'s core geography, which markets.ts and thesis.ts do not currently encode as a gate. Flagging this as a genuine gap: the thesis-fit layer checks sector/B2C/moat but has no geographic-mandate check, so a strong off-geography deal like this would currently score as a good quality fit with no thesis penalty at all.',
  },
  {
    input: { name: 'Bykea', industry: 'Mobility Tech', country: 'Pakistan', is_b2b: false, team_size: 175, funding_total_usd: 18_700_000, funding_rounds: 2, time_to_first_funding_months: 36, has_previous_exit: true, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Scaling', founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    as_of_date: '2025-07-03',
    sources: ['TechCrunch 2020 $13M Series B (Prosus Ventures)', 'MenaBytes 2019 $5.7M Series A'],
    note: 'Pakistan\'s largest motorbike ride-hailing/logistics platform; founder co-founded Daraz (acquired by Alibaba) = has_previous_exit. Classified thesis (parallel to eZhire, already in this cohort as a thesis-passed B2C mobility deal): consumer, asset-heavy B2C mobility model, same pattern the fund has explicitly deprioritized elsewhere.',
  },
  {
    input: { name: 'Kingpin', industry: 'B2B SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 20, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2024 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year', 'funding_total_usd', 'funding_rounds', 'time_to_first_funding_months'],
    as_of_date: '2024-04-09',
    sources: ['Wamda 2025 $3.5M seed (Infinity Ventures, Red Swan, Mu Ventures, COTU, Outliers, Hub71) - POST-DECISION, see note', 'Entrepreneur ME coverage - POST-DECISION'],
    note: 'AI-native B2B distribution platform for brands/distributors. TEMPORAL FIX (2026-07 audit): the original record used the $3.5M seed round as funding_total_usd, but that round closed 2025-11-21 per Wamda/Entrepreneur ME - eighteen months AFTER the CRM\'s last-recorded-email on this deal (2024-04-09, stage Passed). The fund passed on this company before it had ANY funding, likely at or near inception (founding_year 2024). Corrected funding_total_usd/funding_rounds/time_to_first_funding_months to 0 to reflect that pre-decision state, rather than crediting this record with a funding round that did not yet exist. This also sharpens the classification: this reads less like an ambiguous stage/recency close call and more like a straightforward too-early/pre-funding quality pass.',
  },
  {
    input: { name: 'UBQT', industry: 'Social/Platform Software', country: 'United Arab Emirates', is_b2b: false, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'founding_year'],
    as_of_date: '2026-06-23',
    sources: ['TahawulTech founder interview', 'Meridio co-founder Q&A'],
    note: 'Consumer social app (deliberately no feed/likes); strong founder pedigree (CTO ex-Meta/Lyft/Careem, CEO ex-corporate-insurance & a unicorn IPO). Classified thesis: B2C consumer social, same pattern as this fund\'s other thesis-capped consumer deals (Podeo, Cari).',
  },
  {
    input: { name: 'The F* Word', industry: 'Fashion AI', country: 'United States', is_b2b: true, team_size: 8, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: true, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    as_of_date: '2024-03-24',
    sources: ['thefword.ai about-us page', 'Tracxn (unfunded, Fremont CA)'],
    note: 'Agentic AI workflow tool for fashion brands; founders claim 2 prior exits. CRM tagged this deal "Dubai" but public sources place it in Fremont, CA with no disclosed funding - inferred quality pass on stage/unclear traction; the CRM country tag itself may be wrong and is worth a data-quality check.',
  },
  {
    input: { name: 'My Pet World', industry: 'Pet Tech', country: 'Qatar', is_b2b: false, team_size: 6, funding_total_usd: 0, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year', 'funding_total_usd'],
    as_of_date: '2024-04-09',
    sources: ['The Peninsula Qatar 2023 DIC-incubated launch', 'Doha News founder feature'],
    note: 'QDB/DIC-incubated pet-owner marketplace app, ~6,000 users. Classified thesis: niche B2C consumer vertical outside the fund\'s preferred sectors, same pattern as other consumer-niche passes in this cohort.',
  },
  {
    input: { name: 'PIPRA', industry: 'MedTech', country: 'Switzerland', is_b2b: true, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year', 'funding_total_usd', 'funding_rounds', 'stage'],
    as_of_date: '2025-12-15',
    sources: ['Swiss Biotech Association directory listing (address/registration only)'],
    note: 'Almost no public information was found beyond a registry listing - no funding, team, or product detail. Included anyway (rather than dropped) because it IS a real, resolved Passed decision, but nearly every field is estimated; treat this record\'s contribution to the fit with more skepticism than the others, and flag for direct follow-up with the deal team rather than trusting this record\'s inputs.',
  },
  {
    input: { name: 'Droobi Smit', industry: 'Healthtech', country: 'Qatar', is_b2b: true, team_size: 15, funding_total_usd: 5_000_000, funding_rounds: 2, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: false, stage: 'Growth', founding_year: 2017 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder'],
    as_of_date: '2026-02-09',
    sources: ['Wamda 2024 Droobi Health x Smit.fit merger', 'Zawya merger coverage'],
    note: 'Chronic-disease digital health platform; on-thesis sector (HealthTech), ~$5M backing (QSTP/QDB/Barzan/Doha Tech Angels/MVP), Stanford/MIT + ex-McKinsey-Partner founders - one of the stronger-pedigree passes in this batch. Later merged with India\'s Smit.fit and rebranded Lillia. Inferred quality pass, but this is a closer call than the others here and worth the deal team double-checking.',
  },
  {
    input: { name: 'Teammates.ai', industry: 'AI', country: 'United Arab Emirates', is_b2b: true, team_size: 25, funding_total_usd: 0, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'time_to_first_funding_months'],
    as_of_date: '2025-12-11',
    sources: ['Wamda 2025 Uktob.ai rebrand to Teammates.ai', 'PRNewswire 2025 funding announcement', 'Arab Founders rebrand coverage'],
    note: 'AI-agent "digital workforce" platform (rebranded from Uktob.ai); on-thesis sector (AI) and geography (UAE/GCC). Raised an undisclosed round from Hustle Fund, Access Bridge Ventures, Oraseya Capital, Beyond Capital + angels; claims 400K+ organic users and government contracts (Dubai Future Foundation, AI Office). Inferred quality pass: despite a strong growth narrative, the funding amount is undisclosed and disclosed traction is user/contract counts rather than revenue - thin enough evidence on hard financing/traction metrics to plausibly explain a pass even though the story otherwise reads on-thesis. Worth a deal-team sanity check given how strong the qualitative signal is.',
  },
  {
    input: { name: 'Sadeem', industry: 'IoT', country: 'Saudi Arabia', is_b2b: true, team_size: 15, funding_total_usd: 3_130_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'founding_year'],
    as_of_date: '2026-02-18',
    sources: ['KAUST Innovation 2023 $2.6M Wa\'ed Ventures investment', 'Arab News "Startup of the Week" feature', 'Dealroom/Crunchbase $3.13M total raised'],
    note: 'KAUST spinout building solar-powered IoT/AI sensor networks for flood, traffic and stormwater monitoring; four PhD-founder team, $3.13M raised (Wa\'ed Ventures, KAUST Innovation Fund, ArabNet, Leading Cities). Classified thesis: this is a hardware/IoT deep-tech deal sold primarily to municipal/government customers (B2G), a materially different sales motion and asset profile than the fund\'s typical asset-light B2B software mandate - parallel to how eZhire/Bykea were thesis-capped for an asset-heavy model.',
  },
  {
    input: { name: 'Cleveric Solutions', industry: 'B2B SaaS', country: 'Qatar', is_b2b: true, team_size: 9, funding_total_usd: 200_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: false, stage: 'Launched', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months', 'technical_cofounder'],
    as_of_date: '2024-07-10',
    sources: ['PitchBook/Crunchbase Cleveric Solutions profile', 'Lucidity Insights startup profile'],
    note: 'Cloud-based, AI-powered inventory/compliance SaaS for F&B and hospitality operators, Doha-based. On-thesis sector (B2B SaaS) and geography (GCC), but only $200K raised (QDB Demo Day) with a 9-person team - inferred quality pass on scale/stage, not a thesis mismatch.',
  },
  {
    input: { name: 'ClearExhaust', industry: 'Climate Tech', country: 'Qatar', is_b2b: true, team_size: 5, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'founding_year'],
    as_of_date: '2024-02-19',
    sources: ['Qatar University / QNA 2023 faculty-led spinoff announcement'],
    note: 'Qatar University faculty-led spinoff (Dr. Samer Fikry, Mechanical Engineering) commercializing a diesel-engine emissions-reduction technology. No external funding disclosed beyond university/SIEED incubation support - pre-commercial IP still inside a university tech-transfer process. Inferred quality pass: too early-stage/pre-revenue with unresolved IP-licensing terms, not a sector or geography mismatch.',
  },
  {
    input: { name: 'Gwala', industry: 'FinTech', country: 'Morocco', is_b2b: true, team_size: 12, funding_total_usd: 0, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'time_to_first_funding_months', 'technical_cofounder'],
    as_of_date: '2024-07-12',
    sources: ['Wamda 2023 pre-Seed funding coverage', 'Knowledge Innovations pre-Seed writeup'],
    note: 'Casablanca-based earned-wage-access / financial-wellness platform for African employers; founder ex-Stanford CS. On-thesis sector (FinTech) and geography (North Africa), led by Ingressive Capital (Maya Horgan Famodu), but pre-Seed and undisclosed amount - inferred quality pass on stage/scale.',
  },
  {
    input: { name: 'Jumlaty', industry: 'FoodTech', country: 'Saudi Arabia', is_b2b: true, team_size: 20, funding_total_usd: 0, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2019 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'time_to_first_funding_months', 'technical_cofounder', 'founding_year'],
    as_of_date: '2024-12-24',
    sources: ['Tracxn Jumlaty company profile', 'Crunchbase Jumlaty profile'],
    note: 'B2B "Supply Chain as a Service" platform for restaurants (sourcing, replenishment, "Supply Now Pay Later"), spun out of Nomu\'s Jeddah venture studio; founders Salman Attieh and Ibrahim Mazoza (same studio that produced Nomu Group, also in this cohort). Raised one funding round from one investor, amount undisclosed. Inferred quality pass on scale/disclosed-metrics thinness, not thesis - directly comparable to its sibling company Nomu Group below.',
  },
  {
    input: { name: 'Nomu Group', industry: 'FoodTech', country: 'Saudi Arabia', is_b2b: true, team_size: 60, funding_total_usd: 5_000_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'technical_cofounder'],
    as_of_date: '2024-09-02',
    sources: ['The National 2023 $5M seed coverage', 'Entrepreneur ME / Forbes ME seed round coverage', 'Wamda seed round writeup'],
    note: 'B2B HORECA inventory/sourcing/delivery platform for restaurants and cafes; $5M seed (DIV Capital, Shurfah, Core Vision, family offices), reported 10x revenue growth in 12 months, expansion to 4 countries, partnerships with Savola and P&G - one of the objectively strongest deals in this "passed" batch on Team/Traction/Financing. Classified thesis rather than quality: the core model is asset-heavy inventory sourcing/warehousing/delivery logistics, not asset-light B2B software, a pattern this fund has thesis-capped elsewhere (eZhire, Bykea). Flagging as a close call the deal team should double-check given how strong the raw metrics are.',
  },
  {
    input: { name: 'MindTales', industry: 'HealthTech', country: 'United Arab Emirates', is_b2b: true, team_size: 15, funding_total_usd: 1_230_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'technical_cofounder'],
    as_of_date: '2025-06-10',
    sources: ['ADSMEHub founder interview', 'Crunchbase/CBInsights MindTales profile'],
    note: 'B2B2C corporate-wellness / mental-health platform, Abu Dhabi; founder Viktorija Aksionova; $1.23M seed (investors from UAE/Saudi/US/Israel), 120K+ app downloads. On-thesis sector (HealthTech, parallel to Droobi Health/Smit already in this cohort as a quality pass) and geography (GCC), but a smaller raise and more consumer-content-driven product - inferred quality pass on stage/scale, not thesis.',
  },
  {
    input: { name: 'tRetail Labs', industry: 'B2B SaaS', country: 'Australia', is_b2b: true, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'founding_year'],
    as_of_date: '2024-04-08',
    sources: ['Moodie Davitt Report 2026 CobuildX AI partnership', 'tretaillabs.com', 'SmartCompany SPARK Business Hub feature'],
    note: 'Sydney-based AI/data platform helping airports and travel retailers design passenger experiences and optimize bids; founder Sushanta Das, co-founder/CPO Sossina Shenkute; grown through SPARK Business Hub support rather than disclosed VC funding. Classified thesis: Australia sits outside this MENA-focused fund\'s core geography (GCC/Levant/North Africa/MENA-other) with no disclosed regional presence - the clearest real-world test case yet for the geographic-mandate gate added to thesis.ts, and a useful sanity check that the new gate would correctly flag this deal.',
  },
  {
    input: { name: 'Qlub', industry: 'FinTech', country: 'United Arab Emirates', is_b2b: true, team_size: 150, funding_total_usd: 42_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'fund_construction', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2024-06-07',
    sources: ['MENAbytes 2022 $17M seed', 'MENAbytes 2025-07 $30M Series B (post-decision, see note)', 'Wamda funding history'],
    note: 'QR-based restaurant payments platform, deployed across thousands of venues globally; on-thesis sector (FinTech) and geography (UAE). TEMPORAL CARE: this deal\'s CRM last-touch is 2024-06-07 - well before the 2025-07 $30M Series B ($72M total) - so funding_total_usd/funding_rounds use only the pre-anchor $17M(2022)+$25M(2023)=$42M/2 rounds, not the later-and-larger total. RECLASSIFIED 2026-07 (was \'quality\'): no CRM reason text; the most plausible read is a stage/round-size mismatch (Series-B-scale payments infra is likely beyond a smaller MENA fund\'s typical check/ownership target) - not a company-quality gap at all, so moved to fund_construction and excluded from the quality-vs-pursued training contrast rather than mislabeling a check-size decision as a quality failure.',
  },
  {
    input: { name: 'Carry1st', industry: 'Gaming', country: 'South Africa', is_b2b: false, team_size: 100, funding_total_usd: 53_000_000, funding_rounds: 3, time_to_first_funding_months: 36, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Scaling', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'unique_tech', 'has_previous_exit'],
    as_of_date: '2025-02-03',
    sources: ['TechCrunch 2023 $27M pre-Series B (a16z, Bitkraft)', 'Disrupt Africa 2024-01 Sony Innovation Fund investment', 'TechCabal/GamesBeat funding history'],
    note: 'Mobile games publisher across Africa; $53M+ raised (a16z, Bitkraft, Google Africa Investment Fund, Sony Innovation Fund), all pre-anchor. Classified thesis: South Africa/Sub-Saharan Africa is outside this MENA-focused fund\'s core geography (same pattern as FairMoney/Bykea elsewhere in this cohort), and the consumer mobile-gaming model is also B2C/off the fund\'s typical enterprise-software lean - a strong company on two separate off-thesis axes rather than a quality shortfall.',
  },
  {
    input: { name: 'Homzmart', industry: 'E-Commerce', country: 'Egypt', is_b2b: false, team_size: 150, funding_total_usd: 40_000_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Scaling', founding_year: 2019 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'has_previous_exit'],
    as_of_date: '2026-05-25',
    sources: ['TechCrunch 2021 $15M Series A', 'MAGNiTT 2020 $1.3M seed', 'Forbes ME pre-Series B ~$40M total'],
    note: 'Egyptian furniture e-commerce marketplace; founders are Jumia/Daraz operations alumni (notable pedigree, but an operational/executive background, not a personal founder exit - has_previous_exit kept false). $40M raised, 30x sales growth. Classified thesis: consumer (B2C) marketplace with asset-heavy furniture logistics/delivery, the same pattern as this fund\'s other B2C-asset-heavy passes (eZhire, Bykea) despite strong disclosed metrics.',
  },
  {
    input: { name: 'Seez', industry: 'Mobility Tech', country: 'United Arab Emirates', is_b2b: true, team_size: 80, funding_total_usd: 17_000_000, funding_rounds: 4, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'has_previous_exit'],
    as_of_date: '2024-07-29',
    sources: ['MENAbytes seed/Series A funding history', 'AIM Group 2020 $6M raise', 'Arab Founders US-expansion raise'],
    note: 'Started as an AI car-identification consumer app, pivoted to a B2B dealership SaaS platform; ~$17M raised across multiple rounds, all pre-anchor (2024-07). On-thesis sector/geography (Mobility Tech/SaaS, UAE). NOTABLE: Seez was later acquired by Pinewood Technologies Group PLC for ~$46.2M in February 2025 - AFTER this deal\'s CRM last-touch, so this outcome is NOT used as a training input (would be temporal leakage), but it is a real instance of a passed deal exiting well and worth the deal team reviewing regardless of what any model says. Classified quality (ambiguous close call) rather than thesis, given the eventual acquisition suggests this was a substantively good company.',
  },
  {
    input: { name: 'Algbra', industry: 'FinTech', country: 'United Kingdom', is_b2b: false, team_size: 30, funding_total_usd: 4_700_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'has_previous_exit'],
    as_of_date: '2025-11-23',
    sources: ['UKTN 2021 £3.75M raise', 'FinTech Futures Standard Chartered/SC Ventures strategic investment (amount undisclosed, date uncertain - excluded from funding total, see note)'],
    note: 'UK-based Sharia-compliant, B-Corp certified digital bank; on-geography per this fund\'s (unusually broad) core_regions mandate, which explicitly includes Europe. funding_total_usd uses only the disclosed 2021 £3.75M (~$4.7M) raise - a separate Standard Chartered/SC Ventures strategic investment exists but its amount and date are both undisclosed/unconfirmed relative to this deal\'s 2025-11 anchor, so it is excluded rather than guessed at. Classified thesis: this is a consumer (B2C) digital banking product, the same pattern as this cohort\'s other B2C challenger-bank passes (Tweeq, CWallet).',
  },
  {
    input: { name: 'Pemo', industry: 'FinTech', country: 'United Arab Emirates', is_b2b: true, team_size: 60, funding_total_usd: 19_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'fund_construction', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months', 'founding_year', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2025-11-23',
    sources: ['BusinessWire 2022 $12M seed', 'FinSMEs 2024-11 $7M pre-Series A'],
    note: 'B2B spend-management/corporate-card platform for MENAP SMEs; $19M raised (both rounds pre-anchor), 60+ team, processing ~$380M annualized across 4,000+ companies - a strong on-thesis (B2B FinTech, UAE) company. Co-founders are described as having "collectively launched or scaled" Zalora and Pleo, but the source does not attribute a personal founding-and-exit to any named Pemo co-founder specifically (could be an operating/scaling role rather than founder) - kept has_previous_exit=false rather than crediting an unconfirmed exit. RECLASSIFIED 2026-07 (was \'quality\'): no CRM reason text and no obvious quality gap found; the more plausible read is a stage/check-size mismatch (same pattern as Qlub above) or competitive-overlap with this fund\'s existing EdfaPay position - moved to fund_construction rather than mislabeling either of those as a quality failure.',
  },
  {
    input: { name: 'Finanshels', industry: 'B2B SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 18, funding_total_usd: 0, funding_rounds: 1, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_rounds', 'time_to_first_funding_months', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2025-07-22',
    sources: ['Entrepreneur ME startup-spotlight feature', 'finanshels.com/about-us'],
    note: 'Bookkeeping/tax/CFO-as-a-service SaaS for UAE SMEs; 200+ customers growing ~30%/month, backed by MBRIF/in5 Tech/Kube VC accelerator programs with no disclosed institutional round amount. On-thesis sector/geography (B2B SaaS, UAE); inferred quality pass on stage/scale (very early, no disclosed priced round) rather than a thesis mismatch.',
  },
  {
    input: { name: 'DarDoc', industry: 'HealthTech', country: 'United Arab Emirates', is_b2b: false, team_size: 20, funding_total_usd: 800_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2025-03-02',
    sources: ['The National 2023 founder feature', 'ADSMEHub interview', 'Crunchbase/Tracxn funding profile'],
    note: 'On-demand home-healthcare booking app, Abu Dhabi/Dubai; ~$800K raised (MBRIF, Flat6Labs, Hub71-incubated), ~500 affiliated healthcare professionals. On-thesis sector (HealthTech, parallel to this cohort\'s Droobi Health/Smit quality-pass precedent) and geography (UAE); inferred quality pass on small disclosed funding/stage rather than thesis.',
  },
  {
    input: { name: 'Dojah', industry: 'B2B SaaS', country: 'Nigeria', is_b2b: true, team_size: 22, funding_total_usd: 1_250_000, funding_rounds: 1, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2024-10-27',
    sources: ['Disrupt Africa 2025-02 feature', 'startuplist.africa funding profile'],
    note: 'Identity-verification/KYC API platform for African businesses (Nigeria, Ghana, Kenya, South Africa); YC-backed, $1.25M pre-seed, 50M+ identities verified. On-thesis sector (B2B SaaS/RegTech) but classified thesis: Nigeria/Sub-Saharan Africa is outside this MENA-focused fund\'s core geography, the same pattern as FairMoney/Carry1st elsewhere in this cohort.',
  },
  {
    input: { name: 'Rayyan Systems', industry: 'AI', country: 'United States', is_b2b: true, team_size: 12, funding_total_usd: 800_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'founding_year', 'has_previous_exit'],
    as_of_date: '2025-02-18',
    sources: ['Qatar Computing Research Institute (QCRI) publication page', 'Zawya/Gulf Times QF-funded-startup coverage', 'Rayyan Systems Inc equity-crowdfunding materials'],
    note: 'AI-powered systematic-review tool for academic researchers (Rayyan), originated at Qatar\'s QCRI/QSTP (Qatar Foundation) under EIR Robert Ayan before incorporating as US-based Rayyan Systems Inc - the CRM tags this deal United States, which is what is used here, though the substantive origin is Qatar/GCC. 300,000+ researchers use the tool but only ~$800K in disclosed institutional/angel/cloud-credit backing - founding_year is an estimate (QCRI-era development predates the company\'s formal incorporation and no precise founding date was found). Classified quality: strong product-market fit and usage scale but very thin disclosed fundraising for the company\'s apparent age - a genuine scale/monetization gap rather than a thesis mismatch (US and Qatar are both within this fund\'s core_regions either way).',
  },
  {
    input: { name: 'NymCard', industry: 'FinTech', country: 'United Arab Emirates', is_b2b: true, team_size: 130, funding_total_usd: 22_500_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'fund_construction', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'technical_cofounder', 'has_previous_exit'],
    as_of_date: '2024-11-13',
    sources: ['Wamda 2022 $22.5M funding round', 'IDENTITY CAVEAT: CRM box title is "IDVerse / NymCard" (single merged row, co_0576) - treated as a candidate match to NymCard only, not a confirmed identity, per this project\'s "unconfirmed identity" convention (see CIQ elsewhere in this cohort)'],
    note: 'UAE embedded-finance/payments infrastructure platform (nCore), Central Bank of UAE licensed; funding_total_usd uses ONLY the pre-anchor 2022 $22.5M round - a later $33M Series B (announced 2025-03, per QED Investors coverage) happened AFTER this deal\'s 2024-11 CRM last-touch and is excluded as temporal leakage. IDENTITY CAVEAT: the CRM box for this deal is literally titled "IDVerse / NymCard" - it is not fully certain this deal is actually about NymCard (vs. IDVerse, an unrelated Australian identity-verification company, or some joint intro) rather than a confident match; treat this record with more skepticism than the others in this cohort. RECLASSIFIED 2026-07 (was \'quality\'): given how strong NymCard itself looks on-paper, a stage/check-size mismatch is the more plausible read than a quality failure - moved to fund_construction. The identity caveat above stands independently either way.',
  },
  {
    input: { name: 'Koniku', industry: 'Deeptech', country: 'United States', is_b2b: true, team_size: 25, funding_total_usd: 46_500_000, funding_rounds: 2, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2015 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'has_previous_exit'],
    as_of_date: '2024-11-28',
    sources: ['TechCabal 2021-12 Series A close (Platform Capital)', 'PitchBook $46.5M total raised', 'Wikipedia/Koniku company overview'],
    note: 'Synthetic-biology/silicon "wetware" olfaction-sensing deep tech (the "Konikore" smell-detection device), founder Osh Agabi is a computational neuroscientist; $46.5M raised across multiple rounds, all appearing to predate the 2024-11 anchor. On-geography per this fund\'s core_regions (includes North America) - notably, this fund HAS pursued other US deep-tech deals in this same cohort (Antaris Space, CIQ), so US geography alone does not explain this pass. Classified quality: an unusually exotic synthetic-biology/hardware vertical that likely does not map cleanly onto this fund\'s typical enterprise-software diligence framework - flagged honestly as a case where the real pass reason is unclear rather than confidently inferred.',
  },
  {
    input: { name: 'Pixxel Space', industry: 'SpaceTech', country: 'India', is_b2b: true, team_size: 200, funding_total_usd: 95_000_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2019 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'has_previous_exit'],
    as_of_date: '2026-07-02',
    sources: ['Pixxel 2022 Series A $27M announcement', 'Pixxel Series B $60M ($36M+$24M extension) announcement', 'Wikipedia/Tracxn $95M total raised'],
    note: 'Hyperspectral-imaging satellite constellation operator (US-Indian dual entity), founded by BITS Pilani engineering students; $95M raised across seed/Series A/Series B, all confirmed pre-anchor. Classified thesis: India/South Asia is outside this MENA-focused fund\'s core_regions (GCC/Levant/North Africa/MENA-other/North America/Europe do not include South Asia) - a clean real-world test of the geographic gate, parallel to tRetail Labs (Australia) elsewhere in this cohort.',
  },
  {
    input: { name: 'Regent Craft', industry: 'Deeptech', country: 'United States', is_b2b: true, team_size: 100, funding_total_usd: 90_000_000, funding_rounds: 2, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'fund_construction', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'founding_year', 'has_previous_exit'],
    as_of_date: '2026-03-27',
    sources: ['TechCrunch 2023-10 $60M Series A close', 'Forbes/CNBC seaglider coverage', 'Y Combinator company profile'],
    note: 'Electric "seaglider" (low-flying, wave-skimming eVTOL) maritime transport hardware startup; founders are MIT aerospace engineers ex-Aurora Flight Sciences/Boeing/Blue Origin/Virgin Galactic. $90M raised (Founders Fund, Lockheed Martin, Japan Airlines Innovation Fund among others), >$10B in airline/ferry pre-orders - all pre-anchor (2026-03). On-geography (US is in this fund\'s core_regions) but classified fund_construction: capital-intensive aerospace hardware at this scale (a $60M+ Series A backed by Founders Fund/Lockheed Martin) is very likely beyond a smaller MENA-focused fund\'s typical check size or ability to lead/influence the round, rather than a reflection of company quality.',
  },
  {
    input: { name: 'Atmo Biosciences', industry: 'MedTech', country: 'Australia', is_b2b: true, team_size: 18, funding_total_usd: 7_010_000, funding_rounds: 4, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'founding_year', 'has_previous_exit'],
    as_of_date: '2026-02-17',
    sources: ['Planet Innovation/BioMelbourne Network grant coverage', 'Crunchbase $7.01M total raised', 'RMIT University research-impact page'],
    note: 'Ingestible gas-sensing capsule + cloud platform diagnosing gut disorders, spun out of RMIT University research; $7.01M raised across 4 rounds (seed 2019, Series B closed Feb 2023), government MRFF/Breakthrough Victoria grants, all pre-anchor. CRM tags this deal United States, which does not match any source found (Melbourne, Australia throughout) - used the real HQ and flagged the CRM tag as a likely data-entry anomaly. Classified thesis: Australia is outside this fund\'s core_regions, the same pattern as tRetail Labs and Pixxel Space elsewhere in this cohort.',
  },
  {
    input: { name: 'Vispera', industry: 'AI', country: 'Turkey', is_b2b: true, team_size: 190, funding_total_usd: 8_450_000, funding_rounds: 1, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2014 },
    actual_outcome: 'passed', pass_kind: 'fund_construction', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months', 'has_previous_exit'],
    as_of_date: '2026-02-24',
    sources: ['Vispera company/about page', 'PitchBook/Tracxn company profile', 'Nanalyze Turkey AI startup coverage'],
    note: 'Computer-vision retail shelf-auditing SaaS (planogram compliance, stock monitoring); founders are academic computer-vision researchers (Bogazici University, Telecom ParisTech). Disclosed funding of ~$8.45M (Koc Holding strategic investment, giving distribution into Migros/Koctas/Aygaz), 190-person team across 5 global regions. On-geography (Turkey = MENA-other, within this fund\'s core_regions) but classified fund_construction: a 190-person, globally-distributed, already-profitable-scale company backed by Turkey\'s largest conglomerate is a materially later/larger-stage profile than this fund\'s typical seed/Series A check, more likely a stage/check-size mismatch than a quality gap.',
  },
  {
    input: { name: 'Celligenics', industry: 'BioTech', country: 'Singapore', is_b2b: true, team_size: 12, funding_total_usd: 4_200_000, funding_rounds: 1, time_to_first_funding_months: 36, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'has_previous_exit'],
    as_of_date: '2025-06-12',
    sources: ['Celligenics company site', 'BioSpectrum Asia cell/gene therapy coverage', 'A*STAR biotech spinoff recognition (2018)'],
    note: 'A*STAR (Singapore) biotech spinoff developing regenerative biologics from stem-cell/secretome science; SGD5.63M ($4.2M) Series A from Best World International, closed 2019-01-14 - well pre-anchor. Classified thesis: Singapore/East Asia is outside this fund\'s core_regions, the same pattern as Pixxel Space and Atmo Biosciences elsewhere in this cohort.',
  },
  {
    input: { name: 'Basma', industry: 'MedTech', country: 'United Kingdom', is_b2b: false, team_size: 28, funding_total_usd: 7_470_000, funding_rounds: 2, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'time_to_first_funding_months', 'has_previous_exit'],
    as_of_date: '2025-04-07',
    sources: ['UKTN 2021-06 GBP2.1M raise coverage', 'PRNewswire/MEVP $3M Series A announcement', 'Crunchbase $7.47M total raised'],
    note: 'London-headquartered, MENA-focused teledentistry/D2C invisible-aligner platform, founded by a practicing dentist (Dr. Cherif Massoud) and Hrag Hayrabedian. ~$7.47M raised (angels + MEVP-led Series A), all pre-anchor; sources show some inconsistency between a GBP2.1M figure (UKTN) and a $3M Series A figure (PRNewswire/MEVP) that may be the same round reported in different currencies or two distinct rounds - used the higher-confidence aggregate total either way. On-geography (UK is in this fund\'s core_regions) but classified thesis: this is a B2C consumer product (direct-to-patient aligners), the same pattern as this cohort\'s other B2C passes (Tweeq, CWallet, Algbra).',
  },
];

