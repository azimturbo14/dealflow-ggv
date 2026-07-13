// Adaptive market + macro engine.
//
// The original app hard-coded a single market (Uzbekistan / IT-Park Ventures).
// This module makes the reasoning adapt to whatever COUNTRY × SECTOR a deal
// arrives with, so a Saudi FinTech, a Jordanian AI startup and a US BioTech each
// get their own macro backdrop and market sizing.
//
// HONESTY CONTRACT
//   - Every figure below is a curated, order-of-magnitude reference drawn from
//     public 2024-2025 macro data (IMF/World Bank growth & inflation, central-bank
//     policy rates, sector TAM estimates). They are reference assumptions, not live
//     data — the app has no backend.
//   - When a country or sector is unknown, the resolver DOES NOT invent a number.
//     It falls back to a regional or global default and records that assumption in
//     `assumptions[]` with a `confidence` flag, so the UI can show the user exactly
//     what was assumed instead of pretending certainty.

export type Region =
  | 'GCC' | 'Levant' | 'North Africa' | 'MENA-other'
  | 'Europe' | 'North America' | 'South Asia' | 'East Asia'
  | 'Sub-Saharan Africa' | 'Other';

export type Band = 'Low' | 'Medium' | 'High';
export type Comp = 'Low' | 'Moderate' | 'High';
export type Confidence = 'exact' | 'regional' | 'global';

export interface CountryProfile {
  name: string;
  region: Region;
  gdp_growth: number;      // % real GDP growth (annual)
  inflation: number;       // % CPI
  policy_rate: number;     // % central-bank policy / benchmark rate — the cost-of-capital anchor
  currency: string;        // ISO-ish label
  fx_note: string;         // peg / float / depreciation context
  fx_risk: Band;
  fdi_trend: string;       // short human-readable FDI direction
  regulatory_ease: Band;   // ease of building/selling (High = easy)
  capital_availability: Band; // depth of local follow-on / VC capital (forward funding risk)
  market_weight: number;   // 0-1 scalar: relative share of a global sector market reachable from here
  ecosystem: string;       // one-line startup-ecosystem context
}

