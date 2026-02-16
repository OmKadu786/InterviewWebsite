import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Target, Clock, Lightbulb, Bug } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface TopicScore {
    topic: string;
    score: number;
    accuracy_avg: number;
    depth_avg: number;
    time_avg: number;
    hint_dependency: number;
    error_count: number;
    question_count: number;
    weakness_score: number;
}

interface WeaknessData {
    topic_scores: Record<string, TopicScore>;
    classification: {
        strong: TopicScore[];
        weak: TopicScore[];
        risk: TopicScore[];
    };
    hint_usage: Record<string, string[]>;
    logical_errors: Array<{
        question_index: number;
        issue_type: string;
        feedback: string;
        severity: string;
    }>;
    question_topics: Record<string, string>;
}

export const WeaknessReport: React.FC = () => {
    const [data, setData] = useState<WeaknessData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_ENDPOINTS.uploadResume.replace('/upload-resume', '')}/api/session/weakness-analysis`);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (e) {
                console.error('Error fetching weakness data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-secondary/50 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-secondary/30 rounded-xl"></div>
                    <div className="h-16 bg-secondary/30 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!data || Object.keys(data.topic_scores).length === 0) {
        return null; // No data to show
    }

    const { classification, logical_errors, hint_usage } = data;
    const totalHints = Object.values(hint_usage || {}).reduce((sum, levels) => sum + levels.length, 0);

    return (
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target size={18} className="text-hirebyte-mint" />
                Cognitive Pattern Analysis
            </h3>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border/30">
                    <Lightbulb size={16} className="text-yellow-400 mx-auto mb-1" />
                    <div className="text-lg font-bold">{totalHints}</div>
                    <div className="text-xs text-muted-foreground">Hints Used</div>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border/30">
                    <Bug size={16} className="text-red-400 mx-auto mb-1" />
                    <div className="text-lg font-bold">{logical_errors?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Logic Errors</div>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border/30">
                    <Shield size={16} className="text-emerald-400 mx-auto mb-1" />
                    <div className="text-lg font-bold">{Object.keys(data.topic_scores).length}</div>
                    <div className="text-xs text-muted-foreground">Topics Covered</div>
                </div>
            </div>

            {/* Strong Topics */}
            {classification.strong.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Strong Topics</span>
                    </div>
                    <div className="space-y-2">
                        {classification.strong.map((t: TopicScore, i: number) => (
                            <TopicCard key={i} topic={t} variant="strong" />
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Topics */}
            {classification.risk.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">Needs Attention</span>
                    </div>
                    <div className="space-y-2">
                        {classification.risk.map((t: TopicScore, i: number) => (
                            <TopicCard key={i} topic={t} variant="risk" />
                        ))}
                    </div>
                </div>
            )}

            {/* Weak Topics */}
            {classification.weak.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={14} className="text-red-400" />
                        <span className="text-sm font-semibold text-red-400">Weak Topics</span>
                    </div>
                    <div className="space-y-2">
                        {classification.weak.map((t: TopicScore, i: number) => (
                            <TopicCard key={i} topic={t} variant="weak" />
                        ))}
                    </div>
                </div>
            )}

            {/* Logical Errors List */}
            {logical_errors && logical_errors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Bug size={14} className="text-red-400" />
                        <span className="text-sm font-semibold">Logical Issues Detected</span>
                    </div>
                    <div className="space-y-2">
                        {logical_errors.map((err, i) => (
                            <div key={i} className={`text-xs p-2 rounded-lg border ${err.severity === 'error' ? 'bg-red-500/5 border-red-500/20' :
                                err.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                    'bg-blue-500/5 border-blue-500/20'
                                }`}>
                                <span className="font-medium capitalize">{err.issue_type.replace(/_/g, ' ')}:</span>{' '}
                                {err.feedback}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Topic card sub-component
const TopicCard: React.FC<{ topic: TopicScore; variant: 'strong' | 'weak' | 'risk' }> = ({ topic, variant }) => {
    const barColor = variant === 'strong' ? 'bg-emerald-400' : variant === 'risk' ? 'bg-yellow-400' : 'bg-red-400';
    const score = Math.max(0, 100 - topic.weakness_score); // Invert: higher = better for display

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-secondary/20 rounded-xl p-3 border border-border/20"
        >
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">{topic.topic}</span>
                <span className="text-xs text-muted-foreground">{score}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden mb-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor}`}
                />
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
                {topic.time_avg > 0 && (
                    <span className="flex items-center gap-0.5">
                        <Clock size={10} /> {topic.time_avg}s
                    </span>
                )}
                {topic.hint_dependency > 0 && (
                    <span className="flex items-center gap-0.5">
                        <Lightbulb size={10} /> {(topic.hint_dependency * 100).toFixed(0)}% hints
                    </span>
                )}
            </div>
        </motion.div>
    );
};
