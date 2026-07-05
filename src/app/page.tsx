'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { mockStartups, type Startup } from '@/lib/mock-data';
import {
  LayoutDashboard, Rows3, BookOpen, Search, ChevronRight, ChevronDown,
  Download, Play, ArrowLeft, ArrowUpRight, CircleCheck, TriangleAlert, CircleX,
} from 'lucide-react';

type View = 'overview' | 'apps' | 'methodology';
type Filter = 'all' | 'high' | 'moderate' | 'low';

const VERDICT = {
  high: { label: 'Pursue', text: 'text-good', bg: 'bg-good', soft: 'bg-good-soft', hex: '#187a3f' },
  moderate: { label: 'Review', text: 'text-warn', bg: 'bg-warn', soft: 'bg-warn-soft', hex: '#9a6407' },
  low: { label: 'Pass', text: 'text-bad', bg: 'bg-bad', soft: 'bg-bad-soft', hex: '#b23325' },
} as const;

const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v > 0 ? `$${(v / 1000).toFixed(0)}K` : '—';
const fmtMoney0 = (v: number) => (v > 0 ? fmtMoney(v) : '$0');

const counts = {
  all: mockStartups.length,
  high: mockStartups.filter((s) => s.verdict === 'high').length,
  moderate: mockStartups.filter((s) => s.verdict === 'moderate').length,
  low: mockStartups.filter((s) => s.verdict === 'low').length,
};

/* ---------- shared primitives ---------- */

function VerdictChip({ verdict, size = 'sm' }: { verdict: Startup['verdict']; size?: 'sm' | 'md' }) {
  const v = VERDICT[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${v.soft} ${v.text} ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${v.bg}`} />
      {v.label}
    </span>
  );
}

function ScoreRing({ score, verdict, size = 56 }: { score: number; verdict: Startup['verdict']; size?: number }) {
  const v = VERDICT[verdict];
  return (
    <div
      className="rounded-full grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${v.hex} ${score * 3.6}deg, var(--tint) 0deg)`,
      }}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <div
        className="rounded-full bg-pane grid place-items-center font-mono font-semibold"
        style={{ width: size - 12, height: size - 12, fontSize: size / 3.2 }}
      >
        {score}
      </div>
    </div>
  );
}

function Card({ title, aside, children, className = '' }: {
  title?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-pane border border-line rounded-xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-1">
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {aside}
        </div>
      )}
      <div className="px-5 pb-5 pt-3">{children}</div>
    </section>
  );
}