// ---- Country reference table (markets that actually appear in MENA deal flow) ----
const COUNTRIES: Record<string, CountryProfile> = {
  'Saudi Arabia': { name: 'Saudi Arabia', region: 'GCC', gdp_growth: 3.5, inflation: 1.9, policy_rate: 5.5, currency: 'SAR', fx_note: 'SAR pegged to USD (3.75) — no devaluation risk', fx_risk: 'Low', fdi_trend: 'FDI rising sharply on Vision 2030 & PIF deployment', regulatory_ease: 'Medium', capital_availability: 'High', market_weight: 0.06, ecosystem: 'Largest GCC market; PIF/Sanabil anchor a deep local VC base.' },
  'United Arab Emirates': { name: 'United Arab Emirates', region: 'GCC', gdp_growth: 4.0, inflation: 2.3, policy_rate: 5.4, currency: 'AED', fx_note: 'AED pegged to USD (3.6725) — stable', fx_risk: 'Low', fdi_trend: '#1 FDI destination in MENA; record inflows', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.05, ecosystem: 'DIFC/ADGM hubs; most active regional VC and HQ base.' },
  'Qatar': { name: 'Qatar', region: 'GCC', gdp_growth: 2.0, inflation: 1.5, policy_rate: 5.5, currency: 'QAR', fx_note: 'QAR pegged to USD (3.64) — stable', fx_risk: 'Low', fdi_trend: 'QIA-led diversification; moderate FDI', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.015, ecosystem: 'Small but wealthy; QDB/QIA support, limited local deal flow.' },
  'Oman': { name: 'Oman', region: 'GCC', gdp_growth: 1.5, inflation: 1.0, policy_rate: 5.5, currency: 'OMR', fx_note: 'OMR pegged to USD (0.385) — stable', fx_risk: 'Low', fdi_trend: 'Steady, energy-led; small VC scene', regulatory_ease: 'Medium', capital_availability: 'Low', market_weight: 0.006, ecosystem: 'Small market; thin local capital, often raises from GCC neighbours.' },
  'Bahrain': { name: 'Bahrain', region: 'GCC', gdp_growth: 3.0, inflation: 1.0, policy_rate: 5.5, currency: 'BHD', fx_note: 'BHD pegged to USD (0.376) — stable', fx_risk: 'Low', fdi_trend: 'Fintech-friendly; modest FDI', regulatory_ease: 'High', capital_availability: 'Low', market_weight: 0.004, ecosystem: 'Regulatory sandbox pioneer; tiny domestic market.' },
  'Kuwait': { name: 'Kuwait', region: 'GCC', gdp_growth: 2.5, inflation: 3.0, policy_rate: 4.25, currency: 'KWD', fx_note: 'KWD pegged to a currency basket — stable', fx_risk: 'Low', fdi_trend: 'Oil-heavy; slow diversification', regulatory_ease: 'Low', capital_availability: 'Low', market_weight: 0.008, ecosystem: 'Wealthy consumers but slow regulatory reform.' },
  'Jordan': { name: 'Jordan', region: 'Levant', gdp_growth: 2.5, inflation: 2.0, policy_rate: 7.5, currency: 'JOD', fx_note: 'JOD pegged to USD (0.709) — stable but high carry', fx_risk: 'Low', fdi_trend: 'Modest; donor & diaspora linked', regulatory_ease: 'Medium', capital_availability: 'Low', market_weight: 0.008, ecosystem: 'Strong engineering talent (Amman); startups scale out to GCC for capital.' },
  'Egypt': { name: 'Egypt', region: 'North Africa', gdp_growth: 3.5, inflation: 28.0, policy_rate: 27.25, currency: 'EGP', fx_note: 'EGP floated Mar-2024, devalued ~60% — high FX risk', fx_risk: 'High', fdi_trend: 'Large but volatile; Ras El-Hekma boost', regulatory_ease: 'Low', capital_availability: 'Medium', market_weight: 0.03, ecosystem: 'Largest MENA population; big TAM but severe macro/FX headwinds.' },
  'Morocco': { name: 'Morocco', region: 'North Africa', gdp_growth: 3.2, inflation: 2.2, policy_rate: 2.75, currency: 'MAD', fx_note: 'MAD managed float vs basket — moderate stability', fx_risk: 'Medium', fdi_trend: 'Rising; auto & offshoring led', regulatory_ease: 'Medium', capital_availability: 'Low', market_weight: 0.01, ecosystem: 'Francophone gateway; nascent VC scene.' },
  'Turkey': { name: 'Turkey', region: 'MENA-other', gdp_growth: 3.5, inflation: 55.0, policy_rate: 50.0, currency: 'TRY', fx_note: 'TRY heavily depreciated; orthodox tightening since 2023 — high FX risk', fx_risk: 'High', fdi_trend: 'Volatile; strong tech talent draws selective FDI', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.05, ecosystem: 'Large market & proven exits (Peak, Getir), but extreme macro volatility.' },
  'Uzbekistan': { name: 'Uzbekistan', region: 'MENA-other', gdp_growth: 6.0, inflation: 9.0, policy_rate: 14.0, currency: 'UZS', fx_note: 'UZS managed float, gradual depreciation — moderate FX risk', fx_risk: 'Medium', fdi_trend: 'Reform-driven FDI growth (privatization & IT-Park incentives)', regulatory_ease: 'Medium', capital_availability: 'Low', market_weight: 0.004, ecosystem: 'Fast-growing IT-Park / startup scene; thin local VC, raises from GCC & abroad.' },
  'Israel': { name: 'Israel', region: 'MENA-other', gdp_growth: 2.0, inflation: 3.0, policy_rate: 4.5, currency: 'ILS', fx_note: 'ILS floating; conflict-driven volatility', fx_risk: 'Medium', fdi_trend: 'Deep-tech magnet; conflict-sensitive', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.03, ecosystem: 'World-class deep-tech density; abundant risk capital.' },
  'United States': { name: 'United States', region: 'North America', gdp_growth: 2.5, inflation: 3.0, policy_rate: 4.75, currency: 'USD', fx_note: 'USD — reserve currency, no FX risk', fx_risk: 'Low', fdi_trend: 'Deepest capital market globally', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.35, ecosystem: 'Deepest venture market; best follow-on and exit optionality.' },
  'United Kingdom': { name: 'United Kingdom', region: 'Europe', gdp_growth: 1.1, inflation: 2.5, policy_rate: 4.75, currency: 'GBP', fx_note: 'GBP floating — moderate', fx_risk: 'Low', fdi_trend: 'Mature; London a top-3 global hub', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.08, ecosystem: 'Europe’s largest venture hub; strong fintech depth.' },
  'Germany': { name: 'Germany', region: 'Europe', gdp_growth: 0.7, inflation: 2.4, policy_rate: 3.4, currency: 'EUR', fx_note: 'EUR — stable', fx_risk: 'Low', fdi_trend: 'Mature industrial base', regulatory_ease: 'Medium', capital_availability: 'High', market_weight: 0.07, ecosystem: 'Strong B2B/industrial tech; Berlin/Munich hubs.' },
  'Singapore': { name: 'Singapore', region: 'East Asia', gdp_growth: 2.6, inflation: 2.8, policy_rate: 3.5, currency: 'SGD', fx_note: 'SGD managed float — very stable', fx_risk: 'Low', fdi_trend: 'SEA gateway; heavy FDI', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.04, ecosystem: 'APAC HQ hub; deep regional VC.' },
  'India': { name: 'India', region: 'South Asia', gdp_growth: 6.8, inflation: 4.8, policy_rate: 6.5, currency: 'INR', fx_note: 'INR managed float — gradual depreciation', fx_risk: 'Medium', fdi_trend: 'Strong; fastest-growing large economy', regulatory_ease: 'Medium', capital_availability: 'High', market_weight: 0.12, ecosystem: 'Huge market and mature VC, but crowded and capital-competitive.' },
  'Pakistan': { name: 'Pakistan', region: 'South Asia', gdp_growth: 2.5, inflation: 12.0, policy_rate: 15.0, currency: 'PKR', fx_note: 'PKR depreciated; IMF-program dependent — high FX risk', fx_risk: 'High', fdi_trend: 'Constrained by macro instability', regulatory_ease: 'Low', capital_availability: 'Low', market_weight: 0.015, ecosystem: 'Large young population; funding winter hit hard.' },
  'Indonesia': { name: 'Indonesia', region: 'East Asia', gdp_growth: 5.0, inflation: 2.8, policy_rate: 6.0, currency: 'IDR', fx_note: 'IDR floating — moderate', fx_risk: 'Medium', fdi_trend: 'Strong SEA growth story', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.03, ecosystem: 'Largest SEA market; post-boom consolidation.' },
  'Nigeria': { name: 'Nigeria', region: 'Sub-Saharan Africa', gdp_growth: 3.1, inflation: 33.0, policy_rate: 27.25, currency: 'NGN', fx_note: 'NGN devalued sharply since 2023 — high FX risk', fx_risk: 'High', fdi_trend: 'Big fintech story but FX-impaired', regulatory_ease: 'Low', capital_availability: 'Medium', market_weight: 0.02, ecosystem: 'Africa’s biggest fintech market; severe currency risk.' },
  'South Africa': { name: 'South Africa', region: 'Sub-Saharan Africa', gdp_growth: 1.2, inflation: 4.5, policy_rate: 8.0, currency: 'ZAR', fx_note: 'ZAR floating — volatile', fx_risk: 'Medium', fdi_trend: 'Mature but low-growth', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.02, ecosystem: 'Most developed African capital market; slow growth.' },
  'Canada': { name: 'Canada', region: 'North America', gdp_growth: 1.2, inflation: 2.4, policy_rate: 3.75, currency: 'CAD', fx_note: 'CAD floating — stable', fx_risk: 'Low', fdi_trend: 'Mature', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.05, ecosystem: 'Strong AI research base (Toronto/Montreal).' },
};

