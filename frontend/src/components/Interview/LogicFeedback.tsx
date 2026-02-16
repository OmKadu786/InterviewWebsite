import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface LogicFeedbackProps {
    feedback: {
        issue_type: string;
        feedback: string;
        severity: 'info' | 'warning' | 'error';
    } | null;
    onDismiss: () => void;
}

const severityConfig = {
    info: {
        icon: Info,
        bgClass: 'bg-blue-500/10 border-blue-500/30',
        textClass: 'text-blue-400',
        iconClass: 'text-blue-400',
        label: 'Note'
    },
    warning: {
        icon: AlertTriangle,
        bgClass: 'bg-yellow-500/10 border-yellow-500/30',
        textClass: 'text-yellow-400',
        iconClass: 'text-yellow-400',
        label: 'Think Again'
    },
    error: {
        icon: AlertCircle,
        bgClass: 'bg-red-500/10 border-red-500/30',
        textClass: 'text-red-400',
        iconClass: 'text-red-400',
        label: 'Check This'
    }
};

export const LogicFeedback: React.FC<LogicFeedbackProps> = ({ feedback, onDismiss }) => {
    if (!feedback) return null;

    const config = severityConfig[feedback.severity] || severityConfig.info;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`rounded-xl border p-3 ${config.bgClass} backdrop-blur-sm`}
                >
                    <div className="flex items-start gap-2">
                        <Icon size={16} className={`${config.iconClass} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${config.textClass}`}>
                                    {config.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {feedback.issue_type.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                {feedback.feedback}
                            </p>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
