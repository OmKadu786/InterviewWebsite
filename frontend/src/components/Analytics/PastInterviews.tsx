/**
 * PastInterviews - Shows saved interview history from MongoDB
 */
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { Clock, Briefcase, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';

import { Badge } from '../Badge';

interface SavedInterview {
    _id: string;
    saved_at: string;
    job_description: string;
    candidate_summary: string;
    transcript: Array<{ role: string; content: string }>;
    analytics: {
        radar_chart_data: {
            technical_accuracy: number;
            communication: number;
            confidence: number;
            focus: number;
            emotional_intelligence?: number;
        };
        scoring_summary: {
            average_score: number;
        };
        nlp_report?: {
            filler_rate: number;
            total_filler_count: number;
            talk_to_listen_ratio: number;
        };
        vision_analytics?: {
            overall_eye_contact_percentage: number;
        };
    };
    video_metrics_summary: {
        avg_focus: number;
        avg_confidence: number;
    };
    feedback?: {
        strengths: string[];
        improvements: string[];
    };
}

interface PastInterviewsProps {
    onBack: () => void;
}

export function PastInterviews({ onBack }: PastInterviewsProps) {
    const [interviews, setInterviews] = useState<SavedInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<SavedInterview | null>(null);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.interviews);
            const data = await res.json();
            setInterviews(data.interviews || []);
        } catch (err) {
            console.error('Error fetching interviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewDetail = async (id: string) => {
        try {
            const res = await fetch(`${API_ENDPOINTS.interviews}/${id}`);
            const data = await res.json();
            setSelectedDetail(data);
            setSelectedId(id);
        } catch (err) {
            console.error('Error fetching interview detail:', err);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hirebyte-mint"></div>
            </div>
        );
    }

    // Detail view for a single interview
    if (selectedDetail && selectedId) {
        const d = selectedDetail;
        const radar = d.analytics?.radar_chart_data;
        const avgScore = d.analytics?.scoring_summary?.average_score || 0;

        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <button
                    onClick={() => { setSelectedId(null); setSelectedDetail(null); }}
                    className="mb-6 px-4 py-2 text-sm text-hirebyte-mint hover:text-white transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> Back to History
                </button>

                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-1">Interview Report</h2>
                    <p className="text-sm text-muted-foreground mb-4">{formatDate(d.saved_at)}</p>

                    {d.job_description && (
                        <div className="mb-4 p-3 bg-secondary/30 rounded-xl">
                            <span className="text-xs font-medium text-muted-foreground uppercase">Job Description</span>
                            <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{d.job_description.slice(0, 500)}</p>
                        </div>
                    )}

                    {/* Scores */}
                    {radar && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {[
                                { label: 'Technical', value: radar.technical_accuracy },
                                { label: 'Communication', value: radar.communication },
                                { label: 'Confidence', value: radar.confidence },
                                { label: 'Focus', value: radar.focus }
                            ].map((s) => (
                                <div key={s.label} className="bg-secondary/30 rounded-xl p-3 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                                    <p className={`text-2xl font-bold ${getScoreColor(s.value)}`}>{Math.round(s.value)}%</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mb-6">
                        <span className="text-sm text-muted-foreground">Overall Score</span>
                        <p className={`text-4xl font-bold ${getScoreColor(avgScore)}`}>{Math.round(avgScore)}%</p>
                    </div>

                    {/* AI Feedback Section */}
                    {d.feedback && (
                        <div className="mt-6 border-t border-border pt-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-hirebyte-mint" />
                                AI Feedback
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                                    <p className="text-green-500 font-medium mb-2 text-sm uppercase">Strengths</p>
                                    <ul className="space-y-1">
                                        {d.feedback.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-green-100/80 flex items-start gap-2">
                                                <span className="text-green-500 mt-1">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                                    <p className="text-amber-500 font-medium mb-2 text-sm uppercase">Improvements</p>
                                    <ul className="space-y-1">
                                        {d.feedback.improvements.map((s, i) => (
                                            <li key={i} className="text-sm text-amber-100/80 flex items-start gap-2">
                                                <span className="text-amber-500 mt-1">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transcript */}
                {d.transcript && d.transcript.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Transcript ({d.transcript.length} messages)</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {d.transcript.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'ai'
                                        ? 'bg-secondary text-secondary-foreground rounded-tl-none'
                                        : 'bg-primary text-primary-foreground rounded-tr-none'}`}>
                                        <span className="text-xs font-medium opacity-60 block mb-1">
                                            {msg.role === 'ai' ? '🤖 AI Interviewer' : '👤 You'}
                                        </span>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // List view
    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <button
                onClick={onBack}
                className="mb-6 px-4 py-2 text-sm text-hirebyte-mint hover:text-white transition-colors flex items-center gap-1"
            >
                <ArrowLeft size={16} /> Back to Home
            </button>

            <h2 className="text-2xl font-bold mb-6">
                <span className="text-hirebyte-mint">Past</span> Interviews
            </h2>

            {interviews.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No interviews yet</p>
                    <p className="text-sm">Complete your first interview to see it here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {interviews.map((interview) => {
                        const avgScore = interview.analytics?.scoring_summary?.average_score || 0;
                        const messageCount = interview.transcript?.length || 0;

                        return (
                            <button
                                key={interview._id}
                                onClick={() => viewDetail(interview._id)}
                                className="w-full bg-card hover:bg-card/80 border border-border/50 hover:border-hirebyte-mint/30 rounded-xl p-4 flex items-center gap-4 transition-all group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-hirebyte-mint/10 flex items-center justify-center text-hirebyte-mint shrink-0">
                                    <Briefcase size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={12} className="text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{formatDate(interview.saved_at)}</span>
                                    </div>
                                    <p className="text-sm truncate text-muted-foreground">
                                        {interview.job_description?.slice(0, 80) || 'No job description'}
                                        {(interview.job_description?.length || 0) > 80 ? '...' : ''}
                                    </p>

                                    {/* Badges Summary */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(() => {
                                            const badges: string[] = [];
                                            const { analytics, video_metrics_summary } = interview;
                                            const radar = analytics?.radar_chart_data;
                                            const nlp = analytics?.nlp_report;
                                            const score = analytics?.scoring_summary?.average_score || 0;

                                            if (score >= 80) badges.push('interview_ready');
                                            if (radar?.technical_accuracy && radar.technical_accuracy > 85) badges.push('star_method_master');
                                            if (nlp && nlp.filler_rate < 3) badges.push('clear_communicator');
                                            if (video_metrics_summary?.avg_confidence && video_metrics_summary.avg_confidence > 80) badges.push('confident_posture');

                                            return badges.slice(0, 3).map(b => (
                                                <div key={b} className="transform scale-90 origin-left">
                                                    <Badge id={b} />
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1">{messageCount} messages</p>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 mb-1">
                                        <TrendingUp size={14} className={getScoreColor(avgScore)} />
                                        <span className={`text-lg font-bold ${getScoreColor(avgScore)}`}>{Math.round(avgScore)}%</span>
                                    </div>
                                </div>

                                <ChevronRight size={18} className="text-muted-foreground group-hover:text-hirebyte-mint transition-colors shrink-0" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PastInterviews;