// Region-level fallback when a specific country isn't in the table.
const REGION_DEFAULTS: Record<Region, CountryProfile> = {
  GCC:        { name: 'GCC (regional est.)', region: 'GCC', gdp_growth: 3.2, inflation: 2.0, policy_rate: 5.4, currency: 'USD-pegged', fx_note: 'GCC currencies broadly USD-pegged', fx_risk: 'Low', fdi_trend: 'Diversification-driven FDI growth', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.02, ecosystem: 'GCC regional estimate — country-specific data unavailable.' },
  Levant:     { name: 'Levant (regional est.)', region: 'Levant', gdp_growth: 2.3, inflation: 4.0, policy_rate: 7.0, currency: 'Mixed', fx_note: 'Mixed pegs; some instability', fx_risk: 'Medium', fdi_trend: 'Modest, talent-led', regulatory_ease: 'Medium', capital_availability: 'Low', market_weight: 0.008, ecosystem: 'Levant regional estimate.' },
  'North Africa': { name: 'North Africa (regional est.)', region: 'North Africa', gdp_growth: 3.3, inflation: 12.0, policy_rate: 15.0, currency: 'Mixed', fx_note: 'Several floating/devaluing currencies', fx_risk: 'High', fdi_trend: 'Large TAM, macro-constrained', regulatory_ease: 'Low', capital_availability: 'Low', market_weight: 0.02, ecosystem: 'North Africa regional estimate.' },
  'MENA-other': { name: 'MENA (regional est.)', region: 'MENA-other', gdp_growth: 3.0, inflation: 15.0, policy_rate: 20.0, currency: 'Mixed', fx_note: 'Elevated FX risk', fx_risk: 'High', fdi_trend: 'Selective', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.03, ecosystem: 'Broader MENA regional estimate.' },
  Europe:     { name: 'Europe (regional est.)', region: 'Europe', gdp_growth: 1.2, inflation: 2.5, policy_rate: 3.4, currency: 'EUR', fx_note: 'Stable', fx_risk: 'Low', fdi_trend: 'Mature', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.06, ecosystem: 'European regional estimate.' },
  'North America': { name: 'North America (regional est.)', region: 'North America', gdp_growth: 2.3, inflation: 2.9, policy_rate: 4.6, currency: 'USD', fx_note: 'Stable', fx_risk: 'Low', fdi_trend: 'Deepest capital markets', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.2, ecosystem: 'North America regional estimate.' },
  'South Asia': { name: 'South Asia (regional est.)', region: 'South Asia', gdp_growth: 5.5, inflation: 7.0, policy_rate: 8.5, currency: 'Mixed', fx_note: 'Moderate depreciation', fx_risk: 'Medium', fdi_trend: 'Growing', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.05, ecosystem: 'South Asia regional estimate.' },
  'East Asia': { name: 'East Asia (regional est.)', region: 'East Asia', gdp_growth: 4.0, inflation: 2.8, policy_rate: 4.5, currency: 'Mixed', fx_note: 'Broadly stable', fx_risk: 'Low', fdi_trend: 'Strong', regulatory_ease: 'High', capital_availability: 'High', market_weight: 0.04, ecosystem: 'East Asia regional estimate.' },
  'Sub-Saharan Africa': { name: 'Sub-Saharan Africa (regional est.)', region: 'Sub-Saharan Africa', gdp_growth: 3.5, inflation: 15.0, policy_rate: 18.0, currency: 'Mixed', fx_note: 'High FX risk', fx_risk: 'High', fdi_trend: 'Fintech-led but volatile', regulatory_ease: 'Low', capital_availability: 'Low', market_weight: 0.015, ecosystem: 'Sub-Saharan Africa regional estimate.' },
  Other:      { name: 'Global (est.)', region: 'Other', gdp_growth: 2.8, inflation: 4.0, policy_rate: 5.0, currency: 'Mixed', fx_note: 'Unknown — global blended estimate', fx_risk: 'Medium', fdi_trend: 'Blended global', regulatory_ease: 'Medium', capital_availability: 'Medium', market_weight: 0.03, ecosystem: 'Global blended estimate — market not identified.' },
};

