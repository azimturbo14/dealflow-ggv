"use client";

import { FileInput, SlidersHorizontal, ScrollText } from "lucide-react";
import { Card, Meter, SectionLabel } from "@/components/app/primitives";
import { CALIBRATION } from "@/lib/calibration";
import { DEFAULT_PILLAR_WEIGHTS } from "@/lib/mock-data";

const STEPS = [
  {
    icon: FileInput, num: "01", title: "Intake",
    desc: "Companies arrive as a spreadsheet import, a single manual entry, or an uploaded pitch deck / financial model read directly in the browser. Fields are normalised before anything is scored.",
  },
  {
    icon: SlidersHorizontal, num: "02", title: "Four-pillar scoring",
    desc: "Each company is scored across Team & Founder, Traction & Financials, Market & Growth, and Macro & Deal Fit. Market growth is not self-reported — it comes from a regression on the sector's historical market size.",
  },
  {
    icon: ScrollText, num: "03", title: "Transparent output",
    desc: "Every verdict shows the points earned per pillar and factor, a market-forecast chart, strengths, risks, an audit-log decision path, and a data-confidence rating reflecting how complete the submission was.",
  },
];

// "points" below is each pillar's own rubric ceiling (how its sub-score is
// built, unchanged since launch) - NOT how much it moves the final composite
// score. That is a separate, and currently very different, number: see
// DEFAULT_PILLAR_WEIGHTS (src/lib/mock-data.ts), which multiplies each
// pillar's score before the composite is computed. As of 2026-07 that
// multiplier is 0 for Market and Macro and 0 for Team (Traction = 1, i.e.
// 100% of the composite) - see the "CORRECTION" note in calibration.ts for
// why. Pulling the multiplier from DEFAULT_PILLAR_WEIGHTS directly here
// means this page cannot silently drift out of sync with the scoring engine
// the way it did in a previous revision (that bug shipped static "25/30/30/
// 15%" composite-weight labels that no longer matched the engine at all).
const PILLARS = [
  { key: "team" as const, name: "Team & Founder", points: 25, tone: "accent" as const, factors: "Execution track record (prior exit / shipped projects), founder background depth, technical moat (unique tech / patents), and team size." },
  { key: "traction" as const, name: "Traction & Financials", points: 30, tone: "good" as const, factors: "Prior investment, revenue validation, revenue growth, runway, and development stage. Growth and runway come from the financial model when supplied." },
  { key: "market" as const, name: "Market & Growth", points: 30, tone: "warn" as const, factors: "Serviceable market (SAM), regression-projected CAGR, obtainable market (SOM) at exit, and competitive density." },
  { key: "macro" as const, name: "Macro & Deal Fit", points: 15, tone: "ink" as const, factors: "Regulatory environment, geography and currency, capital / FDI trend, and the ask versus a typical early-stage mandate." },
];

const TOTAL_WEIGHT = DEFAULT_PILLAR_WEIGHTS.team + DEFAULT_PILLAR_WEIGHTS.traction + DEFAULT_PILLAR_WEIGHTS.market + DEFAULT_PILLAR_WEIGHTS.macro;
function compositeSharePct(key: keyof typeof DEFAULT_PILLAR_WEIGHTS): number {
  return TOTAL_WEIGHT > 0 ? Math.round((DEFAULT_PILLAR_WEIGHTS[key] / TOTAL_WEIGHT) * 100) : 0;
}

const TONE_HEX = { accent: "bg-accent", good: "bg-good", warn: "bg-warn", ink: "bg-ink-3" };

