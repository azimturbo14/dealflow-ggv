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
}

// funding_rounds inferred from the last announced stage; time_to_first_funding
// left at a neutral value where unknown (it barely moves the score).
export const MENA_COHORT: CohortRecord[] = [
  // ---------------- PURSUED (the 13 positives) ----------------
  {
    input: { name: 'Invisible Technologies', industry: 'AI', country: 'United States', is_b2b: true, team_size: 350, funding_total_usd: 144_000_000, funding_rounds: 4, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 134_000_000, unique_tech: true, technical_cofounder: true, stage: 'Scaling', revenue_growth_pct: 8, founding_year: 2015 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['revenue_growth_pct'],
    sources: ['businesswire 2025 $100M raise', 'getlatka $134M ARR 2024'], note: 'AI infra, $134M ARR, Inc 5000 #2 fastest-growing AI.',
  },
  {
    input: { name: 'Lucidya', industry: 'AI', country: 'Saudi Arabia', is_b2b: true, team_size: 200, funding_total_usd: 37_100_000, funding_rounds: 4, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2016 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['Wamda 2025 $30M Series B', 'Wikipedia/Tracxn'], note: 'Arabic-language AI, largest MENA AI round.',
  },
  {
    input: { name: 'Invygo', industry: 'Mobility Tech', country: 'United Arab Emirates', is_b2b: false, team_size: 80, funding_total_usd: 22_200_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['TechCrunch 2022 $10M Series A', 'Tracxn $22.2M total'], note: 'Car subscription; B2C but pursued to IC.',
  },
  {
    input: { name: 'Emma Systems', industry: 'AI', country: 'Qatar', is_b2b: true, team_size: 30, funding_total_usd: 2_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['Wamda 2025 seed +VC', 'QSTP/QDB backed'], note: 'Aviation-ops AI (not construction); deal size $2M from CRM.',
  },
  {
    input: { name: 'CIQ', industry: 'B2B SaaS', country: 'United States', is_b2b: true, team_size: 100, funding_total_usd: 30_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: true, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2020 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['VentureBeat 2022 $26M Series A', 'ciq.com'], note: 'Rocky Linux / HPC infra; founder = CentOS creator (prior track record).',
  },
  {
    input: { name: 'Antaris Space', industry: 'SpaceTech', country: 'United States', is_b2b: true, team_size: 60, funding_total_usd: 42_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2021 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['SpaceNews $28M Series A', 'Lockheed Martin Ventures'], note: 'Satellite mission software; deep tech.',
  },
  {
    input: { name: 'EdfaPay', industry: 'FinTech', country: 'Saudi Arabia', is_b2b: true, team_size: 30, funding_total_usd: 9_800_000, funding_rounds: 3, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 500_000, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'sales_amount_usd'],
    sources: ['Forbes ME 2024 $5M pre-Series A', 'Tracxn $9.8M total'], note: 'SoftPOS; traction in Morocco/Tunisia.',
  },
  {
    input: { name: 'Tarjama', industry: 'AI', country: 'Jordan', is_b2b: true, team_size: 300, funding_total_usd: 20_000_000, funding_rounds: 2, time_to_first_funding_months: 20, has_previous_exit: false, sales_amount_usd: 8_000_000, unique_tech: true, technical_cofounder: true, stage: 'Scaling', founding_year: 2008 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['sales_amount_usd'],
    sources: ['Slator 2025 $15M Series A', 'tarjama.com 700+ clients'], note: 'Arabic language tech; 300+ team, 700+ clients (revenue est. from scale).',
  },
  {
    input: { name: 'Byanat', industry: 'B2B SaaS', country: 'Oman', is_b2b: true, team_size: 30, funding_total_usd: 4_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['Wamda 2023 seed', 'Golden Gate/QDB pre-Series A 2025'], note: 'IoT/data analytics SaaS; ~$2.45M committed at IC per CRM notes.',
  },
  {
    input: { name: 'Swypex', industry: 'FinTech', country: 'Egypt', is_b2b: true, team_size: 30, funding_total_usd: 4_000_000, funding_rounds: 1, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['TechCrunch 2024 $4M seed (Accel)'], note: 'B2B corporate cards / spend management.',
  },
  {
    input: { name: 'Nybl', industry: 'AI', country: 'Saudi Arabia', is_b2b: true, team_size: 32, funding_total_usd: 31_000_000, funding_rounds: 3, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: [],
    sources: ['PitchBook $31M', 'ArabNews'], note: 'Industrial/oil-and-gas AI.',
  },
  {
    input: { name: 'BioSapien', industry: 'BioTech', country: 'United States', is_b2b: true, team_size: 20, funding_total_usd: 8_000_000, funding_rounds: 2, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2018 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['Wamda 2025 $8M pre-Series A', 'Global Ventures'], note: '3D-printed drug delivery (MediChip); deep tech, pre-revenue.',
  },
  {
    input: { name: 'XScape Photonics', industry: 'DeepTech', country: 'United States', is_b2b: true, team_size: 60, funding_total_usd: 95_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'pursued', pass_kind: 'n/a', est_fields: ['team_size'],
    sources: ['BusinessWire 2026 $37M (total Series A $81M)', 'NVIDIA-backed'], note: 'Optical interconnects for AI data centers; Columbia spinout.',
  },

  // ---------------- PASSED — quality-driven (the rubric CAN predict these) ----------------
  {
    input: { name: 'Patron', industry: 'BNPL', country: 'Egypt', is_b2b: false, team_size: 15, funding_total_usd: 3_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['Crunchbase seed'], note: 'Client reason: no defensible model, too small, no growth.',
  },
  {
    input: { name: 'QX Lab AI', industry: 'AI', country: 'United Arab Emirates', is_b2b: true, team_size: 20, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size'],
    sources: ['Tracxn: no funding, deadpooled'], note: 'Client reason: too early / track. Later deadpooled — model should not pursue.',
  },
  {
    input: { name: 'Bon Plus', industry: 'B2B SaaS', country: 'Oman', is_b2b: true, team_size: 12, funding_total_usd: 500_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['Wamda 2024 undisclosed seed'], note: 'Client reason: too early.',
  },
  {
    input: { name: 'Batal Gaming', industry: 'Gaming', country: 'United Arab Emirates', is_b2b: false, team_size: 15, funding_total_usd: 1_000_000, funding_rounds: 1, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['PitchBook: Plus VC seed'], note: 'Client reason: no moat vs bigger players.',
  },
  {
    input: { name: 'Fero.ai', industry: 'Logistics SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 25, funding_total_usd: 2_670_000, funding_rounds: 2, time_to_first_funding_months: 16, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2018 },
    actual_outcome: 'passed', pass_kind: 'mixed', est_fields: ['team_size'],
    sources: ['Crunchbase $2.67M'], note: 'Client reason: vertical pass + growth-potential concern.',
  },
  {
    input: { name: 'Droplinked', industry: 'Blockchain', country: 'United Arab Emirates', is_b2b: false, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', est_fields: ['team_size'],
    sources: ['Tracxn/Hub71 accelerator'], note: 'Client reason: web3 consumer needs more validation.',
  },

  // ---------------- PASSED — thesis-driven (needs the thesis layer, not quality) ----------------
  {
    input: { name: 'Beije', industry: 'B2C Femcare', country: 'Turkey', is_b2b: false, team_size: 30, funding_total_usd: 1_000_000, funding_rounds: 1, time_to_first_funding_months: 18, has_previous_exit: false, sales_amount_usd: 2_760_000, unique_tech: false, technical_cofounder: false, stage: 'Growth', revenue_growth_pct: 10, founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['CRM notes: $230K MRR, 55k subs, EBITDA+', 'Crunchbase (GFC seed)'], note: 'Strong B2C metrics; passed purely on "not investing in B2C".',
  },
  {
    input: { name: 'eZhire', industry: 'Mobility Tech', country: 'United Arab Emirates', is_b2b: false, team_size: 60, funding_total_usd: 3_000_000, funding_rounds: 2, time_to_first_funding_months: 14, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', revenue_growth_pct: 8, founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
    sources: ['MENAbytes seed (Jabbar)', 'Zawya 102% growth'], note: 'Largest B2C car rental; passed on "focusing on b2b deep tech".',
  },
  {
    input: { name: 'Podeo', industry: 'AdTech', country: 'United Arab Emirates', is_b2b: false, team_size: 30, funding_total_usd: 5_400_000, funding_rounds: 2, time_to_first_funding_months: 16, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    sources: ['TechCrunch 2024 $5.4M Series A'], note: 'Podcast platform; passed on "no interest in podcast businesses".',
  },
  {
    input: { name: 'AlGooru', industry: 'EdTech', country: 'Saudi Arabia', is_b2b: false, team_size: 30, funding_total_usd: 5_800_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2021 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    sources: ['Wamda 2024 $4M pre-Series A', 'ArabNews $1.8M seed'], note: 'Tutoring marketplace; passed on EdTech-sector thesis.',
  },
  {
    input: { name: 'Poltio', industry: 'Retail Tech', country: 'Turkey', is_b2b: true, team_size: 15, funding_total_usd: 296_000, funding_rounds: 4, time_to_first_funding_months: 20, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2014 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size'],
    sources: ['Tracxn $296K total'], note: 'Interactive content; passed on "less keen on retail sector".',
  },
  {
    input: { name: 'Cari', industry: 'FoodTech', country: 'United Arab Emirates', is_b2b: false, team_size: 40, funding_total_usd: 3_000_000, funding_rounds: 2, time_to_first_funding_months: 12, has_previous_exit: true, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Growth', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'thesis', est_fields: ['team_size', 'funding_total_usd'],
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
    sources: ['Wamda 2023 $3.7M seed', 'The National founder profile (30yr F&B veteran co-founder)'],
    note: 'B2B F&B order-taking SaaS; on-thesis sector (B2B SaaS) but no stated technical moat found - inferred quality pass, not a thesis mismatch. One aggregator reports $4.8M total vs $3.7M in press; used the press figure.',
  },
  {
    input: { name: 'Tweeq', industry: 'FinTech', country: 'Saudi Arabia', is_b2b: false, team_size: 15, funding_total_usd: 533_000, funding_rounds: 2, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    sources: ['MenaBytes 2021 seven-figure round (STV/Raed)', 'CBInsights people/funding'],
    note: 'Consumer spending-account app; on-thesis sector (FinTech) but B2C and a small disclosed raise ($533K/2 rounds) - inferred quality pass on scale/stage. NOTABLE: Tweeq was acquired by Tabby in Sept 2024, i.e. after this fund passed - a real instance of a passed deal later exiting, worth the fund reviewing regardless of what the model says.',
  },
  {
    input: { name: 'CWallet', industry: 'Digital Bank', country: 'Qatar', is_b2b: false, team_size: 10, funding_total_usd: 1_095_000, funding_rounds: 2, time_to_first_funding_months: 6, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'MVP', founding_year: 2019 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder'],
    sources: ['Qatar Tribune 2021 $220K pre-seed (MBK Holding)', 'Wamda 2022 $875K pre-Series A'],
    note: 'Digital wallet/remittance for the unbanked; on-thesis sector (FinTech) but very small disclosed raises ($220K + $875K) - inferred quality pass on scale/stage, not thesis.',
  },
  {
    input: { name: 'FairMoney', industry: 'FinTech', country: 'Nigeria', is_b2b: false, team_size: 600, funding_total_usd: 57_000_000, funding_rounds: 4, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Scaling', founding_year: 2017 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['time_to_first_funding_months'],
    sources: ['FintechFutures 2019 $42M Series B (Tiger Global, DST Global)', 'Tracxn/LinkedIn team size'],
    note: 'A large, well-funded ($57-90M depending on source), well-staffed (600-1200+ per different counts) Nigerian digital bank - objectively strong on Team/Traction/Financing. Classified thesis, not quality: Nigeria/Sub-Saharan Africa is outside this MENA-focused fund\'s core geography, which markets.ts and thesis.ts do not currently encode as a gate. Flagging this as a genuine gap: the thesis-fit layer checks sector/B2C/moat but has no geographic-mandate check, so a strong off-geography deal like this would currently score as a good quality fit with no thesis penalty at all.',
  },
  {
    input: { name: 'Bykea', industry: 'Mobility Tech', country: 'Pakistan', is_b2b: false, team_size: 175, funding_total_usd: 18_700_000, funding_rounds: 2, time_to_first_funding_months: 36, has_previous_exit: true, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Scaling', founding_year: 2016 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    sources: ['TechCrunch 2020 $13M Series B (Prosus Ventures)', 'MenaBytes 2019 $5.7M Series A'],
    note: 'Pakistan\'s largest motorbike ride-hailing/logistics platform; founder co-founded Daraz (acquired by Alibaba) = has_previous_exit. Classified thesis (parallel to eZhire, already in this cohort as a thesis-passed B2C mobility deal): consumer, asset-heavy B2C mobility model, same pattern the fund has explicitly deprioritized elsewhere.',
  },
  {
    input: { name: 'Kingpin', industry: 'B2B SaaS', country: 'United Arab Emirates', is_b2b: true, team_size: 20, funding_total_usd: 3_500_000, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'Launched', founding_year: 2024 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year'],
    sources: ['Wamda 2025 $3.5M seed (Infinity Ventures, Red Swan, Mu Ventures, COTU, Outliers, Hub71)', 'Entrepreneur ME coverage'],
    note: 'AI-native B2B distribution platform for brands/distributors; on-thesis (B2B SaaS/AI), named seed investors, 300+ customers claimed. Inferred quality pass likely on stage/recency (seed closed Nov 2025) rather than thesis mismatch - a reasonable case to double-check with the deal team given how on-thesis it otherwise looks.',
  },
  {
    input: { name: 'UBQT', industry: 'Social/Platform Software', country: 'United Arab Emirates', is_b2b: false, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: true, stage: 'Launched', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'funding_total_usd', 'founding_year'],
    sources: ['TahawulTech founder interview', 'Meridio co-founder Q&A'],
    note: 'Consumer social app (deliberately no feed/likes); strong founder pedigree (CTO ex-Meta/Lyft/Careem, CEO ex-corporate-insurance & a unicorn IPO). Classified thesis: B2C consumer social, same pattern as this fund\'s other thesis-capped consumer deals (Podeo, Cari).',
  },
  {
    input: { name: 'The F* Word', industry: 'Fashion AI', country: 'United States', is_b2b: true, team_size: 8, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: true, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2023 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size'],
    sources: ['thefword.ai about-us page', 'Tracxn (unfunded, Fremont CA)'],
    note: 'Agentic AI workflow tool for fashion brands; founders claim 2 prior exits. CRM tagged this deal "Dubai" but public sources place it in Fremont, CA with no disclosed funding - inferred quality pass on stage/unclear traction; the CRM country tag itself may be wrong and is worth a data-quality check.',
  },
  {
    input: { name: 'My Pet World', industry: 'Pet Tech', country: 'Qatar', is_b2b: false, team_size: 6, funding_total_usd: 0, funding_rounds: 1, time_to_first_funding_months: 12, has_previous_exit: false, sales_amount_usd: 0, unique_tech: false, technical_cofounder: false, stage: 'Launched', founding_year: 2022 },
    actual_outcome: 'passed', pass_kind: 'thesis', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year', 'funding_total_usd'],
    sources: ['The Peninsula Qatar 2023 DIC-incubated launch', 'Doha News founder feature'],
    note: 'QDB/DIC-incubated pet-owner marketplace app, ~6,000 users. Classified thesis: niche B2C consumer vertical outside the fund\'s preferred sectors, same pattern as other consumer-niche passes in this cohort.',
  },
  {
    input: { name: 'PIPRA', industry: 'MedTech', country: 'Switzerland', is_b2b: true, team_size: 10, funding_total_usd: 0, funding_rounds: 0, time_to_first_funding_months: 0, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: true, stage: 'MVP', founding_year: 2020 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'founding_year', 'funding_total_usd', 'funding_rounds', 'stage'],
    sources: ['Swiss Biotech Association directory listing (address/registration only)'],
    note: 'Almost no public information was found beyond a registry listing - no funding, team, or product detail. Included anyway (rather than dropped) because it IS a real, resolved Passed decision, but nearly every field is estimated; treat this record\'s contribution to the fit with more skepticism than the others, and flag for direct follow-up with the deal team rather than trusting this record\'s inputs.',
  },
  {
    input: { name: 'Droobi Smit', industry: 'Healthtech', country: 'Qatar', is_b2b: true, team_size: 15, funding_total_usd: 5_000_000, funding_rounds: 2, time_to_first_funding_months: 24, has_previous_exit: false, sales_amount_usd: 0, unique_tech: true, technical_cofounder: false, stage: 'Growth', founding_year: 2017 },
    actual_outcome: 'passed', pass_kind: 'quality', reason_basis: 'inferred_from_thesis_rubric',
    est_fields: ['team_size', 'technical_cofounder'],
    sources: ['Wamda 2024 Droobi Health x Smit.fit merger', 'Zawya merger coverage'],
    note: 'Chronic-disease digital health platform; on-thesis sector (HealthTech), ~$5M backing (QSTP/QDB/Barzan/Doha Tech Angels/MVP), Stanford/MIT + ex-McKinsey-Partner founders - one of the stronger-pedigree passes in this batch. Later merged with India\'s Smit.fit and rebranded Lillia. Inferred quality pass, but this is a closer call than the others here and worth the deal team double-checking.',
  },
];