// Country aliases: cities, abbreviations, common typos in the CRM export.
const COUNTRY_ALIAS: Record<string, string> = {
  'dubai': 'United Arab Emirates', 'abu dhabi': 'United Arab Emirates', 'uae': 'United Arab Emirates', 'sharjah': 'United Arab Emirates',
  'ksa': 'Saudi Arabia', 'saudi': 'Saudi Arabia', 'riyadh': 'Saudi Arabia', 'jeddah': 'Saudi Arabia',
  'usa': 'United States', 'us': 'United States', 'u.s.': 'United States', 'united states of america': 'United States', 'new york': 'United States', 'san francisco': 'United States', 'delaware': 'United States',
  'uk': 'United Kingdom', 'england': 'United Kingdom', 'london': 'United Kingdom', 'britain': 'United Kingdom',
  'cairo': 'Egypt', 'delhi': 'India', 'new delhi': 'India', 'bangalore': 'India', 'mumbai': 'India',
  'the netherlands': 'Netherlands', 'holland': 'Netherlands',
  'brasil': 'Brazil', 'khazakstan': 'Kazakhstan', 'kazakstan': 'Kazakhstan', 'algaria': 'Algeria', 'algeria ': 'Algeria',
  'hong kong': 'Hong Kong', 'south korea': 'South Korea', 'korea': 'South Korea',
};

