import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIAssistanceBadgeProps {
    isConnected: boolean;
}

export const AIAssistanceBadge: React.FC<AIAssistanceBadgeProps> = ({ isConnected }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`backdrop-blur-md px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-semibold cursor-help transition-all ${
                    isConnected
                        ? 'bg-black/60 border-hirebyte-mint/50 text-hirebyte-mint shadow-lg shadow-hirebyte-mint/20'
                        : 'bg-black/60 border-yellow-500/50 text-yellow-400'
                }`}
            >
                {/* Pulsing Dot */}
                <span className="relative flex h-2 w-2">
                    <span 
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isConnected ? 'bg-hirebyte-mint' : 'bg-yellow-400'
                        }`}
                    />
                    <span 
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                            isConnected ? 'bg-hirebyte-mint' : 'bg-yellow-500'
                        }`}
                    />
                </span>

                {/* Icon */}
                <Brain size={12} />

                {/* Text */}
                <span>AI Assistance {isConnected ? 'ON' : 'OFF'}</span>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-0 mt-2 z-50"
                    >
                        <div className="bg-gray-900/95 border border-white/20 rounded-xl p-3 shadow-xl backdrop-blur-md min-w-[220px]">
                            <div className="flex items-start gap-2">
                                <div className={`p-1.5 rounded-lg ${isConnected ? 'bg-hirebyte-mint/20 text-hirebyte-mint' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    <Brain size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white mb-1">
                                        {isConnected ? 'AI is Active' : 'AI Connecting...'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {isConnected 
                                            ? 'AI is analyzing your responses and providing real-time practice feedback.'
                                            : 'Establishing connection to AI services...'
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            {/* Arrow pointing up */}
                            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900/95 border-l border-t border-white/20 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
