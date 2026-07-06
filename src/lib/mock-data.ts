export interface MarketResearch {
  tam: string;
  sam: string;
  som: string;
  som_explanation: string;
  market_viable: boolean;
  capture_potential: 'Low' | 'Moderate' | 'High';
  growth_rate: string;
  competition: 'Low' | 'Moderate' | 'High';
  key_trends: string[];
  assessment: string;
}

export interface MacroAnalysis {
  gdp_growth: string;
  inflation: string;
  regulatory_risk: 'Low' | 'Medium' | 'High';
  foreign_investment_trend: string;
  currency_stability: string;
  assessment: string;
}

export interface Startup {
  id: number;
  name: string;
  industry: string;
  description: string;
  is_b2b: boolean;
  team_size: number;
  funding_total_usd: number;
  funding_rounds: number;
  time_to_first_funding_months: number;
  has_previous_exit: boolean;
  founder_name: string;
  founder_role: string;
  website: string;
  sales_amount_usd: number;
  score: number;
  verdict: "high" | "moderate" | "low";
  strengths: string[];
  red_flags: string[];
  decision_path: string[];
  risks: string[];
  market_research: MarketResearch;
  macro_analysis: MacroAnalysis;
  score_breakdown: ScoreFactor[];
}

export interface ScoreFactor {
  criterion: string;
  value: string;
  impact: number;
 max_impact: number;
 direction: 'positive' | 'negative' | 'neutral';
 explanation: string;
  threshold?: string;
  benchmark?: string;
}

export const industries = [
  "SaaS", "Fintech", "EdTech", "AgriTech", "HealthTech",
  "E-commerce", "LogTech", "CyberSec", "AI/ML", "GovTech",
  "PropTech", "RecruTech", "CleanTech", "FoodTech", "LegalTech"
];

const b2bIndustries = new Set(["SaaS", "Fintech", "AgriTech", "LogTech", "CyberSec", "AI/ML", "GovTech", "PropTech", "CleanTech", "LegalTech", "RecruTech"]);

const startupNames = [
  "DasturCloud", "PayUz", "AgriConnect", "MedUz", "LogiTech",
  "DasturLab", "SmartFarm UZ", "EduUz", "FinBridge", "CloudNomad",
  "CyberShield UZ", "GovTech Solutions", "PropUz", "HireUz", "GreenEnergy UZ",
  "FoodChain UZ", "LegalTech UZ", "DataVista", "AI Assist UZ", "ShopUz",
  "DeliveryUz", "TechMed UZ", "AgriSense", "EduBridge", "FinFlow",
  "CloudPeak", "SecureNet UZ", "SmartCity UZ", "RecruitPro", "CleanPower",
  "FoodLogix", "LawConnect", "InsightAI", "AutoTech UZ", "BuildTech",
  "TravelUz", "MediaFlow", "SportTech UZ", "FashionTech", "PetTech",
  "MusicUz", "GameDev UZ", "SocialConnect", "ChatAI UZ", "DesignHub"
];

const founderNames = [
  "Dilshod Karimov", "Nodira Azimova", "Timur Rustamov", "Gulnora Toshmatova",
  "Jasur Umarov", "Shahlo Kamalova", "Bekzod Mirzayev", "Zulfiya Mukhammadieva",
  "Sardor Tursunov", "Madina Rakhimova", "Abror Yusupov", "Nilufar Hamidova",
  "Farrukh Saidov", "Dilorom Alimova", "Kamoliddin Normatov"
];

// Deterministic PRNG (mulberry32) — keeps server and client renders identical
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260705);

export interface StartupInput {
  name: string;
  industry: string;
  is_b2b: boolean;
  team_size: number;
  funding_total_usd: number;
  funding_rounds: number;
  time_to_first_funding_months: number;
  has_previous_exit: boolean;
  sales_amount_usd: number;
  founder_name?: string;
  description?: string;
  website?: string;
}