// Countries we recognise by name but don't keep a full record for → route to region default.
const COUNTRY_REGION: Record<string, Region> = {
  'Netherlands': 'Europe', 'Switzerland': 'Europe', 'Spain': 'Europe', 'Italy': 'Europe', 'Sweden': 'Europe', 'Denmark': 'Europe',
  'Australia': 'Other', 'Japan': 'East Asia', 'South Korea': 'East Asia', 'Hong Kong': 'East Asia', 'Philippines': 'East Asia', 'Brazil': 'Other',
  'Bangladesh': 'South Asia', 'Palestine': 'Levant', 'Iraq': 'MENA-other', 'Algeria': 'North Africa',
  'Azerbaijan': 'MENA-other', 'Armenia': 'MENA-other', 'Kazakhstan': 'MENA-other', 'Tajikistan': 'MENA-other', 'Uzbekistan': 'MENA-other',
  'Central Africa': 'Sub-Saharan Africa', 'Africa': 'Sub-Saharan Africa',
};

export function resolveCountry(raw: string): { profile: CountryProfile; confidence: Confidence; input: string } {
  const input = (raw || '').trim();
  const low = input.toLowerCase();
  if (!input) return { profile: REGION_DEFAULTS.Other, confidence: 'global', input: 'unspecified' };
  const canonical = COUNTRY_ALIAS[low] || input;
  // exact record
  const exactKey = Object.keys(COUNTRIES).find((k) => k.toLowerCase() === canonical.toLowerCase());
  if (exactKey) return { profile: COUNTRIES[exactKey], confidence: 'exact', input };
  // known name → region default
  const regionKey = Object.keys(COUNTRY_REGION).find((k) => k.toLowerCase() === canonical.toLowerCase());
  if (regionKey) return { profile: REGION_DEFAULTS[COUNTRY_REGION[regionKey]], confidence: 'regional', input };
  // unknown → global blended
  return { profile: REGION_DEFAULTS.Other, confidence: 'global', input };
}

// ---------------------------------------------------------------------------
// Sector reference table — global baselines that get scaled to a country.
// ---------------------------------------------------------------------------
export interface SectorProfile {
  key: string;
  label: string;
  global_tam_b: number;   // global sector TAM ($B), order of magnitude
  cagr: number;           // sector growth (decimal)
  competition: Comp;
  b2b: boolean;
  capital_intensity: Band; // High = hardware/bio/deep-tech burn; affects runway expectations
  trends: string[];
}

