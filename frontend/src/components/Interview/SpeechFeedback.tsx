import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Clock, AlertTriangle } from 'lucide-react';

interface SpeechFeedbackProps {
    feedback: {
        wpm: number;
        pace: string;
        filler_count: number;
        confidence_level: string;
        long_silence: boolean;
        feedback: string;
    } | null;
    onDismiss: () => void;
}

const paceConfig: Record<string, { color: string; label: string }> = {
    too_slow: { color: 'text-orange-400', label: 'Too Slow' },
    slow: { color: 'text-yellow-400', label: 'Slow' },
    normal: { color: 'text-emerald-400', label: 'Good' },
    fast: { color: 'text-blue-400', label: 'Fast' },
    too_fast: { color: 'text-red-400', label: 'Too Fast' },
};

const confidenceColors: Record<string, string> = {
    high: 'border-emerald-500/30 bg-emerald-500/5',
    medium: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-red-500/30 bg-red-500/5',
};

export const SpeechFeedback: React.FC<SpeechFeedbackProps> = ({ feedback, onDismiss }) => {
    if (!feedback) return null;

    const pace = paceConfig[feedback.pace] || paceConfig.normal;
    const borderColor = confidenceColors[feedback.confidence_level] || confidenceColors.medium;

    return (
        <AnimatePresence>
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`rounded-xl border p-3 backdrop-blur-sm ${borderColor}`}
                    onClick={onDismiss}
                >
                    {/* Metrics row */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1.5">
                            <Volume2 size={12} className={pace.color} />
                            <span className={`text-xs font-semibold ${pace.color}`}>{pace.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Mic size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{feedback.wpm} WPM</span>
                        </div>

                        {feedback.filler_count > 0 && (
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-yellow-400" />
                                <span className="text-xs text-yellow-400">{feedback.filler_count} fillers</span>
                            </div>
                        )}

                        {feedback.long_silence && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-orange-400" />
                                <span className="text-xs text-orange-400">Long pause</span>
                            </div>
                        )}
                    </div>

                    {/* Feedback message */}
                    <p className="text-xs text-foreground/80 leading-relaxed">
                        {feedback.feedback}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
