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
export type PassKind = 'thesis' | 'quality' | 'mixed' | 'n/a';

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
];

