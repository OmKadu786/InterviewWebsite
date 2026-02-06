import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Brain, Eye, Shield, X } from 'lucide-react';

interface ConsentModalProps {
    isOpen: boolean;
    onAgree: () => void;
    onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onAgree, onCancel }) => {
    const [isChecked, setIsChecked] = useState(false);

    // Reset checkbox when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsChecked(false);
        }
    }, [isOpen]);

    const handleAgree = () => {
        if (isChecked) {
            // Save consent to localStorage
            localStorage.setItem('aiConsent', 'true');
            localStorage.setItem('aiConsentDate', new Date().toISOString());
            onAgree();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-hirebyte-mint/30 rounded-2xl p-6 shadow-2xl shadow-hirebyte-blue/20 backdrop-blur-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-hirebyte-mint/20 text-hirebyte-mint">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Before You Begin</h2>
                                        <p className="text-sm text-gray-400">Privacy & Consent</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Consent Items */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                                        <Camera size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Camera Access</p>
                                        <p className="text-xs text-gray-400">Your camera will be used for video analysis</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
                                        <Mic size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Microphone Access</p>
                                        <p className="text-xs text-gray-400">Your voice will be recorded for transcription</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="p-1.5 rounded-lg bg-hirebyte-mint/20 text-hirebyte-mint mt-0.5">
                                        <Brain size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">AI Analysis</p>
                                        <p className="text-xs text-gray-400">AI will analyze your responses and body language</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 mt-0.5">
                                        <Eye size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Practice Session</p>
                                        <p className="text-xs text-gray-400">This is for practice purposes only • AI assistance is always visible</p>
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <label className="flex items-center gap-3 p-4 rounded-xl bg-hirebyte-blue/10 border border-hirebyte-blue/30 cursor-pointer hover:bg-hirebyte-blue/15 transition-colors mb-6 group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                                        isChecked 
                                            ? 'bg-hirebyte-mint border-hirebyte-mint' 
                                            : 'border-gray-500 group-hover:border-hirebyte-mint/50'
                                    }`}>
                                        {isChecked && (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </motion.svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-white">I understand and agree to the above</span>
                            </label>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-gray-300 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAgree}
                                    disabled={!isChecked}
                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                        isChecked
                                            ? 'bg-gradient-to-r from-hirebyte-mint to-emerald-500 text-white hover:from-emerald-500 hover:to-hirebyte-mint shadow-lg shadow-hirebyte-mint/25'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Shield size={16} />
                                    I Agree & Start
                                </button>
                            </div>

                            {/* Footer Note */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Your privacy matters. Data is processed locally for this session.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