// Scores a raw application with the same decision-tree rules the demo data uses
export function evaluateStartup(input: StartupInput, id: number, jitter = 0): Startup {
  const {
    industry, is_b2b, team_size, funding_total_usd, funding_rounds,
    time_to_first_funding_months, has_previous_exit, sales_amount_usd,
  } = input;

    // ML scoring logic (mirrors decision tree)
    let score = 30; // base
    if (has_previous_exit) score += 20;
    if (is_b2b) score += 10;
    if (funding_total_usd > 300000) score += 10;
    if (funding_rounds >= 2) score += 10;
    if (time_to_first_funding_months > 0 && time_to_first_funding_months <= 12) score += 8;
    else if (time_to_first_funding_months > 12) score -= 5;
    if (team_size >= 5 && team_size <= 15) score += 7;
    else if (team_size > 15 && !has_previous_exit) score -= 5;
    if (sales_amount_usd > 0) score += 5;
    score = Math.max(5, Math.min(98, score + jitter));

    const verdict: "high" | "moderate" | "low" = score >= 65 ? "high" : score >= 35 ? "moderate" : "low";

    // Strengths
    const strengths: string[] = [];
    if (is_b2b) strengths.push("B2B model — higher survival rate in early-stage");
    if (has_previous_exit) strengths.push("Founder with prior exit — proven execution ability");
    if (funding_rounds >= 2) strengths.push(`${funding_rounds} funding rounds — investor confidence demonstrated`);
    if (time_to_first_funding_months > 0 && time_to_first_funding_months <= 8) strengths.push(`Funded within ${time_to_first_funding_months} months — strong market signal`);
    if (team_size >= 5) strengths.push(`Team of ${team_size} — sufficient capacity for growth`);
    if (funding_total_usd >= 500000) strengths.push(`$${(funding_total_usd / 1000).toFixed(0)}K raised — solid capital base`);
    if (sales_amount_usd > 0) strengths.push(`$${(sales_amount_usd / 1000).toFixed(0)}K in revenue — market validation exists`);
    if (strengths.length === 0) strengths.push("Early-stage — potential upside if execution improves");

    // Red flags
    const red_flags: string[] = [];
    if (!has_previous_exit) red_flags.push("No prior founder exits — first-time execution risk (~75% failure rate)");
    if (funding_rounds <= 1 && funding_total_usd > 0) red_flags.push("Single funding round — high dependency on one investor");
    if (funding_rounds === 0) red_flags.push("No funding raised — unvalidated by market investors");
    if (sales_amount_usd === 0) red_flags.push("Zero revenue — product-market fit not yet proven");
    if (team_size < 4) red_flags.push(`Small team (${team_size}) — limited capacity for execution`);
    if (time_to_first_funding_months > 15) red_flags.push(`${time_to_first_funding_months} months to first funding — slow market traction`);
    if (!is_b2b) red_flags.push("B2C model — higher failure rate at early stage");
    if (team_size > 18 && !has_previous_exit) red_flags.push("Large team without prior exits — high burn rate risk");
    if (red_flags.length === 0) red_flags.push("No critical red flags detected at this stage");

    // Decision path
    const decision_path: string[] = [];
    decision_path.push(`Previous exit? → ${has_previous_exit ? "Yes" : "No"}`);
    if (has_previous_exit) {
      decision_path.push(`Team size <= 15? → ${team_size <= 15 ? "Yes" : "No"}`);
      if (team_size <= 15) decision_path.push(`→ INVEST (${score}%)`);
      else {
        decision_path.push(`B2B? → ${is_b2b ? "Yes" : "No"}`);
        decision_path.push(`→ ${is_b2b ? "INVEST" : "REVIEW"} (${score}%)`);
      }
    } else {
      decision_path.push(`Funding > $300K? → ${funding_total_usd > 300000 ? "Yes" : "No"}`);
      if (funding_total_usd > 300000) {
        decision_path.push(`Time to fund <= 12mo? → ${time_to_first_funding_months <= 12 ? "Yes" : "No"}`);
        decision_path.push(`→ ${time_to_first_funding_months <= 12 ? "INVEST" : "REVIEW"} (${score}%)`);
      } else {
        decision_path.push(`B2B? → ${is_b2b ? "Yes" : "No"}`);
        if (is_b2b) {
          decision_path.push(`Rounds > 1? → ${funding_rounds > 1 ? "Yes" : "No"}`);
          decision_path.push(`→ ${funding_rounds > 1 ? "INVEST" : "PASS"} (${score}%)`);
        } else {
          decision_path.push(`→ PASS (${score}%)`);
        }
      }
    }

    // Score breakdown — WHY each factor contributed
    const score_breakdown: ScoreFactor[] = [];

    // 1. Previous founder exits
    score_breakdown.push({
      criterion: "Previous Founder Exits",
      value: has_previous_exit ? "Yes — prior successful exit" : "No — first-time founder",
      impact: has_previous_exit ? 20 : 0,
      max_impact: 20,
      direction: has_previous_exit ? "positive" : "negative",
      explanation: has_previous_exit
        ? "Founders who have previously built and sold a company have a ~3x higher success rate on their next venture. They have proven execution ability, established networks, and learned from past failures."
        : "75% of first-time founders fail to reach Series A. This does not mean the startup will fail — but it increases execution risk significantly. Mitigated by other positive signals like funding velocity and team size.",
      threshold: "Has the founder built and exited a company before? (Yes/No)",
      benchmark: "~15% of startup founders have prior exits. Those who do succeed at 2-3x the rate of first-timers.",
    });

    // 2. Business model
    score_breakdown.push({
      criterion: "Business Model (B2B vs B2C)",
      value: is_b2b ? "B2B" : "B2C",
      impact: is_b2b ? 10 : 0,
      max_impact: 10,
      direction: is_b2b ? "positive" : "negative",
      explanation: is_b2b
        ? "B2B startups in the SaaS/enterprise space generally have higher survival rates. Revenue is more predictable (subscriptions/contracts), customer acquisition cost is lower, and churn is manageable. The Central Asian B2B market is underserved — a structural advantage."
        : "B2C startups face higher customer acquisition costs, lower retention, and stronger competition from global players. In the Central Asian market, B2C success often depends on local market knowledge and network effects that are hard to replicate.",
      threshold: "Is the primary customer a business (B2B) or consumer (B2C)?",
      benchmark: "B2B SaaS startups have a ~60% higher survival rate to Series A compared to B2C startups at the same stage.",
    });

    // 3. Total funding
    const fundingImpact = funding_total_usd > 300000 ? 10 : 0;
    score_breakdown.push({
      criterion: "Total Funding Raised",
      value: funding_total_usd > 0 ? `$${(funding_total_usd / 1000).toFixed(0)}K across ${funding_rounds} round${funding_rounds !== 1 ? 's' : ''}` : "$0 — no external funding",
      impact: fundingImpact,
      max_impact: 10,
      direction: funding_total_usd > 300000 ? "positive" : funding_total_usd > 0 ? "neutral" : "negative",
      explanation: funding_total_usd > 300000
        ? `Raising $300K+ is a strong signal that at least one professional investor has validated the startup's potential. This capital provides runway to reach the next milestone (typically 12-18 months).`
        : funding_total_usd > 0
        ? `Some funding was raised, but below the $300K threshold where investor conviction becomes meaningful. The startup may need to demonstrate more traction before the next round.`
        : "No external funding means the startup is entirely self-funded. While bootstrapping shows founder commitment, it also means no professional investor has validated the idea. For venture-scale returns, external validation matters.",
      threshold: "Is total funding > $300K? (Yes: +10 points)",
      benchmark: "Startups that raise $300K+ before their first anniversary have a 2.5x higher probability of reaching Series A.",
    });

    // 4. Funding rounds
    const roundsImpact = funding_rounds >= 2 ? 10 : 0;
    score_breakdown.push({
      criterion: "Number of Funding Rounds",
      value: `${funding_rounds} round${funding_rounds !== 1 ? 's' : ''}`,
      impact: roundsImpact,
      max_impact: 10,
      direction: funding_rounds >= 2 ? "positive" : funding_rounds === 1 ? "neutral" : "negative",
      explanation: funding_rounds >= 2
        ? "Multiple funding rounds indicate sustained investor confidence. The first investor was followed by others — a strong signal that the startup is hitting milestones. It also means the startup is not solely dependent on a single investor."
        : funding_rounds === 1
        ? "A single funding round means the startup's fate is tied to one investor's decision to follow on. If that investor passes on the next round, the startup faces a funding cliff. This is the #1 cause of early-stage startup death."
        : "No funding rounds completed. The startup has not yet passed any investor's due diligence process.",
      threshold: "Are there 2+ funding rounds? (Yes: +10 points, No: 0 points)",
      benchmark: "Startups with 2+ rounds have a 70% higher rate of reaching profitability compared to single-round startups.",
    });

    // 5. Time to first funding
    let timeImpact = 0;
    let timeDir: 'positive' | 'negative' | 'neutral' = 'neutral';
    let timeExpl = '';
    if (funding_rounds > 0) {
      if (time_to_first_funding_months <= 8) {
        timeImpact = 8; timeDir = 'positive';
        timeExpl = `Funded within ${time_to_first_funding_months} months — this is very fast. It means the founder was able to convince an investor quickly, which correlates with strong market signal, founder credibility, and product-market fit. Startups funded within 8 months have the highest survival rates.`;
      } else if (time_to_first_funding_months <= 12) {
        timeImpact = 5; timeDir = 'positive';
        timeExpl = `Funded within ${time_to_first_funding_months} months — within the healthy range. This indicates reasonable market interest without excessive delay.`;
      } else if (time_to_first_funding_months <= 18) {
        timeImpact = 0; timeDir = 'neutral';
        timeExpl = `Took ${time_to_first_funding_months} months to secure first funding. This is slower than average and may indicate difficulty in convincing investors, an unclear value proposition, or a small addressable market.`;
      } else {
        timeImpact = -5; timeDir = 'negative';
        timeExpl = `Took ${time_to_first_funding_months} months to get first funding — significantly above average. Prolonged time-to-funding is a negative signal suggesting the startup struggled to find product-market fit or lacked investor conviction.`;
      }
    } else {
      timeExpl = "No funding data available — this factor is not scored.";
    }
    score_breakdown.push({
      criterion: "Time to First Funding",
      value: funding_rounds > 0 ? `${time_to_first_funding_months} months from founding` : "N/A — no funding",
      impact: timeImpact,
      max_impact: 8,
      direction: timeDir,
      explanation: timeExpl,
      threshold: "Funded within 8 months: +8 pts | 8-12 months: +5 pts | 12-18 months: 0 pts | 18+ months: -5 pts",
      benchmark: "Median time to first funding for successful startups is ~9 months. The 75th percentile is 15 months.",
    });

    // 6. Team size
    let teamImpact = 0;
    let teamDir: 'positive' | 'negative' | 'neutral' = 'neutral';
    let teamExpl = '';
    if (team_size >= 5 && team_size <= 15) {
      teamImpact = 7; teamDir = 'positive';
      teamExpl = `Team of ${team_size} is within the optimal range for this stage. Large enough to cover product, sales, and operations, but lean enough to maintain focus and low burn rate.`;
    } else if (team_size < 5) {
      teamImpact = 0; teamDir = 'negative';
      teamExpl = `Team of ${team_size} is below the recommended minimum of 4-5 for this stage. A team this small may struggle to execute simultaneously on product development, customer acquisition, and operations. High risk of founder burnout.`;
    } else if (team_size > 15) {
      teamImpact = has_previous_exit ? 0 : -5; teamDir = has_previous_exit ? 'neutral' : 'negative';
      teamExpl = has_previous_exit
        ? `Team of ${team_size} is large, but the founder's prior exit experience reduces the risk of mismanagement. The larger team may be appropriate if the startup is in a scaling phase.`
        : `Team of ${team_size} without a prior exit is concerning. Large teams burn cash faster, require more coordination, and increase the risk of misaligned incentives. Without proven leadership, this is a red flag.`;
    } else {
      teamImpact = 3; teamDir = 'neutral';
      teamExpl = `Team of ${team_size} — adequate size for early stage.`;
    }
    score_breakdown.push({
      criterion: "Team Size",
      value: `${team_size} ${team_size === 1 ? 'person' : 'people'} (full-time)`,
      impact: teamImpact,
      max_impact: 7,
      direction: teamDir,
      explanation: teamExpl,
      threshold: "5-15 people: +7 pts | <5 or >15 (no exit): 0/-5 pts",
      benchmark: "Optimal team size for seed-stage is 5-12. Teams below 4 have 2x higher failure rate. Teams above 15 without revenue have 1.8x higher burn rate.",
    });

    // 7. Revenue (bonus)
    if (sales_amount_usd > 0) {
      score_breakdown.push({
        criterion: "Revenue Validation",
        value: `$${(sales_amount_usd / 1000).toFixed(0)}K in sales`,
        impact: 5,
        max_impact: 5,
        direction: "positive",
        explanation: `Revenue of $${(sales_amount_usd / 1000).toFixed(0)}K proves that real customers are willing to pay. This is the strongest form of market validation — stronger than funding, stronger than user signups. It significantly reduces the risk of building something nobody wants.`,
        threshold: "Is revenue > $0? (Yes: +5 bonus points)",
        benchmark: "Only ~40% of seed-stage startups have any revenue. Those that do are 2x more likely to reach Series A.",
      });
    } else {
      score_breakdown.push({
        criterion: "Revenue Validation",
        value: "$0 — no revenue yet",
        impact: 0,
        max_impact: 5,
        direction: "negative",
        explanation: "No revenue means the startup has not yet proven that customers will pay for the product. This is expected for very early-stage startups, but it increases the risk that the product-market fit assumption is wrong.",
        threshold: "Is revenue > $0? (Yes: +5 bonus points)",
        benchmark: "Only ~40% of seed-stage startups have any revenue. Those that do are 2x more likely to reach Series A.",
      });
    }

    // Risk analysis
    const risks: string[] = [];
    if (!has_previous_exit) {
      risks.push(`First-time founder execution risk: Industry data shows ~75% of first-time founders fail to reach Series A. Mitigated if team has strong domain expertise or early revenue traction.`);
    }
    if (funding_rounds <= 1 && funding_total_usd > 0) {
      risks.push(`Single-round dependency: ${funding_total_usd > 0 ? `$${(funding_total_usd/1000).toFixed(0)}K` : 'No'} from one round. If the lead investor does not follow on, the startup may not survive to the next milestone. This is the #1 cause of death for early-stage startups in the region.`);
    }
    if (sales_amount_usd === 0) {
      risks.push(`No revenue validation: The startup has not yet demonstrated willingness of customers to pay. For ${is_b2b ? "B2B" : "B2C"} ${industry.toLowerCase()} companies, the average time to first revenue is 8-14 months from MVP.`);
    }
    if (team_size < 4 && team_size > 0) {
      risks.push(`Team capacity risk: With only ${team_size} ${team_size === 1 ? 'person' : 'people'}, the startup may struggle to execute on product development, sales, and operations simultaneously. Recommended minimum team size for this stage: 4-6.`);
    }
    if (risks.length === 0) {
      risks.push("No significant structural risks identified. The startup shows strong fundamentals across team, funding, and market positioning.");
    }

    // Market Research
    const md: Record<string, MarketResearch> = {
      SaaS: { tam: '$12.4B', sam: '$890M', som: '$18M', som_explanation: 'With high competition and established global players, a new B2B SaaS startup can realistically capture 1-3% of SAM. Early revenue and a niche vertical focus are critical to reaching $18M+ in 5 years.', market_viable: true, capture_potential: 'Moderate', growth_rate: '22.3% CAGR', competition: 'High', key_trends: ['Cloud adoption accelerating across Uzbekistan enterprises', 'Government digitalization mandate driving B2B SaaS demand', 'Low local SaaS saturation — first-mover advantages'], assessment: `The Central Asian SaaS market is in early growth. Uzbekistan's government is pushing digital transformation across ministries and SOEs, creating forced demand for B2B software. Enterprise cloud penetration is only 8-12% vs 35-45% in developed markets. This gap is the opportunity and the risk — the market exists but requires education and adaptation to local practices.` },
      Fintech: { tam: '$8.7B', sam: '$1.2B', som: '$12M', som_explanation: 'Fintech is crowded with well-funded players (Uzum, Payme). A new entrant without a specific niche can capture 0.5-1.5% of SAM. Niche focus (e.g., SME lending, trade finance) could push this to 2-3%.', market_viable: true, capture_potential: 'Low', growth_rate: '28.1% CAGR', competition: 'High', key_trends: ['Central bank licensing 15+ new digital banks by 2026', 'Mobile banking penetration jumped from 18% to 42% in 2 years', 'Cross-border payments remain a major SME pain point'], assessment: `Uzbekistan's fintech is the most active sector in Central Asia. Regulatory sandboxes and fast-tracked licenses help, but 40+ fintech startups compete for 36M people. Success requires a specific niche — generic plays struggle against Uzum ($150M+ raised) and Payme.` },
      EdTech: { tam: '$5.2B', sam: '$340M', som: '$15M', som_explanation: 'With $200M government commitment and moderate competition, a B2B EdTech startup can capture 3-5% of SAM. B2C EdTech is limited by low household spend — B2B is the viable path to $15M+.', market_viable: true, capture_potential: 'Moderate', growth_rate: '19.7% CAGR', competition: 'Moderate', key_trends: ['Government investing $200M in digital education infrastructure', 'STEM demand growing 25% year-over-year', 'Corporate training market underpenetrated by technology'], assessment: `EdTech benefits from strong government support — $200M committed to digitize 80% of schools by 2027. But B2C is price-sensitive ($15-30/year household spend on EdTech). B2B (corporate training, school management) has significantly better unit economics.` },
      AgriTech: { tam: '$3.8B', sam: '$520M', som: '$26M', som_explanation: 'Low competition and massive greenfield opportunity (3% tech adoption). An AgriTech startup with government subsidy access can capture 4-6% of SAM — one of the highest capture potentials in the region.', market_viable: true, capture_potential: 'High', growth_rate: '15.4% CAGR', competition: 'Low', key_trends: ['Agriculture employs 27% of workforce but only 3% use tech', 'Government subsidies for precision agriculture', 'Export-oriented horticulture driving supply chain demand'], assessment: `Agriculture is Uzbekistan's #2 sector, yet only 3% of farms use digital tools — massive greenfield opportunity. The biggest challenge is last-mile distribution to rural areas with limited internet and low digital literacy.` },
      HealthTech: { tam: '$6.1B', sam: '$280M', som: '$8M', som_explanation: 'Moderate competition but slow 12-18 month procurement cycles and strict medical regulations limit capture to 2-4% of SAM. Regulatory compliance costs are a significant barrier for early-stage startups.', market_viable: true, capture_potential: 'Low', growth_rate: '24.8% CAGR', competition: 'Moderate', key_trends: ['Telemedicine legalized and insurance expanded in 2024', 'Medical data digitization mandate for all clinics by 2026', 'Shortage of 12,000 doctors driving AI diagnostics demand'], assessment: `Healthcare is modernizing fast — EHR mandate by 2026, telemedicine insurance coverage expanded. Doctor-to-patient ratio is 1:1,200 (3x worse than WHO recommends). Procurement cycles are slow (12-18 months) and medical software regulations are stringent.` },
      'E-commerce': { tam: '$9.3B', sam: '$1.8B', som: '$9M', som_explanation: 'Uzum Mall and olcha.uz control ~70% of the market. A new e-commerce player without a specific vertical niche can only capture 0.3-0.8% of SAM. Vertical specialization (fashion, electronics, groceries) is essential.', market_viable: false, capture_potential: 'Low', growth_rate: '31.2% CAGR', competition: 'High', key_trends: ['E-commerce grew 65% in 2024 — fastest in Central Asia', 'Uzum Mall and olcha.uz dominate but verticals still open', '$500M in new warehouse investments improving logistics'], assessment: `65% growth in 2024, but Uzum Mall and olcha.uz control ~70% of the market. New entrants need specific vertical niches. Last-mile delivery outside Tashkent costs 2-3x more than in the capital.` },
      LogTech: { tam: '$4.2B', sam: '$380M', som: '$19M', som_explanation: 'Low competition and only 15% tech adoption among logistics firms. A LogTech startup can capture 4-6% of SAM by targeting cross-border trade corridors and SEZ-based warehouses.', market_viable: true, capture_potential: 'High', growth_rate: '17.6% CAGR', competition: 'Low', key_trends: ['Cross-border trade with China/Kazakhstan growing 20% annually', 'Only 15% of logistics companies use route optimization', '14 special economic zones driving warehousing demand'], assessment: `Uzbekistan is a natural logistics hub between China, Kazakhstan, and Afghanistan. 14 SEZs with simplified customs. Only 15% of logistics firms use optimization software. Sales cycles are long (6-12 months) and customers are price-sensitive.` },
      CyberSec: { tam: '$2.8B', sam: '$190M', som: '$10M', som_explanation: 'Low competition with near-zero local vendors. A local CyberSec startup can capture 4-6% of SAM by replacing expensive imported solutions. Regulatory mandate (annual audits) provides guaranteed demand.', market_viable: true, capture_potential: 'High', growth_rate: '26.3% CAGR', competition: 'Low', key_trends: ['Mandatory cybersecurity audits for financial institutions since 2024', 'Zero local enterprise-grade vendors — all imports', 'Government building national SOC'], assessment: `New regulations force financial institutions into annual audits, creating demand. Nearly all solutions are imported (mostly Russian), opening space for local vendors. The challenge: most enterprises don't prioritize cybersecurity until after a breach.` },
      'AI/ML': { tam: '$7.5B', sam: '$410M', som: '$8M', som_explanation: 'Fastest-growing sector but most local AI startups are pre-revenue. Capture potential is 1-3% of SAM — realistic only for startups with specific vertical AI applications and paying customers.', market_viable: true, capture_potential: 'Low', growth_rate: '34.2% CAGR', competition: 'Moderate', key_trends: ['Government AI strategy with $100M allocation', 'Uzbek language NLP severely underdeveloped', '3,000+ CS graduates/year from local universities'], assessment: `Fastest-growing sector with $100M government AI fund. The unique opportunity is Uzbek-language NLP for 35M speakers. However, most local AI startups are pre-revenue and rely on consulting/grants.` },
      GovTech: { tam: '$3.1B', sam: '$450M', som: '$14M', som_explanation: 'Government is an active buyer but sales cycles are 12-24 months. A GovTech startup can capture 2-4% of SAM by winning 2-3 government contracts. Over-reliance on a single client is the key risk.', market_viable: true, capture_potential: 'Moderate', growth_rate: '20.8% CAGR', competition: 'Moderate', key_trends: ['E-government processing 50M+ transactions/year', 'Smart City Tashkent with $300M budget', 'Open data portals enabling civic tech'], assessment: `Government is an active buyer — 50M+ e-gov transactions/year, $300M Smart City budget. But sales cycles are 12-24 months, payments can be delayed, and over-reliance on a single government client is a key risk.` },
    };
    const defaultMarket: MarketResearch = { tam: '$4.5B', sam: '$310M', som: '$12M', som_explanation: 'Without clear differentiation or early revenue, this startup can realistically capture 3-5% of SAM in its first 3-5 years.', market_viable: true, capture_potential: 'Moderate', growth_rate: '18.5% CAGR', competition: 'Moderate', key_trends: ['Digital adoption accelerating across all sectors', 'Local talent pool growing with expanding CS programs', 'Regional market underserved by global platforms'], assessment: `The Central Asian tech market is in early growth with significant untapped potential. Local startups understand regional business practices, regulations, and language better than global platforms. The key challenge is building sustainable revenue in a price-sensitive market.` };
    const market_research = md[industry] || defaultMarket;

    // Macroeconomic Analysis
    const mi: Record<string, MacroAnalysis> = {
      Fintech: { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'Medium', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `Fintech regulation is evolving rapidly — 12 regulatory updates in 2024 alone. This creates barriers to entry (positive for incumbents) but uncertainty for startups. 9.8% inflation impacts lending economics. Currency depreciation creates cross-border payment complexities but also demand for local fintech solutions.` },
      HealthTech: { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'High', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `Medical software must comply with Ministry of Health certification and data localization (patient data on Uzbek servers). Budget allocations prioritize infrastructure over technology. Healthcare receives a small share of the $2.8B FDI inflow.` },
      CyberSec: { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'High', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `New laws require 24-hour incident reporting and certified security products — 6-12 month approval process creates a moat but also a barrier. Most budgets go to hardware (firewalls) not software platforms.` },
      'AI/ML': { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'Low', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `No specific AI laws — low barriers but no protection from global competition. 5.5% GDP growth and 3,000+ CS graduates/year are strong tailwinds. 9.8% inflation drives demand for cost-saving automation.` },
      'E-commerce': { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'Medium', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `Import duties (15-30%) make cross-border expensive, benefiting local platforms. Young demographic (median age 29) is a tailwind. But 9.8% inflation directly reduces discretionary spending and e-commerce order volumes.` },
      GovTech: { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'High', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `Government procurement involves complex bureaucracy, mandatory tenders, and 60-90 day payment terms. Data localization requires servers in Uzbekistan. The positive: dedicated budget for digital transformation with specific allocations.` },
    };
    const defaultMacro: MacroAnalysis = { gdp_growth: '5.5%', inflation: '9.8%', regulatory_risk: 'Medium', foreign_investment_trend: 'FDI up 23% YoY to $2.8B', currency_stability: 'UZS depreciated 8% vs USD in 2024', assessment: `Uzbekistan's 5.5% GDP growth is among the highest in the CIS, driven by liberalization, privatization, and growing FDI. Key risks: 9.8% inflation (above 8% target), 8% currency depreciation, and evolving regulation. For ${industry.toLowerCase()}, the most relevant factor is the government's digital transformation commitment.` };
    const macro_analysis = mi[industry] || defaultMacro;

  return {
    id,
    name: input.name,
    industry,
    description: input.description ?? `${is_b2b ? "B2B" : "B2C"} ${industry.toLowerCase()} platform for the Central Asian market`,
    is_b2b,
    team_size,
    funding_total_usd,
    funding_rounds,
    time_to_first_funding_months,
    has_previous_exit,
    founder_name: input.founder_name || "Not provided",
    founder_role: "CEO",
    website: input.website ?? "",
    sales_amount_usd,
    score,
    verdict,
    strengths,
    red_flags,
    decision_path,
    risks,
    market_research,
    macro_analysis,
    score_breakdown,
  };
}

