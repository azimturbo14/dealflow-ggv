// Thesis-fit layer.
//
// WHY THIS EXISTS
//   Analysis of the client's real Streak pipeline showed that ~half of their
//   passes have nothing to do with company quality — they are mandate/thesis
//   passes: "we're not investing in B2C right now", "travel retail is not a
//   focus", "no interest in podcast businesses", "doesn't fit our thesis".
//   A pure quality score can never predict those. So the VERDICT (pursue /
//   review / pass) is a function of BOTH the quality score AND thesis fit,
//   while the 0-100 quality score stays a clean measure of the company itself.
//
// The thesis below is DERIVED FROM THE CLIENT'S OWN DECISIONS, and is a plain,
// editable config object — the client can tune it as their mandate shifts.

import type { ScoreFactor } from './mock-data';
import type { Region } from './markets';

export type ThesisBand = 'on-thesis' | 'partial' | 'off-thesis';
export type ThesisGate = 'none' | 'cap-review' | 'hard-pass';

export interface FundThesis {
  label: string;
  b2c_stance: 'pass' | 'review-cap' | 'ok'; // how B2C companies are treated
  min_dev_stage: string;                     // earlier than this reads as "too early"
  require_moat: boolean;                      // defensibility expected
  preferred_sectors: string[];               // canonical sector keys the fund actively wants
  avoid_sectors: string[];                    // canonical sectors the fund is out of
  avoid_keywords: string[];                   // narrow verticals explicitly passed on
  // Geography gate - added after a 2026-07 cohort review found a strong,
  // well-funded off-region deal (FairMoney, Nigeria) reading as a good
  // quality fit with ZERO thesis penalty, because nothing checked geography
  // at all. Evidence for this rule is thin (2 CRM data points: FairMoney/
  // Sub-Saharan Africa and Bykea/Pakistan, both passed) - deliberately a
  // 'cap-review' gate, not 'hard-pass', and flagged as tentative below.
  // CONFIRM WITH THE DEAL TEAM before trusting this as settled policy.
  core_regions: Region[];
  geography_evidence_note: string;
  notes: string;
}

// Derived from the MENA client's pursued (Signed/DD/IC) vs passed history.
export const MENA_CLIENT_THESIS: FundThesis = {
  label: 'B2B deep-tech · FinTech · AI — defensible, Series-A-ready',
  b2c_stance: 'review-cap',
  min_dev_stage: 'MVP',
  require_moat: true,
  preferred_sectors: ['FinTech', 'AI', 'SaaS', 'DeepTech', 'BioTech', 'HealthTech', 'CyberSec', 'RegTech', 'ClimateTech', 'SpaceTech', 'Robotics'],
  avoid_sectors: [],
  avoid_keywords: ['podcast', 'travel retail', 'femcare', 'dating'],
  // Pursued deals in the cohort span GCC, Levant, North Africa, MENA-other
  // AND North America (several US deep-tech deals: Invisible Technologies,
  // CIQ, Antaris Space, BioSapien, XScape Photonics) - so "MENA-only" would
  // be wrong. Sub-Saharan Africa and South Asia are the two regions with
  // passed deals and zero pursued ones so far.
  core_regions: ['GCC', 'Levant', 'North Africa', 'MENA-other', 'North America', 'Europe'],
  geography_evidence_note: 'Tentative - based on only 2 off-core-region CRM data points (FairMoney/Sub-Saharan Africa, Bykea/South Asia), both passed. Not enough evidence to hard-gate; confirm with the deal team whether geography is really a mandate boundary or those 2 passes were coincidentally also B2C/quality passes for other reasons.',
  notes: 'Pursued deals cluster in B2B FinTech/AI/SaaS/DeepTech/BioTech at Series A+. B2C explicitly deprioritized ("not actively investing in B2C"); "too early" and "no defensible moat / business model" are recurring quality-adjacent pass reasons; several niche consumer verticals passed outright.',
};

const STAGE_ORDER = ['Idea', 'MVP', 'Launched', 'Growth', 'Scaling'];

export interface ThesisInput {
  is_b2b: boolean;
  dev_stage: string;
  unique_tech: boolean;
  technical_cofounder?: boolean;
  sector_key: string;
  industry: string;
  description?: string;
  region?: Region;
}

export interface ThesisFit {
  score: number;        // 0-100 how well the deal matches the fund's mandate
  band: ThesisBand;
  gate: ThesisGate;     // how it constrains the verdict
  reasons: string[];
  factors: ScoreFactor[];
}

// Precedence: hard-pass beats cap-review beats none.
function stronger(a: ThesisGate, b: ThesisGate): ThesisGate {
  const rank: Record<ThesisGate, number> = { 'none': 0, 'cap-review': 1, 'hard-pass': 2 };
  return rank[a] >= rank[b] ? a : b;
}

