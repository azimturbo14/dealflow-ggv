'use client';

import { useState, useMemo } from 'react';
import { mockStartups, type Startup } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Upload, Search, ArrowLeft, ArrowRight, Filter,
  CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet,
  Zap, Shield, Brain, TreePine, BarChart3, Users,
  Clock, DollarSign, Briefcase, ChevronRight, Download
} from 'lucide-react';

type View = 'home' | 'dashboard' | 'detail' | 'how-it-works';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : score >= 35
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200';
  const label = score >= 65 ? 'HIGH' : score >= 35 ? 'MODERATE' : 'LOW';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {score >= 65 ? <CheckCircle2 className="w-3 h-3" /> : score >= 35 ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label} {score}%
    </span>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 65 ? 'text-emerald-500' : score >= 35 ? 'text-amber-500' : 'text-red-500';
  const bg = score >= 65 ? 'bg-emerald-50' : score >= 35 ? 'bg-amber-50' : 'bg-red-50';
  return (
    <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${bg}`}>
      <div className="text-center">
        <div className={`text-3xl font-bold ${color}`}>{score}</div>
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Score</div>
      </div>
    </div>
  );
}

/* ========== SCREEN 1: HOME / INPUT ========== */
function HomeScreen({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [searchValue, setSearchValue] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleLoadDemo = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      onNavigate('dashboard');
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="max-w-xl w-full text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--df-navy)' }}>
          Evaluate Startups<br />in Seconds, Not Hours
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Transparent AI-powered screening for venture funds.
          See exactly why each startup passes or fails.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-lg border-gray-200/80">
        <CardContent className="p-6 space-y-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter a startup name to evaluate"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button className="h-11 px-6 font-medium" style={{ backgroundColor: 'var(--df-blue)' }}>
              Evaluate
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer group">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            <p className="text-sm font-medium text-foreground">Upload a batch of startups</p>
            <p className="text-xs text-muted-foreground mt-1">Drag & drop CSV file here or click to browse</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-xl mt-6 border-blue-200 bg-blue-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--df-blue-light)' }}>
              <FileSpreadsheet className="w-5 h-5" style={{ color: 'var(--df-blue)' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--df-navy)' }}>
                Try the demo — 50 pre-loaded Central Asian tech startups
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Modeled after typical IT-Park Ventures applicants. Evaluated in seconds.
              </p>
              <Button
                onClick={handleLoadDemo}
                disabled={isEvaluating}
                className="mt-3 h-9 px-5 text-sm font-medium"
                style={{ backgroundColor: 'var(--df-blue)' }}
              >
                {isEvaluating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Evaluating 50 startups...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Load Demo Data <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ========== SCREEN 2: DASHBOARD ========== */
function DashboardScreen({ onSelectStartup, onNavigate }: { onSelectStartup: (s: Startup) => void; onNavigate: (v: View) => void }) {
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 15;

  const filtered = useMemo(() => {
    let data = mockStartups;
    if (filter !== 'all') data = data.filter(s => s.verdict === filter);
    if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.industry.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [filter, search]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const highCount = mockStartups.filter(s => s.verdict === 'high').length;
  const moderateCount = mockStartups.filter(s => s.verdict === 'moderate').length;
  const lowCount = mockStartups.filter(s => s.verdict === 'low').length;

  const filters: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: mockStartups.length },
    { key: 'high', label: 'High Potential', count: highCount },
    { key: 'moderate', label: 'Moderate', count: moderateCount },
    { key: 'low', label: 'Low', count: lowCount },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--df-navy)' }}>Batch Evaluation Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockStartups.length} startups evaluated &middot; {highCount} high potential &middot; 3.2 sec
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label} <span className="text-muted-foreground/60">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search startups..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground w-10">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Startup</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground hidden md:table-cell">Industry</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Team</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Funding</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Score</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => onSelectStartup(s)}
                  className="border-b last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-xs text-muted-foreground">{page * perPage + i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{s.industry} &middot; {s.is_b2b ? 'B2B' : 'B2C'}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs font-normal">{s.industry}</Badge>
                    <span className="text-[10px] text-muted-foreground ml-1.5">{s.is_b2b ? 'B2B' : 'B2C'}</span>
                  </td>
                  <td className="py-3 px-4 text-xs hidden sm:table-cell">{s.team_size} people</td>
                  <td className="py-3 px-4 text-xs hidden lg:table-cell">
                    {s.funding_total_usd > 0 ? `$${(s.funding_total_usd / 1000).toFixed(0)}K` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ScoreBadge score={s.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
          <p className="text-xs text-muted-foreground">
            Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ArrowLeft className="w-3 h-3" />
            </Button>
            {Array.from({ length: Math.ceil(filtered.length / perPage) }, (_, i) => (
              <Button key={i} variant={page === i ? 'default' : 'outline'} size="sm" className="h-7 w-7 p-0 text-xs"
                style={page === i ? { backgroundColor: 'var(--df-blue)' } : {}}
                onClick={() => setPage(i)}>{i + 1}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" disabled={page >= Math.ceil(filtered.length / perPage) - 1} onClick={() => setPage(p => p + 1)}>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ========== SCREEN 3: STARTUP DETAIL ========== */
function DetailScreen({ startup, onBack }: { startup: Startup; onBack: () => void }) {
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null);
  const verdictLabel = startup.score >= 65 ? 'HIGH POTENTIAL' : startup.score >= 35 ? 'MODERATE POTENTIAL' : 'LOW POTENTIAL';
  const verdictBg = startup.score >= 65 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : startup.score >= 35 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700';
  const baseScore = 30;
  const maxPossible = 70;
  const totalPositive = startup.score_breakdown.filter(f => f.impact > 0).reduce((s, f) => s + f.impact, 0);
  const totalNegative = startup.score_breakdown.filter(f => f.impact < 0).reduce((s, f) => s + Math.abs(f.impact), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      {/* Header Card */}
      <Card className="border-gray-200/80 mb-5 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start gap-5 p-6">
            <ScoreCircle score={startup.score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--df-navy)' }}>{startup.name}</h1>
                <Badge className={verdictBg + ' text-xs font-semibold'}>
                  {verdictLabel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{startup.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {startup.industry} &middot; {startup.is_b2b ? 'B2B' : 'B2C'}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Team of {startup.team_size}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {startup.funding_total_usd > 0 ? `$${(startup.funding_total_usd / 1000).toFixed(0)}K raised` : 'No funding'}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {startup.funding_rounds} {startup.funding_rounds === 1 ? 'round' : 'rounds'}</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100">
            <div
              className={`h-full transition-all ${startup.score >= 65 ? 'bg-emerald-500' : startup.score >= 35 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${startup.score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* SCORE BREAKDOWN — THE TRANSPARENCY SECTION */}
      <Card className="border-blue-200/60 mb-5" style={{ backgroundColor: '#F8FAFF' }}>
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--df-navy)' }}>
              <Brain className="w-4 h-4" style={{ color: 'var(--df-blue)' }} /> Why This Score?
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Base: {baseScore}</span>
              <span className="text-emerald-600 font-medium">+{totalPositive} positive</span>
              {totalNegative > 0 && <span className="text-red-600 font-medium">-{totalNegative} negative</span>}
              <span className="font-bold text-foreground">= {startup.score}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-2">
          {startup.score_breakdown.map((factor, i) => {
            const isExpanded = expandedFactor === i;
            const barColor = factor.direction === 'positive' ? 'bg-emerald-500' : factor.direction === 'negative' ? 'bg-red-400' : 'bg-gray-300';
            const barWidth = factor.max_impact > 0 ? `${(Math.abs(factor.impact) / factor.max_impact) * 100}%` : '0%';
            const iconColor = factor.direction === 'positive' ? 'text-emerald-600' : factor.direction === 'negative' ? 'text-red-500' : 'text-gray-400';
            const Icon = factor.direction === 'positive' ? CheckCircle2 : factor.direction === 'negative' ? XCircle : AlertTriangle;

            return (
              <div key={i} className={`rounded-xl border transition-colors ${isExpanded ? 'border-blue-200 bg-white shadow-sm' : 'border-transparent hover:border-gray-200'}`}>
                <button
                  onClick={() => setExpandedFactor(isExpanded ? null : i)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3"
                >
                  <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{factor.criterion}</span>
                      <span className={`text-xs font-bold ${factor.impact > 0 ? 'text-emerald-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {factor.impact > 0 ? `+${factor.impact}` : factor.impact < 0 ? `${factor.impact}` : '0'} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: barWidth, minWidth: factor.impact !== 0 ? '4px' : '0' }} />
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0 w-32 text-right truncate">{factor.value}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3.5">
                      <p className="text-xs text-foreground/80 leading-relaxed">{factor.explanation}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {factor.threshold && (
                        <div className="bg-blue-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-0.5">Scoring Rule</div>
                          <p className="text-[11px] text-blue-800">{factor.threshold}</p>
                        </div>
                      )}
                      {factor.benchmark && (
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Industry Benchmark</div>
                          <p className="text-[11px] text-foreground/70">{factor.benchmark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground pt-2 px-1">
            Click any criterion to see the full explanation, scoring rule, and industry benchmark. All data points come from the startup's application.
          </p>
        </CardContent>
      </Card>

      {/* Strengths + Red Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card className="border-emerald-200/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2.5">
              {startup.strengths.map((s, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-200/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" /> Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2.5">
              {startup.red_flags.map((s, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Decision Tree Logic */}
      <Card className="border-gray-200/80 mb-5">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--df-navy)' }}>
            <TreePine className="w-4 h-4" style={{ color: 'var(--df-blue)' }} /> Decision Tree — The Exact Path
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm leading-7 overflow-x-auto">
            {startup.decision_path.map((step, i) => {
              const indent = i * 3;
              const isResult = step.startsWith('→');
              const isYes = step.includes('→ Yes');
              const isNo = step.includes('→ No');
              return (
                <div key={i} className="flex items-center" style={{ paddingLeft: `${indent}ch` }}>
                  <span className={`${isResult ? (step.includes('INVEST') ? 'text-emerald-400 font-bold' : step.includes('PASS') ? 'text-red-400 font-bold' : 'text-amber-400 font-bold') : isYes ? 'text-emerald-400/80' : isNo ? 'text-red-400/80' : 'text-gray-300'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            This is the exact path the Decision Tree followed. Each node is a yes/no question. The final label is the recommendation. Unlike black-box AI, you can audit every single decision.
          </p>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="border-gray-200/80 mb-5">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--df-navy)' }}>
            <Shield className="w-4 h-4" style={{ color: 'var(--df-blue)' }} /> Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {startup.risks.map((risk, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3.5">
              <p className="text-xs text-foreground/80 leading-relaxed">{risk}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card className="border-gray-200/80">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" /> Raw Application Data
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Industry', value: startup.industry },
              { label: 'Business Model', value: startup.is_b2b ? 'B2B' : 'B2C' },
              { label: 'Team Size', value: `${startup.team_size} people` },
              { label: 'Total Funding', value: startup.funding_total_usd > 0 ? `$${(startup.funding_total_usd / 1000).toFixed(0)}K` : '$0' },
              { label: 'Funding Rounds', value: `${startup.funding_rounds}` },
              { label: 'Time to First Funding', value: startup.time_to_first_funding_months > 0 ? `${startup.time_to_first_funding_months} months` : 'N/A' },
              { label: 'Previous Founder Exit', value: startup.has_previous_exit ? 'Yes' : 'No' },
              { label: 'Revenue', value: startup.sales_amount_usd > 0 ? `$${(startup.sales_amount_usd / 1000).toFixed(0)}K` : '$0' },
              { label: 'Founder', value: startup.founder_name },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--df-navy)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ========== SCREEN 4: HOW IT WORKS ========== */
function HowItWorksScreen({ onNavigate }: { onNavigate: (v: View) => void }) {
  const steps = [
    { icon: <Upload className="w-6 h-6" />, num: '01', title: 'Input', desc: 'Startups enter via CSV upload (batch), manual form entry, or URL scraping. Works even for early-stage startups with no website — just 6-7 basic data points.' },
    { icon: <Brain className="w-6 h-6" />, num: '02', title: 'AI Evaluation', desc: 'A trained Decision Tree ML model evaluates each startup based on: funding history, team composition, market type (B2B vs B2C), time-to-funding velocity, and founder track record.' },
    { icon: <BarChart3 className="w-6 h-6" />, num: '03', title: 'Ranked Results', desc: 'Every startup receives: a confidence score (0-100%), a list of strengths, a list of red flags with written explanations, and the exact decision tree path showing the logic.' },
  ];

  const criteria = [
    { icon: <Users className="w-5 h-5" />, name: 'Previous Founder Exits', desc: 'Has the founder built and sold a company before?' },
    { icon: <DollarSign className="w-5 h-5" />, name: 'Total Funding Raised', desc: 'Cumulative capital raised to date (USD)' },
    { icon: <Zap className="w-5 h-5" />, name: 'Number of Funding Rounds', desc: 'How many distinct funding rounds completed' },
    { icon: <Clock className="w-5 h-5" />, name: 'Time to First Funding', desc: 'Months from founding to first investment' },
    { icon: <Briefcase className="w-5 h-5" />, name: 'Business Model', desc: 'B2B vs B2C — B2B has higher survival rates' },
    { icon: <Users className="w-5 h-5" />, name: 'Team Size', desc: 'Total full-time team members' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--df-navy)' }}>How DealFlow AI Works</h1>
      <p className="text-muted-foreground mb-10">A transparent, three-step process from data input to investment decision.</p>

      {/* 3 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {steps.map((step, i) => (
          <Card key={i} className="border-gray-200/80 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="text-4xl font-bold mb-3" style={{ color: 'var(--df-blue)', opacity: 0.15 }}>{step.num}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--df-blue-light)', color: 'var(--df-blue)' }}>
                {step.icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--df-navy)' }}>{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </CardContent>
            {i < 2 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <div className="w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: 'var(--df-blue)' }}>
                  <ChevronRight className="w-3 h-3" style={{ color: 'var(--df-blue)' }} />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Model Transparency */}
      <Card className="border-gray-200/80 mb-12" style={{ backgroundColor: 'var(--df-navy)' }}>
        <CardContent className="p-6">
          <h2 className="text-white font-bold text-lg mb-4">Model Transparency</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '40,000+', label: 'Real startup outcomes (training data)' },
              { value: 'Decision Tree', label: 'Fully interpretable ML model' },
              { value: '6', label: 'Core evaluation criteria' },
              { value: '85%+', label: 'Accuracy on test data' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6 Criteria */}
      <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--df-navy)' }}>The 6 Evaluation Criteria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {criteria.map((c, i) => (
          <Card key={i} className="border-gray-200/80">
            <CardContent className="p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--df-blue-light)', color: 'var(--df-blue)' }}>
                {c.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--df-navy)' }}>{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ========== MAIN APP ========== */
export default function Home() {
  const [view, setView] = useState<View>('home');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleSelectStartup = (s: Startup) => {
    setSelectedStartup(s);
    setView('detail');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedStartup(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFBFC' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setView('home')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--df-navy)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--df-navy)' }}>
              DealFlow <span style={{ color: 'var(--df-blue)' }}>AI</span>
            </span>
          </button>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setView('how-it-works')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'how-it-works' ? 'bg-blue-50 text-blue-700' : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => setView('home')}
              className="h-8 px-4 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--df-blue)' }}
            >
              Demo
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {view === 'home' && <HomeScreen onNavigate={setView} />}
        {view === 'dashboard' && <DashboardScreen onSelectStartup={handleSelectStartup} onNavigate={setView} />}
        {view === 'detail' && selectedStartup && <DetailScreen startup={selectedStartup} onBack={handleBack} />}
        {view === 'how-it-works' && <HowItWorksScreen onNavigate={setView} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>DealFlow AI — Partnership Proposal for IT-Park Ventures</span>
          <span>Demo Product &middot; 2025</span>
        </div>
      </footer>
    </div>
  );
}