const SECTORS: Record<string, SectorProfile> = {
  FinTech:      { key: 'FinTech', label: 'FinTech', global_tam_b: 310, cagr: 0.17, competition: 'High', b2b: false, capital_intensity: 'Medium', trends: ['Embedded finance & BNPL expansion', 'Regulatory sandboxes across GCC', 'SME lending & cross-border payments underserved'] },
  SaaS:         { key: 'SaaS', label: 'B2B SaaS', global_tam_b: 340, cagr: 0.19, competition: 'High', b2b: true, capital_intensity: 'Low', trends: ['Vertical SaaS displacing horizontal tools', 'AI copilots raising ACV', 'Cloud adoption still early in MENA enterprises'] },
  AI:           { key: 'AI', label: 'AI / ML', global_tam_b: 400, cagr: 0.34, competition: 'High', b2b: true, capital_intensity: 'Medium', trends: ['Applied vertical AI over foundation models', 'Arabic-language NLP underdeveloped', 'Compute cost a key margin driver'] },
  HealthTech:   { key: 'HealthTech', label: 'HealthTech', global_tam_b: 220, cagr: 0.24, competition: 'Moderate', b2b: true, capital_intensity: 'Medium', trends: ['Telemedicine reimbursement expanding', 'EHR mandates in GCC', 'Long clinical & procurement cycles'] },
  BioTech:      { key: 'BioTech', label: 'BioTech', global_tam_b: 500, cagr: 0.12, competition: 'Moderate', b2b: true, capital_intensity: 'High', trends: ['Long R&D and regulatory timelines', 'Capital-intensive, milestone-based', 'Export/IP-led value'] },
  Ecommerce:    { key: 'Ecommerce', label: 'E-commerce', global_tam_b: 600, cagr: 0.14, competition: 'High', b2b: false, capital_intensity: 'Medium', trends: ['Marketplace consolidation', 'Q-commerce & logistics tie-ins', 'Thin margins, high CAC'] },
  ClimateTech:  { key: 'ClimateTech', label: 'Climate Tech', global_tam_b: 180, cagr: 0.24, competition: 'Low', b2b: true, capital_intensity: 'High', trends: ['Net-zero policy tailwinds', 'Solar/storage buildout in GCC', 'Hardware capex & long payback'] },
  Logistics:    { key: 'Logistics', label: 'Logistics / Supply Chain', global_tam_b: 160, cagr: 0.17, competition: 'Moderate', b2b: true, capital_intensity: 'Medium', trends: ['Cross-border trade corridors', 'Low software penetration', 'Long enterprise sales cycles'] },
  EdTech:       { key: 'EdTech', label: 'EdTech', global_tam_b: 120, cagr: 0.16, competition: 'Moderate', b2b: false, capital_intensity: 'Low', trends: ['B2B/corporate training better unit economics', 'Government digitisation budgets', 'B2C price sensitivity'] },
  PropTech:     { key: 'PropTech', label: 'PropTech', global_tam_b: 90, cagr: 0.15, competition: 'Moderate', b2b: true, capital_intensity: 'Medium', trends: ['GCC real-estate digitisation', 'Rental & mortgage rails', 'Incumbent developer relationships matter'] },
  Media:        { key: 'Media', label: 'Media / Content', global_tam_b: 110, cagr: 0.12, competition: 'High', b2b: false, capital_intensity: 'Low', trends: ['Creator economy', 'Arabic content gap', 'Ad-spend cyclicality'] },
  HRTech:       { key: 'HRTech', label: 'HR Tech', global_tam_b: 80, cagr: 0.15, competition: 'Moderate', b2b: true, capital_intensity: 'Low', trends: ['GCC workforce nationalisation drives compliance tools', 'Payroll & EOR demand', 'Fragmented buyers'] },
  Mobility:     { key: 'Mobility', label: 'Mobility Tech', global_tam_b: 140, cagr: 0.18, competition: 'High', b2b: false, capital_intensity: 'High', trends: ['EV & micromobility', 'Asset-heavy models', 'Regulatory dependence'] },
  DeepTech:     { key: 'DeepTech', label: 'DeepTech', global_tam_b: 200, cagr: 0.22, competition: 'Low', b2b: true, capital_intensity: 'High', trends: ['Strong IP defensibility', 'Long time-to-revenue', 'Talent-intensive'] },
  FoodTech:     { key: 'FoodTech', label: 'FoodTech', global_tam_b: 100, cagr: 0.15, competition: 'Moderate', b2b: false, capital_intensity: 'Medium', trends: ['Food security agenda in GCC', 'Cloud kitchens maturing', 'Margin pressure'] },
  CyberSec:     { key: 'CyberSec', label: 'Cybersecurity', global_tam_b: 210, cagr: 0.26, competition: 'Moderate', b2b: true, capital_intensity: 'Low', trends: ['Mandatory audits in GCC finance', 'Few local vendors', 'Enterprise budgets rising'] },
  AgriTech:     { key: 'AgriTech', label: 'AgriTech', global_tam_b: 70, cagr: 0.15, competition: 'Low', b2b: true, capital_intensity: 'Medium', trends: ['Water-scarce farming innovation', 'Food security subsidies', 'Rural distribution challenge'] },
  RegTech:      { key: 'RegTech', label: 'RegTech', global_tam_b: 60, cagr: 0.20, competition: 'Moderate', b2b: true, capital_intensity: 'Low', trends: ['Compliance automation', 'KYC/AML demand', 'Regulatory tailwind'] },
  Blockchain:   { key: 'Blockchain', label: 'Blockchain / Web3', global_tam_b: 90, cagr: 0.20, competition: 'High', b2b: false, capital_intensity: 'Medium', trends: ['Tokenisation & payments', 'Regulatory uncertainty', 'Adoption still early'] },
  Fashion:      { key: 'Fashion', label: 'Fashion / Retail Tech', global_tam_b: 120, cagr: 0.13, competition: 'High', b2b: false, capital_intensity: 'Medium', trends: ['Social commerce', 'Modest-fashion niche in MENA', 'High return rates'] },
  Gaming:       { key: 'Gaming', label: 'Gaming', global_tam_b: 190, cagr: 0.13, competition: 'High', b2b: false, capital_intensity: 'Medium', trends: ['Young mobile-first MENA demographic', 'Savvy Games investment wave', 'Hit-driven volatility'] },
  LegalTech:    { key: 'LegalTech', label: 'LegalTech', global_tam_b: 40, cagr: 0.17, competition: 'Low', b2b: true, capital_intensity: 'Low', trends: ['Contract automation', 'Arabic legal NLP gap', 'Conservative buyers'] },
  SpaceTech:    { key: 'SpaceTech', label: 'SpaceTech', global_tam_b: 60, cagr: 0.16, competition: 'Low', b2b: true, capital_intensity: 'High', trends: ['GCC space programmes', 'Very capital-intensive', 'Long horizons'] },
  Robotics:     { key: 'Robotics', label: 'Robotics', global_tam_b: 80, cagr: 0.20, competition: 'Moderate', b2b: true, capital_intensity: 'High', trends: ['Warehouse & industrial automation', 'Hardware margin pressure', 'Labour-cost driven demand'] },
  AdTech:       { key: 'AdTech', label: 'AdTech', global_tam_b: 100, cagr: 0.12, competition: 'High', b2b: true, capital_intensity: 'Low', trends: ['Retail media growth', 'Privacy-driven reshuffle', 'Cyclical ad budgets'] },
};

