import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Code, Lock, CheckCircle } from 'lucide-react';

export type HintLevel = 'small' | 'medium' | 'full';

interface HintLevelButtonsProps {
    onRequestHint: (level: HintLevel, prompt: string) => void;
    isLoading?: boolean;
    availableLevel?: string | null;  // Current available level from progressive system
    topic?: string | null;           // Detected question topic
}

// Prompt templates for each hint level
const HINT_PROMPTS = {
    small: "Give only a directional hint. Do not name algorithms. Do not give code. One sentence only.",
    medium: "Explain the approach. No full solution. No code. High-level explanation only.",
    full: "Provide a partial solution outline with key steps. No complete code."
};

const LEVEL_ORDER: HintLevel[] = ['small', 'medium', 'full'];

export const HintLevelButtons: React.FC<HintLevelButtonsProps> = ({
    onRequestHint,
    isLoading = false,
    availableLevel = 'small',
    topic = null
}) => {
    const [showFullConfirm, setShowFullConfirm] = useState(false);

    // Determine which levels are unlocked/used/available
    const availableIndex = availableLevel ? LEVEL_ORDER.indexOf(availableLevel as HintLevel) : -1;

    const getLevelStatus = (level: HintLevel): 'used' | 'available' | 'locked' => {
        const levelIndex = LEVEL_ORDER.indexOf(level);
        if (availableLevel === null) return 'used'; // All used up
        if (levelIndex < availableIndex) return 'used';
        if (levelIndex === availableIndex) return 'available';
        return 'locked';
    };

    const handleHint = (level: HintLevel) => {
        if (level === 'full' && !showFullConfirm) {
            setShowFullConfirm(true);
            return;
        }
        setShowFullConfirm(false);
        onRequestHint(level, HINT_PROMPTS[level]);
    };

    const levelConfig = {
        small: { icon: Lightbulb, label: 'Small', activeColor: 'yellow', desc: 'Direction' },
        medium: { icon: Zap, label: 'Medium', activeColor: 'blue', desc: 'Approach' },
        full: { icon: Code, label: 'Outline', activeColor: 'purple', desc: 'Partial Solution' },
    };

    return (
        <div className="relative">
            {/* Topic Badge */}
            {topic && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-hirebyte-mint/10 border border-hirebyte-mint/20 rounded-full"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-hirebyte-mint animate-pulse" />
                    <span className="text-xs font-medium text-hirebyte-mint">{topic}</span>
                </motion.div>
            )}

            {/* Main Buttons Container */}
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-2 border border-border/40">
                <div className="flex items-center gap-1 bg-background/50 p-1.5 rounded-lg border border-border/30 h-12">
                    {LEVEL_ORDER.map((level, i) => {
                        const config = levelConfig[level];
                        const Icon = config.icon;
                        const status = getLevelStatus(level);
                        const isDisabled = isLoading || status === 'locked';
                        const isUsed = status === 'used';
                        const isAvailable = status === 'available';
                        const colorClass = `${config.activeColor}`;

                        return (
                            <React.Fragment key={level}>
                                {i > 0 && <div className="w-px h-6 bg-border/40" />}
                                <motion.button
                                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                    onClick={() => handleHint(level)}
                                    disabled={isDisabled}
                                    className={`flex-1 h-full rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 group relative ${isUsed
                                            ? 'opacity-40 cursor-default'
                                            : isAvailable
                                                ? `hover:bg-${colorClass}-400/10 hover:text-${colorClass}-400`
                                                : 'opacity-30 cursor-not-allowed'
                                        } ${level === 'full' && showFullConfirm ? 'bg-purple-900/40 text-purple-400' : ''}`}
                                    title={isUsed ? 'Already used' : status === 'locked' ? `Use ${LEVEL_ORDER[i - 1]} first` : config.desc}
                                >
                                    {isUsed ? (
                                        <CheckCircle size={14} className="text-emerald-400/60" />
                                    ) : status === 'locked' ? (
                                        <Lock size={14} className="text-muted-foreground/50" />
                                    ) : (
                                        <Icon size={16} className={`transition-colors ${level === 'full' && showFullConfirm
                                                ? 'text-purple-400'
                                                : `text-muted-foreground group-hover:text-${colorClass}-400`
                                            }`} />
                                    )}
                                    <span>
                                        {level === 'full' && showFullConfirm
                                            ? 'Sure?'
                                            : isUsed
                                                ? '✓'
                                                : config.label}
                                    </span>
                                </motion.button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Exhausted message */}
                {availableLevel === null && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground text-center mt-1.5 italic"
                    >
                        All hints used for this question
                    </motion.p>
                )}
            </div>
        </div>
    );
};