export function assessThesisFit(input: ThesisInput, thesis: FundThesis = MENA_CLIENT_THESIS): ThesisFit {
  const factors: ScoreFactor[] = [];
  const reasons: string[] = [];
  let score = 60;
  let gate: ThesisGate = 'none';

  const haystack = `${input.industry} ${input.description ?? ''}`.toLowerCase();

  // 1) Sector stance
  const preferred = thesis.preferred_sectors.includes(input.sector_key);
  const avoided = thesis.avoid_sectors.includes(input.sector_key);
  let sectorImpact = 0;
  if (avoided) { sectorImpact = -35; gate = stronger(gate, 'hard-pass'); reasons.push(`${input.sector_key} is a sector the fund is currently out of.`); }
  else if (preferred) { sectorImpact = 22; }
  score += sectorImpact;
  factors.push({
    criterion: 'Sector vs. mandate',
    value: avoided ? `${input.sector_key} — out of mandate` : preferred ? `${input.sector_key} — core focus` : `${input.sector_key} — neutral`,
    impact: sectorImpact, max_impact: 22,
    direction: sectorImpact > 0 ? 'positive' : sectorImpact < 0 ? 'negative' : 'neutral',
    explanation: avoided
      ? `The fund is explicitly not investing in ${input.sector_key} at present — an automatic pass regardless of company quality.`
      : preferred
        ? `${input.sector_key} sits inside the fund's active focus (${thesis.preferred_sectors.slice(0, 5).join(', ')}…).`
        : `${input.sector_key} is neither a stated focus nor an explicit avoid — judged on quality.`,
  });

  // 2) Narrow avoid-vertical keywords (podcast, travel retail, …)
  const hitKw = thesis.avoid_keywords.find((k) => haystack.includes(k));
  if (hitKw) {
    gate = stronger(gate, 'hard-pass');
    score -= 30;
    reasons.push(`"${hitKw}" is a vertical the fund has explicitly passed on before.`);
    factors.push({
      criterion: 'Vertical exclusion',
      value: `Matches "${hitKw}"`,
      impact: -30, max_impact: 0, direction: 'negative',
      explanation: `The deal falls in "${hitKw}", a niche the fund has previously declined as out-of-thesis.`,
    });
  }

  // 3) B2B / B2C stance
  let bcImpact = 0;
  if (input.is_b2b) {
    bcImpact = 12;
  } else {
    if (thesis.b2c_stance === 'pass') { bcImpact = -25; gate = stronger(gate, 'hard-pass'); reasons.push('B2C — the fund does not invest in consumer.'); }
    else if (thesis.b2c_stance === 'review-cap') { bcImpact = -15; gate = stronger(gate, 'cap-review'); reasons.push('B2C — the fund deprioritizes consumer; tracks rather than leads.'); }
  }
  score += bcImpact;
  factors.push({
    criterion: 'Business model (B2B/B2C)',
    value: input.is_b2b ? 'B2B' : 'B2C / consumer',
    impact: bcImpact, max_impact: 12,
    direction: bcImpact > 0 ? 'positive' : bcImpact < 0 ? 'negative' : 'neutral',
    explanation: input.is_b2b
      ? 'B2B matches the fund\'s stated preference for enterprise / deep-tech over consumer.'
      : thesis.b2c_stance === 'ok'
        ? 'Consumer model — no thesis penalty under the current mandate.'
        : `Consumer model — the fund is ${thesis.b2c_stance === 'pass' ? 'not investing in B2C' : 'deprioritizing B2C'} at present.`,
  });

  // 4) Stage — "too early" is a recurring pass reason
  const idx = STAGE_ORDER.indexOf(input.dev_stage);
  const minIdx = STAGE_ORDER.indexOf(thesis.min_dev_stage);
  let stageImpact = 0;
  if (idx >= 0 && minIdx >= 0 && idx < minIdx) {
    stageImpact = -12; gate = stronger(gate, 'cap-review');
    reasons.push(`Stage "${input.dev_stage}" is earlier than the fund typically enters — likely "too early".`);
  }
  factors.push({
    criterion: 'Stage vs. entry point',
    value: input.dev_stage || 'Unknown',
    impact: stageImpact, max_impact: 0,
    direction: stageImpact < 0 ? 'negative' : 'neutral',
    explanation: stageImpact < 0
      ? `The fund's pursued deals cluster at ${thesis.min_dev_stage}+; "${input.dev_stage}" reads as too early and is usually tracked, not led.`
      : `Stage is at or beyond the fund's usual entry point.`,
  });

  // 5) Moat / defensibility — "no defensible model / no defense against competition"
  if (thesis.require_moat && !input.unique_tech && !input.technical_cofounder) {
    score -= 12;
    reasons.push('No stated defensibility (no unique tech or technical co-founder) — the fund passes on undefensible models.');
    factors.push({
      criterion: 'Defensibility',
      value: 'No stated moat',
      impact: -12, max_impact: 0, direction: 'negative',
      explanation: 'A recurring pass reason for this fund is weak defensibility ("no defense against competition", "no defendable business model").',
    });
  }

  // 6) Geography vs. core regions - see the "geography_evidence_note" on the
  // thesis object for how thin the evidence for this rule still is. Deliberately
  // cap-review, never hard-pass, until there's more than 2 data points behind it.
  if (input.region && !thesis.core_regions.includes(input.region)) {
    score -= 15;
    gate = stronger(gate, 'cap-review');
    reasons.push(`${input.region} is outside the fund's core regions so far (${thesis.core_regions.join(', ')}) - tentative signal, confirm with the deal team.`);
    factors.push({
      criterion: 'Geography vs. core regions',
      value: `${input.region} — outside observed core regions`,
      impact: -15, max_impact: 0, direction: 'negative',
      explanation: `No pursued deal in this fund's history so far has come from ${input.region}. This is a THIN, tentative signal (only 2 supporting data points) rather than a confirmed mandate boundary - treat as a prompt to double-check geographic fit, not an automatic pass.`,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band: ThesisBand = gate === 'hard-pass' ? 'off-thesis' : score >= 70 ? 'on-thesis' : score >= 45 ? 'partial' : 'off-thesis';
  if (reasons.length === 0) reasons.push('No thesis conflicts — judged on company quality.');

  return { score, band, gate, reasons, factors };
}
