/**
 * CandidateReport - Main Analytics Dashboard for HireByte
 * Displays comprehensive interview performance analytics with charts and AI feedback.
 */
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  Award
} from 'lucide-react';
import { Badge } from '../Badge';

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

export function CandidateReport() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.analytics);
      const data = await response.json();
      setAnalytics(data);
      // If feedback was already generated and saved (e.g. loading a past interview), display it
      if (data.feedback) {
        setFeedback(data.feedback);
      } else if (data.answer_evaluation && data.answer_evaluation.feedback) {
        // Handle case where feedback might be nested
        setFeedback(data.answer_evaluation.feedback);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const response = await fetch(API_ENDPOINTS.analyticsFeedback, {
        method: 'POST'
      });
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const exportToPDF = async () => {
    // Dynamic import for html2pdf
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('report-content');
    if (element) {
      html2pdf()
        .set({
          margin: 10,
          filename: 'hirebyte-interview-report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-hirebyte-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available yet.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Complete an interview to see your report.</p>
      </div>
    );
  }

  // Transform data for radar chart
  const radarData = [
    { metric: 'Technical', value: analytics.radar_chart_data.technical_accuracy, fullMark: 100 },
    { metric: 'Communication', value: analytics.radar_chart_data.communication, fullMark: 100 },
    { metric: 'Confidence', value: analytics.radar_chart_data.confidence, fullMark: 100 },
    { metric: 'Focus', value: analytics.radar_chart_data.focus, fullMark: 100 },
    { metric: 'EQ', value: analytics.radar_chart_data.emotional_intelligence, fullMark: 100 }
  ];

  // Transform data for line charts
  const confidenceData = analytics.vision_analytics.per_question_metrics?.map((q, i) => ({
    question: `Q${i + 1}`,
    confidence: q.confidence || 0,
    eyeContact: q.eye_contact_percentage || 0
  })) || [];

  // Sentiment heatmap data
  const sentimentData = analytics.nlp_report.sentiment_trend?.map((s, i) => ({
    question: `Q${i + 1}`,
    sentiment: ((s + 1) / 2) * 100 // Map -1,1 to 0,100
  })) || [];

  // Benchmark comparison
  const benchmarkData = [
    { name: 'Your Score', score: analytics.scoring_summary.average_score || 0 },
    { name: 'Average', score: 65 }
  ];

  // Enhanced weighted scoring for more accurate predictions
  // Weights: Communication (25%), Confidence (25%), Technical (20%), Focus (15%), EQ (15%)
  const weights = {
    communication: 0.25,
    confidence: 0.25,
    technical: 0.20,
    focus: 0.15,
    emotional_intelligence: 0.15
  };

  const overallScore = Math.round(
    analytics.radar_chart_data.communication * weights.communication +
    analytics.radar_chart_data.confidence * weights.confidence +
    analytics.radar_chart_data.technical_accuracy * weights.technical +
    analytics.radar_chart_data.focus * weights.focus +
    analytics.radar_chart_data.emotional_intelligence * weights.emotional_intelligence
  );

  // Apply sample size penalty for short interviews (less reliable scores)
  const sampleCount = analytics.vision_analytics.per_question_metrics?.length || 0;
  const adjustedScore = sampleCount < 3
    ? Math.round(overallScore * 0.9) // 10% penalty for very short interviews
    : overallScore;

  // Determine earned badges based on analytics
  const getBadges = () => {
    const earnedBadges: string[] = [];
    const { radar_chart_data, nlp_report, vision_analytics } = analytics;

    // Communication
    if (nlp_report.filler_rate < 3.0) earnedBadges.push('clear_communicator');
    if (nlp_report.total_filler_count < 5) earnedBadges.push('filler_free');
    if (nlp_report.talk_to_listen_ratio >= 0.8 && nlp_report.talk_to_listen_ratio <= 1.5) earnedBadges.push('concise_answerer');

    // Body Language
    if (vision_analytics.overall_eye_contact_percentage > 75) earnedBadges.push('eye_contact_pro');
    if (radar_chart_data.confidence > 80) earnedBadges.push('confident_posture');
    if (radar_chart_data.emotional_intelligence > 80) earnedBadges.push('calm_under_pressure');

    // Answer Quality
    if (radar_chart_data.technical_accuracy > 85) earnedBadges.push('star_method_master');
    if (radar_chart_data.focus > 85) earnedBadges.push('role_relevant_thinker');

    // Achievement
    if (overallScore >= 80) earnedBadges.push('interview_ready');
    if (overallScore >= 90) earnedBadges.push('top_10_percent');
    if (radar_chart_data.technical_accuracy >= 90 && radar_chart_data.communication >= 90) earnedBadges.push('mock_interview_ace');

    return earnedBadges;
  };

  const earnedBadges = getBadges();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div id="report-content" className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Report
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Powered by HireByte
            </p>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-hirebyte-blue text-white rounded-lg hover:bg-opacity-90 transition"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-hirebyte-blue to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm uppercase tracking-wide">Overall Performance</p>
              <p className="text-5xl font-bold mt-2">{overallScore}</p>
              <p className="text-blue-200 mt-1">out of 100</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-hirebyte-mint flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-hirebyte-mint" />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {earnedBadges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-hirebyte-mint" />
              Achievements Unlocked
            </h2>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map(badgeId => (
                <Badge key={badgeId} id={badgeId} />
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Radar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain size={20} className="text-hirebyte-mint" />
              Competency Profile
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#2ECC71"
                  fill="#2ECC71"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Over Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-hirebyte-mint" />
              Confidence & Focus Timeline
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="question" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="confidence" stroke="#003366" strokeWidth={2} dot={{ fill: '#003366' }} />
                <Line type="monotone" dataKey="eyeContact" stroke="#2ECC71" strokeWidth={2} dot={{ fill: '#2ECC71' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-hirebyte-mint" />
              Sentiment Analysis
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="question" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.sentiment > 60 ? '#2ECC71' : entry.sentiment > 40 ? '#F59E0B' : '#EF4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmark */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye size={20} className="text-hirebyte-mint" />
              Benchmark Comparison
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={benchmarkData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  <Cell fill="#003366" />
                  <Cell fill="#6B7280" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NLP Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Communication Insights
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-hirebyte-blue">
                {analytics.nlp_report.talk_to_listen_ratio?.toFixed(1) || '1.0'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Talk-to-Listen Ratio</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-hirebyte-mint">
                {analytics.nlp_report.total_filler_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Filler Words</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-hirebyte-blue">
                {analytics.nlp_report.filler_rate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Filler Rate</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-hirebyte-mint">
                {analytics.vision_analytics.overall_eye_contact_percentage?.toFixed(0) || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Eye Contact</p>
            </div>
          </div>

          {/* Common Fillers */}
          {analytics.nlp_report.most_common_fillers?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Most used filler words:</p>
              <div className="flex flex-wrap gap-2">
                {analytics.nlp_report.most_common_fillers.map(([word, count], i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    "{word}" × {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-hirebyte-mint" />
              AI-Powered Feedback
            </h2>
            {!feedback && (
              <button
                onClick={fetchFeedback}
                disabled={loadingFeedback}
                className="px-4 py-2 bg-hirebyte-mint text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {loadingFeedback ? 'Generating...' : 'Generate Feedback'}
              </button>
            )}
          </div>

          {feedback ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h3 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 mt-1">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 mt-1">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Click "Generate Feedback" to receive AI-powered personalized insights.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default CandidateReport;
