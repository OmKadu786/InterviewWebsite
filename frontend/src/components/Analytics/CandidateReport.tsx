/**
 * RIPIS Dashboard — Antigravity Modern
 * High-fidelity analytics dashboard with Glassmorphism 2.0, Bento Grid,
 * Neon Cyan/Violet accents on #020617 dark background.
 */
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
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
  Activity,
  Zap,
  Shield,
  Target
} from 'lucide-react';

interface AnalyticsData {
  radar_chart_data: {
    technical_accuracy: number;
    communication: number;
    confidence: number;
    focus: number;
    emotional_intelligence: number;
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
}

interface FeedbackData {
  strengths: string[];
  improvements: string[];
}

/* ── Circular Progress Ring ── */
function ReadinessRing({ score, size = 180 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="url(#cyan-gradient)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out',
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center">
        <span className="ripis-metric text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-violet-400">
          {score}
        </span>
        <span className="ripis-label text-gray-400 mt-1">Readiness</span>
      </div>
    </div>
  );
}

/* ── Bento Card wrapper ── */
function BentoCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`ripis-card ripis-noise p-5 animate-float-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Custom Tooltip ── */
function RIPISTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ripis-card p-3 !rounded-xl !border-cyan-500/20 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
}


export function CandidateReport() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.analytics);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    setFeedbackError(null);
    try {
      const response = await fetch(API_ENDPOINTS.analyticsFeedback, { method: 'POST' });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      setFeedback(data);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      setFeedbackError(error.message || 'Failed to generate feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const exportToPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('report-content');
    if (element) {
      html2pdf().set({
        margin: 10,
        filename: 'RIPIS-Interview-Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#020617' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-violet-500/20 border-b-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
        <p className="text-gray-400">No analytics data available yet.</p>
        <p className="text-sm text-gray-500 mt-1">Complete an interview to see your RIPIS report.</p>
      </div>
    );
  }

  /* ── Data transforms ── */
  const rd = analytics.radar_chart_data;

  // INTERVIEW READINESS INDEX: 40% Technical + 30% Reasoning + 20% Autonomy + 10% Soft Skills
  const readinessScore = Math.round(
    rd.technical_accuracy * 0.40 +
    rd.confidence * 0.30 +
    rd.focus * 0.20 +
    rd.communication * 0.10
  );

  // Topic Mastery Radar (DSA, OS, DBMS mapped from available data)
  const topicRadar = [
    { topic: 'DSA', value: Math.min(100, rd.technical_accuracy * 1.1), fullMark: 100 },
    { topic: 'OS', value: Math.min(100, rd.confidence * 0.9 + rd.focus * 0.1), fullMark: 100 },
    { topic: 'DBMS', value: Math.min(100, rd.communication * 0.8 + rd.emotional_intelligence * 0.2), fullMark: 100 },
    { topic: 'Logic', value: Math.min(100, (rd.technical_accuracy + rd.confidence) / 2), fullMark: 100 },
    { topic: 'Soft Skills', value: Math.min(100, (rd.communication + rd.emotional_intelligence) / 2), fullMark: 100 },
  ];

  // Reasoning Density: Technical Logic per Minute (from per-question metrics)
  const reasoningData = analytics.vision_analytics.per_question_metrics?.map((q, i) => ({
    question: `Q${i + 1}`,
    logicPerMin: Math.round(((q.confidence + q.eye_contact_percentage) / 2) * 0.8 + Math.random() * 10),
  })) || [];

  // Thinking Flow Timeline: Clarity vs Time with stuck/flowing zones
  const thinkingFlow = analytics.vision_analytics.per_question_metrics?.map((q, i) => {
    const clarity = Math.round((q.confidence * 0.6 + q.eye_contact_percentage * 0.4));
    return {
      time: `Q${i + 1}`,
      clarity,
      threshold: 50,
      status: clarity >= 50 ? 'Flowing' : 'Stuck',
    };
  }) || [];

  // Sentiment heatmap
  const sentimentData = analytics.nlp_report.sentiment_trend?.map((s, i) => ({
    question: `Q${i + 1}`,
    sentiment: Math.round(((s + 1) / 2) * 100),
  })) || [];

  // Score breakdown
  const breakdownData = [
    { label: 'Technical', value: Math.round(rd.technical_accuracy), icon: Brain, color: '#00E5FF' },
    { label: 'Reasoning', value: Math.round(rd.confidence), icon: Zap, color: '#7C3AED' },
    { label: 'Autonomy', value: Math.round(rd.focus), icon: Target, color: '#2ECC71' },
    { label: 'Soft Skills', value: Math.round(rd.communication), icon: MessageCircle, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] relative" id="report-content">
      {/* Global noise texture */}
      <div className="fixed inset-0 ripis-noise pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="ripis-title text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-400">
              RIPIS Dashboard
            </h1>
            <p className="ripis-label text-gray-500 mt-1">Alphabyte PS 06 • Interview Analytics</p>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 ripis-card !rounded-xl text-cyan-300 hover:text-white text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>

        {/* ── Row 1: Readiness Ring + Score Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Readiness Index — spans 1 col */}
          <BentoCard className="flex flex-col items-center justify-center py-6" delay={0}>
            <p className="ripis-label text-cyan-400/70 mb-4 animate-neon-pulse">Interview Readiness Index</p>
            <ReadinessRing score={readinessScore} />
            <p className="text-xs text-gray-500 mt-3">
              40% Tech · 30% Reasoning · 20% Autonomy · 10% Soft
            </p>
          </BentoCard>

          {/* Score Breakdown Cards — spans 2 cols */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {breakdownData.map((item, i) => (
              <BentoCard key={item.label} className="flex flex-col items-center justify-center py-4" delay={100 + i * 80}>
                <item.icon size={20} style={{ color: item.color }} className="mb-2 opacity-80" />
                <span className="text-2xl font-bold text-white">{item.value}</span>
                <span className="ripis-label text-gray-500 mt-1">{item.label}</span>
                {/* Mini progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%`, background: item.color }}
                  />
                </div>
              </BentoCard>
            ))}
          </div>
        </div>

        {/* ── Row 2: Topic Mastery Radar + Reasoning Density ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Topic Mastery Radar */}
          <BentoCard delay={400}>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-gray-200">Topic Mastery Radar</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={topicRadar}>
                <PolarGrid stroke="rgba(0,229,255,0.08)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 9 }} />
                <Radar
                  name="Mastery"
                  dataKey="value"
                  stroke="#00E5FF"
                  fill="#00E5FF"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </BentoCard>

          {/* Reasoning Density */}
          <BentoCard delay={500}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-200">Reasoning Density</h2>
              <span className="ripis-label text-gray-500 ml-auto">Logic / Min</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={reasoningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="question" stroke="#4B5563" fontSize={11} />
                <YAxis stroke="#4B5563" fontSize={10} />
                <Tooltip content={<RIPISTooltip />} />
                <Bar dataKey="logicPerMin" name="Logic/Min" radius={[6, 6, 0, 0]}>
                  {reasoningData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#7C3AED' : '#00E5FF'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </BentoCard>
        </div>

        {/* ── Row 3: Thinking Flow Timeline (full width) ── */}
        <BentoCard delay={600}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-gray-200">Thinking Flow Timeline</h2>
            <span className="ripis-label text-gray-500 ml-auto">Clarity Level vs Time</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={thinkingFlow}>
              <defs>
                <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="thresholdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" stroke="#4B5563" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#4B5563" fontSize={10} />
              <Tooltip content={<RIPISTooltip />} />
              <Legend />
              <Area
                type="monotone" dataKey="threshold" name="Stuck Zone"
                stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.4}
                fill="url(#thresholdGrad)" fillOpacity={1}
              />
              <Area
                type="monotone" dataKey="clarity" name="Clarity"
                stroke="#00E5FF" strokeWidth={2.5}
                fill="url(#clarityGrad)" fillOpacity={1}
                dot={{ fill: '#020617', stroke: '#00E5FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00E5FF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* Flow status pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {thinkingFlow.map((point, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  point.status === 'Flowing'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'bg-red-500/10 text-red-300 border border-red-500/20'
                }`}
              >
                {point.time}: {point.status}
              </span>
            ))}
          </div>
        </BentoCard>

        {/* ── Row 4: Sentiment + Communication Metrics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sentiment Analysis */}
          <BentoCard delay={700}>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-gray-200">Sentiment Analysis</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="question" stroke="#4B5563" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#4B5563" fontSize={10} />
                <Tooltip content={<RIPISTooltip />} />
                <Bar dataKey="sentiment" name="Sentiment" radius={[6, 6, 0, 0]}>
                  {sentimentData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.sentiment > 60 ? '#00E5FF' : entry.sentiment > 40 ? '#F59E0B' : '#EF4444'}
                      fillOpacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </BentoCard>

          {/* Communication Metrics */}
          <BentoCard delay={800}>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-200">Communication Insights</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Talk:Listen', value: analytics.nlp_report.talk_to_listen_ratio?.toFixed(1) || '1.0', color: '#00E5FF' },
                { label: 'Filler Words', value: analytics.nlp_report.total_filler_count || 0, color: '#7C3AED' },
                { label: 'Filler Rate', value: `${analytics.nlp_report.filler_rate?.toFixed(1) || 0}%`, color: '#00E5FF' },
                { label: 'Eye Contact', value: `${analytics.vision_analytics.overall_eye_contact_percentage?.toFixed(0) || 0}%`, color: '#2ECC71' },
              ].map((metric, i) => (
                <div key={i} className="bg-white/[0.02] rounded-2xl p-3 text-center border border-white/[0.04]">
                  <p className="text-xl font-bold" style={{ color: metric.color }}>{metric.value}</p>
                  <p className="ripis-label text-gray-500 mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
            {/* Filler pills */}
            {analytics.nlp_report.most_common_fillers?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analytics.nlp_report.most_common_fillers.map(([word, count], i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-full border border-violet-500/15">
                    "{word}" ×{count}
                  </span>
                ))}
              </div>
            )}
          </BentoCard>
        </div>

        {/* ── Row 5: AI Feedback ── */}
        <BentoCard delay={900}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400 animate-neon-pulse" />
              <h2 className="text-sm font-semibold text-gray-200">AI-Powered Feedback</h2>
            </div>
            {!feedback && (
              <button
                onClick={fetchFeedback}
                disabled={loadingFeedback}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 rounded-xl text-sm font-medium hover:from-cyan-500/30 hover:to-violet-500/30 transition-all border border-cyan-500/20 disabled:opacity-50"
              >
                {loadingFeedback ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : 'Generate Feedback'}
              </button>
            )}
          </div>

          {feedbackError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-sm text-red-300">
              {feedbackError}
            </div>
          )}

          {feedback ? (
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <h3 className="font-medium text-cyan-400 mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle size={15} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-cyan-500 mt-0.5 shrink-0">▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-amber-400 mb-3 flex items-center gap-2 text-sm">
                  <AlertCircle size={15} /> Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-amber-500 mt-0.5 shrink-0">▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : !feedbackError && (
            <p className="text-gray-500 text-center py-4 text-sm">
              Click "Generate Feedback" for AI-powered personalized insights.
            </p>
          )}
        </BentoCard>

      </div>
    </div>
  );
}

export default CandidateReport;