function exportCsv(data: Startup[]) {
  const rows = [
    ['Company', 'Industry', 'Model', 'Team', 'Funding USD', 'Rounds', 'Score', 'Verdict'],
    ...data.map((s) => [
      s.name, s.industry, s.is_b2b ? 'B2B' : 'B2C', s.team_size,
      s.funding_total_usd, s.funding_rounds, s.score, VERDICT[s.verdict].label,
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dealflow-screening-results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ========== OVERVIEW ========== */

function OverviewView({ onOpenStartup }: { onOpenStartup: (id: number) => void }) {
  const avgScore = Math.round(mockStartups.reduce((a, s) => a + s.score, 0) / mockStartups.length);
  const b2bShare = Math.round((mockStartups.filter((s) => s.is_b2b).length / mockStartups.length) * 100);

  const buckets = useMemo(() => {
    const b = Array.from({ length: 10 }, () => 0);
    mockStartups.forEach((s) => b[Math.min(9, Math.floor(s.score / 10))]++);
    return b;
  }, []);
  const maxBucket = Math.max(...buckets);

  const sectors = useMemo(() => {
    const m = new Map<string, number>();
    mockStartups.forEach((s) => m.set(s.industry, (m.get(s.industry) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);
  const maxSector = sectors.length ? sectors[0][1] : 1;

  const topRanked = useMemo(
    () => [...mockStartups].sort((a, b) => b.score - a.score).slice(0, 5),
    []
  );

  return (
    <div className="view-enter p-5 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Cohort overview</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            2026 cohort · {counts.all} applications screened in 3.2s
          </p>
        </div>
        <button
          onClick={() => exportCsv(mockStartups)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-2 bg-pane border border-line rounded-lg px-3.5 py-2 hover:bg-tint transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Screened', value: String(counts.all), sub: 'applications', color: 'text-ink' },
          { label: 'Pursue', value: String(counts.high), sub: `${Math.round((counts.high / counts.all) * 100)}% of cohort`, color: 'text-good' },
          { label: 'Average score', value: String(avgScore), sub: 'out of 100', color: 'text-ink' },
          { label: 'B2B share', value: `${b2bShare}%`, sub: 'higher survival rate', color: 'text-ink' },
        ].map((k, i) => (
          <div key={i} className="bg-pane border border-line rounded-xl px-4 py-3.5">
            <div className="microlabel">{k.label}</div>
            <div className={`font-mono text-2xl font-semibold mt-1 ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-ink-3 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Score distribution */}
        <Card title="Score distribution" className="lg:col-span-3">
          <div className="flex items-end gap-1.5 h-32">
            {buckets.map((n, i) => {
              const color = i <= 2 ? 'bg-bad/70' : i <= 5 ? 'bg-warn/70' : 'bg-good/80';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-ink-3">{n > 0 ? n : ''}</span>
                  <div
                    className={`w-full rounded-t ${n > 0 ? color : 'bg-tint'}`}
                    style={{ height: `${n > 0 ? Math.max(6, (n / maxBucket) * 100) : 4}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-ink-3">
            <span>0</span><span>50</span><span>100</span>
          </div>
          {/* Verdict split */}
          <div className="mt-5 pt-4 border-t border-line">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-good" style={{ width: `${(counts.high / counts.all) * 100}%` }} />
              <div className="bg-warn" style={{ width: `${(counts.moderate / counts.all) * 100}%` }} />
              <div className="bg-bad" style={{ width: `${(counts.low / counts.all) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-xs text-ink-2">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-good" /> Pursue {counts.high}</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warn" /> Review {counts.moderate}</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-bad" /> Pass {counts.low}</span>
            </div>
          </div>
        </Card>

        {/* Sectors */}
        <Card title="Top sectors" className="lg:col-span-2">
          <div className="space-y-3">
            {sectors.map(([name, n]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-ink-2 w-20 shrink-0 truncate">{name}</span>
                <div className="flex-1 h-2 bg-tint rounded-full overflow-hidden">
                  <div className="h-full bg-accent/70 rounded-full" style={{ width: `${(n / maxSector) * 100}%` }} />
                </div>
                <span className="font-mono text-xs text-ink-2 w-5 text-right">{n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top ranked */}
      <Card
        title="Top ranked"
        aside={
          <button
            onClick={() => onOpenStartup(topRanked[0].id)}
            className="text-xs font-medium text-accent hover:text-accent-deep inline-flex items-center gap-1"
          >
            View all applications <ArrowUpRight className="w-3 h-3" />
          </button>
        }
      >
        <div className="divide-y divide-line -mx-5">
          {topRanked.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onOpenStartup(s.id)}
              className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-tint/50 transition-colors group"
            >
              <span className="font-mono text-xs text-ink-3 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink group-hover:text-accent-deep transition-colors">{s.name}</div>
                <div className="text-[11px] text-ink-3">{s.industry} · {s.is_b2b ? 'B2B' : 'B2C'} · team {s.team_size}</div>
              </div>
              <span className="font-mono text-sm font-semibold">{s.score}</span>
              <VerdictChip verdict={s.verdict} />
              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ========== APPLICATIONS: LIST + DETAIL ========== */

function AppsView({
  filter, setFilter, selectedId, setSelectedId,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  selectedId: number | null;
  setSelectedId: (id: number) => void;
}) {
  const [search, setSearch] = useState('');
  const [mobileDetail, setMobileDetail] = useState(selectedId !== null);

  const filtered = useMemo(() => {
    let data = mockStartups;
    if (filter !== 'all') data = data.filter((s) => s.verdict === filter);
    if (search)
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.industry.toLowerCase().includes(search.toLowerCase())
      );
    return [...data].sort((a, b) => b.score - a.score);
  }, [filter, search]);

  const selected = mockStartups.find((s) => s.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((s) => s.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId, setSelectedId]);

  const moveSelection = useCallback(
    (dir: 1 | -1) => {
      if (!filtered.length) return;
      const idx = filtered.findIndex((s) => s.id === selected?.id);
      const next = filtered[Math.min(filtered.length - 1, Math.max(0, idx + dir))];
      if (next) setSelectedId(next.id);
    },
    [filtered, selected, setSelectedId]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
      if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveSelection]);

  const tabs: { key: Filter; label: string; dot?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'Pursue', dot: 'bg-good' },
    { key: 'moderate', label: 'Review', dot: 'bg-warn' },
    { key: 'low', label: 'Pass', dot: 'bg-bad' },
  ];

  return (
    <div className="view-enter flex h-full min-h-0">
      {/* List pane */}
      <div className={`${mobileDetail ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-80 xl:w-88 shrink-0 border-r border-line bg-pane min-h-0`}>
        <div className="p-3.5 border-b border-line space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3" />
            <input
              placeholder="Search name or sector"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-canvas border border-line rounded-lg pl-8 pr-3 py-1.5 text-[13px] placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filter === t.key ? 'bg-ink text-white' : 'text-ink-2 hover:bg-tint'
                }`}
              >
                {t.dot && <span className={`w-1.5 h-1.5 rounded-full ${filter === t.key ? 'bg-white' : t.dot}`} />}
                {t.label}
                <span className={filter === t.key ? 'text-white/60' : 'text-ink-3'}>{counts[t.key]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-[13px] text-ink-3 text-center py-10">No matches — adjust the search or filter.</p>
          )}
          {filtered.map((s) => {
            const active = selected?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedId(s.id); setMobileDetail(true); }}
                className={`w-full text-left px-3.5 py-3 border-b border-line/70 transition-colors ${
                  active ? 'bg-accent-soft' : 'hover:bg-tint/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[13px] font-medium truncate ${active ? 'text-accent-deep' : 'text-ink'}`}>
                    {s.name}
                  </span>
                  <span className="font-mono text-[13px] font-semibold shrink-0">{s.score}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[11px] text-ink-3 truncate">
                    {s.industry} · {s.is_b2b ? 'B2B' : 'B2C'} · team {s.team_size}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${VERDICT[s.verdict].bg}`} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-3.5 py-2 border-t border-line flex items-center justify-between">
          <span className="text-[11px] text-ink-3">{filtered.length} shown</span>
          <span className="hidden lg:block text-[11px] text-ink-3 font-mono">↑↓ / j k to navigate</span>
        </div>
      </div>

      {/* Detail pane */}
      <div className={`${mobileDetail ? 'flex' : 'hidden'} lg:flex flex-col flex-1 min-w-0 min-h-0`}>
        {selected ? (
          <DetailPane startup={selected} onBack={() => setMobileDetail(false)} />
        ) : (
          <div className="flex-1 grid place-items-center text-[13px] text-ink-3">Select an application</div>
        )}
      </div>
    </div>
  );
}

/* ========== DETAIL PANE — THE MEMO ========== */

function DetailPane({ startup, onBack }: { startup: Startup; onBack: () => void }) {
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);
  const baseScore = 30;
  const totalPositive = startup.score_breakdown.filter((f) => f.impact > 0).reduce((s, f) => s + f.impact, 0);
  const totalNegative = startup.score_breakdown.filter((f) => f.impact < 0).reduce((s, f) => s + Math.abs(f.impact), 0);
  const mr = startup.market_research;
  const ma = startup.macro_analysis;

  useEffect(() => setExpandedFactor(null), [startup.id]);

  return (
    <>
      {/* Sticky header */}
      <div className="border-b border-line bg-pane px-5 lg:px-7 py-4">
        <button
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 hover:text-ink mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All applications
        </button>
        <div className="flex items-center gap-4">
          <ScoreRing score={startup.score} verdict={startup.verdict} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-semibold tracking-tight truncate">{startup.name}</h1>
              <VerdictChip verdict={startup.verdict} size="md" />
            </div>
            <p className="text-[13px] text-ink-2 mt-0.5 truncate">{startup.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[11px] text-ink-3">
              <span>{startup.industry} · {startup.is_b2b ? 'B2B' : 'B2C'}</span>
              <span>Team {startup.team_size}</span>
              <span>{fmtMoney0(startup.funding_total_usd)} raised · {startup.funding_rounds} {startup.funding_rounds === 1 ? 'round' : 'rounds'}</span>
              <span>{startup.founder_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-canvas">
        <div className="p-5 lg:p-7 max-w-3xl space-y-4">

          {/* Why this score */}
          <Card
            title="Why this score"
            aside={
              <span className="font-mono text-[11px] text-ink-3">
                {baseScore} base <span className="text-good">+{totalPositive}</span>
                {totalNegative > 0 && <span className="text-bad"> −{totalNegative}</span>}
                <span className="font-semibold text-ink"> = {startup.score}</span>
              </span>
            }
          >
            <div className="divide-y divide-line -mx-5">
              {startup.score_breakdown.map((factor, i) => {
                const isExpanded = expandedFactor === i;
                const impactColor = factor.impact > 0 ? 'text-good' : factor.impact < 0 ? 'text-bad' : 'text-ink-3';
                const barColor = factor.direction === 'positive' ? 'bg-good' : factor.direction === 'negative' ? 'bg-bad' : 'bg-ink-3';
                const barWidth = factor.max_impact > 0 ? `${(Math.abs(factor.impact) / factor.max_impact) * 100}%` : '0%';
                return (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedFactor(isExpanded ? null : i)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${isExpanded ? 'bg-tint/40' : 'hover:bg-tint/40'}`}
                    >
                      <span className="text-[13px] font-medium text-ink w-40 lg:w-48 shrink-0 leading-snug">{factor.criterion}</span>
                      <span className="flex-1 h-1.5 bg-tint rounded-full overflow-hidden">
                        <span className={`block h-full rounded-full ${barColor}`} style={{ width: barWidth, minWidth: factor.impact !== 0 ? '5px' : '0' }} />
                      </span>
                      <span className="hidden sm:block text-[11px] text-ink-3 w-36 text-right truncate">{factor.value}</span>
                      <span className={`font-mono text-xs font-semibold w-9 text-right ${impactColor}`}>
                        {factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-ink-3 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-tint/40">
                        <p className="text-[13px] leading-relaxed text-ink-2">{factor.explanation}</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {factor.threshold && (
                            <div className="bg-pane border border-line rounded-lg p-3">
                              <div className="microlabel mb-1">Scoring rule</div>
                              <p className="text-xs leading-snug text-ink">{factor.threshold}</p>
                            </div>
                          )}
                          {factor.benchmark && (
                            <div className="bg-pane border border-line rounded-lg p-3">
                              <div className="microlabel mb-1">Industry benchmark</div>
                              <p className="text-xs leading-snug text-ink-2">{factor.benchmark}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-ink-3 pt-3">Click a criterion for the rule and benchmark behind it.</p>
          </Card>

          {/* Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Strengths">
              <ul className="space-y-2.5">
                {startup.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
                    <CircleCheck className="w-3.5 h-3.5 text-good shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Red flags">
              <ul className="space-y-2.5">
                {startup.red_flags.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
                    <CircleX className="w-3.5 h-3.5 text-bad shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Decision path */}
          <Card title="Decision path" aside={<span className="microlabel">Audit log</span>}>
            <div className="bg-code rounded-lg px-4 py-4 font-mono text-xs leading-6 overflow-x-auto">
              {startup.decision_path.map((step, i) => {
                const color = step.includes('INVEST')
                  ? 'text-[#7fd39a] font-semibold'
                  : step.includes('PASS')
                  ? 'text-[#f09a83] font-semibold'
                  : step.includes('REVIEW')
                  ? 'text-[#e2bb6d] font-semibold'
                  : step.includes('→ Yes')
                  ? 'text-[#7fd39a]'
                  : step.includes('→ No')
                  ? 'text-[#f09a83]'
                  : 'text-[#b9bdc7]';
                return (
                  <div key={i} style={{ paddingLeft: `${i * 2}ch` }} className="whitespace-nowrap">
                    {i > 0 && <span className="text-[#565b66]">└─ </span>}
                    <span className={color}>{step}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-ink-3 mt-3">
              The exact path the decision tree followed — each node a yes/no question, every step auditable.
            </p>
          </Card>

          {/* Risk assessment */}
          <Card title="Risk assessment">
            <div className="space-y-5">
              <div>
                <div className="microlabel mb-2">Execution</div>
                <div className="space-y-2">
                  {startup.risks.map((risk, i) => (
                    <div key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-2">
                      <TriangleAlert className="w-3.5 h-3.5 text-warn shrink-0 mt-0.5" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="microlabel mb-2">Market</div>
                <ul className="space-y-2 text-[13px] leading-snug text-ink-2">
                  {mr.competition === 'High' ? (
                    <>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-bad shrink-0 mt-1.5" />High competition in {startup.industry} — established players and well-funded competitors dominate</li>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-bad shrink-0 mt-1.5" />Differentiation is critical to stand out</li>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0 mt-1.5" />Market growth of {mr.growth_rate} is strong, but competition may compress margins</li>
                    </>
                  ) : mr.competition === 'Low' ? (
                    <>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-good shrink-0 mt-1.5" />Low competition in {startup.industry} — few local players exist</li>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-good shrink-0 mt-1.5" />First-mover advantages available</li>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0 mt-1.5" />Market is less proven — may require education and customer development effort</li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0 mt-1.5" />Moderate competition in {startup.industry} — demand is validated but not saturated</li>
                      <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0 mt-1.5" />Positioning and speed of execution will determine market share</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <div className="microlabel mb-2">Macroeconomic</div>
                <ul className="space-y-2 text-[13px] leading-snug text-ink-2">
                  <li className="flex gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${ma.regulatory_risk === 'High' ? 'bg-bad' : ma.regulatory_risk === 'Medium' ? 'bg-warn' : 'bg-good'}`} />
                    {ma.regulatory_risk === 'High'
                      ? 'High regulatory risk — compliance adds 6–12 months to sales cycles, local certification required'
                      : ma.regulatory_risk === 'Medium'
                      ? 'Moderate regulatory environment — manageable compliance, changes tend to be industry-friendly'
                      : 'Low regulatory risk — minimal compliance burden, faster go-to-market'}
                  </li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-ink-3 shrink-0 mt-1.5" />Inflation at {ma.inflation} erodes purchasing power</li>
                  <li className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-ink-3 shrink-0 mt-1.5" />{ma.currency_stability}</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Market research */}
          <Card
            title={`Market — ${startup.industry}`}
            aside={
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${mr.market_viable ? 'text-good' : 'text-bad'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${mr.market_viable ? 'bg-good' : 'bg-bad'}`} />
                {mr.market_viable ? 'Market viable' : 'Market challenged'}
              </span>
            }
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'TAM', value: mr.tam, sub: 'Total addressable', color: 'text-ink' },
                { label: 'SAM', value: mr.sam, sub: 'Serviceable', color: 'text-ink' },
                {
                  label: 'SOM', value: mr.som, sub: `Capture: ${mr.capture_potential}`,
                  color: mr.capture_potential === 'High' ? 'text-good' : mr.capture_potential === 'Low' ? 'text-bad' : 'text-warn',
                },
              ].map((cell, i) => (
                <div key={i} className="bg-canvas border border-line rounded-lg px-3 py-2.5">
                  <div className="microlabel">{cell.label}</div>
                  <div className={`font-mono text-lg font-semibold mt-0.5 ${cell.color}`}>{cell.value}</div>
                  <div className="text-[10px] text-ink-3 mt-0.5">{cell.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center justify-between bg-canvas border border-line rounded-lg px-3 py-2.5">
                <span className="text-xs text-ink-3">Market growth</span>
                <span className="font-mono text-[13px] font-semibold text-good">{mr.growth_rate}</span>
              </div>
              <div className="flex items-center justify-between bg-canvas border border-line rounded-lg px-3 py-2.5">
                <span className="text-xs text-ink-3">Competition</span>
                <span className={`font-mono text-[13px] font-semibold ${mr.competition === 'Low' ? 'text-good' : mr.competition === 'High' ? 'text-bad' : 'text-warn'}`}>
                  {mr.competition}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="microlabel mb-1.5">Can this business capture the market?</div>
              <p className="text-[13px] leading-relaxed text-ink-2">{mr.som_explanation}</p>
            </div>
            <div className="mt-4">
              <div className="microlabel mb-2">Key trends</div>
              <ul className="space-y-1.5 text-[13px] leading-snug text-ink-2">
                {mr.key_trends.map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0 mt-1.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink border-l-2 border-accent pl-3">{mr.assessment}</p>
          </Card>

          {/* Macro context */}
          <Card title="Macro context — Uzbekistan">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'GDP growth', value: ma.gdp_growth, color: 'text-ink' },
                { label: 'Inflation', value: ma.inflation, color: 'text-warn' },
                {
                  label: 'Reg. risk', value: ma.regulatory_risk,
                  color: ma.regulatory_risk === 'Low' ? 'text-good' : ma.regulatory_risk === 'High' ? 'text-bad' : 'text-warn',
                },
                { label: 'FDI trend', value: 'Up 23%', color: 'text-good' },
                { label: 'Currency', value: '−8% UZS', color: 'text-warn' },
              ].map((cell, i) => (
                <div key={i} className="bg-canvas border border-line rounded-lg px-3 py-2.5">
                  <div className="microlabel">{cell.label}</div>
                  <div className={`font-mono text-[13px] font-semibold mt-1 ${cell.color}`}>{cell.value}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{ma.assessment}</p>
            <p className="text-[11px] text-ink-3 mt-3">
              Sources: State Statistics Committee and World Bank, Uzbekistan 2024 indicators.
            </p>
          </Card>

          {/* Application data */}
          <Card title="Application data">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Industry', value: startup.industry },
                { label: 'Business model', value: startup.is_b2b ? 'B2B' : 'B2C' },
                { label: 'Team size', value: `${startup.team_size} people` },
                { label: 'Total funding', value: fmtMoney0(startup.funding_total_usd) },
                { label: 'Funding rounds', value: String(startup.funding_rounds) },
                {
                  label: 'Time to first funding',
                  value: startup.time_to_first_funding_months > 0 ? `${startup.time_to_first_funding_months} months` : 'N/A',
                },
                { label: 'Previous founder exit', value: startup.has_previous_exit ? 'Yes' : 'No' },
                { label: 'Revenue', value: fmtMoney0(startup.sales_amount_usd) },
                { label: 'Founder', value: startup.founder_name },
              ].map((item, i) => (
                <div key={i} className="bg-canvas border border-line rounded-lg px-3 py-2.5">
                  <div className="microlabel">{item.label}</div>
                  <div className="text-[13px] font-medium text-ink mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ========== METHODOLOGY ========== */

function MethodologyView() {
  const steps = [
    {
      num: '01', title: 'Input',
      desc: 'Startups enter via CSV upload (batch), manual form entry, or URL scraping. Works even for early-stage startups with no website — just 6–7 basic data points.',
    },
    {
      num: '02', title: 'Evaluation',
      desc: 'A trained decision-tree ML model evaluates each startup on funding history, team composition, market type (B2B vs B2C), time-to-funding velocity, and founder track record.',
    },
    {
      num: '03', title: 'Ranked output',
      desc: 'Every startup receives a confidence score (0–100), a list of strengths, a list of red flags with written explanations, and the exact decision-tree path showing the logic.',
    },
  ];

  const criteria = [
    { name: 'Previous founder exits', desc: 'Has the founder built and sold a company before?' },
    { name: 'Total funding raised', desc: 'Cumulative capital raised to date (USD)' },
    { name: 'Number of funding rounds', desc: 'How many distinct funding rounds completed' },
    { name: 'Time to first funding', desc: 'Months from founding to first investment' },
    { name: 'Business model', desc: 'B2B vs B2C — B2B has higher survival rates' },
    { name: 'Team size', desc: 'Total full-time team members' },
  ];

  return (
    <div className="view-enter p-5 lg:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Methodology</h1>
        <p className="text-[13px] text-ink-3 mt-0.5">
          A transparent, three-step process from raw application to recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) => (
          <Card key={step.num}>
            <div className="flex gap-4">
              <span className="font-mono text-sm text-accent font-semibold">{step.num}</span>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-ink-2 mt-1">{step.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-code rounded-xl px-6 py-6">
        <div className="microlabel !text-[#8b8f99]">Model transparency</div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
          {[
            { value: '40,000+', label: 'Real startup outcomes (training data)' },
            { value: 'Decision tree', label: 'Fully interpretable ML model' },
            { value: '6', label: 'Core evaluation criteria' },
            { value: '85%+', label: 'Accuracy on test data' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-mono text-xl font-semibold text-white">{stat.value}</div>
              <div className="text-[11px] text-[#9ba0ab] mt-1 leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Card title="The six criteria">
        <div className="divide-y divide-line -mx-5">
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-4 px-5 py-3">
              <span className="font-mono text-xs text-ink-3 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <span className="text-[13px] font-medium text-ink">{c.name}</span>
                <span className="text-[13px] text-ink-2">{c.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ========== APP SHELL ========== */

export default function Home() {
  const [view, setView] = useState<View>('overview');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [screening, setScreening] = useState(false);

  const openStartup = (id: number) => {
    setSelectedId(id);
    setFilter('all');
    setView('apps');
  };

  const runScreen = () => {
    if (screening) return;
    setScreening(true);
    setTimeout(() => {
      setScreening(false);
      setFilter('all');
      setView('apps');
    }, 1800);
  };

  const nav: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'apps', label: 'Applications', icon: <Rows3 className="w-4 h-4" /> },
    { key: 'methodology', label: 'Methodology', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const verdictNav: { key: Filter; label: string; dot: string; count: number }[] = [
    { key: 'high', label: 'Pursue', dot: 'bg-good', count: counts.high },
    { key: 'moderate', label: 'Review', dot: 'bg-warn', count: counts.moderate },
    { key: 'low', label: 'Pass', dot: 'bg-bad', count: counts.low },
  ];

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-canvas text-ink overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-line bg-pane">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line">
          <span className="w-7 h-7 rounded-lg bg-accent grid place-items-center font-mono text-[11px] font-semibold text-white">
            DF
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">DealFlow AI</div>
            <div className="text-[10px] text-ink-3">IT-Park Ventures · pilot</div>
          </div>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => { setView(n.key); if (n.key === 'apps') setFilter('all'); }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                view === n.key ? 'bg-accent-soft text-accent-deep' : 'text-ink-2 hover:bg-tint'
              }`}
            >
              {n.icon}
              {n.label}
              {n.key === 'apps' && <span className="ml-auto font-mono text-[11px] text-ink-3">{counts.all}</span>}
            </button>
          ))}
          <div className="pt-4 pb-1 px-2.5 microlabel">Verdicts</div>
          {verdictNav.map((v) => (
            <button
              key={v.key}
              onClick={() => { setFilter(v.key); setView('apps'); }}
              className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                view === 'apps' && filter === v.key ? 'bg-tint text-ink font-medium' : 'text-ink-2 hover:bg-tint'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              {v.label}
              <span className="ml-auto font-mono text-[11px] text-ink-3">{v.count}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-line space-y-2">
          <button
            onClick={runScreen}
            disabled={screening}
            className="relative w-full overflow-hidden inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-white text-[13px] font-medium py-2.5 hover:bg-accent-deep transition-colors disabled:opacity-90"
          >
            {screening ? (
              <>
                <span className="absolute inset-y-0 w-1/3 bg-white/20 scanbar" />
                Screening 50 applications…
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Run screen
              </>
            )}
          </button>
          <p className="text-[10px] text-ink-3 text-center">2026 cohort · 3.2s per batch</p>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="lg:hidden border-b border-line bg-pane">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-accent grid place-items-center font-mono text-[10px] font-semibold text-white">DF</span>
            <span className="text-[13px] font-semibold">DealFlow AI</span>
          </div>
          <button
            onClick={runScreen}
            disabled={screening}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-white text-xs font-medium px-3 py-1.5"
          >
            <Play className="w-3 h-3" /> {screening ? 'Screening…' : 'Run screen'}
          </button>
        </div>
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => { setView(n.key); if (n.key === 'apps') setFilter('all'); }}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === n.key ? 'bg-accent-soft text-accent-deep' : 'text-ink-2'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <div className={`flex-1 min-h-0 ${view === 'apps' ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {view === 'overview' && <OverviewView onOpenStartup={openStartup} />}
          {view === 'apps' && (
            <AppsView filter={filter} setFilter={setFilter} selectedId={selectedId} setSelectedId={setSelectedId} />
          )}
          {view === 'methodology' && <MethodologyView />}
        </div>
      </main>
    </div>
  );
}