const DEFAULT_SECTOR: SectorProfile = { key: 'Other', label: 'Technology', global_tam_b: 120, cagr: 0.16, competition: 'Moderate', b2b: true, capital_intensity: 'Medium', trends: ['Digital adoption accelerating', 'Regional platforms underserved', 'Talent pool expanding'] };

// Map the CRM's 57 messy industry labels onto canonical sectors.
const SECTOR_ALIAS: Record<string, string> = {
  'fintech': 'FinTech', 'bnpl': 'FinTech', 'digital bank': 'FinTech', 'regtech': 'RegTech',
  'b2b saas': 'SaaS', 'saas': 'SaaS', 'social/platform software': 'SaaS', 'service tech': 'SaaS', 'it services': 'SaaS', 'super app': 'SaaS',
  'ai': 'AI', 'robotics and ai': 'Robotics', 'sports ai': 'AI', 'edtech ai': 'EdTech', 'retail tech / ai': 'Fashion', 'fashion ai': 'Fashion', 'ai-acoustics': 'AI',
  'healthtech': 'HealthTech', 'medtech': 'HealthTech',
  'biotech': 'BioTech', 'naturetech': 'BioTech',
  'e-commerce': 'Ecommerce', 'ecommerce': 'Ecommerce', 'marketplace': 'Ecommerce',
  'climate tech': 'ClimateTech', 'climatetech': 'ClimateTech',
  'logistics saas': 'Logistics', 'logi-tech': 'Logistics', 'logistics': 'Logistics', 'supply chain': 'Logistics',
  'edtech': 'EdTech',
  'proptech': 'PropTech', 'construction tech': 'PropTech',
  'media': 'Media', 'adtech': 'AdTech',
  'hr': 'HRTech',
  'mobility tech': 'Mobility', 'aviation': 'Mobility', 'drone technology': 'Robotics',
  'deeptech': 'DeepTech', 'quantum computing': 'DeepTech', '3d printing': 'DeepTech', 'iot': 'DeepTech', 'datacenter': 'DeepTech', 'ar': 'DeepTech',
  'foodtech': 'FoodTech', 'f&b tech': 'FoodTech',
  'cybersecurity': 'CyberSec',
  'agritech': 'AgriTech',
  'blockchain': 'Blockchain',
  'fashion tech': 'Fashion', 'retail tech': 'Fashion', 'travel retail tech': 'Fashion', 'pet tech': 'Fashion',
  'gaming': 'Gaming', 'sport tech': 'Gaming', 'sports ai ': 'Gaming',
  'legaltech': 'LegalTech',
  'spacetech': 'SpaceTech',
  'govtech': 'SaaS', 'b2c': 'Ecommerce', 'b2c femcare': 'Ecommerce',
};

