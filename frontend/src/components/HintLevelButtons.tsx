import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Code } from 'lucide-react';

export type HintLevel = 'small' | 'medium' | 'full';

interface HintLevelButtonsProps {
    onRequestHint: (level: HintLevel, prompt: string) => void;
    isLoading?: boolean;
}

// Prompt templates for each hint level
const HINT_PROMPTS = {
    small: "Give only a directional hint. Do not name algorithms. Do not give code. One sentence only.",
    medium: "Explain the approach. No full solution. No code. High-level explanation only.",
    full: "Provide complete solution with explanation."
};

export const HintLevelButtons: React.FC<HintLevelButtonsProps> = ({ onRequestHint, isLoading = false }) => {
    const [showFullConfirm, setShowFullConfirm] = useState(false);

    const handleSmallHint = () => {
        onRequestHint('small', HINT_PROMPTS.small);
    };

    const handleMediumHint = () => {
        onRequestHint('medium', HINT_PROMPTS.medium);
    };

    const handleFullSolution = () => {
        if (!showFullConfirm) {
            setShowFullConfirm(true);
        } else {
            onRequestHint('full', HINT_PROMPTS.full);
            setShowFullConfirm(false);
        }
    };

    return (
        <div className="relative">
            {/* Main Buttons Container - Segmented Control / Bracket Style */}
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-2 border border-border/40">
                <div className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5 px-1 uppercase tracking-wider opacity-70">
                    <Lightbulb size={12} />
                    AI Hints
                </div>
                
                <div className="flex items-center gap-1 bg-background/50 p-1.5 rounded-lg border border-border/30 h-12">
                    {/* Small Hint */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSmallHint}
                        disabled={isLoading}
                        className="flex-1 h-full rounded-md text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-yellow-400/10 hover:text-yellow-400 group relative"
                        title="Quick Direction"
                    >
                        <Lightbulb size={16} className="text-muted-foreground group-hover:text-yellow-400 transition-colors" />
                        <span>Small</span>
                    </motion.button>

                    <div className="w-px h-6 bg-border/40" />

                    {/* Medium Hint */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMediumHint}
                        disabled={isLoading}
                        className="flex-1 h-full rounded-md text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-400/10 hover:text-blue-400 group"
                        title="Approach Guide"
                    >
                        <Zap size={16} className="text-muted-foreground group-hover:text-blue-400 transition-colors" />
                        <span>Medium</span>
                    </motion.button>

                    <div className="w-px h-6 bg-border/40" />

                    {/* Full Solution */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFullSolution}
                        disabled={isLoading}
                        className={`flex-1 h-full rounded-md text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group ${
                            showFullConfirm 
                                ? 'bg-purple-900/40 text-purple-400' 
                                : 'hover:bg-purple-400/10 hover:text-purple-400'
                        }`}
                        title="Full Solution"
                    >
                        <Code size={16} className={`${showFullConfirm ? 'text-purple-400' : 'text-muted-foreground group-hover:text-purple-400'} transition-colors`} />
                        <span>{showFullConfirm ? 'Sure?' : 'Full'}</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};
