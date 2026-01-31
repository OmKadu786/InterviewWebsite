import React from 'react';
import { Brain, ScanFace, BarChart3, ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
    onStartConfirm: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartConfirm }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-4xl w-full text-center z-10 space-y-12">
                {/* Header Section */}
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
                        <span className="text-[#4ade80]">HireByte</span>
                        <br />
                        <span className="text-white">Your AI Interview Assistant</span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Practice interviews with AI-powered feedback, real-time body language
                        analysis, and comprehensive performance analytics. Ace your next interview.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FeatureCard
                        icon={<Brain className="w-6 h-6 text-[#4ade80]" />}
                        title="AI Interviewer"
                        description="Dynamic questions based on your resume"
                    />
                    <FeatureCard
                        icon={<Sparkles className="w-6 h-6 text-blue-400" />}
                        title="Vision Analysis"
                        description="Eye contact, confidence & emotion tracking"
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-6 h-6 text-[#4ade80]" />}
                        title="Detailed Reports"
                        description="Charts, insights & exportable PDF"
                    />
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-white/10 p-1">
                    <div className="bg-[#0b0b0b]/80 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[#161616] p-2 rounded-lg border border-white/10">
                                <Brain className="w-6 h-6 text-[#4ade80]" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[#161616] border border-white/10 text-xs text-[#4ade80] font-mono">
                                AI Powered
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-2">Start Your Practice Interview</h3>
                            <p className="text-gray-400 text-sm">Software • Finance • Marketing • Any Role</p>
                        </div>

                        <button
                            onClick={onStartConfirm}
                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                        >
                            <span>Begin Interview</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-6 rounded-xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors text-left group">
        <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit group-hover:bg-white/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
);