function generateStartups(): Startup[] {
  const startups: Startup[] = [];
  for (let i = 0; i < 50; i++) {
    const industry = industries[i % industries.length];
    const is_b2b = b2bIndustries.has(industry);
    const has_previous_exit = rand() < 0.15;
    const team_size = Math.max(1, Math.round(rand() * 25 + 1));
    const funding_total_usd = Math.round((rand() * 2000000 + (has_previous_exit ? 500000 : 0)) / 10000) * 10000;
    const funding_rounds = funding_total_usd === 0 ? 0 : Math.max(1, Math.min(4, Math.round(Math.log2(funding_total_usd / 50000 + 1))));
    const time_to_first_funding_months = funding_rounds === 0 ? 0 : Math.max(1, Math.round(rand() * 24 + 2));
    const sales_amount_usd = rand() < 0.6 ? 0 : Math.round(rand() * 100000);
    startups.push(
      evaluateStartup(
        {
          name: startupNames[i] || `Startup ${i + 1}`,
          industry,
          is_b2b,
          team_size,
          funding_total_usd,
          funding_rounds,
          time_to_first_funding_months,
          has_previous_exit,
          sales_amount_usd,
          founder_name: founderNames[i % founderNames.length],
          website: i % 3 === 0 ? `${startupNames[i]?.toLowerCase().replace(/\s+/g, "") || "startup"}.uz` : "",
        },
        i + 1,
        Math.round(rand() * 10 - 5)
      )
    );
  }
  startups.sort((a, b) => b.score - a.score);
  return startups;
}

export const mockStartups = generateStartups();