export function resolveSector(raw: string): { profile: SectorProfile; confidence: Confidence; input: string } {
  const input = (raw || '').trim();
  const low = input.toLowerCase();
  if (!input) return { profile: DEFAULT_SECTOR, confidence: 'global', input: 'unspecified' };
  if (SECTORS[input]) return { profile: SECTORS[input], confidence: 'exact', input };
  const alias = SECTOR_ALIAS[low];
  if (alias && SECTORS[alias]) return { profile: SECTORS[alias], confidence: 'exact', input };
  // loose contains match
  const hit = Object.keys(SECTOR_ALIAS).find((k) => low.includes(k) || k.includes(low));
  if (hit && SECTORS[SECTOR_ALIAS[hit]]) return { profile: SECTORS[SECTOR_ALIAS[hit]], confidence: 'regional', input };
  return { profile: DEFAULT_SECTOR, confidence: 'global', input };
}

// ---------------------------------------------------------------------------
// Compose country × sector into a single resolved market context.
// ---------------------------------------------------------------------------
export interface MarketContext {
  country: CountryProfile;
  sector: SectorProfile;
  countryConfidence: Confidence;
  sectorConfidence: Confidence;
  // Sized market for THIS country × sector
  regional_tam_b: number;  // $B addressable from this market
  sam_m: number;           // $M serviceable
  som_m: number;           // $M obtainable (5-yr realistic)
  cagr: number;            // sector CAGR
  competition: Comp;
  // Forward-looking capital signal
  cost_of_capital: Band;      // derived from policy rate
  follow_on_availability: Band; // capital depth for the next round
  assumptions: string[];   // human-readable notes on every fallback used
}

const bandFromRate = (r: number): Band => (r >= 12 ? 'High' : r >= 6 ? 'Medium' : 'Low');

export function resolveMarket(rawCountry: string, rawIndustry: string): MarketContext {
  const { profile: country, confidence: cc, input: ci } = resolveCountry(rawCountry);
  const { profile: sector, confidence: sc, input: si } = resolveSector(rawIndustry);

  const regional_tam_b = +(sector.global_tam_b * country.market_weight).toFixed(2);
  // serviceable & obtainable fractions, dampened by competition
  const compServ = sector.competition === 'High' ? 0.05 : sector.competition === 'Moderate' ? 0.07 : 0.09;
  const compCap = sector.competition === 'High' ? 0.03 : sector.competition === 'Moderate' ? 0.045 : 0.06;
  const sam_m = +(regional_tam_b * 1000 * compServ).toFixed(0);
  const som_m = +(sam_m * compCap).toFixed(1);

  const assumptions: string[] = [];
  if (cc !== 'exact') assumptions.push(`Country "${ci}" not in reference set → used ${country.name} (${cc} estimate).`);
  if (sc !== 'exact') assumptions.push(`Sector "${si}" not an exact match → mapped to ${sector.label} (${sc} estimate).`);
  if (country.fx_risk === 'High') assumptions.push(`${country.name} carries high FX risk (${country.fx_note}).`);

  return {
    country, sector, countryConfidence: cc, sectorConfidence: sc,
    regional_tam_b, sam_m, som_m,
    cagr: sector.cagr, competition: sector.competition,
    cost_of_capital: bandFromRate(country.policy_rate),
    follow_on_availability: country.capital_availability,
    assumptions,
  };
}
