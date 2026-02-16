/**
 * CandidateReport — RIPIS Antigravity Modern Dashboard
 * Glassmorphism 2.0 dark-mode dashboard with Bento Grid layout,
 * neon Cyan/Violet accents, noise-grain texture, and interactive charts.
 */
import { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Download,
  TrendingUp,
  Eye,
  MessageCircle,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Award,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { Badge } from '../Badge';
import { BADGES, BADGE_CATEGORY_LABELS, BadgeCategory } from '../../data/badges';
import { evaluateEarnedBadges, WeaknessInput } from '../../data/badgeEvaluator';

/* ─── Types ───────────────────────────────────────────── */
interface AnalyticsData {
  radar_chart_data: {
    technical_accuracy: number;
    communication: number;
    confidence: number;
    focus: number;
    emotional_intelligence: number;
    reasoning?: number;
    autonomy?: number;
  };
  vision_analytics: {
    overall_eye_contact_percentage: number;
    overall_steadiness_percentage: number;
    per_question_metrics: Array<{
      question_index: number;
      eye_contact_percentage: number;
      confidence: number;
    }>;
  };
  nlp_report: {
    total_filler_count: number;
    filler_rate: number;
    talk_to_listen_ratio: number;
    most_common_fillers: Array<[string, number]>;
    sentiment_trend: number[];
  };
  scoring_summary: {
    average_score: number;
    scores_over_time: number[];
  };
  topic_mastery?: Record<string, number>;
  clarity_timeline?: Array<{ question: string; clarity: number; status: string }>;
}

interface FeedbackData {
  strengths: string[];
  improvements: string[];
}

/* ─── Noise SVG for grain texture ────────────────────── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/* ─── Reusable Card with noise grain ─────────────────── */
const RCard = ({ children, className = '', span = '' }: { children: React.ReactNode; className?: string; span?: string }) => (
  <div className={`relative overflow-hidden rounded-[24px] bg-[#020617]/60 backdrop-blur-xl border-[0.5px] border-cyan-500/12 transition-all duration-300 hover:border-cyan-500/25 hover:shadow-[0_0_30px_rgba(0,229,255,0.06)] ${span} ${className}`}>
    {/* noise grain */}
    <div className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-[0.03]"
      style={{ backgroundImage: NOISE_SVG, backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />
    <div className="relative z-[2] p-5">
      {children}
    </div>
  </div>
);

/* ─── Section Label ──────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="uppercase tracking-[0.08em] font-medium text-cyan-400/70" style={{ fontSize: 'clamp(0.65rem, 1vw, 0.8rem)' }}>
    {children}
  </p>
);

/* ─── Circular Progress Ring (SVG) ───────────────────── */
const ReadinessRing = ({ score }: { score: number }) => {
  const size = 180;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (score / 100) * C;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="drop-shadow-[0_0_20px_rgba(0,229,255,0.3)]">
        <defs>
          <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#cyan-gradient)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        <text x="50%" y="46%" textAnchor="middle" fill="#00E5FF" fontSize="clamp(2rem, 4vw, 3.5rem)" fontWeight="800">{score}</text>
        <text x="50%" y="62%" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12" fontWeight="500">/ 100</text>
      </svg>
      <p className="uppercase tracking-[0.08em] text-xs font-medium text-cyan-400/60">Interview Readiness Index</p>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────── */
export function CandidateReport() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [weakness, setWeakness] = useState<WeaknessInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => { fetchAnalytics(); fetchWeakness(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.analytics);
      setAnalytics(await res.json());
    } catch (e) { console.error('Analytics fetch error:', e); }
    finally { setLoading(false); }
  };

  const fetchWeakness = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.uploadResume.replace('/upload-resume', '')}/api/session/weakness-analysis`);
      if (res.ok) setWeakness(await res.json());
    } catch (e) { console.error('Weakness fetch skipped:', e); }
  };

  const earnedBadges = useMemo(() => evaluateEarnedBadges(analytics as any, weakness), [analytics, weakness]);
  const badgesByCategory = useMemo(() => {
    const groups: Partial<Record<BadgeCategory, string[]>> = {};
    for (const id of earnedBadges) {
      const badge = BADGES[id];
      if (!badge) continue;
      if (!groups[badge.category]) groups[badge.category] = [];
      groups[badge.category]!.push(id);
    }
    return groups;
  }, [earnedBadges]);

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const res = await fetch(API_ENDPOINTS.analyticsFeedback, { method: 'POST' });
      setFeedback(await res.json());
    } catch (e) { console.error('Feedback error:', e); }
    finally { setLoadingFeedback(false); }
  };

  const exportToPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const el = document.getElementById('report-content');
    if (el) html2pdf().set({ margin: 10, filename: 'hirebyte-ripis-report.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: '#020617' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save();
  };

  /* ─── Loading / Empty ──── */
  if (loading) return (
    <div className="flex items-center justify-center h-96 bg-[#020617]">
      <div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
    </div>
  );
  if (!analytics) return (
    <div className="text-center py-12 bg-[#020617] min-h-screen">
      <p className="text-gray-500">No analytics data available yet.</p>
      <p className="text-sm text-gray-600 mt-2">Complete an interview to see your RIPIS report.</p>
    </div>
  );

  /* ─── Data transforms ──── */
  const rd = analytics.radar_chart_data;
  const technical = rd.technical_accuracy || 0;
  const reasoning = rd.reasoning ?? ((technical + (rd.confidence || 0)) / 2);
  const autonomy = rd.autonomy ?? 80;
  const softSkills = ((rd.communication || 0) + (rd.emotional_intelligence || 0)) / 2;

  // RIPIS weighted score
  const readinessScore = Math.round(
    technical * 0.40 + reasoning * 0.30 + autonomy * 0.20 + softSkills * 0.10
  );

  // Topic mastery radar data
  const topicData = Object.entries(analytics.topic_mastery || {
    DSA: technical * 0.9, OS: technical * 0.85, DBMS: technical * 0.8,
    Networking: rd.communication * 0.7, 'Soft Skills': softSkills * 0.9
  }).map(([key, val]) => ({ topic: key, value: Math.round(val as number), fullMark: 100 }));

  // Reasoning density: logic-per-minute approximation
  const reasoningDensity = analytics.vision_analytics.per_question_metrics?.map((q, i) => ({
    question: `Q${i + 1}`,
    logicPerMin: Math.round(((q.confidence || 50) + (q.eye_contact_percentage || 50)) / 2 * 1.2)
  })) || [];

  // Clarity flow timeline
  const clarityData = analytics.clarity_timeline?.length
    ? analytics.clarity_timeline
    : analytics.vision_analytics.per_question_metrics?.map((q, i) => ({
      question: `Q${i + 1}`,
      clarity: Math.round(((q.confidence || 50) + (q.eye_contact_percentage || 50)) / 2),
      status: ((q.confidence || 50) + (q.eye_contact_percentage || 50)) / 2 >= 60 ? 'flowing' : 'stuck'
    })) || [];

  // Confidence over time
  const confidenceData = analytics.vision_analytics.per_question_metrics?.map((q, i) => ({
    question: `Q${i + 1}`, confidence: q.confidence || 0, eyeContact: q.eye_contact_percentage || 0
  })) || [];

  // Weight breakdown
  const weightBreakdown = [
    { label: 'Technical', value: Math.round(technical), weight: '40%', color: '#00E5FF' },
    { label: 'Reasoning', value: Math.round(reasoning), weight: '30%', color: '#8B5CF6' },
    { label: 'Autonomy', value: Math.round(autonomy), weight: '20%', color: '#2DD4BF' },
    { label: 'Soft Skills', value: Math.round(softSkills), weight: '10%', color: '#F472B6' },
  ];

  /* ─── Tooltip style ──── */
  const tooltipStyle = { backgroundColor: '#0A0F1E', border: '1px solid rgba(0,229,255,0.15)', borderRadius: '12px' };

  /* ─── Render ──── */
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 lg:p-8">
      <div id="report-content" className="max-w-[1400px] mx-auto space-y-5">

        {/* ════ Header ════ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }} className="font-bold tracking-tight text-white">
              RIPIS Dashboard
            </h1>
            <p className="text-cyan-400/50 text-sm mt-0.5">Powered by HireByte — Antigravity Modern</p>
          </div>
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors">
            <Download size={16} /> Export PDF
          </button>
        </div>

        {/* ════ Row 1: Readiness Ring + Weight Breakdown ════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Readiness Ring */}
          <RCard span="md:col-span-1 lg:col-span-1">
            <SectionLabel>Interview Readiness</SectionLabel>
            <div className="flex items-center justify-center mt-4">
              <ReadinessRing score={readinessScore} />
            </div>
          </RCard>

          {/* Weight Breakdown */}
          <RCard span="md:col-span-1 lg:col-span-1">
            <SectionLabel>Score Breakdown</SectionLabel>
            <div className="mt-4 space-y-3">
              {weightBreakdown.map(w => (
                <div key={w.label} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-20">{w.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w.value}%`, backgroundColor: w.color }} />
                  </div>
                  <span className="text-xs font-mono text-white/80 w-8 text-right">{w.value}</span>
                  <span className="text-[10px] text-white/30 w-8">{w.weight}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/20 mt-3 italic">Formula: 40% Tech + 30% Reasoning + 20% Autonomy + 10% Soft Skills</p>
          </RCard>

          {/* Quick Stats */}
          <RCard span="md:col-span-2 lg:col-span-1">
            <SectionLabel>Quick Stats</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { icon: <Eye size={14} />, label: 'Eye Contact', val: `${analytics.vision_analytics.overall_eye_contact_percentage?.toFixed(0) || 0}%`, color: 'text-cyan-400' },
                { icon: <MessageCircle size={14} />, label: 'Filler Words', val: analytics.nlp_report.total_filler_count || 0, color: 'text-violet-400' },
                { icon: <Zap size={14} />, label: 'Filler Rate', val: `${analytics.nlp_report.filler_rate?.toFixed(1) || 0}%`, color: 'text-amber-400' },
                { icon: <Activity size={14} />, label: 'Steadiness', val: `${analytics.vision_analytics.overall_steadiness_percentage?.toFixed(0) || 0}%`, color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${s.color} mb-1`}>{s.icon}{s.label}</div>
                  <p className="text-xl font-bold text-white">{s.val}</p>
                </div>
              ))}
            </div>
          </RCard>
        </div>

        {/* ════ Row 2: Topic Mastery Radar + Reasoning Density ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Topic Mastery Radar */}
          <RCard>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-cyan-400" />
              <SectionLabel>Topic Mastery Radar</SectionLabel>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={topicData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Radar name="Mastery" dataKey="value" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </RCard>

          {/* Reasoning Density */}
          <RCard>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-violet-400" />
              <SectionLabel>Reasoning Density — Logic per Minute</SectionLabel>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reasoningDensity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="question" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="logicPerMin" radius={[6, 6, 0, 0]}>
                  {reasoningDensity.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#8B5CF6' : '#6D28D9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </RCard>
        </div>

        {/* ════ Row 3: Thinking Flow Timeline ════ */}
        <RCard>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-400" />
            <SectionLabel>Thinking Flow — Clarity vs Time</SectionLabel>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={clarityData}>
              <defs>
                <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="question" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} />
              <Area type="monotone" dataKey="clarity" stroke="#00E5FF" fill="url(#clarityGrad)" strokeWidth={2} dot={{ fill: '#00E5FF', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Stuck / Flowing labels */}
          <div className="flex flex-wrap gap-2 mt-2">
            {clarityData.map((d: any, i: number) => (
              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${d.status === 'flowing' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                {d.question}: {d.status}
              </span>
            ))}
          </div>
        </RCard>

        {/* ════ Row 4: Confidence Timeline ════ */}
        <RCard>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-cyan-400" />
            <SectionLabel>Confidence & Focus Timeline</SectionLabel>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="question" stroke="rgba(255,255,255,0.3)" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="confidence" stroke="#00E5FF" strokeWidth={2} dot={{ fill: '#00E5FF', r: 3 }} />
              <Line type="monotone" dataKey="eyeContact" stroke="#2DD4BF" strokeWidth={2} dot={{ fill: '#2DD4BF', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </RCard>

        {/* ════ Badges ════ */}
        {earnedBadges.length > 0 && (
          <RCard>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-400" />
              <SectionLabel>Achievements</SectionLabel>
            </div>
            <div className="space-y-4">
              {(Object.entries(badgesByCategory) as [BadgeCategory, string[]][]).map(([cat, ids]) => (
                <div key={cat}>
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">{BADGE_CATEGORY_LABELS[cat]}</p>
                  <div className="flex flex-wrap gap-2">{ids.map(id => <Badge key={id} id={id} />)}</div>
                </div>
              ))}
            </div>
          </RCard>
        )}

        {/* ════ AI Feedback ════ */}
        <RCard>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <SectionLabel>AI-Powered Feedback</SectionLabel>
            </div>
            {!feedback && (
              <button onClick={fetchFeedback} disabled={loadingFeedback}
                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition disabled:opacity-50">
                {loadingFeedback ? 'Generating...' : 'Generate Feedback'}
              </button>
            )}
          </div>
          {feedback ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-emerald-400 mb-3 flex items-center gap-2 text-sm"><CheckCircle size={14} /> Strengths</h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-amber-400 mb-3 flex items-center gap-2 text-sm"><AlertCircle size={14} /> Areas for Improvement</h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm"><span className="text-amber-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-white/30 text-center py-4 text-sm">Click "Generate Feedback" for personalized AI insights.</p>
          )}
        </RCard>

        {/* ════ Filler Words ════ */}
        {analytics.nlp_report.most_common_fillers?.length > 0 && (
          <RCard>
            <SectionLabel>Most Used Filler Words</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {analytics.nlp_report.most_common_fillers.map(([word, count], i) => (
                <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300">
                  "{word}" × {count}
                </span>
              ))}
            </div>
          </RCard>
        )}

      </div>
    </div>
  );
}

export default CandidateReport;
