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
}

const industries = [
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

function generateStartups(): Startup[] {
  const startups: Startup[] = [];
  
  for (let i = 0; i < 50; i++) {
    const industry = industries[i % industries.length];
    const is_b2b = b2bIndustries.has(industry);
    const has_previous_exit = Math.random() < 0.15;
    const team_size = Math.max(1, Math.round(Math.random() * 25 + 1));
    const funding_total_usd = Math.round((Math.random() * 2000000 + (has_previous_exit ? 500000 : 0)) / 10000) * 10000;
    const funding_rounds = funding_total_usd === 0 ? 0 : Math.max(1, Math.min(4, Math.round(Math.log2(funding_total_usd / 50000 + 1))));
    const time_to_first_funding_months = funding_rounds === 0 ? 0 : Math.max(1, Math.round(Math.random() * 24 + 2));
    const sales_amount_usd = Math.random() < 0.6 ? 0 : Math.round(Math.random() * 100000);

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
    score = Math.max(5, Math.min(98, score + Math.round(Math.random() * 10 - 5)));

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

    startups.push({
      id: i + 1,
      name: startupNames[i] || `Startup ${i + 1}`,
      industry,
      description: `${is_b2b ? "B2B" : "B2C"} ${industry.toLowerCase()} platform for the Central Asian market`,
      is_b2b,
      team_size,
      funding_total_usd,
      funding_rounds,
      time_to_first_funding_months,
      has_previous_exit,
      founder_name: founderNames[i % founderNames.length],
      founder_role: "CEO",
      website: i % 3 === 0 ? `${startupNames[i]?.toLowerCase().replace(/\s+/g, "") || "startup"}.uz` : "",
      sales_amount_usd,
      score,
      verdict,
      strengths,
      red_flags,
      decision_path,
      risks,
    });
  }

  // Sort by score descending
  startups.sort((a, b) => b.score - a.score);
  return startups;
}

export const mockStartups = generateStartups();