export function Methodology() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-5 sm:px-8 py-7 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
        <p className="text-[13px] text-ink-3 mt-1">
          A transparent path from a raw company record to a market-aware recommendation.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step) => (
          <Card key={step.num}>
            <div className="flex gap-4">
              <span className="w-9 h-9 rounded-lg bg-tint border border-line grid place-items-center text-ink-2 shrink-0">
                <step.icon className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-accent-deep font-semibold">{step.num}</span>
                  <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-2 mt-1.5">{step.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="The four pillars — 100 rubric points, unevenly weighted today">
        <p className="text-[12.5px] leading-relaxed text-ink-3 mb-4">
          Each pillar still scores on its own rubric out of the points shown below - that part is unchanged.
          But since 2026-07, only Traction &amp; Financials drives the calibrated composite score (100% weight);
          the calibrated model has not yet demonstrated that Team, Market or Macro predict this fund&apos;s real
          decisions at the current sample size (n={CALIBRATION.fitN.positives + CALIBRATION.fitN.negatives}). Team,
          Market and Macro are still fully computed and shown per-company for qualitative review - see{" "}
          <span className="text-ink-2">%</span> of composite below for what actually moves the score today.
        </p>
        <div className="space-y-4">
          {PILLARS.map((p) => {
            const sharePct = compositeSharePct(p.key);
            return (
              <div key={p.name}>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className={`w-2.5 h-2.5 rounded-full ${TONE_HEX[p.tone]}`} />
                  <span className="text-[13px] font-semibold text-ink">{p.name}</span>
                  <span className="font-mono text-[11px] text-ink-3 tabular">{p.points} rubric pts</span>
                  <div className="flex-1 ml-1 min-w-[60px]"><Meter value={p.points} max={30} tone={p.tone} /></div>
                  <span
                    className={`font-mono text-[10.5px] tabular px-1.5 py-0.5 rounded ${sharePct > 0 ? "text-ink-2 bg-tint" : "text-ink-3 bg-canvas border border-line"}`}
                    title="Share of the CALIBRATED composite score, per DEFAULT_PILLAR_WEIGHTS - not the same as the rubric points to the left."
                  >
                    {sharePct}% of composite
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-2 pl-5">{p.factors}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-line-2 grid grid-cols-3 gap-3 text-center">
          {[
            { v: "≥ 70", l: "Pursue", c: "text-good" },
            { v: "45–69", l: "Review", c: "text-warn" },
            { v: "< 45", l: "Pass", c: "text-bad" },
          ].map((t) => (
            <div key={t.l} className="bg-canvas border border-line rounded-lg py-2.5">
              <div className={`font-mono text-lg font-semibold tabular ${t.c}`}>{t.v}</div>
              <div className="microlabel mt-0.5 text-[9px]">{t.l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-code rounded-xl px-6 py-6">
        <SectionLabel className="!text-[#8b8f99]">The market-growth regression</SectionLabel>
        <p className="text-[13px] leading-relaxed text-[#c7cbd4] mt-3">
          For each sector we hold six years of market-size (TAM) history. A log-linear ordinary-least-squares regression
          fits <span className="font-mono text-white">ln(TAM) = a + b·year</span>, so the modeled growth rate is{" "}
          <span className="font-mono text-white">CAGR = e^b − 1</span>. We report the fit quality (R²), project the market
          five years forward with a 95% confidence band, and grow the obtainable market (SOM) at the same rate — a fully
          auditable statistical projection, not a black box.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
          {[
            { value: "4 pillars", label: "Weighted 25 / 30 / 30 / 15" },
            { value: "OLS", label: "Log-linear market regression" },
            { value: "5-year", label: "Forward market projection" },
            { value: "Confidence", label: "Scaled by data completeness" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-lg font-semibold text-white">{stat.value}</div>
              <div className="text-[11px] text-[#9ba0ab] mt-1 leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-code rounded-xl px-6 py-6">
        <SectionLabel className="!text-[#8b8f99]">Calibration &amp; honest limits</SectionLabel>
        <p className="text-[13px] leading-relaxed text-[#c7cbd4] mt-3">
          The 0-100 quality score is converted into a calibrated pursue-probability by fitting a logistic curve
          (Platt scaling) against this fund&apos;s own historical decisions — real, sourced companies from the CRM,
          not synthetic data. That fit is refit every time more decisions are researched into the cohort, and its
          honest, leave-one-out (not in-sample) performance is always shown next to it, not hidden in a changelog.
        </p>
        <p className="text-[13px] leading-relaxed text-[#c7cbd4] mt-3">
          Current fit: <span className="font-mono text-white">{CALIBRATION.fitN.positives + CALIBRATION.fitN.negatives} historical decisions</span> (
          {CALIBRATION.fitN.positives} pursued, {CALIBRATION.fitN.negatives} passed) ·{" "}
          <span className="font-mono text-white">leave-one-out AUC {CALIBRATION.looAuc.toFixed(2)}</span>. That is
          meaningfully above chance (0.50) but still a small, imbalanced sample — this fund has only ever advanced a
          handful of deals past IC discussion in its whole history, which structurally caps how much the positive
          class can grow no matter how much more research goes into this cohort. Use the calibrated probability to{" "}
          <strong className="text-white">prioritize review order</strong>, not as a precision go/no-go gate, until the
          labeled history is materially larger.
        </p>
      </div>

      <Card title="Reading a pitch deck — free, in the browser">
        <p className="text-[13px] leading-relaxed text-ink-2">
          Uploaded pitch decks (PDF) and financial models (XLSX / CSV) are parsed entirely in the browser with pdf.js and
          SheetJS — no server, no API key, no data leaving the page. Extraction pulls out revenue, growth, runway, market
          size, team and ask, then pre-fills the form for the analyst to confirm before scoring. The more the deck reveals,
          the higher the data-confidence rating on the verdict.
        </p>
      </Card>
    </div>
  );
}
